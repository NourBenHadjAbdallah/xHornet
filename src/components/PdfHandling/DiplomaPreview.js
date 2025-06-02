import React from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import "../Form/uniForm.css";


const DiplomaPreview = ({
  imageSrc,
  onBackToForm,
  onDownload,
  isLoading,
  dimensions,
  hasDownloaded,
}) => {
  const handleDownloadClick = async () => {
    try {


      onDownload(); // Let onDownload handle its own connection needs and error handling.
    } catch (error) {
      // This catch block will now primarily catch errors from onDownload if it's async and throws
      // Or errors from code within this try block if any were added.
      console.error("Erreur:", error.message); 
      // Consider making the error message more generic or specific to the download action
      alert("Erreur lors de l'opération de téléchargement.");
    }
  };

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
          <p>Aucun aperçu disponible</p>
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
            onClick={handleDownloadClick}
            disabled={hasDownloaded}
          >
            Télécharger Diplôme
          </button>
        )}
      </div>
    </section>
  );
};

export default DiplomaPreview;