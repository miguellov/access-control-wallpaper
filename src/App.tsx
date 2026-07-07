import { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_DEVICE_ID, DEVICES } from './lib/resolutions';
import { getPositionsForAirline, DEFAULT_POSITION, type Position } from './lib/positions';
import { AIRLINES, DEFAULT_AIRLINE_ID, getAirline, type AirlineId } from './lib/airlines';
import { WALLPAPER_TYPES, type WallpaperType } from './lib/wallpaperTypes';
import { downloadWallpaper, renderWallpaper } from './lib/wallpaperEngine';
import './App.css';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [airlineId, setAirlineId] = useState<AirlineId>(DEFAULT_AIRLINE_ID);
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION);
  const [wallpaperType, setWallpaperType] = useState<WallpaperType>('lock');
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);
  const [loading, setLoading] = useState(true);

  const airline = getAirline(airlineId);
  const positions = getPositionsForAirline(airlineId);
  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];

  const previewScale = 0.28;
  const previewW = Math.round(device.width * previewScale);
  const previewH = Math.round(device.height * previewScale);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);
    await renderWallpaper(
      canvas,
      { position, type: wallpaperType, airlineId },
      previewW,
      previewH,
    );
    setLoading(false);
  }, [position, wallpaperType, airlineId, previewW, previewH]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', airline.accent);
    root.style.setProperty('--accent-bg', airline.accentBg);
    root.style.setProperty('--accent-border', airline.accentBorder);
  }, [airline]);

  const handleAirlineChange = (id: AirlineId) => {
    setAirlineId(id);
    const nextPositions = getPositionsForAirline(id);
    if (!nextPositions.includes(position)) {
      setPosition(DEFAULT_POSITION);
    }
  };

  const handleDownload = async () => {
    const offscreen = document.createElement('canvas');
    await renderWallpaper(
      offscreen,
      { position, type: wallpaperType, airlineId },
      device.width,
      device.height,
    );
    const typeLabel = wallpaperType === 'lock' ? 'bloqueo' : 'inicio';
    const safeName = `${airline.name}-${typeLabel}-${position}`
      .replace(/\s+/g, '-')
      .toLowerCase();
    downloadWallpaper(offscreen, `${safeName}-${device.width}x${device.height}.png`);
  };

  const handleDownloadBoth = async () => {
    setLoading(true);
    for (const type of ['lock', 'home'] as const) {
      const offscreen = document.createElement('canvas');
      await renderWallpaper(offscreen, { position, type, airlineId }, device.width, device.height);
      const typeLabel = type === 'lock' ? 'bloqueo' : 'inicio';
      const safeName = `${airline.name}-${typeLabel}-${position}`
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
          <img src={airline.logo} alt={airline.name} className="header-logo" />
          <div>
            <h1>{airline.name} Access Control</h1>
            <p>Fondos para Samsung Galaxy</p>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="panel">
          <div className="panel-section">
            <h2>Aerolínea</h2>
            <div className="airline-grid">
              {AIRLINES.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className={`airline-btn ${airlineId === a.id ? 'active' : ''}`}
                  onClick={() => handleAirlineChange(a.id)}
                >
                  <img src={a.logo} alt={a.name} className="airline-btn-logo" />
                  <span>{a.name}</span>
                </button>
              ))}
            </div>
          </div>

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
              {positions.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  className={`position-btn ${position === pos ? 'active' : ''}`}
                  onClick={() => setPosition(pos as Position)}
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
            {airline.name} · {activeType?.label} · {device.width} × {device.height}
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
