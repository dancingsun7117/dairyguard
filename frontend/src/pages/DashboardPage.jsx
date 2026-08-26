import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import MetricCard from '../components/common/MetricCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import {
  DASHBOARD_METRICS,
  DAILY_TREND_DATA,
  PRIORITY_INSPECTION_QUEUE
} from '../data/mockData';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Milk,
  Users,
  AlertTriangle,
  Building2,
  Download,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  MapPin
} from 'lucide-react';

export const DashboardPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <PageHeader
        title="Surveillance Dashboard"
        subtitle="Operational procurement integrity and risk-based food safety monitoring across Maharashtra State Dairy Network."
        breadcrumbs={[{ label: 'Dashboard' }]}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              {DASHBOARD_METRICS.lastSyncTimestamp}
            </span>
            <Button variant="secondary" size="sm" icon={RefreshCw}>
              Refresh Data
            </Button>
            <Button variant="primary" size="sm" icon={Download}>
              Export Briefing
            </Button>
          </div>
        }
      />

      {/* 4 Core Macro Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}
      >
        <MetricCard
          label="TOTAL PROCUREMENT VOLUME"
          value={DASHBOARD_METRICS.totalProcurementVolume}
          indicator={DASHBOARD_METRICS.procurementChangePct}
          indicatorType="positive"
          subtext="30-day cumulative state intake"
          icon={Milk}
        />
        <MetricCard
          label="FARMERS MONITORED"
          value={DASHBOARD_METRICS.farmersMonitored}
          indicator="492 Active"
          indicatorType="neutral"
          subtext="Pashu-Aadhar IDs across 34 districts"
          icon={Users}
        />
        <MetricCard
          label="ACTIVE ANOMALIES"
          value={DASHBOARD_METRICS.activeAnomalies}
          indicator={DASHBOARD_METRICS.anomalyRate}
          indicatorType="critical"
          subtext="Integrity & telemetry deviations"
          icon={AlertTriangle}
        />
        <MetricCard
          label="HIGH-RISK ENTITIES"
          value={DASHBOARD_METRICS.highRiskEntities}
          indicator="Priority Audit"
          indicatorType="warning"
          subtext="Centres exceeding risk threshold"
          icon={Building2}
        />
      </div>

      {/* 2 Concise Trend Visualizations */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Daily Procurement Volume Trend */}
        <Card
          title="Daily Procurement Volume (Liters)"
          subtitle="Aggregate milk intake across all registered collection routes"
        >
          <div style={{ height: '220px', width: '100%', marginTop: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DAILY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E3A5F" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#1E3A5F" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFF5" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickLine={false}
                  axisLine={{ stroke: '#D9DEE5' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[14000, 18000]}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString()} Liters`, 'Intake Volume']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D9DEE5',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#1E3A5F"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#volumeGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily Anomaly Frequency Trend */}
        <Card
          title="Daily Anomaly Frequency"
          subtitle="Number of flagged integrity and telemetry anomalies per day"
        >
          <div style={{ height: '220px', width: '100%', marginTop: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DAILY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAEFF5" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickLine={false}
                  axisLine={{ stroke: '#D9DEE5' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#667085' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 12]}
                />
                <Tooltip
                  formatter={(value) => [`${value} Anomalies`, 'Flagged']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D9DEE5',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-subtle)'
                  }}
                />
                <Bar
                  dataKey="anomalies"
                  fill="#B42318"
                  radius={[3, 3, 0, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Priority Inspection Queue Table */}
      <Card
        title="Priority Inspection Queue"
        subtitle="High-risk procurement centres ranked for field surveillance and statutory verification"
        action={
          <Link to="/collection-centres" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
              View All Centres
            </Button>
          </Link>
        }
        noPadding={true}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '0.8125rem'
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#FAFBFD',
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Centre & Code</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>District</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Anomaly Type</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Severity</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Surveillance Finding</th>
                <th style={{ padding: '12px 18px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 18px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {PRIORITY_INSPECTION_QUEUE.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderBottom: idx === PRIORITY_INSPECTION_QUEUE.length - 1 ? 'none' : '1px solid var(--color-border-light)',
                    backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FCFDFE',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F4F7FB'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#FFFFFF' : '#FCFDFE'; }}
                >
                  {/* Centre Name & ID */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {item.centreName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
                      {item.centreId}
                    </div>
                  </td>

                  {/* District */}
                  <td style={{ padding: '14px 18px', color: 'var(--color-text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} style={{ color: 'var(--color-text-secondary)' }} />
                      <span>{item.district}</span>
                    </div>
                  </td>

                  {/* Anomaly Category */}
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {item.anomalyType}
                    </span>
                  </td>

                  {/* Severity Badge */}
                  <td style={{ padding: '14px 18px' }}>
                    <Badge variant={item.severity} size="sm" dot={true}>
                      {item.severity.toUpperCase()}
                    </Badge>
                  </td>

                  {/* Surveillance Finding / Details */}
                  <td style={{ padding: '14px 18px', maxWidth: '380px' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
                      {item.details}
                    </p>
                  </td>

                  {/* Inspection Status */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: item.status === 'Assigned' ? 'var(--color-primary-blue)' : item.status === 'In Review' ? 'var(--color-risk-high)' : 'var(--color-text-secondary)'
                      }}
                    >
                      {item.status}
                    </span>
                  </td>

                  {/* Action Link */}
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <Link
                      to={`/collection-centres/${item.centreId}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        color: 'var(--color-primary-blue)',
                        textDecoration: 'none',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--color-blue-light)',
                        border: '1px solid var(--color-blue-border)'
                      }}
                    >
                      <span>Inspect</span>
                      <ArrowRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
