import { useCallback, useState } from 'react';
import { clearAssetCache } from '../lib/imageAssets';
import {
  addCustomAirline,
  addCustomPosition,
  loadCustomConfig,
  removeCustomAirline,
  removeCustomPosition,
  saveCustomConfig,
  type AppCustomConfig,
  type CustomAirline,
  type CustomPosition,
} from '../lib/configStore';
import type { PositionTemplateId } from '../lib/positionTemplates';

export function useCustomConfig() {
  const [config, setConfig] = useState<AppCustomConfig>(loadCustomConfig);

  const persist = useCallback((next: AppCustomConfig) => {
    setConfig(next);
    saveCustomConfig(next);
    clearAssetCache();
  }, []);

  const addAirline = useCallback(
    (airline: Omit<CustomAirline, 'id'> & { id?: string; templateId?: PositionTemplateId }) => {
      const next = addCustomAirline(config, airline);
      persist(next);
      return next.customAirlines[next.customAirlines.length - 1]?.id;
    },
    [config, persist],
  );

  const deleteAirline = useCallback(
    (airlineId: string) => {
      persist(removeCustomAirline(config, airlineId));
    },
    [config, persist],
  );

  const addPosition = useCallback(
    (airlineId: string, position: CustomPosition) => {
      persist(addCustomPosition(config, airlineId, position));
    },
    [config, persist],
  );

  const deletePosition = useCallback(
    (airlineId: string, positionName: string) => {
      persist(removeCustomPosition(config, airlineId, positionName));
    },
    [config, persist],
  );

  return {
    config,
    addAirline,
    deleteAirline,
    addPosition,
    deletePosition,
  };
}
