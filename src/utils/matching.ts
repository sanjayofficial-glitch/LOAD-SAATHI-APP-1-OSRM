export function calculateMatchScore(
  shipmentOriginCity: string,
  shipmentDestCity: string,
  tripOriginCity: string,
  tripDestCity: string,
  shipmentWeightTonnes: number,
  tripCapacityTonnes: number
): number {
  const n = (s: string) => s.toLowerCase().trim();
  const so = n(shipmentOriginCity);
  const sd = n(shipmentDestCity);
  const to = n(tripOriginCity);
  const td = n(tripDestCity);

  const originScore = (so.includes(to) || to.includes(so)) ? 40 : 0;
  const destScore   = (sd.includes(td) || td.includes(sd)) ? 40 : 0;
  const capScore    = shipmentWeightTonnes <= tripCapacityTonnes ? 20 : 0;

  return originScore + destScore + capScore;
}

export function getMatchLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 60) return { label: `${score}% Match`, color: 'bg-green-100 text-green-700' };
  if (score >= 30) return { label: `${score}% Match`, color: 'bg-yellow-100 text-yellow-700' };
  return { label: `${score}% Match`, color: 'bg-gray-100 text-gray-500' };
}
