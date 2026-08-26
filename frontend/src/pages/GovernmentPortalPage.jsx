import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  AlertTriangle,
  Building2,
  FileSpreadsheet,
  CheckSquare,
  BarChart3,
  FileText,
  History,
  Settings,
  LogOut,
  ChevronDown,
  Download,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  UserCheck,
  Shield,
  Layers,
  MapPin,
  X,
  FileCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import RiskDisclaimer from '../components/common/RiskDisclaimer';
import DairyGuardLogo from '../components/common/DairyGuardLogo';
import '../components/government/GovernmentPortal.css';
import { getOverview, getDistricts, getRiskFlags, getMassBalance, getCentres, getTransactions, getAuditLogs, logout as apiLogout } from '../api/dairyguardApi';

/* ==========================================================================
   GOVERNMENT PROTOTYPE DATASET (Exact specification from Source HTML)
   ========================================================================== */



// 1. Deliveries by Collector
// 2. Received vs Dispatched by Centre
// 3. Centre Balance Status (Donut)
// 4. Highest Risk Transactions (For Dashboard Priority Table)
// 5. Collection Centres Register
// 8. Priority Inspection Queue
// 9. Reconciliation Table Records
// 10. Risk Reports Queue
// 11. Audit Events Timeline
// 12. Audit Log Table
export const GovernmentPortalPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [districtSelection, setDistrictSelection] = useState('Pune District');
  const [centreSearch, setCentreSearch] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [officerRemarks, setOfficerRemarks] = useState('');
  const [collectorDeliveriesData,setCollectorDeliveriesData]=useState([]); const [massBalanceCentreData,setMassBalanceCentreData]=useState([]); const [centreBalanceStatusData,setCentreBalanceStatusData]=useState([]); const [govTransactions,setGovTransactions]=useState([]); const [govCentres,setGovCentres]=useState([]); const [govInspections,setGovInspections]=useState([]); const [govReconciliation,setGovReconciliation]=useState([]); const [govReports,setGovReports]=useState([]); const [govAuditTimeline,setGovAuditTimeline]=useState([]); const [govAuditLog,setGovAuditLog]=useState([]); const [liveError,setLiveError]=useState(''); const [liveLoading,setLiveLoading]=useState(false); const [hasLiveData,setHasLiveData]=useState(false);
  const clearLiveData=()=>{setCollectorDeliveriesData([]);setMassBalanceCentreData([]);setCentreBalanceStatusData([]);setGovTransactions([]);setGovCentres([]);setGovInspections([]);setGovReconciliation([]);setGovReports([]);setGovAuditTimeline([]);setGovAuditLog([]);setHasLiveData(false);};
  const loadLive=async()=>{setLiveLoading(true);try{setLiveError('');const [overview,districts,flags,mass,centres,tx,audits]=await Promise.all([getOverview(),getDistricts(),getRiskFlags(),getMassBalance(),getCentres(),getTransactions(1000),getAuditLogs()]);
    setCollectorDeliveriesData([...centres].sort((a,b)=>(b.volume||0)-(a.volume||0)).slice(0,10).map(x=>({name:x.collector_id,volume:+x.volume||0}))); setMassBalanceCentreData(mass.slice(0,10).map(x=>({centre:x.collector_id,received:+x.collector_logged_total||0,dispatched:+x.plant_intake_total||0}))); const balanced=mass.filter(x=>Math.abs(+x.variance_pct||0)<=2).length,minor=mass.filter(x=>Math.abs(+x.variance_pct||0)>2&&Math.abs(+x.variance_pct||0)<=5).length,major=mass.filter(x=>Math.abs(+x.variance_pct||0)>5).length;setCentreBalanceStatusData([{name:'Balanced',value:balanced,fill:'#2F6B46'},{name:'Minor discrepancy',value:minor,fill:'#D6A12F'},{name:'Major discrepancy',value:major,fill:'#96362C'}]);
    const mapped=flags.map((x,i)=>({id:x.batch_id||`TRX-${i+1}`,centre:x.collector_id,farmerId:x.farmer_id,volume:`${Number(x.volume_liters||0).toFixed(1)} L`,fat:`${Number(x.fat_pct||0).toFixed(1)}%`,snf:'—',temp:`${Number(x.temperature_c||0).toFixed(1)}°C`,riskScore:Math.round((x.final_risk_score||0)*100),severity:x.risk_level==='High'?'High':x.risk_level==='Medium'?'Moderate':'Low',primarySignal:x.capacity_mismatch_flag?'Volume / capacity':x.possible_adulteration_flag?'Quality deviation':x.duplicate_flag?'Duplicate':'Model anomaly'})); setGovTransactions(mapped); setGovCentres(centres.map(x=>({id:x.collector_id,centre:x.collector_id,district:x.district,today:`${Number(x.volume||0).toFixed(0)} L`,risk:Math.round((x.avg_risk||0)*100),flags:x.flags,status:(x.avg_risk||0)>=.7?'High risk':(x.avg_risk||0)>=.35?'Review':'Normal'}))); setGovReconciliation(mass.map(x=>({centre:x.collector_id,received:`${Number(x.collector_logged_total||0).toFixed(1)} L`,dispatched:`${Number(x.plant_intake_total||0).toFixed(1)} L`,difference:`${Math.abs((x.collector_logged_total||0)-(x.plant_intake_total||0)).toFixed(1)} L`,risk:x.is_mass_balance_anomaly?'High':'Low'}))); setGovInspections(mapped.filter(x=>x.riskScore>=70).map((x,i)=>({id:`INS-LIVE-${i+1}`,centre:x.centre,risk:x.riskScore,reason:x.primarySignal,officer:'Unassigned',due:'Pending',status:'Pending'}))); setGovReports(mapped.filter(x=>x.riskScore>=35).map((x,i)=>({id:`RPT-LIVE-${i+1}`,centre:x.centre,risk:x.riskScore,signals:x.primarySignal,status:'New'}))); setGovAuditTimeline([{time:'Live',title:'Active dataset loaded',desc:`${overview.metrics?.farmersMonitored||0} farmers currently monitored.`}]); setGovAuditLog(audits.map(x=>({time:x.created_at||'Live',user:x.user_identifier||'Government User',action:x.action||'Viewed dashboard',object:x.object_id||'Active dataset',result:'Success'})));
    setHasLiveData(true);
  }catch(e){setLiveError(e.message||'Live backend unavailable');clearLiveData();}finally{setLiveLoading(false);}}; useEffect(()=>{loadLive();const iv=setInterval(loadLive,20000);return()=>clearInterval(iv);},[]);


  const handleLogout = () => { apiLogout(); navigate('/'); };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    alert('Inspection successfully assigned to Field Officer.');
    setIsAssignModalOpen(false);
  };

  return (
    <div className="gov-app">{liveError && <div style={{position:'fixed',top:8,right:8,zIndex:9999,background:'#fff3f1',color:'#96362C',padding:'10px 14px',borderRadius:8,fontSize:12,maxWidth:320}}>⚠ Live API: {liveError}</div>}
    {!hasLiveData && !liveLoading && <div style={{margin:'12px 20px',padding:'14px 18px',borderRadius:10,background:'#FFF7E8',border:'1px solid #E8CE8F',color:'#6B5416',fontSize:13,fontWeight:600}}>
      {liveError ? 'No live data is showing — the backend request failed, so nothing below is real. Fix the connection and refresh.' : 'No dataset is active yet. Every chart and table below is empty until a collector or officer uploads a file.'}
    </div>}
    {liveLoading && <div style={{margin:'12px 20px',padding:'10px 18px',borderRadius:10,background:'#EEF3E8',color:'#343E23',fontSize:13,fontWeight:600}}>Loading live data…</div>}
      {/* ====================================================================
          1. DEEP FOREST GOVERNMENT SIDEBAR
          ==================================================================== */}
      <aside className="gov-sidebar">
        <div>
          {/* Logo & Brand Header */}
          <Link to="/" className="gov-sidebar-brand" title="DairyGuard">
            <img
              src="/dairyguard-logo.png"
              alt="DairyGuard Logo"
              className="gov-sidebar-logo"
            />
            <div className="gov-sidebar-brand-text">
              <span className="gov-sidebar-brand-name">DairyGuard</span>
              <span className="gov-sidebar-brand-sub">Verify · Protect · Trust</span>
            </div>
          </Link>

          <div className="gov-portal-tag">Government Portal</div>

          {/* Navigation Links */}
          <nav className="gov-nav-list">
            <button
              type="button"
              className={`gov-nav-btn ${activeTab === 'dashboard' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard className="gov-nav-icon" />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`gov-nav-btn ${activeTab === 'risk' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('risk')}
            >
              <ShieldAlert className="gov-nav-icon" />
              <span>Risk Overview</span>
            </button>

            <button
              type="button"
              className={`gov-nav-btn ${activeTab === 'centres' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('centres')}
            >
              <Building2 className="gov-nav-icon" />
              <span>Collection Centres</span>
            </button>

            <button
              type="button"
              className={`gov-nav-btn ${activeTab === 'inspections' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('inspections')}
            >
              <CheckSquare className="gov-nav-icon" />
              <span>Inspections</span>
            </button>

            <button
              type="button"
              className={`gov-nav-btn ${activeTab === 'analytics' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="gov-nav-icon" />
              <span>Analytics</span>
            </button>

            <button
              type="button"
              className={`gov-nav-btn ${activeTab === 'reports' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <FileText className="gov-nav-icon" />
              <span>Reports</span>
            </button>

            <button
              type="button"
              className={`gov-nav-btn ${activeTab === 'audit' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('audit')}
            >
              <History className="gov-nav-icon" />
              <span>Audit Trail</span>
            </button>

            <button
              type="button"
              className={`gov-nav-btn ${activeTab === 'profile' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <UserCheck className="gov-nav-icon" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              className={`gov-nav-btn ${activeTab === 'settings' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="gov-nav-icon" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Bottom Details: Officer Profile & Logout */}
        <div className="gov-sidebar-bottom">
          <div
            className="gov-sidebar-profile"
            onClick={() => setActiveTab('profile')}
            style={{ cursor: 'pointer' }}
            title="View Officer Profile"
          >
            <div className="gov-sidebar-avatar">AS</div>
            <div className="gov-sidebar-profile-info">
              <span className="gov-sidebar-officer-name">Anjali Sharma</span>
              <span className="gov-sidebar-officer-role">Food Safety Officer</span>
              <span className="gov-sidebar-officer-loc">Pune District</span>
            </div>
          </div>

          <button
            type="button"
            className="gov-sidebar-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            <span>↪ Sign out</span>
          </button>
        </div>
      </aside>

      {/* ====================================================================
          2. MAIN WORKSPACE & GOVERNMENT HEADER
          ==================================================================== */}
      <div className="gov-main">
        {/* Top Header */}
        <header className="gov-topbar">
          <div className="gov-topbar-title-wrap">
            <span className="gov-topbar-dept">Government of Maharashtra</span>
            <span className="gov-topbar-sub">
              Food, Civil Supplies &amp; Consumer Protection Department · Dairy Procurement Integrity Monitoring System
            </span>
          </div>

          <div className="gov-topbar-right">
            <div className="gov-topbar-pill-select">
              <span>{districtSelection}</span>
              <ChevronDown size={13} />
            </div>

            <span>22 Aug 2026 · 18:46 IST</span>

            <div className="gov-topbar-status">
              <span className="gov-dot-green"></span>
              <span>System Operational</span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="gov-content">
          {/* Global System Risk Clarification Disclaimer */}
          <RiskDisclaimer />

          {/* ================================================================
              PAGE 1: GOVERNMENT DASHBOARD (With Elevated Hero Risk Card & Unified Strip)
              ================================================================ */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="gov-page-header-row">
                <div>
                  <div className="gov-eyebrow">01 · Command Overview</div>
                  <h1 className="gov-page-title">Government Dashboard</h1>
                  <p className="gov-page-subtitle">
                    Jurisdiction-level view of procurement risk and priority records.
                  </p>
                </div>
                <div className="gov-updated-tag">Last updated · 18:42 IST</div>
              </div>

              {/* 6A. COHESIVE UNIFIED 5-KPI STRIP */}
              <div className="gov-kpi-unified-strip">
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">COLLECTION CENTRES</span>
                  <span className="gov-kpi-strip-val">214</span>
                  <span className="gov-kpi-strip-sub">Monitored nodes</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">MILK RECEIVED</span>
                  <span className="gov-kpi-strip-val">342,510 L</span>
                  <span className="gov-kpi-strip-sub">Current period</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">ACTIVE RISK SIGNALS</span>
                  <span className="gov-kpi-strip-val" style={{ color: '#96362C' }}>31</span>
                  <span className="gov-kpi-strip-sub is-red">4 critical flags</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">HIGH-RISK CENTRES</span>
                  <span className="gov-kpi-strip-val" style={{ color: '#96362C' }}>7</span>
                  <span className="gov-kpi-strip-sub is-red">3 newly escalated</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">REVIEW QUEUE</span>
                  <span className="gov-kpi-strip-val" style={{ color: '#B7791F' }}>28</span>
                  <span className="gov-kpi-strip-sub is-gold">Requires reconciliation</span>
                </div>
              </div>

              {/* Highest Risk Transactions Table */}
              <div className="gov-card" style={{ marginTop: 0 }}>
                <div className="gov-card-header">
                  <div>
                    <h2 className="gov-card-title">Highest Risk Transactions</h2>
                    <p className="gov-card-subtitle">Priority records ranked by DairyGuard risk score.</p>
                  </div>
                </div>

                <div className="gov-table-wrap">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Transaction</th>
                        <th>Centre</th>
                        <th>Risk</th>
                        <th>Primary Signal</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {govTransactions.map((t) => (
                        <tr key={t.id}>
                          <td className="gov-mono">{t.id}</td>
                          <td style={{ fontWeight: 600 }}>{t.centre}</td>
                          <td>
                            <span className={`gov-badge ${t.riskScore >= 90 ? 'is-crit' : t.riskScore >= 75 ? 'is-high' : 'is-med'}`}>
                              {t.riskScore} · {t.severity}
                            </span>
                          </td>
                          <td>{t.primarySignal}</td>
                          <td>
                            <button
                              type="button"
                              className="gov-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('reports');
                              }}
                            >
                              Review →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 9. MAHARASHTRA INSIGHTS (Concise Intelligence Findings) */}
              <div className="gov-card" style={{ marginTop: 16 }}>
                <div className="gov-card-header">
                  <div>
                    <h2 className="gov-card-title">Maharashtra Insights</h2>
                    <p className="gov-card-subtitle">State-level intelligence indicators across monitored jurisdictions.</p>
                  </div>
                  <span className="gov-badge is-neutral">Intelligence Summary</span>
                </div>

                <div className="gov-grid-4col">
                  <div className="gov-notice" style={{ backgroundColor: '#FAF8F2' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8E9684', textTransform: 'uppercase', letterSpacing: '0.06em' }}>AVERAGE RISK SCORE</span>
                    <div style={{ fontFamily: 'var(--gov-font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#1B231E', margin: '4px 0 2px 0' }}>
                      62 / 100
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#68736C' }}>Moderate across monitored districts.</span>
                  </div>

                  <div className="gov-notice" style={{ backgroundColor: '#FAF8F2' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8E9684', textTransform: 'uppercase', letterSpacing: '0.06em' }}>RISK CONCENTRATION</span>
                    <div style={{ fontFamily: 'var(--gov-font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#96362C', margin: '4px 0 2px 0' }}>
                      Pune + Solapur
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#68736C' }}>Signals concentrated in 7 centres.</span>
                  </div>

                  <div className="gov-notice" style={{ backgroundColor: '#FAF8F2' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8E9684', textTransform: 'uppercase', letterSpacing: '0.06em' }}>RECONCILIATION</span>
                    <div style={{ fontFamily: 'var(--gov-font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#A85A22', margin: '4px 0 2px 0' }}>
                      7,530 L pending
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#68736C' }}>28 centres requiring balance review.</span>
                  </div>

                  <div className="gov-notice" style={{ backgroundColor: '#FAF8F2' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8E9684', textTransform: 'uppercase', letterSpacing: '0.06em' }}>ACTION REQUIRED</span>
                    <div style={{ fontFamily: 'var(--gov-font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#234334', margin: '4px 0 2px 0' }}>
                      28 cases review
                    </div>
                    <span style={{ fontSize: '0.74rem', color: '#68736C' }}>Review evidence prior to inspection.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 2: RISK OVERVIEW (Maharashtra GeoPandas Map)
              ================================================================ */}
          {activeTab === 'risk' && (
            <div>
              <div className="gov-page-header-row">
                <div>
                  <div className="gov-eyebrow">02 · Risk Intelligence</div>
                  <h1 className="gov-page-title">Risk Overview</h1>
                  <p className="gov-page-subtitle">
                    Where is risk concentrated across Maharashtra?
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <select
                    className="gov-select"
                    value={districtSelection}
                    onChange={(e) => setDistrictSelection(e.target.value)}
                  >
                    <option value="Pune District">Pune District</option>
                    <option value="Maharashtra (All Districts)">Maharashtra (All Districts)</option>
                  </select>
                  <button type="button" className="gov-btn" onClick={() => alert('Exporting Maharashtra Risk Overview...')}>
                    <Download size={13} />
                    <span>Export view</span>
                  </button>
                </div>
              </div>

              {/* Maharashtra Geographic Risk Visualisation */}
              <div className="gov-card">
                <div className="gov-card-header">
                  <div>
                    <h2 className="gov-card-title">Risk → GeoPandas</h2>
                    <p className="gov-card-subtitle">Geographic risk visualisation for Maharashtra.</p>
                  </div>
                </div>

                <div className="gov-map-container">
                  <svg viewBox="0 0 560 390" className="gov-map-svg" aria-label="Maharashtra geographic risk map">
                    <path
                      d="M150 32 L255 20 L335 55 L420 45 L495 100 L468 168 L520 215 L474 270 L488 340 L400 356 L330 332 L278 365 L205 330 L165 278 L98 260 L120 205 L76 164 L116 116 Z"
                      fill="#EDF0ED"
                      stroke="#65736A"
                      strokeWidth="2"
                    />
                    <g stroke="#F3F5F3" strokeWidth="3">
                      <path d="M151 33 L184 110 L120 205 L205 213 L205 330" fill="#7FA56F" />
                      <path d="M184 110 L255 20 L285 130 L205 213" fill="#D9BD49" />
                      <path d="M285 130 L335 55 L420 45 L400 150 L350 205" fill="#D9BD49" />
                      <path d="M400 150 L468 168 L520 215 L435 245 L350 205" fill="#E1A13B" />
                      <path d="M350 205 L435 245 L474 270 L400 300 L330 332 L278 270" fill="#96362C" />
                      <path d="M278 270 L330 332 L278 365 L205 330 L205 213" fill="#E1A13B" />
                      <path d="M205 213 L278 270 L205 330 L165 278 L98 260 L120 205" fill="#7FA56F" />
                      <path d="M120 205 L205 213 L184 110 L116 116 L76 164" fill="#7FA56F" />
                    </g>
                    <g fontFamily="Inter, sans-serif" fontSize="11" fill="#27332C" fontWeight="700">
                      <text x="125" y="175">Nashik</text>
                      <text x="210" y="95">Nandurbar</text>
                      <text x="340" y="95">Buldhana</text>
                      <text x="417" y="185">Nagpur</text>
                      <text x="382" y="285">Pune</text>
                      <text x="215" y="278">Satara</text>
                      <text x="130" y="235">Kolhapur</text>
                      <text x="285" y="235">Ahmednagar</text>
                    </g>
                    <circle cx="382" cy="285" r="8" fill="#96362C" stroke="#FFFFFF" strokeWidth="2.5" />
                  </svg>
                </div>

                <div className="gov-map-legend-row">
                  <div className="gov-map-legend-item">
                    <span className="gov-map-legend-color" style={{ backgroundColor: '#7FA56F' }}></span>
                    <span>Lower risk</span>
                  </div>
                  <div className="gov-map-legend-item">
                    <span className="gov-map-legend-color" style={{ backgroundColor: '#D9BD49' }}></span>
                    <span>Moderate</span>
                  </div>
                  <div className="gov-map-legend-item">
                    <span className="gov-map-legend-color" style={{ backgroundColor: '#E1A13B' }}></span>
                    <span>High</span>
                  </div>
                  <div className="gov-map-legend-item">
                    <span className="gov-map-legend-color" style={{ backgroundColor: '#96362C' }}></span>
                    <span>Critical (Pune Jurisdiction)</span>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* ================================================================
              PAGE 4: COLLECTION CENTRES
              ================================================================ */}
          {activeTab === 'centres' && (
            <div>
              <div className="gov-page-header-row">
                <div>
                  <div className="gov-eyebrow">04 · Operations</div>
                  <h1 className="gov-page-title">Collection Centres</h1>
                  <p className="gov-page-subtitle">
                    Centre-level records for government review. Detailed operational views remain separate from the government dashboard analytics.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Search centre or ID..."
                    className="gov-input"
                    value={centreSearch}
                    onChange={(e) => setCentreSearch(e.target.value)}
                  />
                  <select className="gov-select">
                    <option>All districts</option>
                    <option>Pune</option>
                    <option>Satara</option>
                    <option>Nashik</option>
                  </select>
                </div>
              </div>

              <div className="gov-kpi-unified-strip">
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">CENTRES MONITORED</span>
                  <span className="gov-kpi-strip-val">214</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">HIGH RISK</span>
                  <span className="gov-kpi-strip-val" style={{ color: '#96362C' }}>7</span>
                  <span className="gov-kpi-strip-sub is-red">3 new</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">OPEN REVIEWS</span>
                  <span className="gov-kpi-strip-val">28</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">VERIFIED TODAY</span>
                  <span className="gov-kpi-strip-val">186</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">RECORDS RECEIVED</span>
                  <span className="gov-kpi-strip-val">8,421</span>
                </div>
              </div>

              <div className="gov-card">
                <div className="gov-card-header">
                  <div>
                    <h2 className="gov-card-title">Centre Register</h2>
                    <p className="gov-card-subtitle">Select a centre to review records and associated government risk signals.</p>
                  </div>
                </div>

                <div className="gov-table-wrap">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Centre ID</th>
                        <th>Centre</th>
                        <th>District</th>
                        <th>Today</th>
                        <th>Risk</th>
                        <th>Open Flags</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {govCentres
                        .filter((c) => c.id.toLowerCase().includes(centreSearch.toLowerCase()) || c.centre.toLowerCase().includes(centreSearch.toLowerCase()))
                        .map((c) => (
                          <tr key={c.id}>
                            <td className="gov-mono">{c.id}</td>
                            <td style={{ fontWeight: 700 }}>{c.centre}</td>
                            <td>{c.district}</td>
                            <td className="gov-mono">{c.today}</td>
                            <td>
                              <span className={`gov-badge ${c.risk >= 90 ? 'is-crit' : c.risk >= 75 ? 'is-high' : 'is-med'}`}>
                                {c.risk}
                              </span>
                            </td>
                            <td>{c.flags}</td>
                            <td>
                              <span className={`gov-badge ${c.status === 'High risk' ? 'is-crit' : c.status === 'Review' ? 'is-high' : 'is-neutral'}`}>
                                {c.status}
                              </span>
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
              PAGE 6: INSPECTIONS
              ================================================================ */}
          {activeTab === 'inspections' && (
            <div>
              <div className="gov-page-header-row">
                <div>
                  <div className="gov-eyebrow">06 · Enforcement</div>
                  <h1 className="gov-page-title">Inspections</h1>
                  <p className="gov-page-subtitle">
                    Convert government risk reports into traceable field action.
                  </p>
                </div>
                <button
                  type="button"
                  className="gov-btn is-primary"
                  onClick={() => setIsAssignModalOpen(true)}
                >
                  <span>+ Assign Inspection</span>
                </button>
              </div>

              <div className="gov-kpi-unified-strip">
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">PENDING</span>
                  <span className="gov-kpi-strip-val">11</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">ASSIGNED</span>
                  <span className="gov-kpi-strip-val">7</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">IN PROGRESS</span>
                  <span className="gov-kpi-strip-val">4</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">COMPLETED THIS MONTH</span>
                  <span className="gov-kpi-strip-val">23</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">ESCALATED</span>
                  <span className="gov-kpi-strip-val" style={{ color: '#96362C' }}>3</span>
                  <span className="gov-kpi-strip-sub is-red">Requires review</span>
                </div>
              </div>

              <div className="gov-card">
                <div className="gov-card-header">
                  <div>
                    <h2 className="gov-card-title">Priority Inspection Queue</h2>
                    <p className="gov-card-subtitle">Cases ordered by risk and urgency.</p>
                  </div>
                </div>

                <div className="gov-table-wrap">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Case</th>
                        <th>Centre</th>
                        <th>Risk</th>
                        <th>Reason</th>
                        <th>Officer</th>
                        <th>Due</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {govInspections.map((ins) => (
                        <tr key={ins.id}>
                          <td className="gov-mono">{ins.id}</td>
                          <td style={{ fontWeight: 700 }}>{ins.centre}</td>
                          <td>
                            <span className={`gov-badge ${ins.risk >= 90 ? 'is-crit' : 'is-high'}`}>
                              {ins.risk}
                            </span>
                          </td>
                          <td>{ins.reason}</td>
                          <td>{ins.officer}</td>
                          <td>{ins.due}</td>
                          <td>
                            <span className={`gov-badge ${ins.status === 'Assigned' || ins.status === 'In progress' ? 'is-blue' : 'is-neutral'}`}>
                              {ins.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="gov-link"
                              onClick={() => {
                                setSelectedCase(ins);
                                setActiveTab('reports');
                              }}
                            >
                              Open case →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="gov-grid-2col" style={{ marginTop: 14 }}>
                <div className="gov-card">
                  <div className="gov-card-header">
                    <div>
                      <h2 className="gov-card-title">Inspection Checklist</h2>
                      <p className="gov-card-subtitle">Evidence to verify at the collection centre.</p>
                    </div>
                  </div>

                  <div className="gov-grid-2col">
                    <div className="gov-notice">
                      <b>Collection records</b>
                      Verify daily entries and source timestamps.
                    </div>
                    <div className="gov-notice">
                      <b>Weighing equipment</b>
                      Verify equipment and calibration.
                    </div>
                    <div className="gov-notice">
                      <b>Dispatch records</b>
                      Compare outbound records with collection records.
                    </div>
                    <div className="gov-notice">
                      <b>Quality records</b>
                      Verify official FAT/SNF/temperature records.
                    </div>
                  </div>
                </div>

                <div className="gov-card">
                  <div className="gov-card-header">
                    <div>
                      <h2 className="gov-card-title">Inspection Outcome</h2>
                      <p className="gov-card-subtitle">Final determination remains with the authorised officer.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button type="button" className="gov-btn" onClick={() => alert('Marked as Confirmed.')}>
                      Confirmed
                    </button>
                    <button type="button" className="gov-btn" onClick={() => alert('Marked as Not confirmed.')}>
                      Not confirmed
                    </button>
                    <button type="button" className="gov-btn" onClick={() => alert('Marked as Unable to verify.')}>
                      Unable to verify
                    </button>
                  </div>

                  <textarea
                    className="gov-input"
                    style={{ width: '100%', height: 110, resize: 'vertical', boxSizing: 'border-box' }}
                    placeholder="Officer remarks on field evidence and verification..."
                    value={officerRemarks}
                    onChange={(e) => setOfficerRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 7: ANALYTICS
              ================================================================ */}
          {activeTab === 'analytics' && (
            <div>
              <div className="gov-page-header-row">
                <div>
                  <div className="gov-eyebrow">07 · Government Analytics</div>
                  <h1 className="gov-page-title">Analytics</h1>
                  <p className="gov-page-subtitle">
                    Only the government-specified analytical views are shown here.
                  </p>
                </div>
                <div className="gov-updated-tag">Prototype dataset · Pune / Maharashtra</div>
              </div>

              <div className="gov-card">
                <div className="gov-card-header">
                  <div>
                    <h2 className="gov-card-title">Deliveries by Collector</h2>
                    <p className="gov-card-subtitle">Collector-wise delivery volume used for government oversight.</p>
                  </div>
                </div>

                <div style={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={collectorDeliveriesData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" horizontal={false} />
                      <XAxis type="number" stroke="#8E9684" fontSize={10} tickLine={false} />
                      <YAxis type="category" dataKey="name" stroke="#8E9684" fontSize={11} tickLine={false} axisLine={false} width={100} />
                      <Tooltip />
                      <Bar dataKey="volume" fill="#234334" radius={[0, 3, 3, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="gov-card" style={{ marginTop: 14 }}>
                <div className="gov-card-header">
                  <div>
                    <h2 className="gov-card-title">Mass Balance</h2>
                    <p className="gov-card-subtitle">
                      Received → dispatched → unreconciled difference. Differences require reconciliation and are not automatically fraud.
                    </p>
                  </div>
                </div>

                <div className="gov-mass-flow">
                  <div className="gov-flow-box">
                    <span className="gov-flow-val">342,510 L</span>
                    <span className="gov-flow-lbl">Total received</span>
                  </div>
                  <div className="gov-flow-arrow">→</div>
                  <div className="gov-flow-box">
                    <span className="gov-flow-val">334,980 L</span>
                    <span className="gov-flow-lbl">Total dispatched</span>
                  </div>
                  <div className="gov-flow-arrow">→</div>
                  <div className="gov-flow-box is-diff">
                    <span className="gov-flow-val">7,530 L</span>
                    <span className="gov-flow-lbl">Unreconciled difference</span>
                  </div>
                </div>

                <div className="gov-grid-2col">
                  <div className="gov-card">
                    <div className="gov-card-header">
                      <div>
                        <h3 className="gov-card-title" style={{ fontSize: '0.88rem' }}>Received vs Dispatched by Centre</h3>
                        <p className="gov-card-subtitle">Primary reconciliation view.</p>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={massBalanceCentreData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ECE6DC" vertical={false} />
                          <XAxis dataKey="centre" stroke="#8E9684" fontSize={10} tickLine={false} />
                          <YAxis stroke="#8E9684" fontSize={10} tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '0.74rem' }} />
                          <Bar dataKey="received" name="Received (L)" fill="#234334" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="dispatched" name="Dispatched (L)" fill="#B28A3B" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="gov-card">
                    <div className="gov-card-header">
                      <div>
                        <h3 className="gov-card-title" style={{ fontSize: '0.88rem' }}>Centre Balance Status</h3>
                        <p className="gov-card-subtitle">186 balanced · 18 minor · 10 major = 214 centres.</p>
                      </div>
                    </div>

                    <div style={{ width: '100%', height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={centreBalanceStatusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {centreBalanceStatusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '0.74rem' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="gov-table-wrap" style={{ marginTop: 14 }}>
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Centre</th>
                        <th>Received</th>
                        <th>Dispatched</th>
                        <th>Difference</th>
                        <th>Risk</th>
                        <th>Evidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {govReconciliation.map((r, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{r.centre}</td>
                          <td className="gov-mono">{r.received}</td>
                          <td className="gov-mono">{r.dispatched}</td>
                          <td className="gov-mono" style={{ color: '#96362C', fontWeight: 700 }}>{r.difference}</td>
                          <td>
                            <span className={`gov-badge ${r.risk === 'High' ? 'is-crit' : r.risk === 'Moderate' ? 'is-med' : 'is-low'}`}>
                              {r.risk}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="gov-link"
                              onClick={() => setActiveTab('reports')}
                            >
                              View evidence →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="gov-insight" style={{ marginTop: 14 }}>
                  <b>Reconciliation note:</b> 7,530 L currently requires reconciliation across the monitored records. Government officers determine whether the discrepancy has an operational explanation.
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 8: REPORTS
              ================================================================ */}
          {activeTab === 'reports' && (
            <div>
              <div className="gov-page-header-row">
                <div>
                  <div className="gov-eyebrow">08 · Reports</div>
                  <h1 className="gov-page-title">Risk Reports</h1>
                  <p className="gov-page-subtitle">
                    Evidence-backed reports prepared for government review.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select className="gov-select">
                    <option>All statuses</option>
                    <option>New</option>
                    <option>Under review</option>
                    <option>Inspection assigned</option>
                    <option>Resolved</option>
                  </select>
                  <button type="button" className="gov-btn" onClick={() => alert('Exporting Official Risk Dossier PDF...')}>
                    <Download size={13} />
                    <span>Export report</span>
                  </button>
                </div>
              </div>

              <div className="gov-card">
                <div className="gov-card-header">
                  <div>
                    <h2 className="gov-card-title">Risk Report Queue</h2>
                    <p className="gov-card-subtitle">Reports combine multiple signals and supporting records.</p>
                  </div>
                </div>

                <div className="gov-table-wrap">
                  <table className="gov-table">
                    <thead>
                      <tr>
                        <th>Report</th>
                        <th>Centre</th>
                        <th>Risk</th>
                        <th>Signals</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {govReports.map((rpt) => (
                        <tr key={rpt.id}>
                          <td className="gov-mono">{rpt.id}</td>
                          <td style={{ fontWeight: 700 }}>{rpt.centre}</td>
                          <td>
                            <span className={`gov-badge ${rpt.risk >= 90 ? 'is-crit' : 'is-high'}`}>
                              {rpt.risk}
                            </span>
                          </td>
                          <td>{rpt.signals}</td>
                          <td>
                            <span className={`gov-badge ${rpt.status === 'Assigned' ? 'is-blue' : 'is-neutral'}`}>
                              {rpt.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="gov-link"
                              onClick={() => alert(`Reviewing dossier ${rpt.id}`)}
                            >
                              Open →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="gov-card" style={{ marginTop: 14 }}>
                <div className="gov-card-header">
                  <div>
                    <h2 className="gov-card-title">Risk Report Detail · RPT-2026-0421</h2>
                    <p className="gov-card-subtitle">Shivaji Nagar Collection Centre · CC-MH-0247</p>
                  </div>
                  <span className="gov-badge is-crit">High Risk · 92</span>
                </div>

                <div className="gov-grid-4col">
                  <div className="gov-notice"><b>Received</b>1,842 L</div>
                  <div className="gov-notice"><b>Dispatched</b>1,770 L</div>
                  <div className="gov-notice"><b>Difference</b>72 L</div>
                  <div className="gov-notice"><b>Open signals</b>8</div>
                </div>

                <div className="gov-insight" style={{ marginTop: 14 }}>
                  <b>Executive summary:</b> Multiple signals indicate an abnormal procurement pattern. The available evidence supports reconciliation and inspection; it does not by itself establish fraud.
                </div>

                <div className="gov-eyebrow" style={{ marginTop: 16 }}>Evidence Chain</div>
                <div className="gov-evidence-chain">
                  <div className="gov-evidence-step">
                    <span className="gov-evidence-step-title">Source record</span>
                    <span className="gov-evidence-step-sub">AMCS / ERP</span>
                  </div>
                  <div className="gov-evidence-step">
                    <span className="gov-evidence-step-title">Collection</span>
                    <span className="gov-evidence-step-sub">Farmer transaction</span>
                  </div>
                  <div className="gov-evidence-step">
                    <span className="gov-evidence-step-title">Quality</span>
                    <span className="gov-evidence-step-sub">Official values</span>
                  </div>
                  <div className="gov-evidence-step">
                    <span className="gov-evidence-step-title">Dispatch</span>
                    <span className="gov-evidence-step-sub">Outbound record</span>
                  </div>
                  <div className="gov-evidence-step">
                    <span className="gov-evidence-step-title">Baseline</span>
                    <span className="gov-evidence-step-sub">Historical comparison</span>
                  </div>
                  <div className="gov-evidence-step">
                    <span className="gov-evidence-step-title">Analysis</span>
                    <span className="gov-evidence-step-sub">DairyGuard</span>
                  </div>
                  <div className="gov-evidence-step">
                    <span className="gov-evidence-step-title" style={{ color: '#96362C' }}>Risk score</span>
                    <span className="gov-evidence-step-sub" style={{ fontWeight: 700, color: '#96362C' }}>92 / 100</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button
                    type="button"
                    className="gov-btn is-primary"
                    onClick={() => setIsAssignModalOpen(true)}
                  >
                    Assign inspection
                  </button>
                  <button
                    type="button"
                    className="gov-btn"
                    onClick={() => alert('Clarification requested from Collection Centre Officer.')}
                  >
                    Request clarification
                  </button>
                  <button
                    type="button"
                    className="gov-btn"
                    onClick={() => alert('Decision recorded into government audit repository.')}
                  >
                    Record decision
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 9: AUDIT TRAIL
              ================================================================ */}
          {activeTab === 'audit' && (
            <div>
              <div className="gov-page-header-row">
                <div>
                  <div className="gov-eyebrow">09 · Accountability</div>
                  <h1 className="gov-page-title">Audit Trail</h1>
                  <p className="gov-page-subtitle">
                    Trace government access and actions across risk reports and inspections.
                  </p>
                </div>
                <button type="button" className="gov-btn" onClick={() => alert('Exporting immutable government audit log...')}>
                  <Download size={13} />
                  <span>Export audit log</span>
                </button>
              </div>

              <div className="gov-kpi-unified-strip">
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">EVENTS TODAY</span>
                  <span className="gov-kpi-strip-val">184</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">OFFICERS ACTIVE</span>
                  <span className="gov-kpi-strip-val">12</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">REPORTS VIEWED</span>
                  <span className="gov-kpi-strip-val">46</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">CASES UPDATED</span>
                  <span className="gov-kpi-strip-val">19</span>
                </div>
                <div className="gov-kpi-strip-item">
                  <span className="gov-kpi-strip-label">ACCESS EXCEPTIONS</span>
                  <span className="gov-kpi-strip-val">0</span>
                </div>
              </div>

              <div className="gov-grid-2col">
                <div className="gov-card">
                  <div className="gov-card-header">
                    <div>
                      <h2 className="gov-card-title">Recent Activity</h2>
                      <p className="gov-card-subtitle">Chronological government actions.</p>
                    </div>
                  </div>

                  <div className="gov-timeline">
                    {govAuditTimeline.map((ev, idx) => (
                      <div key={idx} className="gov-timeline-event">
                        <span className="gov-timeline-time">{ev.time}</span>
                        <div className="gov-timeline-title">{ev.title}</div>
                        <div className="gov-timeline-desc">{ev.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="gov-card">
                  <div className="gov-card-header">
                    <div>
                      <h2 className="gov-card-title">Audit Log</h2>
                      <p className="gov-card-subtitle">Example prototype records.</p>
                    </div>
                  </div>

                  <div className="gov-table-wrap">
                    <table className="gov-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>User</th>
                          <th>Action</th>
                          <th>Object</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {govAuditLog.map((log, idx) => (
                          <tr key={idx}>
                            <td className="gov-mono">{log.time}</td>
                            <td style={{ fontWeight: 600 }}>{log.user}</td>
                            <td>{log.action}</td>
                            <td className="gov-mono">{log.object}</td>
                            <td><span className="gov-badge is-low">{log.result}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 9: OFFICER PROFILE
              ================================================================ */}
          {activeTab === 'profile' && (
            <div>
              <div className="gov-page-header-row">
                <div>
                  <div className="gov-eyebrow">10 · Government Officer Identity</div>
                  <h1 className="gov-page-title">Officer Profile</h1>
                  <p className="gov-page-subtitle">
                    Authorized Food Safety Officer credentials, jurisdiction assignment, and service details.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span className="gov-badge is-low" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px' }}>
                    <span className="gov-dot-green"></span>
                    <span>Active · Authorized</span>
                  </span>
                  <button type="button" className="gov-btn" onClick={() => alert('Exporting Official Officer Credential PDF...')}>
                    <Download size={13} />
                    <span>Export Credential</span>
                  </button>
                </div>
              </div>

              {/* Officer Hero Card */}
              <div className="gov-card" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: '#20362A',
                      border: '2px solid var(--gov-gold)',
                      color: '#F3E8C8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      fontFamily: 'var(--gov-font-serif)',
                      fontWeight: 800,
                      flexShrink: 0
                    }}
                  >
                    AS
                  </div>
                  <div style={{ flexGrow: 1, minWidth: 240 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <h2 style={{ fontFamily: 'var(--gov-font-serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1B231E', margin: 0 }}>
                        Anjali Sharma
                      </h2>
                      <span className="gov-badge is-blue">Gazetted Class-I</span>
                    </div>
                    <p style={{ fontSize: '0.84rem', color: '#68736C', margin: '4px 0 0 0' }}>
                      Food Safety Officer · Food, Civil Supplies &amp; Consumer Protection Department, Government of Maharashtra
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#8E9684', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      SERVICE ID
                    </span>
                    <div style={{ fontFamily: 'var(--gov-font-mono)', fontSize: '1.1rem', fontWeight: 800, color: '#234334' }}>
                      MH-FCS-018274
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Grid */}
              <div className="gov-grid-2col">
                <div className="gov-card">
                  <div className="gov-card-header">
                    <div>
                      <h2 className="gov-card-title">Official Assignment &amp; Jurisdiction</h2>
                      <p className="gov-card-subtitle">Official administrative jurisdiction and posting details.</p>
                    </div>
                  </div>

                  <div className="gov-grid-2col">
                    <div className="gov-notice">
                      <b>Officer Name</b>
                      Anjali Sharma
                    </div>
                    <div className="gov-notice">
                      <b>Service / Employee ID</b>
                      <span className="gov-mono" style={{ color: '#234334', fontWeight: 800 }}>MH-FCS-018274</span>
                    </div>
                    <div className="gov-notice">
                      <b>Department</b>
                      Food, Civil Supplies &amp; Consumer Protection
                    </div>
                    <div className="gov-notice">
                      <b>Designation</b>
                      Food Safety Officer
                    </div>
                    <div className="gov-notice">
                      <b>Jurisdiction</b>
                      Pune District Division
                    </div>
                    <div className="gov-notice">
                      <b>Sub-Districts Covered</b>
                      Haveli · Baramati · Shirur · Pune City
                    </div>
                    <div className="gov-notice">
                      <b>Monitored Units</b>
                      214 Collection Centres · 18 Chilling Plants
                    </div>
                    <div className="gov-notice">
                      <b>Posting Date</b>
                      12 January 2024
                    </div>
                  </div>
                </div>

                <div className="gov-card">
                  <div className="gov-card-header">
                    <div>
                      <h2 className="gov-card-title">Account &amp; Authentication Details</h2>
                      <p className="gov-card-subtitle">Officer contact and cryptographic access credentials.</p>
                    </div>
                  </div>

                  <div className="gov-grid-2col">
                    <div className="gov-notice">
                      <b>Official Email</b>
                      anjali.sharma@maharashtra.gov.in
                    </div>
                    <div className="gov-notice">
                      <b>Direct Office Telephone</b>
                      +91 20 2612 4920
                    </div>
                    <div className="gov-notice">
                      <b>Government Mobile</b>
                      +91 94220 18274
                    </div>
                    <div className="gov-notice">
                      <b>Posting Station</b>
                      Divisional FDA Headquarters, Pune
                    </div>
                    <div className="gov-notice">
                      <b>Digital Signature Key</b>
                      <span className="gov-mono" style={{ fontSize: '0.72rem', color: '#234334', fontWeight: 700 }}>DS-MH-PUN-8842-VALID</span>
                    </div>
                    <div className="gov-notice">
                      <b>Access Clearance</b>
                      District Surveillance &amp; Enforcement
                    </div>
                    <div className="gov-notice">
                      <b>2FA Authentication</b>
                      <span style={{ color: '#2F6B46', fontWeight: 700 }}>● Active (Sec-Net OTP)</span>
                    </div>
                    <div className="gov-notice">
                      <b>Last System Login</b>
                      22 Aug 2026 · 18:42 IST
                    </div>
                  </div>
                </div>
              </div>

              <div className="gov-insight" style={{ marginTop: 14 }}>
                <b>Statutory Authority:</b> Operating under the provisions of the Food Safety and Standards Act, 2006 and Maharashtra Dairy Procurement Integrity Directives. Analytical risk flags serve as investigative signals and require authorized field verification prior to statutory enforcement.
              </div>
            </div>
          )}

          {/* ================================================================
              PAGE 10: SETTINGS
              ================================================================ */}
          {activeTab === 'settings' && (
            <div>
              <div className="gov-page-header-row">
                <div>
                  <div className="gov-eyebrow">11 · Administration</div>
                  <h1 className="gov-page-title">Settings</h1>
                  <p className="gov-page-subtitle">
                    System integration preferences, notification thresholds, and surveillance parameters.
                  </p>
                </div>
              </div>

              <div className="gov-grid-2col">
                <div className="gov-card">
                  <div className="gov-card-header">
                    <div>
                      <h2 className="gov-card-title">System Integration &amp; Feeds</h2>
                      <p className="gov-card-subtitle">Automated data synchronization status.</p>
                    </div>
                  </div>

                  <div className="gov-grid-2col">
                    <div className="gov-notice">
                      <b>State AMCS Gateway</b>
                      <span style={{ color: '#2F6B46', fontWeight: 700 }}>● Connected (15-min sync)</span>
                    </div>
                    <div className="gov-notice">
                      <b>GIS GeoPandas Layer</b>
                      <span style={{ color: '#2F6B46', fontWeight: 700 }}>● Active (Maharashtra 2026)</span>
                    </div>
                    <div className="gov-notice">
                      <b>Audit Log Repository</b>
                      <span style={{ color: '#2F6B46', fontWeight: 700 }}>● Immutable WORM Active</span>
                    </div>
                    <div className="gov-notice">
                      <b>Inspection Dispatch Queue</b>
                      <span style={{ color: '#2F6B46', fontWeight: 700 }}>● Operational (SMS &amp; Email)</span>
                    </div>
                  </div>

                  <div className="gov-insight" style={{ marginTop: 14 }}>
                    <b>Production configuration:</b> Integration parameters reflect the authenticated Pune District monitoring node.
                  </div>
                </div>

                <div className="gov-card">
                  <div className="gov-card-header">
                    <div>
                      <h2 className="gov-card-title">Access &amp; Notifications</h2>
                      <p className="gov-card-subtitle">Operational preferences for the officer.</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="gov-notice">
                      <b>Critical risk</b>
                      Immediate in-portal alert.
                    </div>
                    <div className="gov-notice">
                      <b>High risk</b>
                      Daily priority digest.
                    </div>
                    <div className="gov-notice">
                      <b>Inspection due</b>
                      Reminder before due date.
                    </div>
                    <div className="gov-notice">
                      <b>Data-source outage</b>
                      In-portal warning.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ====================================================================
          ASSIGN INSPECTION MODAL
          ==================================================================== */}
      {isAssignModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(20, 28, 14, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24
          }}
          onClick={() => setIsAssignModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4DED3',
              borderRadius: 14,
              width: '100%',
              maxWidth: 540,
              padding: 28,
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#F1EFE7',
                border: 'none',
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              onClick={() => setIsAssignModalOpen(false)}
            >
              <X size={15} />
            </button>

            <h2 style={{ fontFamily: 'var(--gov-font-serif)', fontSize: '1.4rem', fontWeight: 700, color: '#1E3A2C', margin: '0 0 6px 0' }}>
              Assign Field Inspection
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#68736C', margin: '0 0 18px 0' }}>
              Dispatch an authorised Food Safety Inspector for on-site verification at the flagged collection centre.
            </p>

            <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#68736C', marginBottom: 4 }}>
                  Target Collection Centre
                </label>
                <select className="gov-select" style={{ width: '100%' }} defaultValue="CC-MH-0247">
                  <option value="CC-MH-0247">CC-MH-0247 · Shivaji Nagar (Risk: 92 · Critical)</option>
                  <option value="CC-MH-0194">CC-MH-0194 · Kondhwa (Risk: 85 · High)</option>
                  <option value="CC-MH-0311">CC-MH-0311 · Bavdhan (Risk: 78 · High)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#68736C', marginBottom: 4 }}>
                  Assigned Field Inspector
                </label>
                <select className="gov-select" style={{ width: '100%' }}>
                  <option>R. Patil (Senior Inspector · Haveli Sub-District)</option>
                  <option>S. Jadhav (Field Officer · Pune North)</option>
                  <option>A. More (Quality Auditor · Pune South)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#68736C', marginBottom: 4 }}>
                  Inspection Due Date
                </label>
                <input type="date" className="gov-input" style={{ width: '100%' }} defaultValue="2026-08-24" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: '#68736C', marginBottom: 4 }}>
                  Directives &amp; Focus Areas
                </label>
                <textarea
                  className="gov-input"
                  style={{ width: '100%', height: 75, resize: 'vertical' }}
                  placeholder="e.g. Conduct manual weighment calibration and verify AMCS milk analyzer logs..."
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="gov-btn is-primary" style={{ flexGrow: 1, justifyContent: 'center' }}>
                  <CheckSquare size={14} />
                  <span>Issue Inspection Order</span>
                </button>
                <button type="button" className="gov-btn" onClick={() => setIsAssignModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentPortalPage;
