import React from 'react';
import { AuthPortalModal } from './AuthPortalModal';

export const CollectionCentreLoginModal = ({ isOpen, onClose }) => {
  return (
    <AuthPortalModal
      isOpen={isOpen}
      onClose={onClose}
      portalType="collection-centre"
    />
  );
};

export default CollectionCentreLoginModal;
