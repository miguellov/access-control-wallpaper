import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AddAirlineForm } from './components/AddAirlineForm';
import { AddPositionForm } from './components/AddPositionForm';
import { InventoryPanel } from './components/InventoryPanel';
import { useCustomConfig } from './hooks/useCustomConfig';
import { useInventory } from './hooks/useInventory';
import { getAppUrl } from './lib/appUrl';
import { DEFAULT_DEVICE_ID, DEVICES } from './lib/resolutions';
import {
  getPositionsForAirline,
  getCustomPositionsForAirline,
  isCustomPosition,
  DEFAULT_POSITION,
} from './lib/positions';
import { getSerialForPosition } from './lib/deviceSerials';
import { getDevicesForAirline, type InventoryDevice } from './lib/inventory';
import {
  DEFAULT_AIRLINE_ID,
  getAirline,
  getAllAirlines,
  isCustomAirline,
  type AirlineId,
} from './lib/airlines';
import { WALLPAPER_TYPES, type WallpaperType } from './lib/wallpaperTypes';
import { downloadWallpaper, renderWallpaper } from './lib/wallpaperEngine';
import { detectBestDeviceId, getPreviewScale, isMobileDevice, isStandaloneApp } from './lib/mobile';
import './App.css';

type AppView = 'wallpaper' | 'inventory';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { config, addAirline, deleteAirline, addPosition, deletePosition } = useCustomConfig();
  const { inventory, reassign, update, add, remove, reset } = useInventory();
  const [view, setView] = useState<AppView>('wallpaper');
  const [airlineId, setAirlineId] = useState<AirlineId>(DEFAULT_AIRLINE_ID);
  const [position, setPosition] = useState(DEFAULT_POSITION);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [wallpaperType, setWallpaperType] = useState<WallpaperType>('lock');
  const [deviceId, setDeviceId] = useState(DEFAULT_DEVICE_ID);
  const [loading, setLoading] = useState(true);
  const [previewScale, setPreviewScale] = useState(0.28);
  const [standalone, setStandalone] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const airlines = getAllAirlines(config.customAirlines);
  const airline = getAirline(airlineId, config.customAirlines);
  const airlineDevices = getDevicesForAirline(inventory, airlineId, true);
  const positions = getPositionsForAirline(airlineId, config, inventory);
  const customPositions = getCustomPositionsForAirline(airlineId, config);
  const device = DEVICES.find((d) => d.id === deviceId) ?? DEVICES[0];

  const selectedDevice = selectedDeviceId
    ? inventory.find((d) => d.id === selectedDeviceId)
    : undefined;

  const serial =
    selectedDevice?.serial ||
    getSerialForPosition(airlineId, position, config, inventory, selectedDeviceId ?? undefined);

  const positionsWithoutDevice = positions.filter(
    (pos) => !airlineDevices.some((d) => d.position === pos),
  );

  const previewW = Math.round(device.width * previewScale);
  const previewH = Math.round(device.height * previewScale);

  useEffect(() => {
    if (isMobileDevice()) {
      setDeviceId(detectBestDeviceId());
    }
    setStandalone(isStandaloneApp());
  }, []);

  useEffect(() => {
    const updatePreviewScale = () => setPreviewScale(getPreviewScale(device.width));
    updatePreviewScale();
    window.addEventListener('resize', updatePreviewScale);
    window.addEventListener('orientationchange', updatePreviewScale);
    return () => {
      window.removeEventListener('resize', updatePreviewScale);
      window.removeEventListener('orientationchange', updatePreviewScale);
    };
  }, [device.width]);

  useEffect(() => {
    if (selectedDeviceId && !inventory.some((d) => d.id === selectedDeviceId)) {
      setSelectedDeviceId(null);
    }
  }, [inventory, selectedDeviceId]);

  useEffect(() => {
    if (selectedDevice && selectedDevice.airlineId !== airlineId) {
      setSelectedDeviceId(null);
    }
  }, [airlineId, selectedDevice]);

  useEffect(() => {
    if (selectedDevice) {
      setPosition(selectedDevice.position);
      return;
    }
    if (!positions.includes(position)) {
      const firstDevice = airlineDevices[0];
      if (firstDevice) {
        setSelectedDeviceId(firstDevice.id);
        setPosition(firstDevice.position);
      } else {
        setPosition(positions[0] ?? DEFAULT_POSITION);
      }
    }
  }, [positions, position, selectedDevice, airlineDevices]);

  useEffect(() => {
    if (!airlines.some((a) => a.id === airlineId)) {
      setAirlineId(DEFAULT_AIRLINE_ID);
    }
  }, [airlines, airlineId]);

  const draw = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);
    await renderWallpaper(
      canvas,
      {
        position,
        type: wallpaperType,
        airlineId,
        serial,
        customAirlines: config.customAirlines,
      },
      previewW,
      previewH,
    );
    setLoading(false);
  }, [position, wallpaperType, airlineId, serial, config.customAirlines, previewW, previewH]);

  useEffect(() => {
    if (view === 'wallpaper') draw();
  }, [draw, view]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', airline.accent);
    root.style.setProperty('--accent-bg', airline.accentBg);
    root.style.setProperty('--accent-border', airline.accentBorder);

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute('content', airline.accent);
  }, [airline]);

  const handleAirlineChange = (id: AirlineId) => {
    setAirlineId(id);
    setSelectedDeviceId(null);
    const nextDevices = getDevicesForAirline(inventory, id, true);
    if (nextDevices[0]) {
      setSelectedDeviceId(nextDevices[0].id);
      setPosition(nextDevices[0].position);
      return;
    }
    const nextPositions = getPositionsForAirline(id, config, inventory);
    if (!nextPositions.includes(position)) {
      setPosition(nextPositions[0] ?? DEFAULT_POSITION);
    }
  };

  const handleAddAirline = (data: {
    name: string;
    accent: string;
    bgDataUrl: string;
    logoDataUrl: string;
  }) => {
    const newId = addAirline(data);
    if (newId) setAirlineId(newId);
  };

  const handleAddPosition = (data: { name: string; serial?: string }) => {
    addPosition(airlineId, data);
    setPosition(data.name);
    setSelectedDeviceId(null);
  };

  const handleSelectDevice = (invDevice: InventoryDevice) => {
    setSelectedDeviceId(invDevice.id);
    setPosition(invDevice.position);
    setAirlineId(invDevice.airlineId);
  };

  const handleSelectFromInventory = (invDevice: InventoryDevice) => {
    handleSelectDevice(invDevice);
    setView('wallpaper');
  };

  const handleDeleteAirline = (id: string) => {
    if (!window.confirm('¿Eliminar esta aerolínea personalizada?')) return;
    deleteAirline(id);
    if (airlineId === id) {
      setAirlineId(DEFAULT_AIRLINE_ID);
    }
  };

  const handleDeletePosition = (pos: string) => {
    if (!window.confirm(`¿Eliminar la posición "${pos}"?`)) return;
    deletePosition(airlineId, pos);
    if (position === pos) {
      const remaining = getPositionsForAirline(airlineId, config, inventory).filter((p) => p !== pos);
      setPosition(remaining[0] ?? DEFAULT_POSITION);
      setSelectedDeviceId(null);
    }
  };

  const handleDownload = async () => {
    const offscreen = document.createElement('canvas');
    await renderWallpaper(
      offscreen,
      {
        position,
        type: wallpaperType,
        airlineId,
        serial,
        customAirlines: config.customAirlines,
      },
      device.width,
      device.height,
    );
    const typeLabel = wallpaperType === 'lock' ? 'bloqueo' : 'inicio';
    const serialSuffix = serial ? `-${serial.toLowerCase()}` : '';
    const safeName = `${airline.name}-${typeLabel}-${position}${serialSuffix}`
      .replace(/\s+/g, '-')
      .toLowerCase();
    downloadWallpaper(offscreen, `${safeName}-${device.width}x${device.height}.png`);
  };

  const handleDownloadBoth = async () => {
    setLoading(true);
    for (const type of ['lock', 'home'] as const) {
      const offscreen = document.createElement('canvas');
      await renderWallpaper(
        offscreen,
        {
          position,
          type,
          airlineId,
          serial,
          customAirlines: config.customAirlines,
        },
        device.width,
        device.height,
      );
      const typeLabel = type === 'lock' ? 'bloqueo' : 'inicio';
      const serialSuffix = serial ? `-${serial.toLowerCase()}` : '';
      const safeName = `${airline.name}-${typeLabel}-${position}${serialSuffix}`
        .replace(/\s+/g, '-')
        .toLowerCase();
      downloadWallpaper(offscreen, `${safeName}-${device.width}x${device.height}.png`);
    }
    setLoading(false);
  };

  const activeType = WALLPAPER_TYPES.find((t) => t.id === wallpaperType);
  const appUrl = getAppUrl();

  return (
    <div className={`app${standalone ? ' app--standalone' : ''}`}>
      <header className="header">
        <div className="header-brand">
          <img src={airline.logo} alt={airline.name} className="header-logo" />
          <div>
            <h1>Access Control</h1>
            <p>Fondos e inventario · Samsung Galaxy</p>
          </div>
        </div>
        <nav className="view-tabs" aria-label="Secciones">
          <button
            type="button"
            className={`view-tab ${view === 'wallpaper' ? 'active' : ''}`}
            onClick={() => setView('wallpaper')}
          >
            Fondos
          </button>
          <button
            type="button"
            className={`view-tab ${view === 'inventory' ? 'active' : ''}`}
            onClick={() => setView('inventory')}
          >
            Inventario
          </button>
        </nav>
      </header>

      <main className="main">
        {view === 'inventory' ? (
          <InventoryPanel
            airlines={airlines}
            inventory={inventory}
            onReassign={reassign}
            onUpdate={update}
            onAdd={add}
            onRemove={remove}
            onReset={() => {
              if (window.confirm('¿Restaurar el inventario original? Se perderán los cambios.')) {
                reset();
              }
            }}
            onSelectForWallpaper={handleSelectFromInventory}
          />
        ) : (
          <>
            <section className="panel">
              <div className="panel-section">
                <h2>Aerolínea</h2>
                <div className="airline-grid">
                  {airlines.map((a) => (
                    <div key={a.id} className="airline-item">
                      <button
                        type="button"
                        className={`airline-btn ${airlineId === a.id ? 'active' : ''}`}
                        onClick={() => handleAirlineChange(a.id)}
                      >
                        <img src={a.logo} alt={a.name} className="airline-btn-logo" />
                        <span>{a.name}</span>
                      </button>
                      {isCustomAirline(a.id) && (
                        <button
                          type="button"
                          className="item-delete-btn"
                          onClick={() => handleDeleteAirline(a.id)}
                          aria-label={`Eliminar ${a.name}`}
                          title="Eliminar aerolínea"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <details className="manage-collapsible">
                  <summary className="manage-summary">+ Agregar aerolínea</summary>
                  <div className="manage-content">
                    <AddAirlineForm onAdd={handleAddAirline} />
                  </div>
                </details>
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
                <h2>Dispositivo / Posición</h2>
                <div className="position-grid">
                  {airlineDevices.map((invDevice) => (
                    <div key={invDevice.id} className="position-item">
                      <button
                        type="button"
                        className={`position-btn ${selectedDeviceId === invDevice.id ? 'active' : ''}`}
                        onClick={() => handleSelectDevice(invDevice)}
                      >
                        <span className="position-btn-label">{invDevice.position}</span>
                        {invDevice.serial && (
                          <span className="position-btn-serial">{invDevice.serial}</span>
                        )}
                        <span className="position-btn-model">{invDevice.model}</span>
                      </button>
                    </div>
                  ))}

                  {positionsWithoutDevice.map((pos) => {
                    const posSerial = getSerialForPosition(airlineId, pos, config, inventory);
                    const isCustom = isCustomPosition(airlineId, pos, config);
                    const isActive = !selectedDeviceId && position === pos;
                    return (
                      <div key={pos} className="position-item">
                        <button
                          type="button"
                          className={`position-btn ${isActive ? 'active' : ''}${isCustom ? ' position-btn--custom' : ''}`}
                          onClick={() => {
                            setSelectedDeviceId(null);
                            setPosition(pos);
                          }}
                        >
                          <span className="position-btn-label">{pos}</span>
                          {posSerial && <span className="position-btn-serial">{posSerial}</span>}
                        </button>
                        {isCustom && (
                          <button
                            type="button"
                            className="item-delete-btn item-delete-btn--position"
                            onClick={() => handleDeletePosition(pos)}
                            aria-label={`Eliminar ${pos}`}
                            title="Eliminar posición"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <details className="manage-collapsible">
                  <summary className="manage-summary">+ Agregar posición</summary>
                  <div className="manage-content">
                    <AddPositionForm onAdd={handleAddPosition} />
                    {customPositions.length > 0 && (
                      <p className="manage-hint">
                        Posiciones personalizadas de {airline.name}: {customPositions.join(', ')}
                      </p>
                    )}
                  </div>
                </details>
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

              <details
                className="qr-collapsible"
                open={qrOpen}
                onToggle={(e) => setQrOpen(e.currentTarget.open)}
              >
                <summary className="qr-summary">Abrir en otro dispositivo</summary>
                <div className="qr-content">
                  <p className="qr-desc">Escanea el código QR con la cámara de otro celular</p>
                  <div className="qr-wrap">
                    <QRCodeSVG
                      value={appUrl}
                      size={168}
                      bgColor="#ffffff"
                      fgColor="#0b0f19"
                      level="M"
                      marginSize={2}
                    />
                  </div>
                  <p className="qr-url">{appUrl}</p>
                </div>
              </details>
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
                {serial && ` · ${serial}`}
              </p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
