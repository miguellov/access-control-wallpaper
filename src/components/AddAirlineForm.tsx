import { useState, type FormEvent } from 'react';
import { readFileAsDataUrl } from '../lib/configStore';
import {
  DEFAULT_POSITION_TEMPLATE_ID,
  POSITION_TEMPLATES,
  type PositionTemplateId,
} from '../lib/positionTemplates';

interface AddAirlineFormProps {
  onAdd: (airline: {
    name: string;
    accent: string;
    bgDataUrl: string;
    logoDataUrl: string;
    templateId: PositionTemplateId;
  }) => void;
}

export function AddAirlineForm({ onAdd }: AddAirlineFormProps) {
  const [name, setName] = useState('');
  const [accent, setAccent] = useState('#0066cc');
  const [templateId, setTemplateId] = useState<PositionTemplateId>(DEFAULT_POSITION_TEMPLATE_ID);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedTemplate = POSITION_TEMPLATES.find((t) => t.id === templateId);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Escribe el nombre de la aerolínea.');
      return;
    }

    const form = e.currentTarget as HTMLFormElement;
    const logoInput = form.elements.namedItem('logo') as HTMLInputElement;
    const bgInput = form.elements.namedItem('background') as HTMLInputElement;
    const logoFile = logoInput.files?.[0];
    const bgFile = bgInput.files?.[0];

    if (!logoFile || !bgFile) {
      setError('Selecciona el logo y el fondo.');
      return;
    }

    setSaving(true);
    try {
      const [logoDataUrl, bgDataUrl] = await Promise.all([
        readFileAsDataUrl(logoFile),
        readFileAsDataUrl(bgFile),
      ]);

      onAdd({
        name: trimmedName,
        accent,
        bgDataUrl,
        logoDataUrl,
        templateId,
      });

      setName('');
      setAccent('#0066cc');
      setTemplateId(DEFAULT_POSITION_TEMPLATE_ID);
      form.reset();
    } catch {
      setError('No se pudieron cargar las imágenes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="manage-form" onSubmit={handleSubmit}>
      <label className="manage-field">
        <span>Nombre</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Air Canada"
          maxLength={40}
        />
      </label>

      <label className="manage-field">
        <span>Color principal</span>
        <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
      </label>

      <label className="manage-field">
        <span>Plantilla de posiciones</span>
        <select
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value as PositionTemplateId)}
        >
          {POSITION_TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      {selectedTemplate && (
        <p className="manage-hint">
          {selectedTemplate.description}: {selectedTemplate.positions.join(', ')}
        </p>
      )}

      <label className="manage-field">
        <span>Logo (PNG/JPG)</span>
        <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" />
      </label>

      <label className="manage-field">
        <span>Fondo (PNG/JPG)</span>
        <input type="file" name="background" accept="image/png,image/jpeg,image/webp" />
      </label>

      {error && <p className="manage-error">{error}</p>}

      <button type="submit" className="manage-submit" disabled={saving}>
        {saving ? 'Guardando...' : 'Agregar aerolínea'}
      </button>
    </form>
  );
}
