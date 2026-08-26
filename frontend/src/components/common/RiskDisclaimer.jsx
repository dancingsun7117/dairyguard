import React from 'react';
import { Info } from 'lucide-react';
import './RiskDisclaimer.css';

export const RiskDisclaimer = ({ style, className = '' }) => {
  return (
    <div className={`dg-risk-disclaimer-strip ${className}`} style={style} role="note" aria-label="System Risk Clarification">
      <span className="dg-risk-disclaimer-icon">
        <Info size={15} />
      </span>
      <p className="dg-risk-disclaimer-text">
        <strong>IMPORTANT:</strong> These are risk indicators, not confirmed fraud. High score means a transaction looks statistically or logically unusual and deserves human review — it is not proof of wrongdoing.
      </p>
    </div>
  );
};

export default RiskDisclaimer;
