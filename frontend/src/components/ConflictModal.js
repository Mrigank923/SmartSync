import React from 'react';
import './ConflictModal.css';

const ConflictModal = ({ serverVersion, clientVersion, onResolve }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Conflict Detected</h3>
        <div className="modal-section">
          <h4>Server Version</h4>
          <pre>{JSON.stringify(serverVersion, null, 2)}</pre>
        </div>
        <div className="modal-section">
          <h4>Your Version</h4>
          <pre>{JSON.stringify(clientVersion, null, 2)}</pre>
        </div>
        <div className="modal-buttons">
          <button onClick={() => onResolve('merge')}>Merge</button>
          <button onClick={() => onResolve('overwrite')}>Overwrite</button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;
