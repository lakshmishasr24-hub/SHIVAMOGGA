import type { TimeOfDay } from '../types/destination';

export interface TimeSlotData {
  timeOfDay: TimeOfDay;
  label: string;
  icon: string;
  tagline: string;
  recommendedHours: string;
  description: string;
  destinationIds: string[];
}

export const TIME_OF_DAY_SLOTS: TimeSlotData[] = [
  {
    timeOfDay: 'Morning',
    label: 'Dawn & Morning',
    icon: '🌅',
    tagline: 'Mist-clad Peaks & River Bathing',
    recommendedHours: '6:00 AM – 10:30 AM',
    description: 'Catch the sea of clouds from mountain tops, witness elephant bathing sessions in cool river streams, and experience early morning temple peace.',
    destinationIds: ['kundadri-hill', 'sakrebyle-elephant-camp', 'mandagadde-bird-sanctuary', 'sringeri-sharada-peetham', 'kodachadri-peak']
  },
  {
    timeOfDay: 'Afternoon',
    label: 'Midday Explorer',
    icon: '🌤',
    tagline: 'Cascading Waterfalls & Heritage Palaces',
    recommendedHours: '11:00 AM – 3:30 PM',
    description: 'Explore grand waterfall plunge pools under bright daylight, tour 16th-century Keladi Nayaka stone temples, and visit poet Kuvempu\'s heritage museum.',
    destinationIds: ['jog-falls', 'keladi-temple', 'ikkeri-temple', 'kuppali', 'gajanur-dam', 'tyavarekoppa-safari']
  },
  {
    timeOfDay: 'Evening',
    label: 'Sunset Hour',
    icon: '🌄',
    tagline: 'Golden Sky Viewpoints & Coastal Horizons',
    recommendedHours: '4:00 PM – 6:45 PM',
    description: 'Watch the sun sink into liquid gold over the Western Ghats rainforests, historic fort ramparts, and the wide Arabian Sea horizon.',
    destinationIds: ['agumbe-sunset-point', 'kavaledurga-fort', 'murudeshwar-temple', 'bhadra-wildlife-sanctuary', 'nagara-fort']
  },
  {
    timeOfDay: 'Night',
    label: 'Starlight & Twilight',
    icon: '🌙',
    tagline: 'Island Campfires & Temple Chariots',
    recommendedHours: '7:00 PM onwards',
    description: 'Experience tranquil starlit skies on backwater islands, evening illuminated laser shows at Jog Falls, and divine night rathotsavas.',
    destinationIds: ['honnemaradu', 'sringeri-sharada-peetham', 'jog-falls']
  }
];
