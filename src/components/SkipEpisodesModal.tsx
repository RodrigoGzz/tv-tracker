import React from 'react';
import { Episode } from '../types';

interface SkipEpisodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  skippedEpisodes: Episode[];
  targetEpisode: Episode;
}

const SkipEpisodesModal: React.FC<SkipEpisodesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  skippedEpisodes,
  targetEpisode
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>⚠️ Episodios saltados</h3>
        </div>
        
        <div className="modal-body">
          <p>
            Estás intentando marcar como visto <strong>S{targetEpisode.season}E{targetEpisode.number} - {targetEpisode.name}</strong>, 
            pero hay {skippedEpisodes.length} episodio{skippedEpisodes.length > 1 ? 's' : ''} anterior{skippedEpisodes.length > 1 ? 'es' : ''} sin ver:
          </p>
          
          <p>¿Qué quieres hacer?</p>
        </div>
        
        <div className="modal-actions">
          <button 
            className="modal-button track-button tracked" 
            onClick={onConfirm}
          >
            ✅ Marcar todos como vistos
          </button>
          <button 
            className="modal-button track-button untracked" 
            onClick={onCancel}
          >
            🎯 Solo marcar este episodio
          </button>
        </div>
      </div>
    </div>
  );
};



export default SkipEpisodesModal;
