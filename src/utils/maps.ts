import type { Destination } from '../types/destination';

export const SHIVAMOGGA_CENTER = { lat: 13.9299, lng: 75.5681 } as const;

export function buildGoogleMapsDirectionsUrl(
  dest: Pick<Destination, 'latitude' | 'longitude'>,
  userLocation?: { lat: number; lng: number } | null
): string {
  const origin = userLocation
    ? `${userLocation.lat},${userLocation.lng}`
    : `${SHIVAMOGGA_CENTER.lat},${SHIVAMOGGA_CENTER.lng}`;

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest.latitude},${dest.longitude}&travelmode=driving`;
}

