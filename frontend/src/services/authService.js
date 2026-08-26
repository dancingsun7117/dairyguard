import { verifyGovernment, verifyCollector } from '../api/dairyguardApi';
export const verifyCollectionCentreId = (identifier) => verifyCollector((identifier || '').trim());
export const verifyGovernmentServiceId = (identifier) => verifyGovernment((identifier || '').trim());
// Legacy names retained so no caller breaks; authentication is immediate against the live backend.
export const sendOTP = (portalType, identifier) => portalType === 'government' ? verifyGovernmentServiceId(identifier) : verifyCollectionCentreId(identifier);
export const verifyOTP = (portalType, identifier) => portalType === 'government' ? verifyGovernmentServiceId(identifier) : verifyCollectionCentreId(identifier);
export default { sendOTP, verifyOTP, verifyCollectionCentreId, verifyGovernmentServiceId };
