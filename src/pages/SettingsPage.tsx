import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const SettingsPage: React.FC = () => {
  const { trackedShows } = useApp();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const exportData = () => {
    const data = {
      trackedShows,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tv-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const handleImport = () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.trackedShows && Array.isArray(data.trackedShows)) {
          // Aquí podrías implementar la lógica de importación
          console.log('Datos a importar:', data);
          alert('Función de importación pendiente de implementar');
        } else {
          alert('Archivo inválido');
        }
      } catch (error) {
        alert('Error al leer el archivo');
      }
    };
    reader.readAsText(importFile);
    setShowImportModal(false);
  };

  const clearAllData = () => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.'
      )
    ) {
      localStorage.removeItem('tv-tracker-data');
      window.location.reload();
    }
  };

  const storageSize = () => {
    const data = localStorage.getItem('tv-tracker-data');
    return data ? (new Blob([data]).size / 1024).toFixed(2) : '0';
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Configuración</h1>
        <p>Gestiona tus datos y preferencias de TV Tracker</p>
      </div>

      <div className="settings-grid">
        {/* Información de datos */}
        <div className="settings-card">
          <h2>📊 Información de Datos</h2>
          <div className="settings-info">
            <div className="info-item">
              <span className="info-label">Series en seguimiento:</span>
              <span className="info-value">{trackedShows.length}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Tamaño de datos:</span>
              <span className="info-value">{storageSize()} KB</span>
            </div>
            <div className="info-item">
              <span className="info-label">Almacenamiento:</span>
              <span className="info-value">Local (tu navegador)</span>
            </div>
          </div>
        </div>

        {/* Backup y restauración */}
        <div className="settings-card">
          <h2>💾 Backup y Restauración</h2>
          <div className="settings-actions">
            <button
              className="settings-btn primary"
              onClick={() => setShowExportModal(true)}
              disabled={trackedShows.length === 0}
            >
              📤 Exportar Datos
            </button>
            <button className="settings-btn secondary" onClick={() => setShowImportModal(true)}>
              📥 Importar Datos
            </button>
          </div>
          <p className="settings-note">
            Exporta tus datos para crear una copia de seguridad o transferir a otro dispositivo.
          </p>
        </div>

        {/* Limpieza de datos */}
        <div className="settings-card">
          <h2>🧹 Limpieza de Datos</h2>
          <div className="settings-actions">
            <button
              className="settings-btn danger"
              onClick={clearAllData}
              disabled={trackedShows.length === 0}
            >
              🗑️ Eliminar Todos los Datos
            </button>
          </div>
          <p className="settings-note">
            ⚠️ Esta acción eliminará permanentemente todas tus series y progreso.
          </p>
        </div>

        {/* Información de la app */}
        <div className="settings-card">
          <h2>ℹ️ Información de la App</h2>
          <div className="settings-info">
            <div className="info-item">
              <span className="info-label">Versión:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">API:</span>
              <span className="info-value">TVMaze</span>
            </div>
            <div className="info-item">
              <span className="info-label">Desarrollado con:</span>
              <span className="info-value">React + TypeScript</span>
            </div>
          </div>
        </div>

        {/* Privacidad */}
        <div className="settings-card full-width">
          <h2>🔐 Privacidad y Datos</h2>
          <div className="privacy-info">
            <h3>Tu privacidad es importante</h3>
            <ul>
              <li>✅ Todos los datos se almacenan localmente en tu dispositivo</li>
              <li>✅ No enviamos información personal a servidores externos</li>
              <li>✅ Solo consultamos la API pública de TVMaze para información de series</li>
              <li>✅ No hay tracking ni análisis de comportamiento</li>
              <li>✅ Puedes exportar o eliminar tus datos en cualquier momento</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal de exportación */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Exportar Datos</h3>
            <p>Se descargará un archivo JSON con todas tus series y progreso.</p>
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setShowExportModal(false)}>
                Cancelar
              </button>
              <button className="modal-btn primary" onClick={exportData}>
                Descargar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de importación */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Importar Datos</h3>
            <p>Selecciona un archivo de backup de TV Tracker para restaurar tus datos.</p>
            <input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="file-input"
            />
            <div className="modal-actions">
              <button className="modal-btn secondary" onClick={() => setShowImportModal(false)}>
                Cancelar
              </button>
              <button className="modal-btn primary" onClick={handleImport} disabled={!importFile}>
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
