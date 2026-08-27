from pathlib import Path
import os
ROOT=Path(__file__).resolve().parent.parent
(ROOT/'backend'/'data').mkdir(parents=True,exist_ok=True)
DB_URL=os.getenv('DATABASE_URL','sqlite:///'+str(ROOT/'backend'/'data'/'dairyguard.db'))
XGB_MODEL=ROOT/'xgboost_stage2'/'xgboost_stage2.pkl';XGB_FEATURES=ROOT/'xgboost_stage2'/'xgboost_features.pkl';CHRONOS_MODEL=ROOT/'Trained_Chronos'/'chronos_bolt_dairyguard_finetuned'
JWT_SECRET=os.getenv('JWT_SECRET','change-this-before-production')
CHRONOS_HF_REPO=os.getenv('CHRONOS_HF_REPO','AnonymousCatX/Chronos-Bolt_DairyGuard')
