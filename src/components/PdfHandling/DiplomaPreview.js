import React, { useState, useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import "../Form/uniForm.css";

const DiplomaPreview = ({ imageSrc, onBackToForm, onDownload, isLoading, dimensions, hasDownloaded }) => {
  return (
    <section className="form-section">
      <h3 className="form-title">Aperçu Diplôme</h3>
      <hr className="form-line" />
      <div className="div-position">
        {isLoading ? (
          <CircularProgress className="loader" />
        ) : imageSrc ? (
          <img src={imageSrc} alt="Diploma Preview" className="div-scroll" />
        ) : (
          <p>No preview available</p>
        )}
        <canvas id="pdf-canvas" width={dimensions.width} height={dimensions.height}></canvas>
      </div>
      <div className="buttons-container">
        <button 
          className="cancel-button" 
          type="button" 
          onClick={onBackToForm}
          disabled={isLoading}
        >
          Retour au formulaire
        </button>
        {imageSrc && !isLoading && (
          <button 
            className={hasDownloaded ? "telecharger-button-disabled" : "telecharger-button"}
            type="button" 
            onClick={onDownload}
            disabled={hasDownloaded} // Disable based on prop
          >
            Télécharger Diplôme
          </button>
        )}
      </div>
    </section>
  );
};

export default DiplomaPreview;