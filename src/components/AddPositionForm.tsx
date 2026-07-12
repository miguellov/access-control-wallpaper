import { useState, type FormEvent } from 'react';
import { normalizePositionName, normalizeImei } from '../lib/configStore';

interface AddPositionFormProps {
  onAdd: (position: { name: string; imei?: string }) => void;
}

export function AddPositionForm({ onAdd }: AddPositionFormProps) {
  const [name, setName] = useState('');
  const [imei, setImei] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedName = normalizePositionName(name);
    if (!normalizedName) {
      setError('Escribe el nombre de la posición.');
      return;
    }

    onAdd({
      name: normalizedName,
      imei: imei.trim() ? normalizeImei(imei) : undefined,
    });

    setName('');
    setImei('');
  };

  return (
    <form className="manage-form" onSubmit={handleSubmit}>
      <label className="manage-field">
        <span>Posición</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. PUERTA 3"
          maxLength={40}
        />
      </label>

      <label className="manage-field">
        <span>IMEI (opcional)</span>
        <input
          type="text"
          value={imei}
          onChange={(e) => setImei(e.target.value)}
          placeholder="Ej. 359630140337008"
          maxLength={20}
          inputMode="numeric"
        />
      </label>

      {error && <p className="manage-error">{error}</p>}

      <button type="submit" className="manage-submit">
        Agregar posición
      </button>
    </form>
  );
}
