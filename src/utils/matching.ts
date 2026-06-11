export function calculateMatchScore(
  shipmentOriginCity: string,
  shipmentDestCity: string,
  tripOriginCity: string,
  tripDestCity: string,
  shipmentWeightTonnes: number,
  tripCapacityTonnes: number,
  shipmentOriginState?: string,
  shipmentDestState?: string,
  tripOriginState?: string,
  tripDestState?: string
): number {
  const n = (s: string) => s.toLowerCase().trim();
  const so = n(shipmentOriginCity);
  const sd = n(shipmentDestCity);
  const to = n(tripOriginCity);
  const td = n(tripDestCity);

  // City-level matching (exact or substring)
  const originScore = (so === to || so.includes(to) || to.includes(so)) ? 40 : 0;
  const destScore   = (sd === td || sd.includes(td) || td.includes(sd)) ? 40 : 0;
  const capScore    = shipmentWeightTonnes <= tripCapacityTonnes ? 20 : 0;

  let score = originScore + destScore + capScore;

  // Bonus: if cities don't match exactly but states do, give partial credit
  if (originScore === 0 && shipmentOriginState && tripOriginState) {
    if (n(shipmentOriginState) === n(tripOriginState)) {
      score += 20; // Same state, different city
    }
  }
  if (destScore === 0 && shipmentDestState && tripDestState) {
    if (n(shipmentDestState) === n(tripDestState)) {
      score += 20; // Same state, different city
    }
  }

  return Math.min(score, 100);
}

export function getMatchLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 60) return { label: `${score}% Match`, color: 'bg-green-100 text-green-700' };
  if (score >= 30) return { label: `${score}% Match`, color: 'bg-yellow-100 text-yellow-700' };
  return { label: `${score}% Match`, color: 'bg-gray-100 text-gray-500' };
}
