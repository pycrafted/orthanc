import React from 'react';

// Ce composant affiche le viewer OHIF intégré via iframe
const DicomViewer = ({ studyInstanceUID }) => {
  // URL du viewer OHIF local, à adapter si besoin
  const ohifUrl = studyInstanceUID
    ? `http://localhost:8042/ohif/viewer?StudyInstanceUIDs=${studyInstanceUID}`
    : null;

  return (
    <div style={{ width: '100%', height: '80vh', background: '#222', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {ohifUrl ? (
        <iframe
          src={ohifUrl}
          title="OHIF Dicom Viewer"
          style={{ width: '100%', height: '100%', border: 'none', background: '#222' }}
          allowFullScreen
        />
      ) : (
        <h2>Aucune étude DICOM sélectionnée</h2>
      )}
    </div>
  );
};

export default DicomViewer; 