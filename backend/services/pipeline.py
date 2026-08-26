import pickle
import networkx as nx
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from config import XGB_MODEL, XGB_FEATURES

ALIASES = {
    'farmer_id':['farmer_id','farmer_cd','farmer_code','farmerid','pashu_aadhar','animal_id','farmer','producer_id','member_id'],
    'district':['district','dist','district_name','taluka','region'],
    'collector_id':['collector_id','dcs_id','society_id','collector_code','dcs_code','collector','society','route_id'],
    'animal_type':['animal_type','species','animal','milk_type','cattle_type'],
    'date':['date','txn_date','collection_date','entry_date','transaction_date','ds'],
    'volume_liters':['volume_liters','volume_litre','volume_liter','volume','qty','quantity','milk_qty','milk_qty_ltr','milk_qty_liters','litres','liters','milk_volume','milk_volume_liters','qty_ltr','quantity_liters','quantity_litres','daily_transaction_volume_liters','slip_volume_liters','y'],
    'fat_pct':['fat_pct','fat','fat_percentage','fatpercent','fat_content'],
    'ph':['ph','ph_value','acidity'],
    'temperature_c':['temperature_c','temperature','temp','temp_c','milk_temp'],
    'declared_animals':['declared_animals','animal_count','herd_size','num_animals','cattle_count'],
    'batch_id':['batch_id','slip_id','slip_no','receipt_id','transaction_id'],
    'plant_intake_total':['plant_intake_total','plant_intake','received_volume','plant_volume']
}

import re
def _clean(x):
    s = str(x).replace('\ufeff', '').strip().lower()
    s = re.sub(r'[^a-z0-9]+', '_', s)  # collapse any run of non-alphanumerics (spaces, (), /, ., -, %) to a single underscore
    return s.strip('_')

def adapt(raw):
    raw=raw.copy(); raw.columns=[_clean(c) for c in raw.columns]
    cols={c:c for c in raw.columns}; rename={}; mapping={}
    for canonical, aliases in ALIASES.items():
        found=next((cols[_clean(a)] for a in aliases if _clean(a) in cols),None)
        mapping[canonical]=found
        if found: rename[found]=canonical
    df=raw.rename(columns=rename).copy()
    if 'record_type' in df.columns:
        mask=df['record_type'].astype(str).str.strip().str.lower().eq('transaction')
        if mask.any(): df=df.loc[mask].copy()
    for c in ['farmer_id','district','collector_id','animal_type','batch_id']:
        if c not in df.columns: df[c]='Unknown'
    if 'date' not in df.columns: df['date']=pd.Timestamp.utcnow().date().isoformat()
    dt=pd.to_datetime(df['date'],errors='coerce'); df['date']=dt.fillna(pd.Timestamp.utcnow()).dt.strftime('%Y-%m-%d')
    return df,mapping

def _add_model_features(df):
    df['expected_daily_volume']=df.groupby('farmer_id')['volume_liters'].transform('median').fillna(df['volume_liters'].median()).clip(lower=0)
    if 'declared_animals' in df:
        n=pd.to_numeric(df['declared_animals'],errors='coerce').fillna(0); per=df['animal_type'].map({'cow':15.,'buffalo':10.,'goat':3.}).fillna(15.)
        cap=n*per; fallback=df.groupby('farmer_id')['volume_liters'].transform('max').fillna(df['volume_liters'])
        df['max_possible_volume']=np.where(cap>0,cap,np.maximum(fallback,df['expected_daily_volume']*1.5))
    else: df['max_possible_volume']=np.maximum(df.groupby('farmer_id')['volume_liters'].transform('max').fillna(df['volume_liters']),df['expected_daily_volume']*1.5)
    return df

def _xgb(df):
    df['xgb_fraud_probability']=np.nan
    status={'available':False,'used':False,'error':None,'fallback_used':False}
    if not XGB_MODEL.exists() or not XGB_FEATURES.exists():
        status['error']='XGBoost model files not found'; return status
    try:
        with open(XGB_MODEL,'rb') as f: model=pickle.load(f)
        with open(XGB_FEATURES,'rb') as f: spec=pickle.load(f)
        order=spec.get('feature_order',spec) if isinstance(spec,dict) else spec
        classes=spec.get('categorical_classes',{}) if isinstance(spec,dict) else {}
        for cat in ['animal_type','district','collector_id']:
            enc={v:i for i,v in enumerate(classes.get(cat,[]))}; df[cat+'_encoded']=df[cat].astype(str).map(enc).fillna(-1)
        missing=[f for f in order if f not in df.columns]
        if missing: raise ValueError('Required XGBoost features missing: '+', '.join(missing))
        for f in order: df[f]=pd.to_numeric(df[f],errors='coerce').fillna(0)
        df['xgb_fraud_probability']=model.predict_proba(df[order])[:,1]
        status.update(available=True,used=True)
    except Exception as e: status['error']=f'{type(e).__name__}: {e}'; status['fallback_used']=True
    return status

def run(raw):
    df,mapping=adapt(raw)
    if df.empty:
        raise ValueError('This file is incomplete: no transaction rows were found. Please upload a non-empty CSV or Excel file with one row per transaction.')
    if 'volume_liters' not in df.columns:
        raise ValueError('This file is incomplete: no recognizable milk-volume column was found (expected something like "volume_liters", "quantity", "qty_ltr", etc). Please re-upload a file that includes the milk quantity for each transaction. Columns found: '+', '.join(map(str,raw.columns)))
    _raw_vol=pd.to_numeric(df['volume_liters'],errors='coerce'); _invalid_frac=float(_raw_vol.isna().mean())
    if _invalid_frac>0.5:
        raise ValueError(f'This file is incomplete: {_invalid_frac:.0%} of rows have a missing or non-numeric milk volume. Please correct the file and re-upload.')
    if len(df)<5:
        raise ValueError(f'This file is incomplete: only {len(df)} transaction row(s) were found. Upload at least a handful of transactions so the risk models have enough data to run.')
    warnings=[]
    if mapping.get('farmer_id') is None: warnings.append('No farmer ID column found — all rows were grouped under "Unknown", so per-farmer anomaly detection and collusion-network analysis will be unreliable.')
    if mapping.get('collector_id') is None: warnings.append('No collector/centre ID column found — all rows were grouped under "Unknown".')
    if mapping.get('date') is None: warnings.append("No date column found — today's date was used for every row, so trend and forecast charts won't reflect real history.")
    if mapping.get('fat_pct') is None: warnings.append('No fat % column found — a default of 4.0% was assumed, so fat-based adulteration flags are approximate.')
    if mapping.get('ph') is None: warnings.append('No pH column found — a default of 6.6 was assumed.')
    if mapping.get('temperature_c') is None: warnings.append('No temperature column found — a default of 7.0°C was assumed.')
    if mapping.get('declared_animals') is None: warnings.append('No declared-animals/herd-size column found — capacity-mismatch checks fall back to a looser volume-based estimate instead of animal count.')
    if mapping.get('plant_intake_total') is None: warnings.append('No plant-intake-total column found — collector-vs-plant mass-balance reconciliation is unavailable for this dataset.')
    for c,d in [('fat_pct',4.0),('ph',6.6),('temperature_c',7.0)]:
        if c not in df.columns: df[c]=d
        df[c]=pd.to_numeric(df[c],errors='coerce').fillna(d)
    df['volume_liters']=pd.to_numeric(df['volume_liters'],errors='coerce').fillna(0)
    df['animal_type']=df['animal_type'].astype(str).str.strip().str.lower().replace({'unknown':'cow','nan':'cow'})
    df=_add_model_features(df)
    feats=[]
    for c in ['volume_liters','fat_pct','ph','temperature_c']:
        z=c+'_zscore'; fz=c+'_farmer_zscore'
        df[z]=df.groupby('animal_type')[c].transform(lambda x:(x-x.mean())/(x.std() if x.std() and x.std()>0 else 1)).fillna(0)
        df[fz]=df.groupby('farmer_id')[c].transform(lambda x:(x-x.mean())/(x.std() if x.std() and x.std()>0 else 1)).fillna(0)
        feats += [z,fz]
    scores=np.zeros(len(df)); predicted=np.zeros(len(df),dtype=int)
    for animal in df['animal_type'].dropna().unique():
        mask=df['animal_type'].eq(animal); X=df.loc[mask,feats].fillna(0)
        if len(X)>=20:
            iso=IsolationForest(contamination=max(.01,min(.03,2/len(X))),n_estimators=300,random_state=42).fit(X)
            scores[mask]=-iso.decision_function(X); predicted[mask]=(iso.predict(X)==-1).astype(int)
        elif len(X)>=2: scores[mask]=np.linalg.norm(X.to_numpy(),axis=1)
    df['anomaly_score_final']=scores
    df['model_predicted_anomaly_final']=predicted
    df['duplicate_flag']=df.duplicated(subset=['farmer_id','date','volume_liters'],keep=False).astype(int)
    if 'declared_animals' in df.columns:
        n=pd.to_numeric(df['declared_animals'],errors='coerce').fillna(0); ceilings=df['animal_type'].map({'cow':15,'buffalo':10,'goat':3}).fillna(15)*n
        df['capacity_mismatch_flag']=((ceilings>0)&(df['volume_liters']>ceilings)).astype(int)
    else: df['capacity_mismatch_flag']=(df['volume_liters']>df['max_possible_volume']).astype(int)
    df['possible_adulteration_flag']=((df['fat_pct']<2.5)|(df['ph']<6.2)|(df['ph']>7.0)).astype(int)
    xgb_status=_xgb(df)
    s=df['anomaly_score_final']; iso_norm=(s-s.min())/(s.max()-s.min()+1e-9)
    rules=df[['duplicate_flag','capacity_mismatch_flag','possible_adulteration_flag']].max(axis=1)
    xgb=df['xgb_fraud_probability'].fillna(0)
    df['final_risk_score']=((.4*iso_norm+.45*xgb+.15*rules) if xgb_status.get('used') else (.75*iso_norm+.25*rules)).clip(0,1)
    df['risk_level']=pd.cut(df['final_risk_score'],[-.01,.35,.70,1],labels=['Low','Medium','High']).astype(str)
    df.attrs['model_status']={'isolation_forest':{'used':True,'contamination':'1%-3% per species'},'xgboost':xgb_status}
    df.attrs['warnings']=warnings
    return df,mapping

def summaries(df):
    daily=df.groupby('date',dropna=False).agg(volume=('volume_liters','sum'),anomalies=('model_predicted_anomaly_final','sum'),risk=('final_risk_score','mean')).reset_index().to_dict('records')
    districts=df.groupby('district',dropna=False).agg(volume_liters=('volume_liters','sum'),avg_risk=('final_risk_score','mean'),anomalies=('model_predicted_anomaly_final','sum')).reset_index().to_dict('records')
    farmers=df.groupby(['farmer_id','district','collector_id'],dropna=False).agg(total_volume=('volume_liters','sum'),avg_risk=('final_risk_score','mean'),anomalies=('model_predicted_anomaly_final','sum')).reset_index().to_dict('records')
    mb=[]
    if 'plant_intake_total' in df.columns:
        g=df.groupby(['collector_id','date']).agg(collector_logged_total=('volume_liters','sum'),plant_intake_total=('plant_intake_total','max')).reset_index(); g['plant_intake_total']=pd.to_numeric(g['plant_intake_total'],errors='coerce').fillna(0)
        g['variance_pct']=((g.collector_logged_total-g.plant_intake_total)/g.collector_logged_total.replace(0,np.nan)*100).fillna(0); g['is_mass_balance_anomaly']=(g.variance_pct.abs()>5).astype(int); mb=g.to_dict('records')
    pairs=df[['farmer_id','collector_id']].drop_duplicates(); G=nx.Graph(); G.add_nodes_from(pairs.farmer_id.astype(str))
    for _,g in pairs.groupby('collector_id'):
        ids=g.farmer_id.astype(str).tolist()
        for i,a in enumerate(ids):
            for b in ids[i+1:]: G.add_edge(a,b)
    communities=[]
    if len(G):
        risks=df.assign(farmer_id=df.farmer_id.astype(str)).groupby('farmer_id').final_risk_score.mean().to_dict(); base=float(df.final_risk_score.mean())
        for i,c in enumerate(nx.community.louvain_communities(G,seed=42)):
            avg=float(np.mean([risks.get(x,0) for x in c])); communities.append({'community_id':i,'size':len(c),'avg_risk':avg,'risk_vs_baseline':avg/(base+1e-9),'suspicious_community':int(avg>max(.7,base*2)),'farmer_ids':sorted(c)})
    overview={'metrics':{'totalProcurementVolume':float(df.volume_liters.sum()),'farmersMonitored':int(df.farmer_id.nunique()),'activeAnomalies':int(df.model_predicted_anomaly_final.sum()),'highRiskEntities':int((df.risk_level=='High').sum())},'dailyTrend':daily,'riskBreakdown':df.risk_level.value_counts().rename_axis('risk_level').reset_index(name='count').to_dict('records')}
    centres=df.groupby(['collector_id','district'],dropna=False).agg(volume=('volume_liters','sum'),avg_risk=('final_risk_score','mean'),flags=('risk_level',lambda x:int((x!='Low').sum()))).reset_index().to_dict('records')
    return {'overview':overview,'districts':districts,'farmers':farmers,'mass_balance':mb,'centres':centres,'clusters':communities}
