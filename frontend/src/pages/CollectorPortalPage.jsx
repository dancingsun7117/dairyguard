import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  AlertTriangle,
  Users,
  Gauge,
  Database,
  Bell,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  RotateCw,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Droplets,
  Milk,
  Check,
  Info,
  ArrowUpRight,
  UploadCloud,
  Download,
  Filter,
  Search,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Network,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  LineChart,
  BarChart,
  ScatterChart,
  Scatter,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell
} from 'recharts';
import RiskDisclaimer from '../components/common/RiskDisclaimer';
import DairyGuardLogo from '../components/common/DairyGuardLogo';
import '../components/collector/CollectorPortal.css';
import { getOverview, getTransactions, getRiskFlags, getAnomalies, getFarmers, getClusters, getProcurementPerformance, getForecast, uploadDataset, logout as apiLogout, getUser } from '../api/dairyguardApi';

/* ==========================================================================
   PROTOTYPE & DEMO DATA BOUNDARIES (For Demo / Hackathon / Backend Integration)
   ========================================================================== */

// 1. 7-Day Procurement Hero Graph Data
// 2. Daily Collection & Capacity Trends (Procurement Page)
// 3. Historical Procurement Table Data
// 4. 30-Day Risk Score Trend Data
// 5. Flag-Type Breakdown Data (Strict 5 Required Categories)
// 6. Isolation Forest Scatter Observations (Normal vs Anomaly)
// Isolation Forest Observations Comprehensive Data Table
// 7. Network Risk Cluster Scatter Data & Table
// 8. Chronos Bolt Time-Series Foundation Forecast Data
// 9. Quality Trends Data (FAT, SNF, Temp)
// 9. All Transactions (For Data Explorer & Highest-Risk Tables)
// 10. Farmer Directory Data


// Custom Dot Component for Time-Series Line/Area Charts
const CustomChartDot = (props) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;

  if (payload && payload.isAnomaly) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={7.5} fill="#FFFFFF" stroke="#C03728" strokeWidth={2.5} />
        <circle cx={cx} cy={cy} r={3} fill="#C03728" />
      </g>
    );
  }

  return (
    <circle cx={cx} cy={cy} r={4.5} fill="#FFFFFF" stroke="#2E3C1D" strokeWidth={2} />
  );
};

// Custom Scatter Dots for Isolation Forest and Network Visualizations
const NormalScatterDot = (props) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5.5}
      fill="#2E7D32"
      stroke="#FFFFFF"
      strokeWidth={1.5}
      style={{ filter: 'drop-shadow(0 1px 2px rgba(46, 125, 50, 0.35))', cursor: 'pointer' }}
    />
  );
};

const AnomalyScatterDot = (props) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <g style={{ cursor: 'pointer' }}>
      <circle
        cx={cx}
        cy={cy}
        r={8.5}
        fill="#C03728"
        stroke="#FFFFFF"
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 2px 4px rgba(192, 55, 40, 0.45))' }}
      />
      <circle cx={cx} cy={cy} r={3} fill="#FFFFFF" />
    </g>
  );
};

export const CollectorPortalPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7D');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('22 Aug 2026, 05:42 PM');

  // Modals state
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSuccessTime, setUploadSuccessTime] = useState(null);

  // Interactive Point / Row Linking state
  const [highlightedAnomalyId, setHighlightedAnomalyId] = useState(null);
  const [highlightedClusterId, setHighlightedClusterId] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [procurementHeroData,setProcurementHeroData]=useState([]);
  const [dailyCollectionTrendData,setDailyCollectionTrendData]=useState([]);
  const [capacityUtilisationTrendData,setCapacityUtilisationTrendData]=useState([]);
  const [procurementTableData,setProcurementTableData]=useState([]);
  const [riskScoreTrendData,setRiskScoreTrendData]=useState([]);
  const [flagTypeBreakdownData,setFlagTypeBreakdownData]=useState([]);
  const [isolationForestNormal,setIsolationForestNormal]=useState([]);
  const [isolationForestAnomaly,setIsolationForestAnomaly]=useState([]);
  const [isolationForestRecordsTable,setIsolationForestRecordsTable]=useState([]);
  const [networkNormal,setNetworkNormal]=useState([]);
  const [networkAnomaly,setNetworkAnomaly]=useState([]);
  const [networkClusterTable,setNetworkClusterTable]=useState([]);
  const [chronosBoltForecastData,setChronosBoltForecastData]=useState([]);
  const [chronosBoltScheduleTable,setChronosBoltScheduleTable]=useState([]);
  const [qualityTrendsData,setQualityTrendsData]=useState([]);
  const [sampleTransactions,setSampleTransactions]=useState([]);
  const [farmerDirectoryData,setFarmerDirectoryData]=useState([]);
  const [liveError,setLiveError]=useState(''); const [liveLoading,setLiveLoading]=useState(false); const [hasLiveData,setHasLiveData]=useState(false);
  const [heroStats,setHeroStats]=useState({riskScore:0,riskLevel:'—',highRiskFlags:0,todayVolume:0,todayVsYesterdayPct:0,activeFarmers:0,farmersVsWeekPct:0,activeAlerts:0,highAlerts:0,mediumAlerts:0,lowAlerts:0,qualityPct:0,qualityVsYesterdayPct:0});
  const currentUser=getUser();
  const currentCentreId=(currentUser?.collector_id || currentUser?.identifier || '—');
  const currentDistrict=(currentUser?.district || 'All districts');
  const clearLiveData=()=>{setProcurementHeroData([]);setDailyCollectionTrendData([]);setCapacityUtilisationTrendData([]);setProcurementTableData([]);setRiskScoreTrendData([]);setFlagTypeBreakdownData([]);setIsolationForestNormal([]);setIsolationForestAnomaly([]);setIsolationForestRecordsTable([]);setNetworkNormal([]);setNetworkAnomaly([]);setNetworkClusterTable([]);setChronosBoltForecastData([]);setChronosBoltScheduleTable([]);setQualityTrendsData([]);setSampleTransactions([]);setFarmerDirectoryData([]);setHasLiveData(false);};
  const loadLive=async()=>{setLiveLoading(true);setLiveError('');try{
    const results=await Promise.allSettled([getOverview(),getTransactions(1000),getRiskFlags(),getAnomalies(),getFarmers(),getClusters(),getProcurementPerformance('All',365),getForecast('All',14)]);
    const [overviewR,txR,flagsR,anomsR,farmersR,clustersR,procR,forecastR]=results;
    const failed=results.filter(r=>r.status==='rejected');
    if(overviewR.status==='rejected')throw overviewR.reason||new Error('Failed to load overview');
    const overview=overviewR.value,tx=txR.status==='fulfilled'?txR.value:[],flags=flagsR.status==='fulfilled'?flagsR.value:[],anoms=anomsR.status==='fulfilled'?anomsR.value:[],farmers=farmersR.status==='fulfilled'?farmersR.value:[],clusters=clustersR.status==='fulfilled'?clustersR.value:[],proc=procR.status==='fulfilled'?procR.value:[],forecast=forecastR.status==='fulfilled'?forecastR.value:{historical:[],forecast:[]};
    if(failed.length)console.warn('Some live data sources failed to load:',failed.map(f=>f.reason?.message||f.reason));
    {
      const m=overview.metrics||{};
      const breakdown=overview.riskBreakdown||[];
      const countFor=(lvl)=>breakdown.find(b=>String(b.risk_level).toLowerCase()===lvl)?.count||0;
      const high=countFor('high'),medium=countFor('medium'),low=countFor('low');
      const totalRows=high+medium+low;
      const trend=overview.dailyTrend||[];
      const sortedTrend=trend.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date)));
      const lastDay=sortedTrend[sortedTrend.length-1];
      const prevDay=sortedTrend[sortedTrend.length-2];
      const todayVolume=lastDay?Number(lastDay.volume||0):Number(m.totalProcurementVolume||0);
      const todayVsYesterdayPct=(lastDay&&prevDay&&prevDay.volume)?Math.round(((lastDay.volume-prevDay.volume)/prevDay.volume)*1000)/10:0;
      const avgRisk=totalRows?Math.round(((medium*0.5+high*1)/totalRows)*100):0;
      const riskLevel=avgRisk>=70?'HIGH RISK':avgRisk>=35?'MEDIUM RISK':'LOW RISK';
      const qualityPct=totalRows?Math.round((low/totalRows)*100):100;
      setHeroStats({
        riskScore:avgRisk,riskLevel,highRiskFlags:Number(m.highRiskEntities||high||0),
        todayVolume:Math.round(todayVolume*10)/10,todayVsYesterdayPct,
        activeFarmers:Number(m.farmersMonitored||farmers.length||0),farmersVsWeekPct:0,
        activeAlerts:Number(m.activeAnomalies||0),highAlerts:high,mediumAlerts:medium,lowAlerts:low,
        qualityPct,qualityVsYesterdayPct:0,
      });
    }
    const rows=proc.map(x=>({date:String(x.date),actual:+x.actual||0,expected:+x.expectedCapacity||0,rangeMin:Math.max(0,(+x.expectedCapacity||0)*.85),rangeMax:(+x.expectedCapacity||0)*1.15,isAnomaly:!!x.isAnomaly})); setProcurementHeroData(rows.slice(-7)); setDailyCollectionTrendData(rows.slice(-30).map(x=>({day:x.date,volume:x.actual}))); setCapacityUtilisationTrendData(rows.slice(-30).map(x=>({day:x.date,util:Math.round(x.actual/(x.expected||1)*100)}))); setProcurementTableData(rows.slice().reverse().map(x=>({date:x.date,collection:`${x.actual.toFixed(1)} L`,expected:`${x.expected.toFixed(1)} L`,util:`${Math.round(x.actual/(x.expected||1)*100)}%`,uploadTime:'Live dataset',status:x.isAnomaly?'Flagged':'Up to date'})));
    const mapped=tx.map((x,i)=>({id:x.batch_id||`TRX-${i+1}`,date:x.date||'',farmerId:String(x.farmer_id||'Unknown'),farmerName:String(x.farmer_id||'Unknown'),quantity:`${Number(x.volume_liters||0).toFixed(1)} L`,fat:`${Number(x.fat_pct||0).toFixed(1)}%`,snf:'—',temp:`${Number(x.temperature_c||0).toFixed(1)}°C`,riskScore:Math.round((x.final_risk_score||0)*100),primaryFlag:x.capacity_mismatch_flag?'Capacity mismatch':x.possible_adulteration_flag?'Quality deviation':x.duplicate_flag?'Duplicate':x.model_predicted_anomaly_final?'Model anomaly':'Normal',status:x.risk_level==='High'?'Under Review':x.risk_level==='Medium'?'New':'Verified',severity:x.risk_level,signals:[]})); setSampleTransactions(mapped);
    setRiskScoreTrendData((overview.dailyTrend||[]).map(x=>({date:String(x.date),score:Math.round((x.risk||0)*100)}))); setFlagTypeBreakdownData([{flag:'Model Anomaly',count:anoms.length},{flag:'Capacity Mismatch',count:tx.filter(x=>x.capacity_mismatch_flag).length},{flag:'Quality Deviation',count:tx.filter(x=>x.possible_adulteration_flag).length},{flag:'Duplicate',count:tx.filter(x=>x.duplicate_flag).length}]);
    const scatter=tx.map((x,i)=>({volume:+x.volume_liters||0,anomalyScore:Math.round((x.final_risk_score||0)*100),id:x.batch_id||`TRX-${i+1}`,centre:x.collector_id,status:x.model_predicted_anomaly_final?'Anomaly':'Normal'})); setIsolationForestNormal(scatter.filter(x=>x.status==='Normal')); setIsolationForestAnomaly(scatter.filter(x=>x.status==='Anomaly')); setIsolationForestRecordsTable(mapped.filter(x=>x.severity!=='Low'));
    setFarmerDirectoryData(farmers.map(x=>({id:String(x.farmer_id),name:String(x.farmer_id),cattle:'Registered / uploaded',vol7D:`${Number(x.total_volume||0).toFixed(1)} L`,avgFat:'—',avgSnf:'—',risk:Math.round((x.avg_risk||0)*100),status:(x.avg_risk||0)>=.7?'Flagged':'Active'})));
    setNetworkClusterTable(clusters.map(x=>({id:x.community_id,cluster:`Cluster ${x.community_id}`,size:x.size,risk:Math.round((x.avg_risk||0)*100),status:x.suspicious_community?'Suspicious':'Normal'}))); setNetworkAnomaly(clusters.filter(x=>x.suspicious_community).map((x,i)=>({x:i,y:x.avg_risk*100,id:x.community_id}))); setNetworkNormal(clusters.filter(x=>!x.suspicious_community).map((x,i)=>({x:i,y:x.avg_risk*100,id:x.community_id})));
    const hist=(forecast.historical||[]).map(x=>({date:x.date,actual:x.value,predicted:x.value,lowerP10:x.value,upperP90:x.value,isForecast:false})); const fut=(forecast.forecast||[]).map(x=>({date:x.date,actual:null,predicted:x.predicted,lowerP10:x.lower,upperP90:x.upper,isForecast:true})); setChronosBoltForecastData([...hist,...fut]); setChronosBoltScheduleTable(fut.map(x=>({session:x.date,expectedFarmers:'—',baseline:'—',predicted:`${Number(x.predicted).toFixed(1)} L`,range:`${Number(x.lowerP10).toFixed(1)} L – ${Number(x.upperP90).toFixed(1)} L`,volatility:'Chronos P10–P90',status:'Projected'})));
    const q={}; tx.forEach(x=>{const k=x.date||'Unknown';(q[k]??=[]).push(x)}); setQualityTrendsData(Object.entries(q).map(([date,a])=>({date,fat:a.reduce((s,x)=>s+(+x.fat_pct||0),0)/a.length,snf:0,temp:a.reduce((s,x)=>s+(+x.temperature_c||0),0)/a.length})));
    setLastSyncTime(new Date().toLocaleString()); setHasLiveData(true);
  }catch(e){setLiveError(e.message||'Live backend unavailable');clearLiveData();}finally{setLiveLoading(false)}};
  useEffect(()=>{loadLive();},[]);


  const handleRefresh = async () => { setIsRefreshing(true); await loadLive(); setIsRefreshing(false); };

  const handleLogout = () => { apiLogout(); navigate('/'); };

  const [uploadWarnings, setUploadWarnings] = useState([]);
  const handleSimulateUpload = async (e) => { e.preventDefault(); if (!uploadFile) return; try { setLiveLoading(true); setUploadWarnings([]); const res = await uploadDataset(uploadFile); setUploadWarnings(res.warnings || []); setUploadSuccessTime(new Date().toLocaleString()); await loadLive(); setTimeout(()=>{setIsUploadModalOpen(false);setUploadFile(null);},(res.warnings&&res.warnings.length)?2500:600); } catch(err) { setLiveError(err.message || 'Upload failed'); } finally { setLiveLoading(false); } };

  // Filtered transactions for Data Explorer
  const filteredTransactions = sampleTransactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.farmerId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk =
      riskFilter === 'all' ||
      (riskFilter === 'high' && tx.riskScore >= 75) ||
      (riskFilter === 'medium' && tx.riskScore >= 50 && tx.riskScore < 75) ||
      (riskFilter === 'low' && tx.riskScore < 50);
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="dg-c-app">{liveError && <div style={{position:'fixed',top:8,right:8,zIndex:9999,background:'#fff3f1',color:'#96362C',padding:'10px 14px',borderRadius:8,fontSize:12,maxWidth:320}}>⚠ Live API: {liveError}</div>}
    {!hasLiveData && !liveLoading && <div style={{margin:'12px 20px',padding:'14px 18px',borderRadius:10,background:'#FFF7E8',border:'1px solid #E8CE8F',color:'#6B5416',fontSize:13,fontWeight:600}}>
      {liveError ? 'No live data is showing — the backend request failed, so nothing below is real. Fix the connection and refresh, or upload a dataset once it\'s back.' : 'No dataset has been uploaded yet. Every chart and table below is empty until you upload a CSV/Excel file.'}
    </div>}
    {liveLoading && <div style={{margin:'12px 20px',padding:'10px 18px',borderRadius:10,background:'#EEF3E8',color:'#343E23',fontSize:13,fontWeight:600}}>Loading live data…</div>}
      {/* ====================================================================
          1. DEEP OLIVE SIDEBAR (Locked & Final)
          ==================================================================== */}
      <aside className="dg-c-sidebar">
        <div>
          {/* Logo & Brand Header */}
          <Link to="/" className="dg-c-sidebar-brand" title="DairyGuard">
            <img
              src="/dairyguard-logo.png"
              alt="DairyGuard Logo"
              className="dg-c-sidebar-logo-icon"
            />
            <div className="dg-c-sidebar-brand-text">
              <span className="dg-c-sidebar-brand-name">DairyGuard</span>
              <span className="dg-c-sidebar-brand-sub">COLLECTOR PORTAL</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="dg-c-nav-list">
            <button
              type="button"
              className={`dg-c-nav-btn ${activeTab === 'overview' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard className="dg-c-nav-icon" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              className={`dg-c-nav-btn ${activeTab === 'procurement' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('procurement')}
            >
              <TrendingUp className="dg-c-nav-icon" />
              <span>Procurement</span>
            </button>

            <button
              type="button"
              className={`dg-c-nav-btn ${activeTab === 'risk' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('risk')}
            >
              <AlertTriangle className="dg-c-nav-icon" />
              <span>Risk &amp; Anomalies</span>
            </button>

            <button
              type="button"
              className={`dg-c-nav-btn ${activeTab === 'chronos-bolt' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('chronos-bolt')}
            >
              <Sparkles className="dg-c-nav-icon" />
              <span>Chronos Bolt</span>
            </button>

            <button
              type="button"
              className={`dg-c-nav-btn ${activeTab === 'farmers' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('farmers')}
            >
              <Users className="dg-c-nav-icon" />
              <span>Farmers</span>
            </button>

            <button
              type="button"
              className={`dg-c-nav-btn ${activeTab === 'quality' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('quality')}
            >
              <Gauge className="dg-c-nav-icon" />
              <span>Quality</span>
            </button>

            <button
              type="button"
              className={`dg-c-nav-btn ${activeTab === 'explorer' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('explorer')}
            >
              <Database className="dg-c-nav-icon" />
              <span>Data Explorer</span>
            </button>

            <div className="dg-c-sidebar-divider"></div>

            <button
              type="button"
              className={`dg-c-nav-btn ${activeTab === 'settings' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="dg-c-nav-icon" />
              <span>Settings</span>
            </button>

            <button
              type="button"
              className={`dg-c-nav-btn ${activeTab === 'help' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('help')}
            >
              <HelpCircle className="dg-c-nav-icon" />
              <span>Help &amp; Support</span>
            </button>
          </nav>
        </div>

        {/* Bottom Details: Collection Centre Badge & Logout */}
        <div className="dg-c-sidebar-bottom">
          <div className="dg-c-sidebar-centre-card">
            <div className="dg-c-sidebar-centre-label">COLLECTION CENTRE</div>
            <div className="dg-c-sidebar-centre-id">{currentCentreId}</div>
            <div className="dg-c-sidebar-centre-geo">
              <span>📍 {currentDistrict}</span>
            </div>
          </div>

          <button
            type="button"
            className="dg-c-sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ====================================================================
          2. MAIN WORKSPACE & TOPBAR
          ==================================================================== */}
      <div className="dg-c-main">
        {/* Top Header */}
        <header className="dg-c-topbar">
          <div className="dg-c-topbar-left">
            <div className="dg-c-pill-select">
              <span>📍</span>
              <span>{currentCentreId}</span>
              <span>•</span>
              <span>{currentDistrict}</span>
              <ChevronDown size={14} style={{ color: '#6B7460', marginLeft: 2 }} />
            </div>

            <div className="dg-c-pill-synced">
              <span className="dg-c-dot-green"></span>
              <span>Data synced</span>
            </div>

            <span className="dg-c-topbar-updated">
              Last updated: {lastSyncTime}
            </span>

            <button
              type="button"
              className={`dg-c-refresh-icon-btn ${isRefreshing ? 'is-spinning' : ''}`}
              onClick={handleRefresh}
              title="Refresh data"
            >
              <RotateCw size={14} />
            </button>
          </div>

          <div className="dg-c-topbar-right">
            <button
              type="button"
              className="dg-c-bell-btn"
              onClick={() => alert('3 operational telemetry notices recorded for CC-MH-0247.')}
              title="Operational Notices"
            >
              <Bell size={18} />
              <span className="dg-c-bell-badge">3</span>
            </button>

            <div className="dg-c-profile-wrap">
              <div className="dg-c-avatar">CO</div>
              <div className="dg-c-profile-meta">
                <span className="dg-c-profile-name">Collector</span>
                <span className="dg-c-profile-status">
                  <ShieldCheck size={12} />
                  Authorized
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="dg-c-content">
          {/* Global System Risk Clarification Disclaimer */}
          <RiskDisclaimer />

          {/* ================================================================
              PAGE 1: OVERVIEW (With Direct [ + Upload Data ] Action)
              ================================================================ */}
          {activeTab === 'overview' && (
            <div>
              <div className="dg-c-page-header-row">
                <div>
                  <h1 className="dg-c-page-title">Overview</h1>
                  <p className="dg-c-page-subtitle">
                    Welcome back. Here's the status of your collection centre.
                  </p>
                  <div className="dg-c-gold-bar"></div>
                </div>

                {/* Direct Upload Data Action */}
                <div className="dg-c-header-actions">
                  <button
                    type="button"
                    className="dg-c-btn-primary"
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <UploadCloud size={14} />
                    <span>+ Upload Data</span>
                  </button>
                </div>
              </div>

              {/* Top Row: Risk Score + 4-Metric Panel */}
              <div className="dg-c-kpi-row">
                <div className="dg-c-risk-card">
                  <div>
                    <div className="dg-c-risk-top-label">RISK SCORE</div>
                    <div className="dg-c-risk-score-wrap">
                      <span className="dg-c-risk-score-num">{heroStats.riskScore}</span>
                      <span className="dg-c-risk-score-denom">/ 100</span>
                    </div>
                    <div className="dg-c-risk-badge">{heroStats.riskLevel}</div>
                    <p className="dg-c-risk-flags-note">
                      <span>⚠</span>
                      <span>{heroStats.highRiskFlags} active high-risk flags</span>
                    </p>
                  </div>

                  <svg className="dg-c-risk-chart-bg" viewBox="0 0 120 65" fill="none">
                    <path
                      d="M5 55 Q 25 58, 45 42 T 75 35 T 95 18 T 115 10"
                      stroke="#E2B773"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx={115} cy={10} r={3.5} fill="#FFFFFF" stroke="#E2B773" strokeWidth={2} />
                    <circle cx={95} cy={18} r={3} fill="#E2B773" />
                    <circle cx={75} cy={35} r={2.5} fill="#E2B773" />
                    <circle cx={45} cy={42} r={2.5} fill="#E2B773" />
                    <circle cx={5} cy={55} r={2.5} fill="#E2B773" />
                  </svg>
                </div>

                <div className="dg-c-metrics-panel">
                  <div className="dg-c-metric-item">
                    <div className="dg-c-metric-top">
                      <div className="dg-c-metric-icon-circle is-green"><Milk size={16} /></div>
                      <span className="dg-c-metric-label">TODAY'S COLLECTION</span>
                    </div>
                    <div className="dg-c-metric-val">{heroStats.todayVolume.toLocaleString()} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>L</span></div>
                    <div className="dg-c-metric-sub is-green">{heroStats.todayVsYesterdayPct>=0?'↑':'↓'} {Math.abs(heroStats.todayVsYesterdayPct)}% <span style={{ color: '#6B7460', fontWeight: 500 }}>vs yesterday</span></div>
                  </div>

                  <div className="dg-c-metric-item">
                    <div className="dg-c-metric-top">
                      <div className="dg-c-metric-icon-circle is-green"><Users size={16} /></div>
                      <span className="dg-c-metric-label">ACTIVE FARMERS</span>
                    </div>
                    <div className="dg-c-metric-val">{heroStats.activeFarmers}</div>
                    <div className="dg-c-metric-sub is-green">Live from current dataset <span style={{ color: '#6B7460', fontWeight: 500 }}></span></div>
                  </div>

                  <div className="dg-c-metric-item">
                    <div className="dg-c-metric-top">
                      <div className="dg-c-metric-icon-circle is-orange"><Bell size={16} /></div>
                      <span className="dg-c-metric-label">ACTIVE ALERTS</span>
                    </div>
                    <div className="dg-c-metric-val">{heroStats.activeAlerts}</div>
                    <div className="dg-c-alert-dots-row">
                      <span style={{ color: '#C03728' }}>{heroStats.highAlerts} High</span>
                      <span style={{ color: '#C59B5A' }}>• {heroStats.mediumAlerts} Medium</span>
                      <span style={{ color: '#2B5C8F' }}>• {heroStats.lowAlerts} Low</span>
                    </div>
                  </div>

                  <div className="dg-c-metric-item">
                    <div className="dg-c-metric-top">
                      <div className="dg-c-metric-icon-circle is-blue"><Droplets size={16} /></div>
                      <span className="dg-c-metric-label">QUALITY STATUS</span>
                    </div>
                    <div className="dg-c-metric-val">{heroStats.qualityPct}<span style={{ fontSize: '1.1rem', fontWeight: 600 }}>%</span></div>
                    <div className="dg-c-metric-sub is-green">{heroStats.qualityPct>=70?'Good':heroStats.qualityPct>=40?'Fair':'Needs review'} <span style={{ color: '#6B7460', fontWeight: 500 }}>share of low-risk records</span></div>
                  </div>
                </div>
              </div>

              {/* Middle Row */}
              <div className="dg-c-mid-row">
                <div className="dg-c-white-card" style={{ marginBottom: 0 }}>
                  <div className="dg-c-card-header">
                    <div>
                      <h2 className="dg-c-card-heading">Procurement performance</h2>
                      <p className="dg-c-card-subheading">Milk collected vs expected capacity</p>
                    </div>

                    <div className="dg-c-chart-controls">
                      <div className="dg-c-time-pill-group">
                        {['7D', '30D', '3M', '1Y'].map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={`dg-c-time-btn ${timeRange === t ? 'is-active' : ''}`}
                            onClick={() => setTimeRange(t)}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <div className="dg-c-date-pill">
                        <Calendar size={13} />
                        <span>16 Aug – 22 Aug 2026</span>
                      </div>
                    </div>
                  </div>

                  <div className="dg-c-chart-wrap">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={procurementHeroData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="expectedRangeGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EDE5D5" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#EDE5D5" stopOpacity={0.25} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" vertical={false} />
                        <XAxis dataKey="date" stroke="#8E9684" fontSize={11} tickLine={false} axisLine={{ stroke: '#E4DED3' }} dy={6} />
                        <YAxis stroke="#8E9684" fontSize={11} tickLine={false} axisLine={false} domain={[0, 1600]} ticks={[0, 400, 800, 1200, 1600]} tickFormatter={(v) => (v === 0 ? '0' : v === 1200 ? '1.2K' : v === 1600 ? '1.6K' : `${v}`)} label={{ value: 'Litres (L)', angle: -90, position: 'insideLeft', dx: 5, dy: -80, fontSize: 10, fill: '#8E9684' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="rangeMax" stroke="none" fill="url(#expectedRangeGrad)" />
                        <Line type="monotone" dataKey="expected" stroke="#8E9B7E" strokeWidth={1.8} strokeDasharray="4 4" dot={false} />
                        <Line type="monotone" dataKey="actual" stroke="#2E3C1D" strokeWidth={2.2} dot={<CustomChartDot />} activeDot={{ r: 6, fill: '#2E3C1D', stroke: '#FFFFFF', strokeWidth: 2 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="dg-c-chart-legend">
                    <div className="dg-c-legend-item"><div className="dg-c-legend-line-actual"></div><span>Actual Collection (L)</span></div>
                    <div className="dg-c-legend-item"><div className="dg-c-legend-line-expected"></div><span>Expected Capacity (L)</span></div>
                    <div className="dg-c-legend-item"><div className="dg-c-legend-box-range"></div><span>Expected Range</span></div>
                    <div className="dg-c-legend-item"><div className="dg-c-legend-dot-anomaly"></div><span>Anomaly</span></div>
                  </div>
                </div>

                <div className="dg-c-white-card" style={{ marginBottom: 0 }}>
                  <div className="dg-c-card-header">
                    <h2 className="dg-c-card-heading">Today's collection</h2>
                  </div>

                  <div className="dg-c-shifts-list">
                    <div className="dg-c-shift-row">
                      <div className="dg-c-shift-left">
                        <div className="dg-c-shift-icon is-morning"><Sun size={17} /></div>
                        <div><div className="dg-c-shift-title">Morning Collection</div><div className="dg-c-shift-time">05:30 AM – 11:30 AM</div></div>
                      </div>
                      <div className="dg-c-shift-vol">742 L</div>
                    </div>

                    <div className="dg-c-shift-row">
                      <div className="dg-c-shift-left">
                        <div className="dg-c-shift-icon is-evening"><Moon size={17} /></div>
                        <div><div className="dg-c-shift-title">Evening Collection</div><div className="dg-c-shift-time">04:30 PM – 08:30 PM</div></div>
                      </div>
                      <div className="dg-c-shift-vol">503 L</div>
                    </div>

                    <div className="dg-c-shift-row" style={{ paddingTop: 6, borderTop: '1px solid #ECE6DC' }}>
                      <div className="dg-c-shift-left">
                        <div className="dg-c-shift-icon is-total"><Droplets size={17} /></div>
                        <div className="dg-c-shift-title">Total Collection</div>
                      </div>
                      <div className="dg-c-shift-total-wrap">
                        <div className="dg-c-shift-total-vol">1,245 L</div>
                        <div className="dg-c-shift-total-pct">↑ 8.3% vs yesterday</div>
                      </div>
                    </div>

                    <div className="dg-c-capacity-banner">
                      <Check size={14} style={{ flexShrink: 0 }} />
                      <span>Collection is within expected daily capacity.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="dg-c-bottom-row" style={{ marginTop: 20 }}>
                <div className="dg-c-white-card" style={{ marginBottom: 0 }}>
                  <div className="dg-c-card-header">
                    <h2 className="dg-c-card-heading">Operational Notices</h2>
                  </div>

                  <div className="dg-c-rows-list">
                    <div className="dg-c-item-row" onClick={() => { setSelectedTransaction(sampleTransactions[0]); }} style={{ cursor: 'pointer' }}>
                      <div className="dg-c-item-left">
                        <div className="dg-c-item-icon-circle is-red"><AlertTriangle size={15} /></div>
                        <div><div className="dg-c-item-title">2 anomalous transactions detected</div><div className="dg-c-item-sub">22 Aug 2026, 10:15 AM • Review recommended</div></div>
                      </div>
                      <div className="dg-c-item-right"><span className="dg-c-tag is-high">High</span><ChevronRight size={14} style={{ color: '#8E9684' }} /></div>
                    </div>

                    <div className="dg-c-item-row" onClick={() => setActiveTab('risk')} style={{ cursor: 'pointer' }}>
                      <div className="dg-c-item-left">
                        <div className="dg-c-item-icon-circle is-orange"><AlertTriangle size={15} /></div>
                        <div><div className="dg-c-item-title">Capacity nearing threshold</div><div className="dg-c-item-sub">Centre operating at 84% of expected capacity</div></div>
                      </div>
                      <div className="dg-c-item-right"><span className="dg-c-tag is-medium">Medium</span><ChevronRight size={14} style={{ color: '#8E9684' }} /></div>
                    </div>

                    <div className="dg-c-item-row" onClick={() => setIsUploadModalOpen(true)} style={{ cursor: 'pointer' }}>
                      <div className="dg-c-item-left">
                        <div className="dg-c-item-icon-circle is-blue"><Info size={15} /></div>
                        <div><div className="dg-c-item-title">Data upload pending</div><div className="dg-c-item-sub">Procurement data for 21 Aug not uploaded</div></div>
                      </div>
                      <div className="dg-c-item-right"><span className="dg-c-tag is-low">Low</span><ChevronRight size={14} style={{ color: '#8E9684' }} /></div>
                    </div>
                  </div>
                </div>

                <div className="dg-c-white-card" style={{ marginBottom: 0 }}>
                  <div className="dg-c-card-header">
                    <h2 className="dg-c-card-heading">Data status</h2>
                    <button type="button" className="dg-c-view-link" onClick={() => setActiveTab('explorer')}>
                      <span>View all</span><span>→</span>
                    </button>
                  </div>

                  <div className="dg-c-rows-list">
                    <div className="dg-c-item-row">
                      <div className="dg-c-item-left">
                        <div className="dg-c-item-icon-circle is-green"><Database size={15} /></div>
                        <div><div className="dg-c-item-title">Last procurement upload</div><div className="dg-c-item-sub">22 Aug 2026, 04:45 PM</div></div>
                      </div>
                      <div className="dg-c-item-right"><span className="dg-c-status-check"><Check size={13} />Up to date</span><ChevronRight size={14} style={{ color: '#8E9684' }} /></div>
                    </div>

                    <div className="dg-c-item-row">
                      <div className="dg-c-item-left">
                        <div className="dg-c-item-icon-circle is-green"><Droplets size={15} /></div>
                        <div><div className="dg-c-item-title">Last quality upload</div><div className="dg-c-item-sub">22 Aug 2026, 04:50 PM</div></div>
                      </div>
                      <div className="dg-c-item-right"><span className="dg-c-status-check"><Check size={13} />Up to date</span><ChevronRight size={14} style={{ color: '#8E9684' }} /></div>
                    </div>

                    <div className="dg-c-item-row">
                      <div className="dg-c-item-left">
                        <div className="dg-c-item-icon-circle is-green"><FileText size={15} /></div>
                        <div><div className="dg-c-item-title">Last reconciliation batch</div><div className="dg-c-item-sub">21 Aug 2026, 11:30 AM</div></div>
                      </div>
                      <div className="dg-c-item-right">
                        <span className="dg-c-status-check"><Check size={13} />Reconciled</span>
                        <ChevronRight size={14} style={{ color: '#8E9684' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 2: PROCUREMENT (Vertical Spacious Architecture)
              ================================================================ */}
          {activeTab === 'procurement' && (
            <div>
              <div className="dg-c-page-header-row">
                <div>
                  <h1 className="dg-c-page-title">Procurement</h1>
                  <p className="dg-c-page-subtitle">
                    Track milk collection, capacity utilisation, session-wise trends and historical procurement data.
                  </p>
                  <div className="dg-c-gold-bar"></div>
                </div>

                <div className="dg-c-header-actions">
                  <div className="dg-c-date-pill">
                    <Calendar size={13} />
                    <span>16 Aug – 22 Aug 2026</span>
                  </div>
                  <button type="button" className="dg-c-btn-secondary" onClick={() => setActiveTab('explorer')}>
                    <Filter size={14} />
                    <span>Filters</span>
                  </button>
                  <button type="button" className="dg-c-btn-secondary">
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button type="button" className="dg-c-btn-primary" onClick={() => setIsUploadModalOpen(true)}>
                    <UploadCloud size={14} />
                    <span>+ Upload Data</span>
                  </button>
                </div>
              </div>

              {/* 7A. UNIFIED KPI STRIP */}
              <div className="dg-c-kpi-strip cols-6">
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">TOTAL COLLECTION</span>
                  <span className="dg-c-kpi-strip-val">1,245 L</span>
                  <span className="dg-c-kpi-strip-sub is-green">↑ 8.3% vs last 7 days</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">CAPACITY UTILISATION</span>
                  <span className="dg-c-kpi-strip-val">84%</span>
                  <span className="dg-c-kpi-strip-sub is-green">↑ 4.6% vs last 7 days</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">EXPECTED CAPACITY</span>
                  <span className="dg-c-kpi-strip-val">1,480 L</span>
                  <span className="dg-c-kpi-strip-sub">Daily threshold limit</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">ANOMALIES</span>
                  <span className="dg-c-kpi-strip-val">2</span>
                  <span className="dg-c-kpi-strip-sub is-red">2 High · 0 Medium · 0 Low</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">AVG. COLLECTION / DAY</span>
                  <span className="dg-c-kpi-strip-val">1,180 L</span>
                  <span className="dg-c-kpi-strip-sub">7-day rolling average</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">ACTIVE FARMERS</span>
                  <span className="dg-c-kpi-strip-val">86</span>
                  <span className="dg-c-kpi-strip-sub is-green">↑ 5.2% active intake</span>
                </div>
              </div>

              {/* 7B. ACTUAL VS EXPECTED CAPACITY HERO GRAPH */}
              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Actual Collection vs Expected Capacity</h2>
                    <p className="dg-c-card-subheading">Full 7-day longitudinal procurement comparison against registered cattle volume.</p>
                  </div>
                  <div className="dg-c-time-pill-group">
                    {['7D', '30D', '3M', '1Y'].map((t) => (
                      <button key={t} type="button" className={`dg-c-time-btn ${timeRange === t ? 'is-active' : ''}`} onClick={() => setTimeRange(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="dg-c-chart-wrap tall">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={procurementHeroData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="procRangeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EDE5D5" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="#EDE5D5" stopOpacity={0.25} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" vertical={false} />
                      <XAxis dataKey="date" stroke="#8E9684" fontSize={11} tickLine={false} axisLine={{ stroke: '#E4DED3' }} dy={6} />
                      <YAxis stroke="#8E9684" fontSize={11} tickLine={false} axisLine={false} domain={[0, 1600]} ticks={[0, 400, 800, 1200, 1600]} tickFormatter={(v) => (v === 0 ? '0' : v === 1200 ? '1.2K' : v === 1600 ? '1.6K' : `${v}`)} label={{ value: 'Litres (L)', angle: -90, position: 'insideLeft', dx: 5, dy: -80, fontSize: 10, fill: '#8E9684' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="rangeMax" stroke="none" fill="url(#procRangeGrad)" />
                      <Line type="monotone" dataKey="expected" stroke="#8E9B7E" strokeWidth={1.8} strokeDasharray="4 4" dot={false} />
                      <Line type="monotone" dataKey="actual" stroke="#2E3C1D" strokeWidth={2.2} dot={<CustomChartDot />} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="dg-c-chart-legend">
                  <div className="dg-c-legend-item"><div className="dg-c-legend-line-actual"></div><span>Actual Collection (L)</span></div>
                  <div className="dg-c-legend-item"><div className="dg-c-legend-line-expected"></div><span>Expected Capacity (L)</span></div>
                  <div className="dg-c-legend-item"><div className="dg-c-legend-box-range"></div><span>Expected Range</span></div>
                  <div className="dg-c-legend-item"><div className="dg-c-legend-dot-anomaly"></div><span>Anomaly</span></div>
                </div>
              </div>

              {/* 7C. COLLECTION BY SESSION */}
              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Collection by Session</h2>
                    <p className="dg-c-card-subheading">Intake partition across Morning (05:30–11:30) and Evening (16:30–20:30) sessions.</p>
                  </div>
                </div>

                <div className="dg-c-session-full-grid">
                  <div className="dg-c-session-box">
                    <div className="dg-c-session-box-header">
                      <span className="dg-c-session-box-title">☀️ Morning Shift (05:30 – 11:30 AM)</span>
                      <span className="dg-c-session-box-pct">59.6%</span>
                    </div>
                    <div className="dg-c-session-box-vol">742 L</div>
                    <div className="dg-c-session-progress">
                      <div className="dg-c-session-progress-bar" style={{ width: '59.6%' }}></div>
                    </div>
                  </div>

                  <div className="dg-c-session-box">
                    <div className="dg-c-session-box-header">
                      <span className="dg-c-session-box-title">🌙 Evening Shift (04:30 – 08:30 PM)</span>
                      <span className="dg-c-session-box-pct">40.4%</span>
                    </div>
                    <div className="dg-c-session-box-vol">503 L</div>
                    <div className="dg-c-session-progress">
                      <div className="dg-c-session-progress-bar" style={{ width: '40.4%', backgroundColor: '#38679A' }}></div>
                    </div>
                  </div>

                  <div className="dg-c-session-box" style={{ backgroundColor: '#EAF4EB', borderColor: '#D0E6D2' }}>
                    <div className="dg-c-session-box-header">
                      <span className="dg-c-session-box-title">💧 Total Day Intake</span>
                      <span className="dg-c-session-box-pct" style={{ color: '#205C24' }}>100%</span>
                    </div>
                    <div className="dg-c-session-box-vol" style={{ color: '#205C24' }}>1,245 L</div>
                    <div className="dg-c-capacity-banner" style={{ marginTop: 0, padding: '6px 8px', fontSize: '0.74rem' }}>
                      <Check size={13} />
                      <span>Collection is within expected daily capacity.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7D. TRENDS OVERVIEW */}
              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Trends Overview</h2>
                    <p className="dg-c-card-subheading">Comparative trends of daily intake volume and centre capacity headroom.</p>
                  </div>
                </div>

                <div className="dg-c-trends-2col">
                  <div className="dg-c-trend-subbox">
                    <div className="dg-c-trend-subtitle">Daily Collection Trend (L)</div>
                    <div style={{ width: '100%', height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyCollectionTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" vertical={false} />
                          <XAxis dataKey="day" stroke="#8E9684" fontSize={10} tickLine={false} />
                          <YAxis stroke="#8E9684" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Bar dataKey="volume" fill="#3F4A2C" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="dg-c-trend-subbox">
                    <div className="dg-c-trend-subtitle">Capacity Utilisation Trend (%)</div>
                    <div style={{ width: '100%', height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={capacityUtilisationTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" vertical={false} />
                          <XAxis dataKey="day" stroke="#8E9684" fontSize={10} tickLine={false} />
                          <YAxis stroke="#8E9684" fontSize={10} tickLine={false} axisLine={false} domain={[0, 120]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="util" stroke="#C59B5A" strokeWidth={2.2} dot={{ r: 4, fill: '#C59B5A' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* 7E. PROCUREMENT DATA TABLE */}
              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Procurement Data</h2>
                    <p className="dg-c-card-subheading">Verified daily batch records and upload timestamps.</p>
                  </div>
                  <button type="button" className="dg-c-btn-primary" onClick={() => setIsUploadModalOpen(true)}>
                    <UploadCloud size={14} />
                    <span>Upload Data</span>
                  </button>
                </div>

                <div className="dg-c-table-wrap">
                  <table className="dg-c-table">
                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>TOTAL COLLECTION</th>
                        <th>EXPECTED</th>
                        <th>UTILISATION</th>
                        <th>UPLOAD DATE</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {procurementTableData.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{row.date}</td>
                          <td className="dg-c-table-mono">{row.collection}</td>
                          <td className="dg-c-table-mono">{row.expected}</td>
                          <td>{row.util}</td>
                          <td style={{ color: '#6B7460' }}>{row.uploadTime}</td>
                          <td>
                            <span className={`dg-c-tag ${row.status.includes('Flagged') ? 'is-high' : 'is-success'}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className="dg-c-methodology-note">
                  Expected capacity is based on active farmers, historical collection patterns and seasonal adjustments.
                </p>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 3: RISK & ANOMALIES (With Prominent AI Feature Sections)
              ================================================================ */}
          {activeTab === 'risk' && (
            <div>
              <div className="dg-c-page-header-row">
                <div>
                  <h1 className="dg-c-page-title">Risk &amp; Anomalies</h1>
                  <p className="dg-c-page-subtitle">
                    Review detected anomalies, risk signals and transactions requiring attention.
                  </p>
                  <div className="dg-c-gold-bar"></div>
                </div>
              </div>

              {/* 1. Overall Risk Summary Strip */}
              <div className="dg-c-kpi-strip cols-5">
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">OVERALL RISK SCORE</span>
                  <span className="dg-c-kpi-strip-val">72 / 100</span>
                  <span className="dg-c-kpi-strip-sub" style={{ color: '#C59B5A', fontWeight: 700 }}>Medium Risk</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">HIGH-RISK TRANSACTIONS</span>
                  <span className="dg-c-kpi-strip-val" style={{ color: '#C03728' }}>2</span>
                  <span className="dg-c-kpi-strip-sub is-red">Review recommended</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">MEDIUM-RISK SIGNALS</span>
                  <span className="dg-c-kpi-strip-val" style={{ color: '#C59B5A' }}>3</span>
                  <span className="dg-c-kpi-strip-sub">Capacity &amp; delay flags</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">LOW-RISK NOTICES</span>
                  <span className="dg-c-kpi-strip-val" style={{ color: '#2B5C8F' }}>2</span>
                  <span className="dg-c-kpi-strip-sub">Sync &amp; calibration logs</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">LAST MODEL UPDATE</span>
                  <span className="dg-c-kpi-strip-val" style={{ fontSize: '1.05rem' }}>17:30 IST</span>
                  <span className="dg-c-kpi-strip-sub">22 Aug 2026</span>
                </div>
              </div>

              {/* 2. Risk Score Trend Graph */}
              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Risk Score Trend</h2>
                    <p className="dg-c-card-subheading">Rolling 30-day Centre Risk Score progression with critical threshold reference.</p>
                  </div>
                </div>

                <div className="dg-c-chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={riskScoreTrendData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" vertical={false} />
                      <XAxis dataKey="date" stroke="#8E9684" fontSize={11} tickLine={false} />
                      <YAxis stroke="#8E9684" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="score" stroke="#1E2714" strokeWidth={2.5} dot={{ r: 4, fill: '#C59B5A' }} activeDot={{ r: 6, fill: '#C03728' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* ============================================================
                  3. HIGHEST PRIORITY: ISOLATION FOREST ANOMALY DETECTION
                  ============================================================ */}
              <div className="dg-c-ai-feature-card">
                <div className="dg-c-ai-feature-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="dg-c-ai-badge-tag"><Cpu size={12} /> AI Risk Model</span>
                      <h2 className="dg-c-card-heading" style={{ margin: 0 }}>Isolation Forest Anomaly Detection</h2>
                    </div>
                    <p className="dg-c-card-subheading">
                      AI-assisted multi-dimensional anomaly detection identifying statistically unusual procurement transactions and intake outliers across milk volume, composition (FAT, SNF), and temperature metrics.
                    </p>
                  </div>
                </div>

                {/* Isolation Forest Scatter Plot */}
                <div style={{ width: '100%', height: 280, marginTop: 10 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" />
                      <XAxis type="number" dataKey="volume" name="Collection Volume (L)" stroke="#8E9684" fontSize={11} unit="L" />
                      <YAxis type="number" dataKey="anomalyScore" name="Anomaly Score" stroke="#8E9684" fontSize={11} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div style={{ backgroundColor: '#1E2714', color: '#F1EFE7', padding: '8px 12px', borderRadius: 8, fontSize: '0.78rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                <div style={{ fontWeight: 700, color: data.status === 'Anomaly' ? '#FF8A80' : '#A5D6A7' }}>
                                  {data.id} · {data.status === 'Anomaly' ? 'Flagged Anomaly' : 'Normal Observation'}
                                </div>
                                <div>Centre: {data.centre}</div>
                                <div>Volume: {data.volume} L</div>
                                <div>FAT: {data.fat} · SNF: {data.snf}</div>
                                <div>Temperature: {data.temp}</div>
                                <div>Isolation Score: {data.anomalyScore}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine y={10} stroke="#C59B5A" strokeDasharray="4 4" label={{ value: 'Anomaly Threshold (Score ≥ 10)', fill: '#8C6220', fontSize: 10, position: 'insideTopRight' }} />
                      <Scatter
                        name="Normal Observations"
                        data={isolationForestNormal}
                        fill="#2E7D32"
                        shape={<NormalScatterDot />}
                      />
                      <Scatter
                        name="Flagged Anomalies"
                        data={isolationForestAnomaly}
                        fill="#C03728"
                        shape={<AnomalyScatterDot />}
                        onClick={(entry) => {
                          if (entry && entry.id) {
                            setHighlightedAnomalyId(entry.id);
                            const tx = sampleTransactions.find((t) => t.id === entry.id);
                            if (tx) setSelectedTransaction(tx);
                          }
                        }}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="dg-c-chart-legend" style={{ margin: '8px 0 16px 0' }}>
                  <div className="dg-c-legend-item">
                    <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#2E7D32', border: '1.5px solid #FFFFFF', display: 'inline-block' }}></span>
                    <span>Normal Intake Observations (Baseline Fit)</span>
                  </div>
                  <div className="dg-c-legend-item">
                    <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#C03728', border: '2px solid #FFFFFF', display: 'inline-block' }}></span>
                    <span>Flagged Statistical Anomalies (Requires Verification)</span>
                  </div>
                  <div className="dg-c-legend-item">
                    <span style={{ width: 16, height: 2, borderTop: '2px dashed #C59B5A' }}></span>
                    <span>Isolation Threshold</span>
                  </div>
                </div>

                <p className="dg-c-methodology-note" style={{ margin: '0 0 18px 0', borderTop: '1px solid #ECE6DC', paddingTop: 10 }}>
                  <strong>Notice:</strong> Isolation Forest identifies statistical anomalies for investigation. A flagged observation is not a confirmed fraud finding.
                </p>

                {/* 4. Isolation Forest Associated Data Table */}
                <div style={{ marginTop: 16 }}>
                  <div className="dg-c-card-header" style={{ marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#1E2714' }}>
                        Isolation Forest Data Table
                      </h3>
                      <p className="dg-c-card-subheading">Structured record-level observations with multi-dimensional milk volume and composition attributes.</p>
                    </div>
                  </div>

                  <div className="dg-c-table-wrap">
                    <table className="dg-c-table">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>pH</th>
                          <th>Temperature</th>
                          <th>Volume</th>
                          <th>SNF %</th>
                          <th>FAT %</th>
                          <th>Isolation Score</th>
                          <th>Anomaly Status</th>
                          <th>Risk Score</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isolationForestRecordsTable.map((row) => (
                          <tr
                            key={row.id}
                            className={`dg-c-interactive-point-row ${highlightedAnomalyId === row.id ? 'is-selected' : ''}`}
                            onClick={() => {
                              setHighlightedAnomalyId(row.id);
                              const tx = sampleTransactions.find((t) => t.id === row.id);
                              if (tx) setSelectedTransaction(tx);
                            }}
                          >
                            <td className="dg-c-table-mono">{row.id}</td>
                            <td style={{ fontWeight: 700, color: row.isAnomaly && (parseFloat(row.ph) < 6.5 || parseFloat(row.ph) > 6.9) ? '#96362C' : '#2E3C1D' }}>
                              {row.ph}
                            </td>
                            <td style={{ color: row.isAnomaly && parseFloat(row.temp) > 4.5 ? '#96362C' : '#2E3C1D', fontWeight: 600 }}>
                              {row.temp}
                            </td>
                            <td className="dg-c-table-mono">{row.volume}</td>
                            <td style={{ fontWeight: 600, color: row.isAnomaly && parseFloat(row.snf) < 8.5 ? '#96362C' : '#2E3C1D' }}>
                              {row.snf}
                            </td>
                            <td style={{ fontWeight: 600 }}>{row.fat}</td>
                            <td><span className="dg-c-tag is-neutral">{row.isolationScore}</span></td>
                            <td>
                              <span className={`dg-c-tag ${row.isAnomaly ? 'is-critical' : 'is-success'}`}>
                                {row.anomalyStatus}
                              </span>
                            </td>
                            <td>
                              <span className={`dg-c-tag ${row.riskScore >= 80 ? 'is-critical' : row.riskScore >= 60 ? 'is-medium' : 'is-low'}`}>
                                {row.riskScore} / 100
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="dg-c-view-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const tx = sampleTransactions.find((t) => t.id === row.id);
                                  if (tx) setSelectedTransaction(tx);
                                }}
                              >
                                <span>Inspect</span>
                                <span>→</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ============================================================
                  5. HIGHEST PRIORITY: NETWORK RISK CLUSTERS
                  ============================================================ */}
              <div className="dg-c-ai-feature-card">
                <div className="dg-c-ai-feature-header">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span className="dg-c-ai-badge-tag" style={{ backgroundColor: '#1A2938', color: '#90C2EB' }}><Network size={12} /> Graph Analytics</span>
                      <h2 className="dg-c-card-heading" style={{ margin: 0 }}>Network Risk Clusters</h2>
                    </div>
                    <p className="dg-c-card-subheading">
                      Graph-based relationship analytics identifying interconnected behavioral anomalies, multi-centre supplier overlaps, and coordinated intake risk patterns across DCS nodes.
                    </p>
                  </div>
                </div>

                {/* Network Cluster Visualisation */}
                <div style={{ width: '100%', height: 260, marginTop: 10 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" />
                      <XAxis type="number" dataKey="x" name="Shared Collector / Centre Signal" stroke="#8E9684" fontSize={11} />
                      <YAxis type="number" dataKey="y" name="Graph Similarity Score" stroke="#8E9684" fontSize={11} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div style={{ backgroundColor: '#1E2714', color: '#F1EFE7', padding: '8px 12px', borderRadius: 8, fontSize: '0.78rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                                <div style={{ fontWeight: 700, color: '#FF8A80' }}>{data.name}</div>
                                <div>Cluster ID: {data.clusterId}</div>
                                <div>Network Similarity: {data.y}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter
                        name="Normal Relationships"
                        data={networkNormal}
                        fill="#2E7D32"
                        shape={<NormalScatterDot />}
                      />
                      <Scatter
                        name="Identified Risk Clusters"
                        data={networkAnomaly}
                        fill="#C03728"
                        shape={<AnomalyScatterDot />}
                        onClick={(entry) => {
                          if (entry) setHighlightedClusterId(entry.clusterId || 'NC-MH-01');
                        }}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                <div className="dg-c-chart-legend" style={{ margin: '8px 0 16px 0' }}>
                  <div className="dg-c-legend-item">
                    <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#2E7D32', border: '1.5px solid #FFFFFF', display: 'inline-block' }}></span>
                    <span>Normal Independent Suppliers</span>
                  </div>
                  <div className="dg-c-legend-item">
                    <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#C03728', border: '2px solid #FFFFFF', display: 'inline-block' }}></span>
                    <span>Correlated Risk Sub-Network</span>
                  </div>
                </div>

                <p className="dg-c-methodology-note" style={{ margin: '0 0 18px 0', borderTop: '1px solid #ECE6DC', paddingTop: 10 }}>
                  <strong>Notice:</strong> Network patterns are risk signals for investigation and do not independently establish wrongdoing.
                </p>

                {/* 6. Network Cluster Associated Data Table */}
                <div style={{ marginTop: 16 }}>
                  <div className="dg-c-card-header" style={{ marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: 0, color: '#1E2714' }}>
                        Network Risk Cluster Data Table
                      </h3>
                      <p className="dg-c-card-subheading">Entities and supply nodes exhibiting interconnected behavioral anomalies across collection routes.</p>
                    </div>
                  </div>

                  <div className="dg-c-table-wrap">
                    <table className="dg-c-table">
                      <thead>
                        <tr>
                          <th>Cluster ID</th>
                          <th>Collection Centre</th>
                          <th>Connected Entity/Node</th>
                          <th>Cluster Size</th>
                          <th>Risk Level</th>
                          <th>Shared Risk Signals</th>
                          <th>Risk Score</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {networkClusterTable.map((cl, idx) => (
                          <tr
                            key={idx}
                            className={`dg-c-interactive-point-row ${highlightedClusterId === cl.clusterId ? 'is-selected' : ''}`}
                            onClick={() => setHighlightedClusterId(cl.clusterId)}
                          >
                            <td className="dg-c-table-mono" style={{ fontWeight: 700 }}>{cl.clusterId}</td>
                            <td style={{ fontSize: '0.78rem' }}>{cl.centre}</td>
                            <td style={{ fontWeight: 600 }}>{cl.connectedEntity}</td>
                            <td><span className="dg-c-tag is-neutral">{cl.clusterSize}</span></td>
                            <td>
                              <span className={`dg-c-tag ${cl.riskLevel === 'Critical' || cl.riskLevel === 'High' ? 'is-critical' : 'is-medium'}`}>
                                {cl.riskLevel}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.78rem', color: '#4A5538' }}>{cl.sharedSignals}</td>
                            <td>
                              <span className={`dg-c-tag ${cl.riskScore >= 80 ? 'is-critical' : 'is-medium'}`}>
                                {cl.riskScore} / 100
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="dg-c-view-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Tracing graph topology for ${cl.clusterId}: ${cl.connectedEntity}.`);
                                }}
                              >
                                <span>Trace Graph</span>
                                <span>→</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* 7. Flag-Type Breakdown Bar Chart */}
              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Flag-Type Breakdown</h2>
                    <p className="dg-c-card-subheading">Distribution of active risk signals by anomaly category.</p>
                  </div>
                </div>

                <div style={{ width: '100%', height: 230 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={flagTypeBreakdownData} layout="vertical" margin={{ top: 10, right: 15, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" horizontal={false} />
                      <XAxis type="number" stroke="#8E9684" fontSize={10} tickLine={false} />
                      <YAxis type="category" dataKey="flag" stroke="#8E9684" fontSize={11} tickLine={false} axisLine={false} width={130} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3F4A2C" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 8. Highest-Risk Transactions Table */}
              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Highest-Risk Transactions</h2>
                    <p className="dg-c-card-subheading">Ranked by DairyGuard combined anomaly score. Click any row to inspect signals.</p>
                  </div>
                </div>

                <div className="dg-c-table-wrap">
                  <table className="dg-c-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Date / Time</th>
                        <th>Farmer</th>
                        <th>Quantity</th>
                        <th>Risk Score</th>
                        <th>Primary Flag</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleTransactions.slice(0, 4).map((tx) => (
                        <tr key={tx.id} onClick={() => setSelectedTransaction(tx)} style={{ cursor: 'pointer' }}>
                          <td className="dg-c-table-mono">{tx.id}</td>
                          <td style={{ color: '#6B7460' }}>{tx.date}</td>
                          <td style={{ fontWeight: 600 }}>{tx.farmerName} <span style={{ color: '#8E9684', fontSize: '0.74rem' }}>({tx.farmerId})</span></td>
                          <td className="dg-c-table-mono">{tx.quantity}</td>
                          <td>
                            <span className={`dg-c-tag ${tx.riskScore >= 80 ? 'is-critical' : tx.riskScore >= 60 ? 'is-medium' : 'is-low'}`}>
                              {tx.riskScore} / 100
                            </span>
                          </td>
                          <td>{tx.primaryFlag}</td>
                          <td>
                            <span className={`dg-c-tag ${tx.status === 'Verified' ? 'is-success' : 'is-neutral'}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td>
                            <button type="button" className="dg-c-view-link" onClick={(e) => { e.stopPropagation(); setSelectedTransaction(tx); }}>
                              <span>Why was this flagged?</span>
                              <span>→</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 9 & 10. OCR Verification & Capacity Mismatch */}
              <div className="dg-c-mid-row">
                <div className="dg-c-white-card" style={{ marginBottom: 0 }}>
                  <div className="dg-c-card-header">
                    <div>
                      <h2 className="dg-c-card-heading">OCR Verification</h2>
                      <p className="dg-c-card-subheading">Automated slip parsing vs digital AMCS telemetry reconciliation.</p>
                    </div>
                  </div>

                  <div className="dg-c-rows-list">
                    <div className="dg-c-item-row">
                      <div>
                        <div className="dg-c-item-title">Collection Slip #9021 (Ramesh Patil)</div>
                        <div className="dg-c-item-sub">Extracted: 18.5 L · FAT: 2.8% | System: 18.5 L · FAT: 2.8%</div>
                      </div>
                      <span className="dg-c-tag is-success">Matched</span>
                    </div>

                    <div className="dg-c-item-row">
                      <div>
                        <div className="dg-c-item-title">Weighment Slip #9014 (Sunil Shinde)</div>
                        <div className="dg-c-item-sub">Extracted: 42.8 L · Cattle: 2 cows | System: Expected max 24.0 L</div>
                      </div>
                      <span className="dg-c-tag is-medium">Partial Match</span>
                    </div>

                    <div className="dg-c-item-row">
                      <div>
                        <div className="dg-c-item-title">Chilling Tank Log #04 (Morning Dispatch)</div>
                        <div className="dg-c-item-sub">Extracted: 742 L | Outbound Tanker Receipt: 742 L</div>
                      </div>
                      <span className="dg-c-tag is-success">Matched</span>
                    </div>
                  </div>
                </div>

                <div className="dg-c-white-card" style={{ marginBottom: 0 }}>
                  <div className="dg-c-card-header">
                    <div>
                      <h2 className="dg-c-card-heading">Capacity Mismatch</h2>
                      <p className="dg-c-card-subheading">Registered cattle census vs observed intake volume.</p>
                    </div>
                  </div>

                  <div className="dg-c-rows-list">
                    <div className="dg-c-item-row">
                      <div>
                        <div className="dg-c-item-title">Sunil Shinde (2 Cows)</div>
                        <div className="dg-c-item-sub">Delivered: 42.8 L | Max Biological Capacity: 24.0 L (+78% deviation)</div>
                      </div>
                      <span className="dg-c-tag is-high">Mismatch</span>
                    </div>
                    <div className="dg-c-item-row">
                      <div>
                        <div className="dg-c-item-title">Ramesh Patil (4 Buffaloes)</div>
                        <div className="dg-c-item-sub">Delivered: 18.5 L | Expected Capacity: 28.0 L (-34% drop)</div>
                      </div>
                      <span className="dg-c-tag is-medium">Under Yield</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 4: DATA EXPLORER
              ================================================================ */}
          {activeTab === 'explorer' && (
            <div>
              <div className="dg-c-page-header-row">
                <div>
                  <h1 className="dg-c-page-title">Data Explorer</h1>
                  <p className="dg-c-page-subtitle">
                    Search, filter, and audit underlying raw procurement records and quality parameters.
                  </p>
                  <div className="dg-c-gold-bar"></div>
                </div>

                <div className="dg-c-header-actions">
                  <button type="button" className="dg-c-btn-secondary">
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button type="button" className="dg-c-btn-primary" onClick={() => setIsUploadModalOpen(true)}>
                    <UploadCloud size={14} />
                    <span>+ Upload Procurement File</span>
                  </button>
                </div>
              </div>

              {/* Multi-Filter Bar */}
              <div className="dg-c-white-card">
                <div className="dg-c-filter-bar">
                  <div className="dg-c-filter-group">
                    <div className="dg-c-search-input-wrap">
                      <Search size={14} className="dg-c-search-icon" />
                      <input
                        type="text"
                        placeholder="Search TRX ID, Farmer ID, or Name..."
                        className="dg-c-search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <select className="dg-c-select" value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)}>
                      <option value="all">All Risk Levels</option>
                      <option value="high">High Risk (&ge;75)</option>
                      <option value="medium">Medium Risk (50–74)</option>
                      <option value="low">Low Risk (&lt;50)</option>
                    </select>

                    <select className="dg-c-select">
                      <option>All Sessions (Morning &amp; Evening)</option>
                      <option>Morning (05:30–11:30)</option>
                      <option>Evening (16:30–20:30)</option>
                    </select>
                  </div>

                  <span style={{ fontSize: '0.78rem', color: '#6B7460', fontWeight: 600 }}>
                    Showing {filteredTransactions.length} of {sampleTransactions.length} records
                  </span>
                </div>

                {/* Explorer Table */}
                <div className="dg-c-table-wrap">
                  <table className="dg-c-table">
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Date &amp; Time</th>
                        <th>Farmer Name</th>
                        <th>Quantity</th>
                        <th>FAT %</th>
                        <th>SNF %</th>
                        <th>Temp</th>
                        <th>Risk</th>
                        <th>Primary Flag</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} onClick={() => setSelectedTransaction(tx)} style={{ cursor: 'pointer' }}>
                          <td className="dg-c-table-mono">{tx.id}</td>
                          <td style={{ color: '#6B7460' }}>{tx.date}</td>
                          <td style={{ fontWeight: 600 }}>{tx.farmerName} <span style={{ color: '#8E9684', fontSize: '0.74rem' }}>({tx.farmerId})</span></td>
                          <td className="dg-c-table-mono">{tx.quantity}</td>
                          <td>{tx.fat}</td>
                          <td>{tx.snf}</td>
                          <td>{tx.temp}</td>
                          <td>
                            <span className={`dg-c-tag ${tx.riskScore >= 80 ? 'is-critical' : tx.riskScore >= 60 ? 'is-medium' : 'is-low'}`}>
                              {tx.riskScore}
                            </span>
                          </td>
                          <td>{tx.primaryFlag}</td>
                          <td>
                            <span className={`dg-c-tag ${tx.status === 'Verified' ? 'is-success' : 'is-neutral'}`}>
                              {tx.status}
                            </span>
                          </td>
                          <td>
                            <button type="button" className="dg-c-view-link" onClick={(e) => { e.stopPropagation(); setSelectedTransaction(tx); }}>
                              <span>Inspect</span>
                              <span>→</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 5: FARMERS
              ================================================================ */}
          {activeTab === 'farmers' && (
            <div>
              <div className="dg-c-page-header-row">
                <div>
                  <h1 className="dg-c-page-title">Farmers</h1>
                  <p className="dg-c-page-subtitle">
                    Manage registered contributing dairy farmers, delivery consistency, and quality compliance.
                  </p>
                  <div className="dg-c-gold-bar"></div>
                </div>

                <div className="dg-c-header-actions">
                  <button type="button" className="dg-c-btn-secondary">
                    <Download size={14} />
                    <span>Export Farmer Payouts</span>
                  </button>
                </div>
              </div>

              <div className="dg-c-kpi-strip cols-4">
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">TOTAL REGISTERED</span>
                  <span className="dg-c-kpi-strip-val">86 Farmers</span>
                  <span className="dg-c-kpi-strip-sub is-green">100% KYC verified</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">TODAY'S ACTIVE INTAKE</span>
                  <span className="dg-c-kpi-strip-val">74 Farmers</span>
                  <span className="dg-c-kpi-strip-sub">86.0% attendance rate</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">AVG. DAILY YIELD / FARMER</span>
                  <span className="dg-c-kpi-strip-val">16.8 L</span>
                  <span className="dg-c-kpi-strip-sub">Normal: 12–22 L / day</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">FLAGGED FARMERS</span>
                  <span className="dg-c-kpi-strip-val" style={{ color: '#C03728' }}>2</span>
                  <span className="dg-c-kpi-strip-sub is-red">Cattle yield audit pending</span>
                </div>
              </div>

              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Farmer Directory</h2>
                    <p className="dg-c-card-subheading">Contributing producers associated with Centre CC-MH-0247.</p>
                  </div>
                </div>

                <div className="dg-c-table-wrap">
                  <table className="dg-c-table">
                    <thead>
                      <tr>
                        <th>Farmer ID</th>
                        <th>Name</th>
                        <th>Cattle Count</th>
                        <th>7D Volume</th>
                        <th>Avg FAT %</th>
                        <th>Avg SNF %</th>
                        <th>Risk Score</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farmerDirectoryData.map((f) => (
                        <tr key={f.id} onClick={() => setSelectedFarmer(f)} style={{ cursor: 'pointer' }}>
                          <td className="dg-c-table-mono">{f.id}</td>
                          <td style={{ fontWeight: 700 }}>{f.name}</td>
                          <td>{f.cattle}</td>
                          <td className="dg-c-table-mono">{f.vol7D}</td>
                          <td>{f.avgFat}</td>
                          <td>{f.avgSnf}</td>
                          <td>
                            <span className={`dg-c-tag ${f.risk >= 80 ? 'is-critical' : f.risk >= 50 ? 'is-medium' : 'is-low'}`}>
                              {f.risk}
                            </span>
                          </td>
                          <td>
                            <span className={`dg-c-tag ${f.status === 'Active' ? 'is-success' : 'is-high'}`}>
                              {f.status}
                            </span>
                          </td>
                          <td>
                            <button type="button" className="dg-c-view-link" onClick={(e) => { e.stopPropagation(); setSelectedFarmer(f); }}>
                              <span>View Profile</span>
                              <span>→</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 6: QUALITY
              ================================================================ */}
          {activeTab === 'quality' && (
            <div>
              <div className="dg-c-page-header-row">
                <div>
                  <h1 className="dg-c-page-title">Quality</h1>
                  <p className="dg-c-page-subtitle">
                    Calibrated milk composition telemetry, chilling logs, and adulterant screening.
                  </p>
                  <div className="dg-c-gold-bar"></div>
                </div>

                <div className="dg-c-header-actions">
                  <button type="button" className="dg-c-btn-secondary">
                    <Download size={14} />
                    <span>Export Quality Logs</span>
                  </button>
                </div>
              </div>

              <div className="dg-c-kpi-strip cols-4">
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">AVERAGE FAT</span>
                  <span className="dg-c-kpi-strip-val">4.42%</span>
                  <span className="dg-c-kpi-strip-sub is-green">Target: 4.0% – 5.2%</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">AVERAGE SNF</span>
                  <span className="dg-c-kpi-strip-val">8.78%</span>
                  <span className="dg-c-kpi-strip-sub is-green">Target: 8.5% – 9.0%</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">CHILLING TEMPERATURE</span>
                  <span className="dg-c-kpi-strip-val">3.8°C</span>
                  <span className="dg-c-kpi-strip-sub is-green">Target: &le; 4.0°C</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">QUALITY COMPLIANCE</span>
                  <span className="dg-c-kpi-strip-val">93%</span>
                  <span className="dg-c-kpi-strip-sub is-green">Good rating</span>
                </div>
              </div>

              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">7-Day Quality Parameter Trends</h2>
                    <p className="dg-c-card-subheading">Sensor logs of FAT, SNF, and Chilling temperature across reception sessions.</p>
                  </div>
                </div>

                <div className="dg-c-chart-wrap">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={qualityTrendsData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" vertical={false} />
                      <XAxis dataKey="date" stroke="#8E9684" fontSize={11} tickLine={false} />
                      <YAxis stroke="#8E9684" fontSize={11} tickLine={false} axisLine={false} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="fat" name="FAT %" stroke="#2E3C1D" strokeWidth={2.2} dot={{ r: 4, fill: '#2E3C1D' }} />
                      <Line type="monotone" dataKey="snf" name="SNF %" stroke="#2B5C8F" strokeWidth={2.2} dot={{ r: 4, fill: '#2B5C8F' }} />
                      <Line type="monotone" dataKey="temp" name="Temp (°C)" stroke="#C59B5A" strokeWidth={2.2} dot={{ r: 4, fill: '#C59B5A' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Lab &amp; Adulterant Screening Register</h2>
                    <p className="dg-c-card-subheading">Official purity and adulteration test logs from Centre CC-MH-0247 automated analyser.</p>
                  </div>
                </div>

                <div className="dg-c-table-wrap">
                  <table className="dg-c-table">
                    <thead>
                      <tr>
                        <th>Test Parameter</th>
                        <th>Standard Specification</th>
                        <th>Observed Reading</th>
                        <th>Test Method</th>
                        <th>Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 700 }}>Urea / Fertilizer Screen</td>
                        <td>0.00% (Absent)</td>
                        <td>Negative (0.00%)</td>
                        <td>DMAB Colorimetric</td>
                        <td><span className="dg-c-tag is-success">Passed</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700 }}>Starch &amp; Maltodextrin</td>
                        <td>0.00% (Absent)</td>
                        <td>Negative (0.00%)</td>
                        <td>Iodine Complexation</td>
                        <td><span className="dg-c-tag is-success">Passed</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700 }}>Neutralizers (NaOH / Soda)</td>
                        <td>0.00% (Absent)</td>
                        <td>Negative (pH 6.68)</td>
                        <td>Rosolic Acid Test</td>
                        <td><span className="dg-c-tag is-success">Passed</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 700 }}>Added Water Index</td>
                        <td>Freezing Point &le; -0.525°C</td>
                        <td>-0.534°C</td>
                        <td>Cryoscope Telemetry</td>
                        <td><span className="dg-c-tag is-success">0.0% Added Water</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 7: CHRONOS BOLT FORECASTING
              ================================================================ */}
          {activeTab === 'chronos-bolt' && (
            <div>
              <div className="dg-c-page-header-row">
                <div>
                  <h1 className="dg-c-page-title">Chronos Bolt</h1>
                  <p className="dg-c-page-subtitle">
                    Zero-shot foundation time-series forecasting for milk intake projections and anomaly threshold calibration.
                  </p>
                  <div className="dg-c-gold-bar"></div>
                </div>

                <div className="dg-c-header-actions">
                  <button
                    type="button"
                    className="dg-c-btn-secondary"
                    onClick={() => alert('Chronos Bolt forecast model re-calibrated against latest AMCS 15-minute sensor data.')}
                  >
                    <RotateCw size={13} />
                    <span>Run Forecast Inference</span>
                  </button>
                  <button
                    type="button"
                    className="dg-c-btn-primary"
                    onClick={() => alert('Exporting Chronos Bolt predictions CSV...')}
                  >
                    <Download size={13} />
                    <span>Export Forecast CSV</span>
                  </button>
                </div>
              </div>

              {/* 1. Chronos Bolt KPI Strip */}
              <div className="dg-c-kpi-strip cols-5">
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">FOUNDATION MODEL</span>
                  <span className="dg-c-kpi-strip-val">Chronos Bolt</span>
                  <span className="dg-c-kpi-strip-sub">Amazon Zero-Shot (54M)</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">FORECAST HORIZON</span>
                  <span className="dg-c-kpi-strip-val">7-Day Rolling</span>
                  <span className="dg-c-kpi-strip-sub">14 Intake Shifts</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">PROJECTED INTAKE</span>
                  <span className="dg-c-kpi-strip-val">1,290 L / day</span>
                  <span className="dg-c-kpi-strip-sub is-green">↑ 3.6% vs 7D baseline</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">CONFIDENCE BAND</span>
                  <span className="dg-c-kpi-strip-val">95.4% (±2σ)</span>
                  <span className="dg-c-kpi-strip-sub">Calibrated P10–P90</span>
                </div>
                <div className="dg-c-kpi-strip-item">
                  <span className="dg-c-kpi-strip-label">INFERENCE LATENCY</span>
                  <span className="dg-c-kpi-strip-val">42 ms</span>
                  <span className="dg-c-kpi-strip-sub">Sub-second edge model</span>
                </div>
              </div>

              {/* 2. Forecast Trajectory Chart */}
              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Intake Volume Forecast Trajectory</h2>
                    <p className="dg-c-card-subheading">
                      Probabilistic time-series predictions generated by Chronos Bolt vs authoritative collection centre receipts.
                    </p>
                  </div>
                  <div className="dg-c-pills">
                    <button type="button" className="dg-c-pill">24H</button>
                    <button type="button" className="dg-c-pill is-active">7D</button>
                    <button type="button" className="dg-c-pill">14D</button>
                    <button type="button" className="dg-c-pill">30D</button>
                  </div>
                </div>

                <div className="dg-c-chart-wrap" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chronosBoltForecastData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" vertical={false} />
                      <XAxis dataKey="date" stroke="#8E9684" fontSize={11} tickLine={false} />
                      <YAxis stroke="#8E9684" fontSize={11} tickLine={false} axisLine={false} domain={[500, 1800]} ticks={[600, 900, 1200, 1500, 1800]} unit="L" />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div style={{ backgroundColor: '#1E2714', color: '#F1EFE7', padding: '10px 14px', borderRadius: 8, fontSize: '0.8rem', boxShadow: '0 6px 16px rgba(0,0,0,0.25)' }}>
                                <div style={{ fontWeight: 700, marginBottom: 4, color: '#F3E8C8' }}>{label}</div>
                                {data.actual !== null && <div>Actual Intake: <strong>{data.actual} L</strong></div>}
                                <div>Chronos Bolt Forecast: <strong style={{ color: '#90C2EB' }}>{data.predicted} L</strong></div>
                                <div style={{ fontSize: '0.74rem', color: '#A5B598', marginTop: 3 }}>
                                  P10–P90 Confidence: {data.lowerP10} L – {data.upperP90} L
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine
                        y={1500}
                        stroke="#96362C"
                        strokeDasharray="4 4"
                        label={{ value: 'Capacity Limit (1,500 L)', fill: '#96362C', fontSize: 10, position: 'insideTopRight' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="upperP90"
                        stroke="none"
                        fill="#DCE8D7"
                        fillOpacity={0.55}
                        name="90% Confidence Interval (P90)"
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerP10"
                        stroke="none"
                        fill="#FFFFFF"
                        fillOpacity={1}
                        name="Confidence Lower (P10)"
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        name="Chronos Bolt Forecast"
                        stroke="#2B5C8F"
                        strokeWidth={2.5}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: '#2B5C8F' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        name="Actual Intake"
                        stroke="#2E7D32"
                        strokeWidth={2.8}
                        dot={<CustomChartDot />}
                        connectNulls={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="dg-c-chart-legend" style={{ margin: '10px 0 6px 0' }}>
                  <div className="dg-c-legend-item">
                    <span style={{ width: 12, height: 3, backgroundColor: '#2E7D32', display: 'inline-block' }}></span>
                    <span>Authoritative Actual Intake (L)</span>
                  </div>
                  <div className="dg-c-legend-item">
                    <span style={{ width: 14, height: 2, borderTop: '2px dashed #2B5C8F', display: 'inline-block' }}></span>
                    <span>Chronos Bolt Projected Volume (L)</span>
                  </div>
                  <div className="dg-c-legend-item">
                    <span style={{ width: 14, height: 10, backgroundColor: '#DCE8D7', border: '1px solid #B8CFB0', display: 'inline-block', borderRadius: 2 }}></span>
                    <span>90% Probabilistic Confidence Band (P10–P90)</span>
                  </div>
                  <div className="dg-c-legend-item">
                    <span style={{ width: 14, height: 2, borderTop: '2px dashed #96362C', display: 'inline-block' }}></span>
                    <span>Chilling Capacity Limit (1,500 L)</span>
                  </div>
                </div>

                <p className="dg-c-methodology-note" style={{ margin: '14px 0 0 0', borderTop: '1px solid #ECE6DC', paddingTop: 10 }}>
                  <strong>Notice:</strong> Chronos Bolt foundation model outputs generate probabilistic volume estimates based on multi-scale time-series representations. Actual weighment intake at the collection centre remains authoritative for procurement settlement.
                </p>
              </div>

              {/* 3. Shift-Level Prediction Schedule & Model Parameters */}
              <div className="dg-c-white-card">
                <div className="dg-c-card-header">
                  <div>
                    <h2 className="dg-c-card-heading">Session Forecast Schedule &amp; Model Parameters</h2>
                    <p className="dg-c-card-subheading">
                      Shift-level volume projections prepared for AMCS validation and automated reconciliation.
                    </p>
                  </div>
                </div>

                <div className="dg-c-table-wrap">
                  <table className="dg-c-table">
                    <thead>
                      <tr>
                        <th>Target Session / Shift</th>
                        <th>Expected Contributing Farmers</th>
                        <th>Historical Baseline</th>
                        <th>Chronos Bolt Projected</th>
                        <th>P10–P90 Confidence Range</th>
                        <th>Volatility Index</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chronosBoltScheduleTable.map((sch, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{sch.session}</td>
                          <td className="dg-c-table-mono">{sch.expectedFarmers} registered</td>
                          <td className="dg-c-table-mono">{sch.baseline}</td>
                          <td className="dg-c-table-mono" style={{ fontWeight: 800, color: '#2B5C8F' }}>{sch.predicted}</td>
                          <td style={{ color: '#526046', fontSize: '0.78rem' }}>{sch.range}</td>
                          <td><span className="dg-c-tag is-neutral">{sch.volatility}</span></td>
                          <td><span className="dg-c-tag is-success">{sch.status}</span></td>
                          <td>
                            <button
                              type="button"
                              className="dg-c-view-link"
                              onClick={() => alert(`Inspecting Chronos Bolt zero-shot attention weights for ${sch.session}.`)}
                            >
                              <span>Parameters</span>
                              <span>→</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 9: SETTINGS & HELP
              ================================================================ */}
          {activeTab === 'settings' && (
            <div>
              <div className="dg-c-page-header">
                <h1 className="dg-c-page-title">Centre Settings</h1>
                <p className="dg-c-page-subtitle">Configure collection sensors, telemetry sync frequencies, and operator access.</p>
                <div className="dg-c-gold-bar"></div>
              </div>

              <div className="dg-c-white-card">
                <h2 className="dg-c-card-heading" style={{ marginBottom: 14 }}>Collection Node Configuration</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="dg-c-session-box">
                    <span className="dg-c-session-box-title">Centre Identifier</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4 }}>CC-MH-0247</div>
                    <span style={{ fontSize: '0.75rem', color: '#6B7460' }}>Pune District Union DCS</span>
                  </div>
                  <div className="dg-c-session-box">
                    <span className="dg-c-session-box-title">Telemetry Gateway Status</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2E7D32', marginTop: 4 }}>DG-IOT-v2.4 (Online)</div>
                    <span style={{ fontSize: '0.75rem', color: '#6B7460' }}>Auto-sync every 15 minutes</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'help' && (
            <div>
              <div className="dg-c-page-header">
                <h1 className="dg-c-page-title">Help &amp; Support</h1>
                <p className="dg-c-page-subtitle">Operator guidelines, anomaly resolution protocol, and support channels.</p>
                <div className="dg-c-gold-bar"></div>
              </div>

              <div className="dg-c-white-card">
                <h2 className="dg-c-card-heading" style={{ marginBottom: 10 }}>Operator Guidelines &amp; Escalation</h2>
                <p style={{ fontSize: '0.84rem', color: '#6B7460', lineHeight: 1.6, margin: 0 }}>
                  For telemetry sensor recalibration, chilling rate discrepancies, or official inspection queries, contact the Pune District Food Safety Liaison desk at <strong>support@dairyguard.gov.in</strong> or dial the dedicated helpline <strong>1800-425-DAIRY</strong>.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ====================================================================
          MODAL 1: "WHY WAS THIS FLAGGED?" INSPECTION MODAL
          ==================================================================== */}
      {selectedTransaction && (
        <div className="dg-c-modal-overlay" onClick={() => setSelectedTransaction(null)}>
          <div className="dg-c-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="dg-c-modal-close"
              onClick={() => setSelectedTransaction(null)}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className={`dg-c-tag ${selectedTransaction.riskScore >= 80 ? 'is-critical' : 'is-medium'}`}>
                Risk Score: {selectedTransaction.riskScore} / 100
              </span>
              <span style={{ fontSize: '0.78rem', color: '#6B7460' }}>
                Transaction {selectedTransaction.id}
              </span>
            </div>

            <h2 className="dg-c-modal-title">Why was this flagged?</h2>
            <p className="dg-c-modal-subtitle">
              Comprehensive signal breakdown for {selectedTransaction.farmerName} ({selectedTransaction.farmerId}) on {selectedTransaction.date}.
            </p>

            {/* Evidence Chain */}
            <div className="dg-c-evidence-chain">
              <div className="dg-c-evidence-step">
                <div className="dg-c-evidence-step-title">1. Intake Record</div>
                <div className="dg-c-evidence-step-val">{selectedTransaction.quantity}</div>
              </div>
              <div className="dg-c-evidence-step">
                <div className="dg-c-evidence-step-title">2. Lab Analyser</div>
                <div className="dg-c-evidence-step-val">{selectedTransaction.fat} FAT</div>
              </div>
              <div className="dg-c-evidence-step">
                <div className="dg-c-evidence-step-title">3. Chilling Temp</div>
                <div className="dg-c-evidence-step-val">{selectedTransaction.temp}</div>
              </div>
              <div className="dg-c-evidence-step">
                <div className="dg-c-evidence-step-title">4. Model Result</div>
                <div className="dg-c-evidence-step-val" style={{ color: '#C03728' }}>Anomaly</div>
              </div>
              <div className="dg-c-evidence-step">
                <div className="dg-c-evidence-step-title">5. Final Score</div>
                <div className="dg-c-evidence-step-val">{selectedTransaction.riskScore} / 100</div>
              </div>
            </div>

            {/* Signal Details */}
            <div style={{ margin: '18px 0' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 700, margin: '0 0 10px 0' }}>Contributing Signals:</h3>
              {selectedTransaction.signals?.map((sig, idx) => (
                <div key={idx} className="dg-c-signal-box">
                  <div className="dg-c-signal-box-title">⚠ {sig.name}</div>
                  <p className="dg-c-signal-box-desc">{sig.detail}</p>
                </div>
              ))}
            </div>

            <p className="dg-c-methodology-note" style={{ marginTop: 10 }}>
              Notice: Anomaly flags are risk signals intended for operator verification; they do not by themselves establish intent or fraud.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button
                type="button"
                className="dg-c-btn-primary"
                onClick={() => {
                  alert(`Transaction ${selectedTransaction.id} marked as Verified.`);
                  setSelectedTransaction(null);
                }}
              >
                <Check size={14} />
                <span>Mark as Verified by Collector</span>
              </button>
              <button
                type="button"
                className="dg-c-btn-secondary"
                onClick={() => setSelectedTransaction(null)}
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: UPLOAD DATA PROTOTYPE MODAL
          ==================================================================== */}
      {isUploadModalOpen && (
        <div className="dg-c-modal-overlay" onClick={() => setIsUploadModalOpen(false)}>
          <div className="dg-c-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="dg-c-modal-close"
              onClick={() => setIsUploadModalOpen(false)}
            >
              <X size={16} />
            </button>

            <h2 className="dg-c-modal-title">Upload Procurement Data</h2>
            <p className="dg-c-modal-subtitle">
              Upload digital AMCS batch exports, weighment logs, or milk analyser CSV files.
            </p>

            <form onSubmit={handleSimulateUpload}>
              <label htmlFor="fileUploadInput" className="dg-c-dropzone" style={{ display: 'block' }}>
                <UploadCloud size={36} style={{ color: '#343E23', margin: '0 auto 10px auto' }} />
                <div style={{ fontWeight: 700, fontSize: '0.90rem', color: '#1E2714' }}>
                  {uploadFile ? uploadFile.name : 'Click or Drag & Drop AMCS File (.csv, .xlsx, .dat)'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6B7460', marginTop: 4 }}>
                  Maximum file size 25MB · Standard Dairy AMCS format
                </div>
                <input
                  id="fileUploadInput"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadFile(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {uploadFile && (
                <div className="dg-c-signal-box">
                  <div className="dg-c-signal-box-title">✓ File Selected: {uploadFile.name}</div>
                  <p className="dg-c-signal-box-desc">
                    Ready for parsing and verification against the live risk pipeline.
                  </p>
                </div>
              )}

              {liveError && (
                <div className="dg-c-signal-box" style={{ backgroundColor: '#FFF3F1', borderColor: '#F0C4BC' }}>
                  <div className="dg-c-signal-box-title" style={{ color: '#96362C' }}>✕ Upload rejected</div>
                  <p className="dg-c-signal-box-desc" style={{ color: '#96362C' }}>{liveError}</p>
                </div>
              )}

              {uploadWarnings.length > 0 && (
                <div className="dg-c-signal-box" style={{ backgroundColor: '#FFF7E8', borderColor: '#E8CE8F' }}>
                  <div className="dg-c-signal-box-title" style={{ color: '#6B5416' }}>⚠ File accepted, but incomplete</div>
                  <ul style={{ color: '#6B5416', fontSize: '0.78rem', margin: '4px 0 0 16px', padding: 0 }}>
                    {uploadWarnings.map((w, i) => <li key={i} style={{ marginBottom: 3 }}>{w}</li>)}
                  </ul>
                </div>
              )}

              {uploadSuccessTime && (
                <div className="dg-c-signal-box" style={{ backgroundColor: '#EAF4EB', borderColor: '#C5E3C7' }}>
                  <div className="dg-c-signal-box-title" style={{ color: '#205C24' }}>✓ Data Successfully Processed</div>
                  <p className="dg-c-signal-box-desc" style={{ color: '#205C24' }}>
                    Uploaded at {uploadSuccessTime}. Telemetry sync updated.
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                <button type="submit" className="dg-c-btn-primary" disabled={!uploadFile}>
                  <UploadCloud size={14} />
                  <span>Start Upload &amp; Verification</span>
                </button>
                <button type="button" className="dg-c-btn-secondary" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: FARMER PROFILE DRAWER MODAL
          ==================================================================== */}
      {selectedFarmer && (
        <div className="dg-c-modal-overlay" onClick={() => setSelectedFarmer(null)}>
          <div className="dg-c-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="dg-c-modal-close"
              onClick={() => setSelectedFarmer(null)}
            >
              <X size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className={`dg-c-tag ${selectedFarmer.status === 'Active' ? 'is-success' : 'is-high'}`}>
                {selectedFarmer.status}
              </span>
              <span style={{ fontSize: '0.78rem', color: '#6B7460' }}>
                Farmer ID: {selectedFarmer.id}
              </span>
            </div>

            <h2 className="dg-c-modal-title">{selectedFarmer.name}</h2>
            <p className="dg-c-modal-subtitle">
              Producer profile, registered cattle census, and 7-day delivery metrics.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, margin: '16px 0' }}>
              <div className="dg-c-session-box">
                <span className="dg-c-session-box-title">Registered Cattle</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4 }}>{selectedFarmer.cattle}</div>
              </div>
              <div className="dg-c-session-box">
                <span className="dg-c-session-box-title">7-Day Total Volume</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#343E23', marginTop: 4 }}>{selectedFarmer.vol7D}</div>
              </div>
              <div className="dg-c-session-box">
                <span className="dg-c-session-box-title">Average FAT %</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4 }}>{selectedFarmer.avgFat}</div>
              </div>
              <div className="dg-c-session-box">
                <span className="dg-c-session-box-title">Average SNF %</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: 4 }}>{selectedFarmer.avgSnf}</div>
              </div>
            </div>

            <button
              type="button"
              className="dg-c-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
              onClick={() => setSelectedFarmer(null)}
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectorPortalPage;
