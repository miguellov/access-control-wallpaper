import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_DEVICE_ID, DEVICES } from './lib/resolutions';
import { AIRLINE, POSITIONS, type Position } from './lib/positions';
import { WALLPAPER_TYPES, type WallpaperType } from './lib/wallpaperTypes';
import { downloadWallpaper, renderWallpaper } from './lib/wallpaperEngine';
import logoSrc from './assets/westjet-logo.png';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [position, setPosition] = useState<Position>('OBS MAKEUP');
  const [wallpaperType, setWallpaperType] = useState<WallpaperType>('lock');
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);
  const [loading, setLoading] = useState(true);

  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];

  const previewScale = 0.28;
  const previewW = Math.round(device.width * previewScale);
  const previewH = Math.round(device.height * previewScale);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);
    await renderWallpaper(canvas, { position, type: wallpaperType }, previewW, previewH);
    setLoading(false);
  }, [position, wallpaperType, previewW, previewH]);

  useEffect(() => {
    draw();
  }, [draw]);

  const handleDownload = async () => {
    const offscreen = document.createElement('canvas');
    await renderWallpaper(offscreen, { position, type: wallpaperType }, device.width, device.height);
    const typeLabel = wallpaperType === 'lock' ? 'bloqueo' : 'inicio';
    const safeName = `${AIRLINE}-${typeLabel}-${position}`
      .replace(/\s+/g, '-')
      .toLowerCase();
    downloadWallpaper(offscreen, `${safeName}-${device.width}x${device.height}.png`);
  };

  const handleDownloadBoth = async () => {
    setLoading(true);
    for (const type of ['lock', 'home'] as const) {
      const offscreen = document.createElement('canvas');
      await renderWallpaper(offscreen, { position, type }, device.width, device.height);
      const typeLabel = type === 'lock' ? 'bloqueo' : 'inicio';
      const safeName = `${AIRLINE}-${typeLabel}-${position}`
        .replace(/\s+/g, '-')
        .toLowerCase();
      downloadWallpaper(offscreen, `${safeName}-${device.width}x${device.height}.png`);
    }
    setLoading(false);
  };

  const activeType = WALLPAPER_TYPES.find((t) => t.id === wallpaperType);

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <img src={logoSrc} alt="WestJet" className="header-logo" />
          <div>
            <h1>WestJet Access Control</h1>
            <p>Fondos para Samsung Galaxy</p>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="panel">
          <div className="panel-section">
            <h2>Tipo de fondo</h2>
            <div className="type-tabs">
              {WALLPAPER_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`type-tab ${wallpaperType === t.id ? 'active' : ''}`}
                  onClick={() => setWallpaperType(t.id)}
                >
                  <span className="type-tab-label">{t.label}</span>
                  <span className="type-tab-desc">{t.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h2>Posición</h2>
            <div className="position-grid">
              {POSITIONS.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  className={`position-btn ${position === pos ? 'active' : ''}`}
                  onClick={() => setPosition(pos)}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h2>Samsung Galaxy</h2>
            <select
              className="device-select"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            >
              {DEVICES.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label} ({d.width}×{d.height})
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="download-btn" onClick={handleDownload} disabled={loading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {loading ? 'Cargando...' : `Descargar ${activeType?.label.toLowerCase()}`}
          </button>

          <button
            type="button"
            className="download-btn download-btn-secondary"
            onClick={handleDownloadBoth}
            disabled={loading}
          >
            Descargar bloqueo + inicio
          </button>
        </section>

        <section className="preview-area">
          <div className="phone-frame">
            <div className="phone-notch" aria-hidden="true" />
            <div
              className="preview-frame"
              style={{ aspectRatio: `${device.width} / ${device.height}` }}
            >
              <canvas ref={canvasRef} className="preview-canvas" />
            </div>
          </div>
          <p className="preview-label">
            {activeType?.label} · {device.label} · {device.width} × {device.height}
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
