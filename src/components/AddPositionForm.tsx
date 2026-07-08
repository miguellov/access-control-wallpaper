import { useState, type FormEvent } from 'react';
import { normalizePositionName, normalizeSerial } from '../lib/configStore';

interface AddPositionFormProps {
  onAdd: (position: { name: string; serial?: string }) => void;
}

export function AddPositionForm({ onAdd }: AddPositionFormProps) {
  const [name, setName] = useState('');
  const [serial, setSerial] = useState('');
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
      serial: serial.trim() ? normalizeSerial(serial) : undefined,
    });

    setName('');
    setSerial('');
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
        <span>Serial (opcional)</span>
        <input
          type="text"
          value={serial}
          onChange={(e) => setSerial(e.target.value)}
          placeholder="Ej. R5CY31Q9GZV"
          maxLength={20}
        />
      </label>

      {error && <p className="manage-error">{error}</p>}

      <button type="submit" className="manage-submit">
        Agregar posición
      </button>
    </form>
  );
}
