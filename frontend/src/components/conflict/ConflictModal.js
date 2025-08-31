import React from 'react';
import './ConflictModal.css';

const ConflictModal = ({
  serverVersion,
  clientVersion,
  onMerge,
  onOverwrite,
  onCancel,
}) => {
  // safety check (optional)
  if (!serverVersion || !clientVersion) {
    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <p>Loading conflict data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Conflict Detected</h3>

        {/* -------- Server version -------- */}
        <div className="modal-section">
          <h4>Server Version</h4>
          <p><strong>Title:</strong> {serverVersion.title ?? 'N/A'}</p>
          <p><strong>Description:</strong> {serverVersion.description ?? 'N/A'}</p>
          <p><strong>Priority:</strong> {serverVersion.priority ?? 'N/A'}</p>
          <p><strong>Status:</strong> {serverVersion.status ?? 'N/A'}</p>
          <details>
            <summary>Raw Data</summary>
            <pre>{JSON.stringify(serverVersion, null, 2)}</pre>
          </details>
        </div>

        {/* -------- Client version -------- */}
        <div className="modal-section">
          <h4>Your Version</h4>
          <p><strong>Title:</strong> {clientVersion.title ?? 'N/A'}</p>
          <p><strong>Description:</strong> {clientVersion.description ?? 'N/A'}</p>
          <p><strong>Priority:</strong> {clientVersion.priority ?? 'N/A'}</p>
          <p><strong>Status:</strong> {clientVersion.status ?? 'N/A'}</p>
          <details>
            <summary>Raw Data</summary>
            <pre>{JSON.stringify(clientVersion, null, 2)}</pre>
          </details>
        </div>

        {/* -------- Action buttons -------- */}
        <div className="modal-buttons">
          <button onClick={onMerge}>🔀 Merge</button>
          <button onClick={onOverwrite}>⚠️ Overwrite</button>
          <button onClick={onCancel} className="cancel-btn">❌ Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
