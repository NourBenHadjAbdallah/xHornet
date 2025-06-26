import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const openExternalLink = (url) => {
  if (window.require) {
    const { shell } = window.require('electron');
    shell.openExternal(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};


const VerificationDisplay = ({ metadata }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const diplomaWebAppUrl = "http://127.0.0.1:5173/";

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  const {
    onChainHash,
    txHash,
    studentFullName,
    degreeName,
    academicFullYear,
    studentId
  } = metadata || {};


  const etherscanBaseTxUrl = "https://sepolia.etherscan.io/tx/";

  const hasCoreVerificationData = onChainHash || txHash;
  const hasStudentData = studentId || studentFullName || degreeName || academicFullYear;

  const panelWidth = 350;
  const dynamicDiplomaUrl = onChainHash
    ? `${diplomaWebAppUrl}?hash=${onChainHash}${txHash ? `&txHash=${txHash}` : ''}`
    : diplomaWebAppUrl;

  const handleDiplomaLinkClick = (event) => {
    event.preventDefault();
    openExternalLink(dynamicDiplomaUrl);
  };
  
  const handleEtherscanLinkClick = (event) => {
    event.preventDefault();
    openExternalLink(`${etherscanBaseTxUrl}${txHash}`);
  };

  return (
    <>
      <button
        onClick={togglePanel}
        className="verification-arrow-toggle"
        style={{ left: isPanelOpen ? `${panelWidth}px` : '0px' }}
      >
        <div className="verification-arrow-toggle-content">
          {isPanelOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          <span className="arrow-text">
            {isPanelOpen ? 'Fermer' : 'Vérif'}
          </span>
        </div>
      </button>

      <div className={`verification-slide-panel ${isPanelOpen ? 'open' : ''}`}>
        <div className="verification-slide-inner-content">
          
          <div className="panel-header">
            <h4>🔍 Données de Vérification</h4>
            <p className="panel-subtitle">Informations blockchain du diplôme</p>
          </div>

          <div className="panel-body">
            {!hasCoreVerificationData && !hasStudentData ? (
              <div className="panel-placeholder">
                <div className="placeholder-icon">📋</div>
                <p>
                  Les informations de vérification du diplôme apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="panel-data-sections">
                
                {hasStudentData && (
                  <div className="panel-section student-info-section">
                    <h5>👤 Informations Étudiant</h5>
                    {studentFullName && (
                      <div className="info-item">
                        <p className="info-label">Nom et Prénom:</p>
                        <p className="info-value">{studentFullName}</p>
                      </div>
                    )}
                    {studentId && (
                      <div className="info-item">
                        <p className="info-label">ID Étudiant:</p>
                        <p className="info-value">{studentId}</p>
                      </div>
                    )}
                    {degreeName && (
                      <div className="info-item">
                        <p className="info-label">Diplôme:</p>
                        <p className="info-value">{degreeName}</p>
                      </div>
                    )}
                    {academicFullYear && (
                      <div className="info-item">
                        <p className="info-label">Année Universitaire:</p>
                        <p className="info-value">{academicFullYear}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {hasCoreVerificationData && (
                  <div className="panel-section blockchain-info-section">
                    <h5>⛓️ Vérification Blockchain</h5>
                    {onChainHash && (
                      <div className="info-item">
                        <p className="info-label">Identifiant Blockchain (Hash):</p>
                        <div className="info-hash-value">{onChainHash}</div>
                      </div>
                    )}
                    {txHash && (
                      <div className="info-item">
                        <p className="info-label">Transaction Blockchain:</p>
                        <a
                          href={`${etherscanBaseTxUrl}${txHash}`}
                          onClick={handleEtherscanLinkClick} // Use the custom click handler
                          className="info-link etherscan-link"
                        >
                          🔗 Voir sur Etherscan
                          <span className="hash-preview">
                            {txHash.substring(0, 6)}...{txHash.substring(txHash.length - 4)}
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="panel-section web-link-section">
                  <h5>🔗 Lien Web</h5>
                  <div className="info-item">
                    <p className="info-label">Page du Diplôme:</p>
                    <a
                      href={dynamicDiplomaUrl}
                      onClick={handleDiplomaLinkClick} // Use the custom click handler
                      className="info-link etherscan-link"
                    >
                      Voir le diplôme en ligne
                      <ExternalLink size={16} style={{ marginLeft: '8px' }}/>
                    </a>
                  </div>
                </div>
                
                <div className="panel-footer-info">
                  <p>✅ Ce diplôme est sécurisé par la technologie blockchain</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default VerificationDisplay;