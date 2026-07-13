export type VehicleEmissionClass = 'light' | 'medium' | 'heavy';

export interface EmissionsInput {
  distanceKm: number;
  vehicleType?: string | null;
  loadTonnes?: number | null;
}

export interface EmissionsResult {
  distanceKm: number;
  factorKgPerKm: number;
  totalKg: number;
  tonnesCO2e: number;
  intensityKgPerTonneKm: number | null;
  vehicleClass: VehicleEmissionClass;
}

const EMISSION_FACTORS: Record<VehicleEmissionClass, number> = {
  light: 0.32,
  medium: 0.68,
  heavy: 0.92,
};

export function getVehicleEmissionClass(vehicleType?: string | null): VehicleEmissionClass {
  const normalized = vehicleType?.toLowerCase() ?? '';
  if (/mini|pickup|tata ace|tempo|light/.test(normalized)) return 'light';
  if (/14|16|17|medium|eicher/.test(normalized)) return 'medium';
  return 'heavy';
}

export function calculateEmissions({ distanceKm, vehicleType, loadTonnes }: EmissionsInput): EmissionsResult {
  const safeDistance = Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm : 0;
  const safeLoad = Number.isFinite(loadTonnes) && (loadTonnes ?? 0) > 0 ? Number(loadTonnes) : null;
  const vehicleClass = getVehicleEmissionClass(vehicleType);
  const factorKgPerKm = EMISSION_FACTORS[vehicleClass];
  const totalKg = safeDistance * factorKgPerKm;

  return {
    distanceKm: safeDistance,
    factorKgPerKm,
    totalKg: Math.round(totalKg * 10) / 10,
    tonnesCO2e: Math.round((totalKg / 1000) * 1000) / 1000,
    intensityKgPerTonneKm: safeLoad ? Math.round((totalKg / (safeDistance * safeLoad)) * 1000) / 1000 : null,
    vehicleClass,
  };
}
