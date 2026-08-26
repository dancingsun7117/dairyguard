import React from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { COLLECTION_CENTRES_DATA, PRIORITY_INSPECTION_QUEUE } from '../data/mockData';
import { Building2, ArrowLeft, AlertTriangle, Thermometer, Scale, Users, Calendar, ShieldCheck, CheckCircle } from 'lucide-react';

export const CentreDetailPage = () => {
  const { id } = useParams();
  
  // Find centre or default to first
  const centre = COLLECTION_CENTRES_DATA.find(c => c.id === id) || COLLECTION_CENTRES_DATA[0];
  const relatedInspections = PRIORITY_INSPECTION_QUEUE.filter(item => item.centreId === centre.id);

  return (
    <div>
      <PageHeader
        title={`${centre.name} (${centre.id})`}
        subtitle={`Detailed procurement integrity audit and telemetry surveillance for ${centre.district} District.`}
        breadcrumbs={[
          { label: 'Collection Centres', path: '/collection-centres' },
          { label: centre.id }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link to="/collection-centres">
              <Button variant="secondary" size="sm" icon={ArrowLeft}>
                Back to Directory
              </Button>
            </Link>
            <Button variant="primary" size="sm" icon={ShieldCheck}>
              Schedule Field Audit
            </Button>
          </div>
        }
      />

      {/* Summary KPI Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Surveillance Risk Score</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{centre.riskScore}/100</span>
            <Badge variant={centre.riskLevel} size="sm">{centre.riskLevel.toUpperCase()}</Badge>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Daily Procurement Intake</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{centre.procurementVolume}</div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Mass-Balance Variance</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: centre.massBalanceVariance.startsWith('-') && parseFloat(centre.massBalanceVariance) < -5 ? 'var(--color-risk-critical)' : 'var(--color-text-primary)' }}>
            {centre.massBalanceVariance}
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px 20px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Chilling Temperature</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: parseFloat(centre.chillingTemp) > 10 ? 'var(--color-risk-high)' : 'var(--color-text-primary)' }}>
            {centre.chillingTemp}
          </div>
        </div>
      </div>

      {/* Main Analysis Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Contributing Risk Factors */}
        <Card title="Contributing Risk Dimensions" subtitle="Multi-layer integrity signals flagged for this centre">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px 14px', border: '1px solid var(--color-border-light)', backgroundColor: '#FAFBFD', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Mass-Balance Route Deficit</span>
                <Badge variant={centre.riskLevel === 'critical' ? 'critical' : 'neutral'} size="sm">Variance {centre.massBalanceVariance}</Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Collector-logged intake exceeds reception total at dairy processing plant beyond the ±0.5% standard tolerance.
              </p>
            </div>

            <div style={{ padding: '12px 14px', border: '1px solid var(--color-border-light)', backgroundColor: '#FAFBFD', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Chilling Cycle & Temperature Compliance</span>
                <Badge variant={parseFloat(centre.chillingTemp) > 10 ? 'high' : 'safe'} size="sm">{centre.chillingTemp}</Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                Bulk Milk Cooler (BMC) telemetry logs show chilling compliance within permissible standards during morning and evening shifts.
              </p>
            </div>

            <div style={{ padding: '12px 14px', border: '1px solid var(--color-border-light)', backgroundColor: '#FAFBFD', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Active Member Producers</span>
                <Badge variant="neutral" size="sm">{centre.farmersCount} Farmers Registered</Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                All member farmers are mapped with Pashu-Aadhar IDs and verified against the 18th Livestock Census livestock boundaries.
              </p>
            </div>
          </div>
        </Card>

        {/* Recommended Action Mandate */}
        <Card title="Officer Action Mandate" subtitle="Required administrative and physical surveillance steps">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '14px 16px', backgroundColor: 'var(--color-blue-light)', borderLeft: '4px solid var(--color-primary-blue)', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-primary-blue)', marginBottom: '4px' }}>
                Recommended Action
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
                Conduct unannounced dipstick and tanker mass-balance audit at <strong>{centre.name}</strong> during the morning dispatch shift. Verify weighing bridge calibration certificate.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Surveillance Checklist:</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Reconcile electronic slip records with tanker logbook
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" /> Inspect BMC temperature data logger memory
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                <input type="checkbox" /> Draw statutory reference milk samples for laboratory fat/SNF verification
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CentreDetailPage;
