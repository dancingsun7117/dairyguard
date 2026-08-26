import React from 'react';
import Card from './Card';
import Badge from './Badge';
import { ShieldCheck, Info } from 'lucide-react';

export const PlaceholderView = ({
  moduleName,
  officerDecisionGoal,
  keySignals = []
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Officer Mandate Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div
            style={{
              padding: '10px',
              backgroundColor: 'var(--color-blue-light)',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--color-primary-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '2px'
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-primary-blue)', fontWeight: 700 }}>
              Surveillance Scope: {moduleName}
            </span>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--color-text-primary)', marginTop: '4px', marginBottom: '6px' }}>
              {officerDecisionGoal}
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
              This operational module coordinates field surveillance, statutory milk testing schedules, and regulatory documentation across district jurisdictions.
            </p>
          </div>
        </div>
      </Card>

      {/* Core Surveillance Signals */}
      {keySignals.length > 0 && (
        <Card
          title="Surveillance & Risk Telemetry Parameters"
          subtitle={`Key operational dimensions monitored under ${moduleName}`}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {keySignals.map((signal, idx) => (
              <div
                key={idx}
                style={{
                  padding: '14px',
                  backgroundColor: '#FAFBFD',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                  {signal.title}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  {signal.description}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PlaceholderView;
