export type CategoryType = 
  | 'Waterfalls'
  | 'Mountains & Hills'
  | 'Nature'
  | 'Wildlife'
  | 'Trekking'
  | 'Temples'
  | 'Historical Places'
  | 'Forts'
  | 'Viewpoints'
  | 'Adventure'
  | 'Beaches'
  | 'Forests'
  | 'Camping'
  | 'Coffee Plantations'
  | 'Dams & Reservoirs'
  | 'Heritage & Culture';

export type DistrictType = 
  | 'Shivamogga'
  | 'Chikkamagaluru'
  | 'Udupi'
  | 'Uttara Kannada'
  | 'Dakshina Kannada'
  | 'Davanagere'
  | 'Haveri';

export type DifficultyLevel = 'Easy' | 'Moderate' | 'Difficult';
export type TravelType = 'Family' | 'Couple' | 'Friends' | 'Solo' | 'Adventure';
export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night';
export type EscapeTag = 'Water' | 'Nature' | 'Adventure' | 'Culture' | 'Wildlife' | 'Photography' | 'Relaxation' | 'Family';

export interface HowToReach {
  road?: string;
  bus?: string;
  train?: string;
  air?: string;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  district: DistrictType;
  state: 'Karnataka';
  category: CategoryType;
  shortDescription: string;
  longDescription: string;
  history?: string;
  geography?: string;
  latitude: number;
  longitude: number;
  distanceFromShivamogga: number; // calculated straight-line / radial distance in km
  roadDistance?: string; // driving road distance, e.g. "105 KM via NH-69"
  estimatedTravelTime: string; // e.g. "2 hours 15 mins"
  bestTimeToVisit: string;
  entryFee: string;
  openingHours: string;
  images: string[];
  thingsToDo: string[];
  howToReach: HowToReach;
  nearbyPlaces: string[]; // destination IDs
  tags: string[];
  rating: number; // out of 5
  reviewCount: number;
  difficulty: DifficultyLevel;
  travelType: TravelType[];
  suitableTimeOfDay: TimeOfDay[];
  escapeTag?: EscapeTag[];
  hiddenGem?: boolean;
  oneDayEscape?: boolean;
  safetyTips?: string[];
  featured?: boolean;
}

export interface TripItem {
  destinationId: string;
  order: number;
  notes?: string;
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  destinationName: string;
  district: string;
  image: string;
  content: string[];
  quote: string;
  quoteAuthor: string;
}
