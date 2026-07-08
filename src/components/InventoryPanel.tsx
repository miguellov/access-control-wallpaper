import { useState, type FormEvent } from 'react';
import type { AirlineTheme } from '../lib/airlines';
import type { InventoryDevice } from '../lib/inventory';
import { groupInventoryByAirline } from '../lib/inventory';
import type { NewDeviceInput } from '../lib/inventoryStore';

interface InventoryPanelProps {
  airlines: AirlineTheme[];
  inventory: InventoryDevice[];
  onReassign: (deviceId: string, newAirlineId: string) => void;
  onUpdate: (
    deviceId: string,
    updates: Partial<Pick<InventoryDevice, 'position' | 'serial' | 'model' | 'status'>>,
  ) => void;
  onAdd: (input: NewDeviceInput) => void;
  onRemove: (deviceId: string) => void;
  onReset: () => void;
  onSelectForWallpaper?: (device: InventoryDevice) => void;
}

export function InventoryPanel({
  airlines,
  inventory,
  onReassign,
  onUpdate,
  onAdd,
  onRemove,
  onReset,
  onSelectForWallpaper,
}: InventoryPanelProps) {
  const [filterAirline, setFilterAirline] = useState<string>('all');
  const groups = groupInventoryByAirline(
    inventory,
    airlines.map((a) => a.id),
  );

  const visibleAirlines =
    filterAirline === 'all' ? airlines : airlines.filter((a) => a.id === filterAirline);

  return (
    <div className="inventory-panel">
      <div className="inventory-toolbar">
        <label className="inventory-filter">
          <span>Filtrar</span>
          <select value={filterAirline} onChange={(e) => setFilterAirline(e.target.value)}>
            <option value="all">Todas las aerolíneas</option>
            {airlines.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="inventory-reset-btn" onClick={onReset}>
          Restaurar inventario
        </button>
      </div>

      {visibleAirlines.map((airline) => {
        const devices = groups[airline.id] ?? [];
        if (devices.length === 0) return null;

        return (
          <section key={airline.id} className="inventory-group">
            <header className="inventory-group-header" style={{ background: airline.accent }}>
              <img src={airline.logo} alt="" className="inventory-group-logo" />
              <span>{airline.name}</span>
              <span className="inventory-group-count">{devices.length}</span>
            </header>

            <div className="inventory-table">
              <div className="inventory-row inventory-row--head">
                <span>Modelo</span>
                <span>Serial</span>
                <span>Posición</span>
                <span>Estado</span>
                <span>Reasignar</span>
                <span />
              </div>

              {devices.map((device) => (
                <InventoryRow
                  key={device.id}
                  device={device}
                  airlines={airlines}
                  onReassign={onReassign}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onSelectForWallpaper={onSelectForWallpaper}
                />
              ))}
            </div>
          </section>
        );
      })}

      <AddInventoryDeviceForm airlines={airlines} onAdd={onAdd} />
    </div>
  );
}

interface InventoryRowProps {
  device: InventoryDevice;
  airlines: AirlineTheme[];
  onReassign: (deviceId: string, newAirlineId: string) => void;
  onUpdate: InventoryPanelProps['onUpdate'];
  onRemove: (deviceId: string) => void;
  onSelectForWallpaper?: (device: InventoryDevice) => void;
}

function InventoryRow({
  device,
  airlines,
  onReassign,
  onUpdate,
  onRemove,
  onSelectForWallpaper,
}: InventoryRowProps) {
  const serialLabel =
    device.status === 'inoperative' ? 'INOPERATIVO' : device.serial || '—';

  return (
    <div className={`inventory-row${device.status === 'inoperative' ? ' inventory-row--inactive' : ''}`}>
      <span className="inventory-cell inventory-cell--model">{device.model}</span>
      <span className="inventory-cell inventory-cell--serial">{serialLabel}</span>
      <input
        className="inventory-cell-input"
        value={device.position}
        onChange={(e) => onUpdate(device.id, { position: e.target.value })}
        aria-label="Posición"
      />
      <select
        className="inventory-cell-select"
        value={device.status}
        onChange={(e) => onUpdate(device.id, { status: e.target.value as InventoryDevice['status'] })}
        aria-label="Estado"
      >
        <option value="active">Activo</option>
        <option value="inoperative">Inoperativo</option>
      </select>
      <select
        className="inventory-cell-select inventory-cell-select--airline"
        value={device.airlineId}
        onChange={(e) => onReassign(device.id, e.target.value)}
        aria-label="Reasignar aerolínea"
      >
        {airlines.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      <div className="inventory-row-actions">
        {onSelectForWallpaper && device.status === 'active' && (
          <button
            type="button"
            className="inventory-action-btn"
            onClick={() => onSelectForWallpaper(device)}
            title="Usar para fondo"
          >
            Fondo
          </button>
        )}
        <button
          type="button"
          className="inventory-action-btn inventory-action-btn--danger"
          onClick={() => onRemove(device.id)}
          title="Eliminar"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function AddInventoryDeviceForm({
  airlines,
  onAdd,
}: {
  airlines: AirlineTheme[];
  onAdd: (input: NewDeviceInput) => void;
}) {
  const [airlineId, setAirlineId] = useState(airlines[0]?.id ?? 'westjet');
  const [position, setPosition] = useState('');
  const [serial, setSerial] = useState('');
  const [model, setModel] = useState('Galaxy A16');
  const [status, setStatus] = useState<InventoryDevice['status']>('active');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!position.trim()) return;
    onAdd({ airlineId, position, serial, model, status });
    setPosition('');
    setSerial('');
  };

  return (
    <details className="manage-collapsible inventory-add">
      <summary className="manage-summary">+ Agregar dispositivo al inventario</summary>
      <form className="manage-form" onSubmit={handleSubmit}>
        <label className="manage-field">
          <span>Aerolínea</span>
          <select value={airlineId} onChange={(e) => setAirlineId(e.target.value)}>
            {airlines.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="manage-field">
          <span>Posición</span>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Ej. PUERTA 3"
          />
        </label>
        <label className="manage-field">
          <span>Serial</span>
          <input
            type="text"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="Ej. R5CY31Q9GZV"
          />
        </label>
        <label className="manage-field">
          <span>Modelo</span>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Galaxy A16"
          />
        </label>
        <label className="manage-field">
          <span>Estado</span>
          <select value={status} onChange={(e) => setStatus(e.target.value as InventoryDevice['status'])}>
            <option value="active">Activo</option>
            <option value="inoperative">Inoperativo</option>
          </select>
        </label>
        <button type="submit" className="manage-submit">
          Agregar dispositivo
        </button>
      </form>
    </details>
  );
}
