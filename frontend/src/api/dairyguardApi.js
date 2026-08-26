const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const getToken = () => localStorage.getItem('dairyguard_token');
export const getUser = () => { try { return JSON.parse(localStorage.getItem('dairyguard_user') || 'null'); } catch { return null; } };
export const authHeaders = () => { const token = getToken(); return token ? { Authorization: `Bearer ${token}` } : {}; };

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || body.message || `${response.status} ${response.statusText}`);
  return body;
}

export async function verifyGovernment(identifier) {
  const data = await request('/api/auth/verify/government', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({identifier}) });
  localStorage.setItem('dairyguard_token', data.token); localStorage.setItem('dairyguard_user', JSON.stringify(data.user));
  return data;
}
export async function verifyCollector(identifier) {
  const data = await request('/api/auth/verify/collector', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({identifier}) });
  localStorage.setItem('dairyguard_token', data.token); localStorage.setItem('dairyguard_user', JSON.stringify(data.user));
  return data;
}
export const logout = () => { localStorage.removeItem('dairyguard_token'); localStorage.removeItem('dairyguard_user'); };
export async function uploadDataset(file) {
  const fd = new FormData(); fd.append('file', file);
  return request('/api/upload', { method:'POST', body:fd });
}
export const getOverview = () => request('/api/dashboard/overview');
export const getRiskFlags = () => request('/api/risk-flags').then(x=>x.data||[]);
export const getAnomalies = () => request('/api/anomalies').then(x=>x.data||[]);
export const getTransactions = (limit=500) => request(`/api/transactions?limit=${limit}`).then(x=>x.data||[]);
export const getDistricts = () => request('/api/districts').then(x=>x.data||[]);
export const getFarmers = () => request('/api/farmers').then(x=>x.data||[]);
export const getMassBalance = () => request('/api/mass-balance').then(x=>x.data||[]);
export const getCentres = () => request('/api/collection-centres').then(x=>x.data||[]);
export const getClusters = () => request('/api/network/clusters').then(x=>x.data||[]);
export const getProcurementPerformance = (district='All',days=30) => request(`/api/procurement-performance?district=${encodeURIComponent(district)}&days=${days}`).then(x=>x.data||[]);
export const getForecast = (district='All',days=14) => request(`/api/forecast?district=${encodeURIComponent(district)}&days=${days}`);
export const getAuditLogs = () => request('/api/audit-logs').then(x=>x.data||[]);
export const apiBase = API_BASE;
