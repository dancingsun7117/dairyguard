// DairyGuard Surveillance Data Layer
// Calibrated with Maharashtra Dairy Development Dept & 18th Livestock Census data

export const DASHBOARD_METRICS = {
  totalProcurementVolume: "4,82,450 L",
  totalProcurementVolumeNum: 482450,
  procurementChangePct: "+3.2%",
  farmersMonitored: "510",
  farmersActive: "492",
  activeAnomalies: "142",
  anomalyRate: "5.8%",
  highRiskEntities: "8",
  highRiskEntitiesTotal: "156 DCS Nodes",
  districtsCovered: "34",
  lastSyncTimestamp: "Today, 06:30 AM (Shift 1 Synced)"
};

// 30-day Procurement and Anomaly Trend
export const DAILY_TREND_DATA = [
  { date: "Jun 01", volume: 15820, anomalies: 3, normalRate: 98.1 },
  { date: "Jun 03", volume: 16100, anomalies: 4, normalRate: 97.5 },
  { date: "Jun 05", volume: 15950, anomalies: 2, normalRate: 98.8 },
  { date: "Jun 07", volume: 16340, anomalies: 6, normalRate: 96.3 },
  { date: "Jun 09", volume: 16210, anomalies: 5, normalRate: 96.9 },
  { date: "Jun 11", volume: 15780, anomalies: 3, normalRate: 98.1 },
  { date: "Jun 13", volume: 16450, anomalies: 7, normalRate: 95.7 },
  { date: "Jun 15", volume: 16620, anomalies: 8, normalRate: 95.1 },
  { date: "Jun 17", volume: 15990, anomalies: 4, normalRate: 97.5 },
  { date: "Jun 19", volume: 16150, anomalies: 5, normalRate: 96.9 },
  { date: "Jun 21", volume: 16380, anomalies: 6, normalRate: 96.3 },
  { date: "Jun 23", volume: 16710, anomalies: 9, normalRate: 94.6 },
  { date: "Jun 25", volume: 16290, anomalies: 4, normalRate: 97.5 },
  { date: "Jun 27", volume: 16540, anomalies: 5, normalRate: 96.9 },
  { date: "Jun 29", volume: 16820, anomalies: 6, normalRate: 96.4 },
  { date: "Jun 30", volume: 16410, anomalies: 5, normalRate: 97.0 }
];

// Priority Inspection Queue for On-Duty Food Safety & Dairy Officers
export const PRIORITY_INSPECTION_QUEUE = [
  {
    id: "INSP-2025-081",
    centreId: "DCS-WAS-5",
    centreName: "Washim Central DCS #05",
    district: "Washim",
    anomalyType: "Mass-Balance Deficit",
    severity: "critical",
    details: "-18.4% volume discrepancy between collection logged (1,840 L) and plant reception (1,501 L).",
    riskScore: 92,
    date: "2025-06-30",
    status: "Pending Action"
  },
  {
    id: "INSP-2025-082",
    centreId: "DCS-BHA-5",
    centreName: "Bhandara East DCS #05",
    district: "Bhandara",
    anomalyType: "Collusion Cluster (Louvain)",
    severity: "critical",
    details: "Community #109 (3 farmers) logging synchronous duplicate deliveries with 8.15x baseline fraud rate.",
    riskScore: 88,
    date: "2025-06-30",
    status: "Pending Action"
  },
  {
    id: "INSP-2025-083",
    centreId: "DCS-SIN-3",
    centreName: "Sindhudurg Rural DCS #03",
    district: "Sindhudurg",
    anomalyType: "Capacity Mismatch",
    severity: "high",
    details: "Farmer PA000368 delivered 280 L against declared 3 cows (biological max ceiling: 45 L/day).",
    riskScore: 79,
    date: "2025-06-29",
    status: "Assigned"
  },
  {
    id: "INSP-2025-084",
    centreId: "DCS-DHU-5",
    centreName: "Dhule North DCS #05",
    district: "Dhule",
    anomalyType: "Temperature Non-Compliance",
    severity: "high",
    details: "Chilling tank reception logged at 21.4°C (permissible threshold: 4.0°C – 10.0°C).",
    riskScore: 76,
    date: "2025-06-29",
    status: "Pending Action"
  },
  {
    id: "INSP-2025-085",
    centreId: "DCS-AHM-2",
    centreName: "Ahmednagar Sangamner DCS #02",
    district: "Ahmednagar",
    anomalyType: "Fat/SNF Dilution",
    severity: "high",
    details: "Consecutive batch fat percentage dropped to 2.1% (species floor: 3.5%).",
    riskScore: 73,
    date: "2025-06-28",
    status: "In Review"
  },
  {
    id: "INSP-2025-086",
    centreId: "DCS-PUN-1",
    centreName: "Pune Baramati DCS #01",
    district: "Pune",
    anomalyType: "OCR Slip Discrepancy",
    severity: "moderate",
    details: "Discrepancy detected between handwritten procurement slip OCR scan and digital entry.",
    riskScore: 58,
    date: "2025-06-28",
    status: "In Review"
  }
];

// Collection Centre Directory with Risk Scores
export const COLLECTION_CENTRES_DATA = [
  {
    id: "DCS-WAS-5",
    name: "Washim Central DCS #05",
    district: "Washim",
    procurementVolume: "1,840 L/day",
    farmersCount: 15,
    riskScore: 92,
    riskLevel: "critical",
    activeAnomalies: 11,
    inspectionStatus: "Immediate Inspection Required",
    lastAuditDate: "2025-05-12",
    massBalanceVariance: "-18.4%",
    chillingTemp: "8.2°C"
  },
  {
    id: "DCS-BHA-5",
    name: "Bhandara East DCS #05",
    district: "Bhandara",
    procurementVolume: "1,620 L/day",
    farmersCount: 15,
    riskScore: 88,
    riskLevel: "critical",
    activeAnomalies: 10,
    inspectionStatus: "Immediate Inspection Required",
    lastAuditDate: "2025-04-20",
    massBalanceVariance: "-14.2%",
    chillingTemp: "7.5°C"
  },
  {
    id: "DCS-SIN-3",
    name: "Sindhudurg Rural DCS #03",
    district: "Sindhudurg",
    procurementVolume: "1,210 L/day",
    farmersCount: 15,
    riskScore: 79,
    riskLevel: "high",
    activeAnomalies: 12,
    inspectionStatus: "Assigned to Inspector",
    lastAuditDate: "2025-06-02",
    massBalanceVariance: "-5.8%",
    chillingTemp: "6.9°C"
  },
  {
    id: "DCS-DHU-5",
    name: "Dhule North DCS #05",
    district: "Dhule",
    procurementVolume: "2,150 L/day",
    farmersCount: 15,
    riskScore: 76,
    riskLevel: "high",
    activeAnomalies: 13,
    inspectionStatus: "Scheduled",
    lastAuditDate: "2025-05-28",
    massBalanceVariance: "-3.2%",
    chillingTemp: "21.4°C"
  },
  {
    id: "DCS-AHM-2",
    name: "Ahmednagar Sangamner DCS #02",
    district: "Ahmednagar",
    procurementVolume: "3,890 L/day",
    farmersCount: 15,
    riskScore: 73,
    riskLevel: "high",
    activeAnomalies: 8,
    inspectionStatus: "In Review",
    lastAuditDate: "2025-06-15",
    massBalanceVariance: "-2.1%",
    chillingTemp: "5.4°C"
  },
  {
    id: "DCS-PUN-1",
    name: "Pune Baramati DCS #01",
    district: "Pune",
    procurementVolume: "4,120 L/day",
    farmersCount: 15,
    riskScore: 58,
    riskLevel: "moderate",
    activeAnomalies: 6,
    inspectionStatus: "Compliant",
    lastAuditDate: "2025-06-10",
    massBalanceVariance: "+0.4%",
    chillingTemp: "4.8°C"
  },
  {
    id: "DCS-KOL-5",
    name: "Kolhapur Karveer DCS #05",
    district: "Kolhapur",
    procurementVolume: "3,450 L/day",
    farmersCount: 15,
    riskScore: 32,
    riskLevel: "low",
    activeAnomalies: 2,
    inspectionStatus: "Compliant",
    lastAuditDate: "2025-06-20",
    massBalanceVariance: "-0.2%",
    chillingTemp: "4.2°C"
  },
  {
    id: "DCS-SAN-2",
    name: "Sangli Miraj DCS #02",
    district: "Sangli",
    procurementVolume: "3,280 L/day",
    farmersCount: 15,
    riskScore: 28,
    riskLevel: "low",
    activeAnomalies: 1,
    inspectionStatus: "Compliant",
    lastAuditDate: "2025-06-22",
    massBalanceVariance: "+0.1%",
    chillingTemp: "4.0°C"
  }
];

// District Summary Reference
export const DISTRICT_REFERENCE_DATA = [
  { district: "Ahmednagar", realProcurementLakhL: 37.30, cattlePop: 1383247, buffaloPop: 241199, goatPop: 916199, anomalyRate: "6.2%" },
  { district: "Pune", realProcurementLakhL: 29.41, cattlePop: 782986, buffaloPop: 299654, goatPop: 534895, anomalyRate: "4.8%" },
  { district: "Satara", realProcurementLakhL: 16.31, cattlePop: 359057, buffaloPop: 347155, goatPop: 391173, anomalyRate: "7.1%" },
  { district: "Kolhapur", realProcurementLakhL: 14.91, cattlePop: 252550, buffaloPop: 642414, goatPop: 189090, anomalyRate: "3.4%" },
  { district: "Sangli", realProcurementLakhL: 14.84, cattlePop: 280987, buffaloPop: 518835, goatPop: 387923, anomalyRate: "3.9%" },
  { district: "Solapur", realProcurementLakhL: 14.31, cattlePop: 685058, buffaloPop: 407766, goatPop: 844408, anomalyRate: "8.4%" },
  { district: "Nasik", realProcurementLakhL: 7.41, cattlePop: 976700, buffaloPop: 241957, goatPop: 646885, anomalyRate: "5.5%" },
  { district: "Aurangabad", realProcurementLakhL: 5.43, cattlePop: 530114, buffaloPop: 98532, goatPop: 353695, anomalyRate: "6.0%" },
  { district: "Osmanabad", realProcurementLakhL: 5.23, cattlePop: 375433, buffaloPop: 169737, goatPop: 190315, anomalyRate: "6.8%" },
  { district: "Washim", realProcurementLakhL: 0.45, cattlePop: 298616, buffaloPop: 77212, goatPop: 170399, anomalyRate: "9.2%" }
];
