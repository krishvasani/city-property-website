/**
 * City Property Services — Ahmedabad & Gandhinagar locality / micro-market dataset.
 *
 * Canonical, shared source of localities for: Buy/Rent filters, the Map page,
 * Sell/Consult locality pickers, property↔locality matching, blog/guide filters
 * and future SEO/locality landing pages.
 *
 * COORDINATES: all latitude/longitude values are **approximate locality
 * centroids** drawn from OpenStreetMap / Google Maps knowledge (treat as ~±1 km).
 * They are good enough for map fallbacks and centring, not for parcel-level use.
 * Sources for relevance: AMC/AUDA area knowledge, GIDC industrial estates, GIFT
 * City, and general Ahmedabad/Gandhinagar real-estate market knowledge. No market
 * prices are invented here.
 *
 * Conventions: `id` is the canonical key (kebab-case, also used as `slug` and as
 * a property's `localitySlug`). `nearbyAreas` holds other locality **ids**.
 * Display the `name` in UI; match on `id` internally.
 */

export type LocalityType =
  | 'residential'
  | 'commercial'
  | 'office'
  | 'industrial'
  | 'warehousing'
  | 'logistics'
  | 'plots'
  | 'investment';

export type LocalityGroup =
  | 'West Ahmedabad'
  | 'North Ahmedabad'
  | 'East Ahmedabad'
  | 'South Ahmedabad'
  | 'Central Ahmedabad'
  | 'Ahmedabad Outskirts'
  | 'Industrial & Warehousing'
  | 'GIFT City & Gandhinagar';

export interface PropertyRelevance {
  buy: boolean;
  rent: boolean;
  sell: boolean;
  lease: boolean;
  plots: boolean;
  industrial: boolean;
  warehousing: boolean;
  commercial: boolean;
}

export interface Locality {
  id: string;
  name: string;
  aliases: string[];
  city: string;
  district: string;
  region: string;
  zone: string;
  group: LocalityGroup;
  microMarket: string;
  type: LocalityType[];
  propertyTypes: LocalityType[]; // alias of `type` for SEO/data clarity
  propertyRelevance: PropertyRelevance;
  popularFor: string[];
  nearbyAreas: string[]; // locality ids
  connectivity: string[];
  landmarks: string[];
  pincode: string;
  latitude: number; // approximate centroid
  longitude: number; // approximate centroid
  searchKeywords: string[];
  priority: number; // 1 = prime/most-searched … 4 = niche
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

// ── builder ───────────────────────────────────────────────────────────
type Extra = Partial<
  Pick<
    Locality,
    | 'aliases' | 'city' | 'district' | 'region' | 'zone' | 'microMarket'
    | 'propertyRelevance' | 'popularFor' | 'nearbyAreas' | 'connectivity'
    | 'landmarks' | 'pincode' | 'priority' | 'description' | 'seoTitle' | 'seoDescription'
  >
>;
type Row = [id: string, name: string, type: LocalityType[], lat: number, lng: number, extra?: Extra];

const GROUP_DEFAULTS: Record<LocalityGroup, { region: string; zone: string; microMarket: string; city: string }> = {
  'West Ahmedabad': { region: 'West Ahmedabad', zone: 'West', microMarket: 'SG Highway / West Ahmedabad', city: 'Ahmedabad' },
  'North Ahmedabad': { region: 'North Ahmedabad', zone: 'North', microMarket: 'North Ahmedabad', city: 'Ahmedabad' },
  'East Ahmedabad': { region: 'East Ahmedabad', zone: 'East', microMarket: 'East Ahmedabad', city: 'Ahmedabad' },
  'South Ahmedabad': { region: 'South Ahmedabad', zone: 'South', microMarket: 'South Ahmedabad', city: 'Ahmedabad' },
  'Central Ahmedabad': { region: 'Central Ahmedabad', zone: 'Central', microMarket: 'Central / Walled City', city: 'Ahmedabad' },
  'Ahmedabad Outskirts': { region: 'Ahmedabad Outskirts', zone: 'Outskirts', microMarket: 'Ahmedabad Outskirts', city: 'Ahmedabad' },
  'Industrial & Warehousing': { region: 'Industrial Belt', zone: 'Industrial', microMarket: 'Industrial & Warehousing Belt', city: 'Ahmedabad' },
  'GIFT City & Gandhinagar': { region: 'Gandhinagar', zone: 'Gandhinagar', microMarket: 'GIFT City / Gandhinagar', city: 'Gandhinagar' },
};

const TYPE_KEYWORD: Record<LocalityType, string> = {
  residential: 'flats', commercial: 'office space', office: 'office', industrial: 'industrial sheds',
  warehousing: 'warehouse', logistics: 'warehouse', plots: 'plots', investment: 'investment property',
};

function relevanceFor(types: LocalityType[]): PropertyRelevance {
  const has = (t: LocalityType) => types.includes(t);
  const residential = has('residential');
  const commercial = has('commercial') || has('office');
  const industrial = has('industrial');
  const warehousing = has('warehousing') || has('logistics');
  const plots = has('plots');
  const investment = has('investment');
  return {
    buy: residential || commercial || plots || investment,
    rent: residential || commercial,
    sell: true,
    lease: commercial || industrial || warehousing,
    plots,
    industrial,
    warehousing,
    commercial,
  };
}

function build(group: LocalityGroup, rows: Row[]): Locality[] {
  const g = GROUP_DEFAULTS[group];
  return rows.map(([id, name, type, latitude, longitude, extra = {}]) => {
    const city = extra.city ?? g.city;
    const keywords = [
      `property in ${name}`,
      `${name} ${city}`,
      ...type.map((t) => `${TYPE_KEYWORD[t]} in ${name}`),
    ];
    const usePhrase = extra.popularFor?.[0] ?? type.join(' / ');
    return {
      id,
      name,
      aliases: extra.aliases ?? [],
      city,
      district: extra.district ?? (group === 'GIFT City & Gandhinagar' ? 'Gandhinagar' : 'Ahmedabad'),
      region: extra.region ?? g.region,
      zone: extra.zone ?? g.zone,
      group,
      microMarket: extra.microMarket ?? g.microMarket,
      type,
      propertyTypes: type,
      propertyRelevance: extra.propertyRelevance ?? relevanceFor(type),
      popularFor: extra.popularFor ?? [],
      nearbyAreas: extra.nearbyAreas ?? [],
      connectivity: extra.connectivity ?? [],
      landmarks: extra.landmarks ?? [],
      pincode: extra.pincode ?? '',
      latitude,
      longitude,
      searchKeywords: keywords,
      priority: extra.priority ?? 3,
      slug: id,
      description:
        extra.description ?? `${name} is a ${usePhrase} area in ${g.region}, ${city}.`,
      seoTitle: extra.seoTitle ?? `Property in ${name}, ${city}: Buy, Rent & Invest`,
      seoDescription:
        extra.seoDescription ??
        `Explore ${name} real estate with City Property Services, covering ${usePhrase} in ${name}, ${city}. Find properties for sale, rent and lease.`,
    };
  });
}

// ── DATASET ───────────────────────────────────────────────────────────
export const localities: Locality[] = [
  // ---------- WEST AHMEDABAD (premium / established) ----------
  ...build('West Ahmedabad', [
    ['bodakdev', 'Bodakdev', ['residential', 'commercial'], 23.039, 72.512, { priority: 1, popularFor: ['premium apartments', 'corporate offices', 'family housing', 'investment'], nearbyAreas: ['thaltej', 'vastrapur', 'satellite', 'ambli', 'sg-highway'], connectivity: ['SG Highway', 'Sindhu Bhavan Road', 'SP Ring Road'] }],
    ['satellite', 'Satellite', ['residential', 'commercial'], 23.030, 72.520, { priority: 1, popularFor: ['established residential', 'retail', 'schools'], nearbyAreas: ['vastrapur', 'jodhpur', 'prahlad-nagar', 'ambawadi'], connectivity: ['Satellite Road', 'SG Highway', '132ft Ring Road'] }],
    ['vastrapur', 'Vastrapur', ['residential', 'commercial'], 23.037, 72.527, { priority: 1, popularFor: ['lakeside living', 'apartments', 'retail'], nearbyAreas: ['satellite', 'bodakdev', 'memnagar', 'university-area'], landmarks: ['Vastrapur Lake', 'Alpha One Mall'] }],
    ['thaltej', 'Thaltej', ['residential', 'commercial'], 23.047, 72.505, { priority: 1, popularFor: ['premium apartments', 'offices', 'showrooms'], nearbyAreas: ['bodakdev', 'sindhu-bhavan-road', 'sola', 'shilaj'], connectivity: ['SG Highway', 'Sindhu Bhavan Road'] }],
    ['ambli', 'Ambli', ['residential', 'commercial'], 23.035, 72.478, { priority: 2, popularFor: ['luxury villas', 'bungalows'], nearbyAreas: ['bopal', 'shilaj', 'bodakdev'], connectivity: ['Ambli-Bopal Road', 'SP Ring Road'] }],
    ['bopal', 'Bopal', ['residential', 'commercial'], 23.033, 72.470, { priority: 1, popularFor: ['family housing', 'affordable-to-mid apartments', 'schools'], nearbyAreas: ['south-bopal', 'ambli', 'ghuma', 'shela'], connectivity: ['Bopal-Ambli Road', 'SP Ring Road'] }],
    ['south-bopal', 'South Bopal', ['residential', 'commercial'], 23.018, 72.465, { aliases: ['SoBo Ahmedabad'], priority: 1, popularFor: ['new apartments', 'family housing', 'value'], nearbyAreas: ['bopal', 'ghuma', 'shela'], connectivity: ['SP Ring Road', 'South Bopal Road'] }],
    ['shela', 'Shela', ['residential', 'plots'], 23.008, 72.476, { priority: 1, popularFor: ['new villas & towers', 'plots', 'investment'], nearbyAreas: ['south-bopal', 'ghuma', 'shilaj'], connectivity: ['SP Ring Road', 'Shela-Shantipura Road'] }],
    ['shilaj', 'Shilaj', ['residential', 'plots'], 23.045, 72.470, { priority: 2, popularFor: ['bungalows', 'plots', 'gated schemes'], nearbyAreas: ['ambli', 'thaltej', 'shela'] }],
    ['ghuma', 'Ghuma', ['residential', 'plots'], 23.025, 72.455, { priority: 2, popularFor: ['new residential', 'plots'], nearbyAreas: ['bopal', 'south-bopal', 'shela'] }],
    ['prahlad-nagar', 'Prahlad Nagar', ['residential', 'commercial', 'office'], 23.012, 72.510, { priority: 1, popularFor: ['premium apartments', 'corporate offices', 'investment'], nearbyAreas: ['satellite', 'makarba', 'jodhpur', 'sg-highway'], landmarks: ['Iscon Mega Mall', 'Safal Parisar'] }],
    ['makarba', 'Makarba', ['residential', 'commercial'], 23.008, 72.500, { priority: 2, nearbyAreas: ['prahlad-nagar', 'vejalpur', 'sg-highway'] }],
    ['jodhpur', 'Jodhpur', ['residential', 'commercial'], 23.018, 72.520, { aliases: ['Jodhpur Ahmedabad'], priority: 2, nearbyAreas: ['satellite', 'prahlad-nagar', 'jodhpur-village'] }],
    ['jodhpur-village', 'Jodhpur Village', ['residential'], 23.015, 72.515, { aliases: ['Jodhpur Gam'], priority: 3, nearbyAreas: ['jodhpur', 'satellite'] }],
    ['jodhpur-cross-road', 'Jodhpur Cross Road', ['commercial', 'residential'], 23.021, 72.522, { priority: 3, nearbyAreas: ['satellite', 'jodhpur'] }],
    ['iskcon', 'ISKCON', ['commercial', 'residential', 'office'], 23.027, 72.507, { aliases: ['ISKCON Cross Road'], priority: 2, popularFor: ['offices', 'retail', 'hospitality'], nearbyAreas: ['sg-highway', 'prahlad-nagar', 'bodakdev'], landmarks: ['ISKCON Temple', 'Iscon Cross Roads'] }],
    ['sg-highway', 'SG Highway', ['commercial', 'office', 'residential'], 23.030, 72.508, { aliases: ['Sarkhej-Gandhinagar Highway', 'S.G. Highway'], priority: 1, popularFor: ['commercial offices', 'showrooms', 'premium apartments', 'hospitality'], nearbyAreas: ['bodakdev', 'prahlad-nagar', 'thaltej', 'iskcon'], connectivity: ['SG Highway', 'SP Ring Road'] }],
    ['sindhu-bhavan-road', 'Sindhu Bhavan Road', ['commercial', 'office', 'residential'], 23.045, 72.500, { aliases: ['SBR', 'Sindhubhavan', 'Sindhu Bhavan', 'Sindhu Bhavan Marg'], priority: 1, popularFor: ['new-age offices', 'cafes & retail', 'premium residential'], nearbyAreas: ['thaltej', 'bodakdev', 'pakwan'] }],
    ['science-city', 'Science City', ['residential', 'commercial'], 23.078, 72.512, { priority: 2, popularFor: ['new apartments', 'family housing'], nearbyAreas: ['sola', 'bhadaj', 'ghatlodia'], landmarks: ['Gujarat Science City'] }],
    ['sola', 'Sola', ['residential', 'commercial'], 23.075, 72.525, { priority: 2, nearbyAreas: ['science-city', 'ghatlodia', 'gota'], landmarks: ['Sola Civil Hospital'] }],
    ['sola-road', 'Sola Road', ['residential', 'commercial'], 23.068, 72.535, { priority: 3, nearbyAreas: ['sola', 'naranpura', 'ghatlodia'] }],
    ['chanakyapuri', 'Chanakyapuri', ['residential'], 23.063, 72.545, { priority: 3, nearbyAreas: ['ghatlodia', 'memnagar', 'naranpura'] }],
    ['ghatlodia', 'Ghatlodia', ['residential', 'commercial'], 23.077, 72.553, { priority: 2, popularFor: ['mid housing', 'value apartments'], nearbyAreas: ['sola', 'chanakyapuri', 'gota'] }],
    ['memnagar', 'Memnagar', ['residential', 'commercial'], 23.055, 72.540, { priority: 2, nearbyAreas: ['vastrapur', 'naranpura', 'gurukul'] }],
    ['gurukul', 'Gurukul', ['residential', 'commercial'], 23.048, 72.545, { priority: 3, nearbyAreas: ['memnagar', 'drive-in', 'naranpura'] }],
    ['naranpura', 'Naranpura', ['residential', 'commercial'], 23.058, 72.560, { priority: 2, nearbyAreas: ['navrangpura', 'memnagar', 'sola-road'] }],
    ['navrangpura', 'Navrangpura', ['residential', 'commercial', 'office'], 23.038, 72.560, { priority: 1, popularFor: ['offices', 'retail', 'education hub'], nearbyAreas: ['cg-road', 'ambawadi', 'naranpura'], landmarks: ['Gujarat University', 'CG Road'] }],
    ['ambawadi', 'Ambawadi', ['residential', 'commercial'], 23.022, 72.553, { priority: 2, nearbyAreas: ['nehrunagar', 'paldi', 'navrangpura'] }],
    ['paldi', 'Paldi', ['residential', 'commercial'], 23.012, 72.565, { priority: 2, nearbyAreas: ['ellisbridge', 'vasna', 'ambawadi'] }],
    ['ellisbridge', 'Ellisbridge', ['residential', 'commercial'], 23.022, 72.575, { aliases: ['Ellis Bridge'], priority: 2, nearbyAreas: ['paldi', 'law-garden', 'navrangpura'], landmarks: ['Sabarmati Riverfront'] }],
    ['ashram-road', 'Ashram Road', ['commercial', 'office'], 23.040, 72.575, { priority: 2, popularFor: ['corporate & bank offices'], nearbyAreas: ['navrangpura', 'ellisbridge', 'usmanpura'] }],
    ['cg-road', 'CG Road', ['commercial', 'office', 'residential'], 23.030, 72.560, { aliases: ['Chimanlal Girdharlal Road'], priority: 1, popularFor: ['retail', 'offices', 'showrooms'], nearbyAreas: ['navrangpura', 'law-garden', 'ambawadi'] }],
    ['law-garden', 'Law Garden', ['residential', 'commercial'], 23.025, 72.565, { priority: 2, nearbyAreas: ['cg-road', 'ellisbridge', 'ambawadi'], landmarks: ['Law Garden Market'] }],
    ['university-area', 'University Area', ['residential', 'commercial'], 23.036, 72.547, { priority: 3, nearbyAreas: ['vastrapur', 'navrangpura', 'panjrapole'] }],
    ['panjrapole', 'Panjrapole', ['residential', 'commercial'], 23.030, 72.548, { priority: 3, nearbyAreas: ['university-area', 'ambawadi'] }],
    ['nehrunagar', 'Nehrunagar', ['residential', 'commercial'], 23.022, 72.545, { priority: 2, nearbyAreas: ['ambawadi', 'satellite', 'prahlad-nagar'] }],
    ['vasna', 'Vasna', ['residential'], 23.000, 72.555, { priority: 3, nearbyAreas: ['paldi', 'jivraj-park', 'vejalpur'] }],
    ['jivraj-park', 'Jivraj Park', ['residential', 'commercial'], 23.006, 72.540, { priority: 3, nearbyAreas: ['vasna', 'vejalpur', 'makarba'] }],
  ]),

  // ---------- NORTH / NORTH-WEST AHMEDABAD ----------
  ...build('North Ahmedabad', [
    ['gota', 'Gota', ['residential', 'plots'], 23.101, 72.543, { priority: 1, popularFor: ['emerging & affordable', 'new apartments', 'first-time buyers'], nearbyAreas: ['chandkheda', 'ghatlodia', 'tragad', 'science-city'], connectivity: ['SG Highway', 'SP Ring Road'] }],
    ['chandkheda', 'Chandkheda', ['residential', 'commercial'], 23.108, 72.582, { priority: 1, popularFor: ['value apartments', 'IT/PSU proximity', 'family housing'], nearbyAreas: ['motera', 'sabarmati', 'new-cg-road', 'gota'], connectivity: ['New CG Road', 'NH 48'] }],
    ['motera', 'Motera', ['residential', 'commercial'], 23.092, 72.597, { priority: 2, popularFor: ['stadium-side apartments'], nearbyAreas: ['chandkheda', 'sabarmati', 'tragad'], landmarks: ['Narendra Modi Stadium'] }],
    ['sabarmati', 'Sabarmati', ['residential', 'commercial'], 23.085, 72.580, { priority: 2, nearbyAreas: ['motera', 'ranip', 'chandkheda'] }],
    ['ranip', 'Ranip', ['residential', 'commercial'], 23.080, 72.565, { priority: 2, nearbyAreas: ['new-ranip', 'sabarmati', 'jagatpur'] }],
    ['new-ranip', 'New Ranip', ['residential'], 23.083, 72.560, { priority: 3, nearbyAreas: ['ranip', 'jagatpur'] }],
    ['tragad', 'Tragad', ['residential', 'plots'], 23.105, 72.565, { priority: 3, nearbyAreas: ['gota', 'chandkheda', 'zundal'] }],
    ['zundal', 'Zundal', ['residential', 'plots'], 23.125, 72.560, { priority: 2, popularFor: ['plots', 'new schemes', 'Gandhinagar-side growth'], nearbyAreas: ['tragad', 'khoraj', 'adalaj', 'vaishnodevi-circle'] }],
    ['vaishnodevi-circle', 'Vaishnodevi Circle', ['residential', 'commercial', 'plots'], 23.135, 72.545, { aliases: ['Vaishnodevi'], priority: 2, popularFor: ['new townships', 'plots', 'investment'], nearbyAreas: ['zundal', 'khoraj', 'jagatpur'], connectivity: ['SG Highway', 'SP Ring Road'] }],
    ['jagatpur', 'Jagatpur', ['residential', 'plots'], 23.095, 72.535, { priority: 3, nearbyAreas: ['gota', 'ranip', 'chenpur'] }],
    ['chenpur', 'Chenpur', ['residential', 'plots'], 23.110, 72.555, { priority: 3, nearbyAreas: ['jagatpur', 'tragad', 'zundal'] }],
    ['ognaj', 'Ognaj', ['residential', 'plots'], 23.085, 72.510, { priority: 3, nearbyAreas: ['bhadaj', 'science-city', 'gota'] }],
    ['bhadaj', 'Bhadaj', ['residential', 'plots'], 23.095, 72.500, { priority: 3, nearbyAreas: ['ognaj', 'science-city', 'thaltej'] }],
    ['hebatpur', 'Hebatpur', ['residential', 'commercial'], 23.058, 72.490, { priority: 3, nearbyAreas: ['thaltej', 'sola', 'shilaj'] }],
    ['kali', 'Kali', ['residential', 'plots'], 23.100, 72.520, { priority: 4, description: 'Kali is an emerging residential/plotting pocket in North-West Ahmedabad. // approximate centroid', nearbyAreas: ['gota', 'jagatpur'] }],
    ['tapovan-circle', 'Tapovan Circle', ['residential', 'commercial', 'plots'], 23.120, 72.555, { priority: 3, nearbyAreas: ['zundal', 'chenpur', 'vaishnodevi-circle'] }],
  ]),

  // ---------- CENTRAL / OLD (WALLED CITY) AHMEDABAD ----------
  ...build('Central Ahmedabad', [
    ['kalupur', 'Kalupur', ['commercial', 'residential'], 23.027, 72.600, { priority: 2, popularFor: ['wholesale markets', 'transit hub'], nearbyAreas: ['sarangpur', 'dariyapur', 'relief-road'], landmarks: ['Kalupur Railway Station'] }],
    ['shahpur', 'Shahpur', ['residential', 'commercial'], 23.035, 72.585, { priority: 3, nearbyAreas: ['delhi-darwaja', 'khanpur', 'dariyapur'] }],
    ['dariyapur', 'Dariyapur', ['residential', 'commercial'], 23.035, 72.595, { priority: 3, nearbyAreas: ['kalupur', 'shahpur', 'delhi-darwaja'] }],
    ['jamalpur', 'Jamalpur', ['commercial', 'residential'], 23.015, 72.585, { priority: 2, popularFor: ['APMC market', 'wholesale'], nearbyAreas: ['raikhad', 'astodia', 'behrampura'], landmarks: ['Jamalpur APMC'] }],
    ['raipur', 'Raipur', ['residential', 'commercial'], 23.020, 72.595, { priority: 3, nearbyAreas: ['khadia', 'astodia', 'kankaria'] }],
    ['manek-chowk', 'Manek Chowk', ['commercial'], 23.025, 72.590, { priority: 3, popularFor: ['jewellery & textile trade', 'food market'], nearbyAreas: ['khadia', 'bhadra', 'relief-road'] }],
    ['relief-road', 'Relief Road', ['commercial'], 23.027, 72.588, { priority: 2, popularFor: ['electronics & retail trade'], nearbyAreas: ['gheekanta', 'lal-darwaja', 'kalupur'] }],
    ['gheekanta', 'Gheekanta', ['commercial', 'residential'], 23.028, 72.585, { priority: 3, nearbyAreas: ['relief-road', 'lal-darwaja'] }],
    ['lal-darwaja', 'Lal Darwaja', ['commercial'], 23.026, 72.580, { priority: 2, popularFor: ['central market', 'transit'], nearbyAreas: ['bhadra', 'relief-road', 'khanpur'], landmarks: ['Lal Darwaja Market'] }],
    ['bhadra', 'Bhadra', ['commercial'], 23.025, 72.587, { priority: 3, nearbyAreas: ['lal-darwaja', 'manek-chowk'], landmarks: ['Bhadra Fort'] }],
    ['khadia', 'Khadia', ['residential', 'commercial'], 23.025, 72.592, { priority: 3, nearbyAreas: ['raipur', 'manek-chowk', 'astodia'] }],
    ['raikhad', 'Raikhad', ['residential', 'commercial'], 23.018, 72.580, { priority: 4, nearbyAreas: ['jamalpur', 'astodia'] }],
    ['sarangpur', 'Sarangpur', ['commercial', 'residential'], 23.025, 72.600, { priority: 3, nearbyAreas: ['kalupur', 'raipur'] }],
    ['astodia', 'Astodia', ['residential', 'commercial'], 23.020, 72.590, { priority: 3, nearbyAreas: ['raipur', 'khadia', 'jamalpur'] }],
    ['delhi-darwaja', 'Delhi Darwaja', ['commercial', 'residential'], 23.040, 72.595, { priority: 3, nearbyAreas: ['shahpur', 'dariyapur', 'sarangpur'] }],
    ['khanpur', 'Khanpur', ['residential', 'commercial', 'office'], 23.035, 72.580, { priority: 3, nearbyAreas: ['lal-darwaja', 'shahpur'], landmarks: ['Sabarmati Riverfront (east)'] }],
  ]),

  // ---------- EAST AHMEDABAD ----------
  ...build('East Ahmedabad', [
    ['maninagar', 'Maninagar', ['residential', 'commercial'], 22.998, 72.602, { priority: 1, popularFor: ['established residential', 'retail', 'transit'], nearbyAreas: ['kankaria', 'khokhra', 'ghodasar'], landmarks: ['Kankaria Lake', 'Maninagar Station'] }],
    ['kankaria', 'Kankaria', ['residential', 'commercial'], 23.005, 72.600, { priority: 2, nearbyAreas: ['maninagar', 'raipur', 'khokhra'], landmarks: ['Kankaria Lakefront'] }],
    ['khokhra', 'Khokhra', ['residential', 'commercial'], 23.000, 72.615, { priority: 3, nearbyAreas: ['maninagar', 'hatkeshwar', 'amraiwadi'] }],
    ['amraiwadi', 'Amraiwadi', ['residential', 'commercial', 'industrial'], 23.005, 72.625, { priority: 2, popularFor: ['affordable housing', 'textile/industrial belt'], nearbyAreas: ['khokhra', 'rakhial', 'ctm', 'hatkeshwar'] }],
    ['ctm', 'CTM', ['residential', 'commercial'], 23.005, 72.635, { aliases: ['Char Taj Marg', 'CTM Cross Road'], priority: 3, nearbyAreas: ['amraiwadi', 'vastral', 'ramol'] }],
    ['hatkeshwar', 'Hatkeshwar', ['residential', 'commercial'], 23.010, 72.620, { priority: 3, nearbyAreas: ['amraiwadi', 'khokhra', 'rakhial'] }],
    ['ramol', 'Ramol', ['residential'], 22.985, 72.640, { priority: 3, nearbyAreas: ['ctm', 'vastral', 'hathijan'] }],
    ['vastral', 'Vastral', ['residential', 'commercial'], 23.010, 72.650, { priority: 2, popularFor: ['affordable apartments', 'metro connectivity'], nearbyAreas: ['ctm', 'nikol', 'ramol'], connectivity: ['Ahmedabad Metro (East)'] }],
    ['nikol', 'Nikol', ['residential', 'commercial'], 23.045, 72.650, { priority: 2, popularFor: ['mid housing', 'value'], nearbyAreas: ['naroda', 'vastral', 'nava-naroda'] }],
    ['naroda', 'Naroda', ['residential', 'commercial', 'industrial'], 23.070, 72.655, { priority: 2, popularFor: ['residential + Naroda GIDC proximity'], nearbyAreas: ['nava-naroda', 'nikol', 'saijpur-bogha', 'naroda-gidc'] }],
    ['nava-naroda', 'Nava Naroda', ['residential'], 23.060, 72.665, { priority: 3, nearbyAreas: ['naroda', 'nikol'] }],
    ['odhav', 'Odhav', ['residential', 'industrial'], 23.030, 72.660, { priority: 3, popularFor: ['industrial + worker housing'], nearbyAreas: ['odhav-gidc', 'vastral', 'kathwada'] }],
    ['viratnagar', 'Viratnagar', ['residential'], 22.990, 72.650, { priority: 3, nearbyAreas: ['ramol', 'vastral', 'vatva'] }],
    ['bapunagar', 'Bapunagar', ['residential', 'commercial'], 23.040, 72.625, { priority: 3, nearbyAreas: ['india-colony', 'rakhial', 'saraspur'] }],
    ['india-colony', 'India Colony', ['residential', 'commercial'], 23.045, 72.630, { priority: 3, nearbyAreas: ['bapunagar', 'nikol'] }],
    ['rakhial', 'Rakhial', ['residential', 'industrial', 'commercial'], 23.030, 72.615, { priority: 3, popularFor: ['textile mills belt', 'industrial'], nearbyAreas: ['amraiwadi', 'saraspur', 'bapunagar'] }],
    ['saraspur', 'Saraspur', ['residential', 'commercial'], 23.040, 72.610, { priority: 3, nearbyAreas: ['rakhial', 'asarwa', 'bapunagar'] }],
    ['asarwa', 'Asarwa', ['residential', 'commercial'], 23.045, 72.605, { priority: 3, nearbyAreas: ['saraspur', 'meghaninagar'], landmarks: ['Civil Hospital Asarwa'] }],
    ['meghaninagar', 'Meghaninagar', ['residential', 'commercial'], 23.055, 72.610, { priority: 3, nearbyAreas: ['asarwa', 'saijpur-bogha'] }],
    ['saijpur-bogha', 'Saijpur Bogha', ['residential'], 23.075, 72.630, { priority: 3, nearbyAreas: ['naroda', 'meghaninagar', 'sabarmati'] }],
  ]),

  // ---------- SOUTH AHMEDABAD ----------
  ...build('South Ahmedabad', [
    ['narol', 'Narol', ['residential', 'commercial', 'industrial', 'warehousing'], 22.985, 72.595, { priority: 2, popularFor: ['textile & industrial belt', 'affordable housing', 'warehousing'], nearbyAreas: ['vatva', 'lambha', 'shah-alam', 'aslali'], connectivity: ['Narol Circle', 'NH 48', 'SP Ring Road'] }],
    ['vatva', 'Vatva', ['residential', 'industrial', 'warehousing'], 22.965, 72.625, { priority: 2, popularFor: ['Vatva GIDC proximity', 'worker housing', 'warehousing'], nearbyAreas: ['vatva-gidc', 'isanpur', 'jashoda-nagar', 'narol'] }],
    ['isanpur', 'Isanpur', ['residential', 'commercial'], 22.975, 72.610, { priority: 3, nearbyAreas: ['ghodasar', 'jashoda-nagar', 'vatva'] }],
    ['ghodasar', 'Ghodasar', ['residential', 'commercial'], 22.985, 72.610, { priority: 3, nearbyAreas: ['isanpur', 'maninagar', 'jashoda-nagar'] }],
    ['jashoda-nagar', 'Jashoda Nagar', ['residential', 'commercial'], 22.975, 72.625, { priority: 3, nearbyAreas: ['isanpur', 'vatva', 'vastral'] }],
    ['lambha', 'Lambha', ['residential', 'industrial'], 22.945, 72.615, { priority: 3, nearbyAreas: ['narol', 'vatva', 'gyaspur'] }],
    ['dani-limda', 'Dani Limda', ['residential', 'commercial'], 22.995, 72.595, { priority: 3, nearbyAreas: ['behrampura', 'shah-alam', 'narol'] }],
    ['behrampura', 'Behrampura', ['residential', 'commercial'], 23.000, 72.590, { priority: 3, nearbyAreas: ['jamalpur', 'dani-limda', 'shah-alam'] }],
    ['shah-alam', 'Shah Alam', ['residential', 'commercial'], 22.995, 72.600, { priority: 3, nearbyAreas: ['dani-limda', 'behrampura', 'narol'], landmarks: ['Shah Alam Roza'] }],
    ['sarkhej', 'Sarkhej', ['residential', 'commercial', 'industrial'], 22.985, 72.500, { priority: 2, popularFor: ['mixed residential & commercial', 'highway frontage', 'industrial nearby'], nearbyAreas: ['juhapura', 'makarba', 'sanathal', 'sarkhej-bavla-belt'], connectivity: ['Sarkhej Circle', 'SG Highway', 'Sarkhej-Bavla Highway'], landmarks: ['Sarkhej Roza'] }],
    ['vejalpur', 'Vejalpur', ['residential', 'commercial'], 23.005, 72.520, { priority: 2, popularFor: ['mid housing', 'value apartments'], nearbyAreas: ['juhapura', 'jivraj-park', 'makarba'] }],
    ['fatehwadi', 'Fatehwadi', ['residential'], 22.995, 72.530, { priority: 3, nearbyAreas: ['juhapura', 'sarkhej', 'vejalpur'] }],
    ['juhapura', 'Juhapura', ['residential', 'commercial'], 23.000, 72.535, { priority: 2, popularFor: ['dense residential', 'affordable housing'], nearbyAreas: ['vejalpur', 'fatehwadi', 'sarkhej', 'maktampura'] }],
    ['maktampura', 'Maktampura', ['residential'], 23.000, 72.545, { priority: 3, nearbyAreas: ['juhapura', 'vejalpur'] }],
    ['gyaspur', 'Gyaspur', ['residential', 'industrial'], 22.960, 72.580, { priority: 3, nearbyAreas: ['lambha', 'vatva', 'narol'] }],
  ]),

  // ---------- AHMEDABAD OUTSKIRTS / GROWTH CORRIDORS ----------
  ...build('Ahmedabad Outskirts', [
    ['sp-ring-road', 'SP Ring Road Belt', ['residential', 'commercial', 'plots', 'investment'], 22.985, 72.470, { aliases: ['Sardar Patel Ring Road'], priority: 1, popularFor: ['plotting schemes', 'new townships', 'investment corridor'], nearbyAreas: ['shela', 'sanathal', 'tragad', 'vaishnodevi-circle'], connectivity: ['SP Ring Road (78 km loop)'], description: 'The Sardar Patel (SP) Ring Road loop, the main growth & plotting corridor circling Ahmedabad. // representative point, the belt spans the whole ring' }],
    ['sanand', 'Sanand', ['residential', 'commercial', 'industrial', 'plots', 'investment'], 22.992, 72.380, { priority: 1, popularFor: ['auto/manufacturing hub', 'plots', 'township investment'], nearbyAreas: ['sanand-gidc', 'sanathal', 'bol', 'changodar'], connectivity: ['Sanand-Sarkhej Road', 'Ahmedabad-Rajkot NH 47'] }],
    ['sanathal', 'Sanathal', ['residential', 'industrial', 'warehousing', 'plots'], 22.985, 72.470, { priority: 2, popularFor: ['logistics & warehousing', 'plots'], nearbyAreas: ['sarkhej', 'changodar', 'sanand', 'sarkhej-bavla-belt'], connectivity: ['Sarkhej-Bavla Highway', 'SP Ring Road'] }],
    ['ujala-circle', 'Ujala Circle', ['residential', 'commercial', 'plots'], 22.990, 72.490, { priority: 3, nearbyAreas: ['sarkhej', 'sanathal', 'juhapura'] }],
    ['dholka', 'Dholka', ['residential', 'industrial', 'plots'], 22.728, 72.470, { priority: 3, popularFor: ['town + industrial', 'plots', 'investment'], nearbyAreas: ['bavla', 'bagodara', 'jetalpur'], connectivity: ['Dholka Road', 'Ahmedabad-Bhavnagar Highway'] }],
    ['bareja', 'Bareja', ['residential', 'industrial', 'plots'], 22.900, 72.640, { priority: 3, nearbyAreas: ['aslali', 'jetalpur', 'kheda-road'] }],
    ['jetalpur', 'Jetalpur', ['residential', 'plots', 'industrial'], 22.910, 72.605, { priority: 3, nearbyAreas: ['bareja', 'aslali', 'kamod'] }],
    ['bakrol', 'Bakrol', ['residential', 'plots'], 22.945, 72.640, { aliases: ['Bakrol-Bujrang'], priority: 3, nearbyAreas: ['aslali', 'kamod', 'hathijan'] }],
    ['kamod', 'Kamod', ['residential', 'plots'], 22.945, 72.595, { priority: 3, nearbyAreas: ['jetalpur', 'bakrol', 'gyaspur'] }],
    ['hathijan', 'Hathijan', ['residential', 'industrial', 'plots'], 22.965, 72.660, { priority: 3, nearbyAreas: ['vatva', 'bakrol', 'ramol'] }],
    ['kuha', 'Kuha', ['residential', 'plots', 'industrial'], 23.005, 72.720, { priority: 4, nearbyAreas: ['kathwada', 'dehgam'] }],
    ['mahemdabad', 'Mahemdabad', ['residential', 'plots', 'investment'], 22.832, 72.755, { aliases: ['Mahemdabad Road', 'Mahemadabad'], priority: 3, district: 'Kheda', region: 'Outer / Kheda Road', nearbyAreas: ['bareja', 'kheda'] }],
    ['dholera-sir', 'Dholera SIR', ['investment', 'industrial', 'plots'], 22.250, 72.180, { priority: 2, district: 'Ahmedabad (Dholera)', region: 'Dholera SIR (Investment)', microMarket: 'Dholera Special Investment Region', popularFor: ['greenfield smart city', 'land/plot investment', 'industrial'], nearbyAreas: ['dholka', 'bagodara'], description: 'Dholera Special Investment Region, a greenfield smart city & industrial investment zone south of Ahmedabad. Kept separate from Ahmedabad city. // approximate centroid' }],
  ]),

  // ---------- INDUSTRIAL, WAREHOUSING, LOGISTICS & PLOT BELTS ----------
  ...build('Industrial & Warehousing', [
    ['vatva-gidc', 'Vatva GIDC', ['industrial', 'warehousing', 'logistics'], 22.910, 72.630, { priority: 1, popularFor: ['chemicals & engineering', 'sheds', 'warehousing'], nearbyAreas: ['vatva', 'narol', 'naroda-gidc'], connectivity: ['SP Ring Road', 'Vatva-Narol Road'], landmarks: ['GIDC Vatva Estate'] }],
    ['naroda-gidc', 'Naroda GIDC', ['industrial', 'warehousing'], 23.075, 72.640, { priority: 1, popularFor: ['manufacturing', 'sheds', 'warehousing'], nearbyAreas: ['naroda', 'odhav-gidc', 'kathwada'], landmarks: ['GIDC Naroda Estate'] }],
    ['odhav-gidc', 'Odhav GIDC', ['industrial', 'warehousing'], 23.025, 72.665, { priority: 2, popularFor: ['engineering units', 'sheds'], nearbyAreas: ['odhav', 'naroda-gidc', 'kathwada'] }],
    ['kathwada', 'Kathwada (GIDC)', ['industrial', 'warehousing', 'residential'], 23.045, 72.695, { priority: 2, popularFor: ['industrial estate', 'warehousing'], nearbyAreas: ['naroda-gidc', 'odhav', 'kuha'], landmarks: ['GIDC Kathwada'] }],
    ['sanand-gidc', 'Sanand GIDC', ['industrial', 'warehousing', 'logistics', 'investment'], 22.935, 72.405, { aliases: ['Sanand GIDC I & II'], priority: 1, popularFor: ['auto & manufacturing', 'large sheds', 'warehousing', 'industrial plots'], nearbyAreas: ['sanand', 'sanathal', 'bol', 'changodar'], connectivity: ['NH 47 (Ahmedabad-Rajkot)', 'Sanand-Viramgam Road'], landmarks: ['Tata Nano plant area', 'GIDC Sanand'] }],
    ['changodar', 'Changodar', ['industrial', 'warehousing', 'logistics', 'plots'], 22.911, 72.4486, { priority: 1, popularFor: ['warehousing & logistics park', 'industrial sheds', 'plots'], nearbyAreas: ['moraiya', 'sanathal', 'bavla', 'sanand-gidc'], connectivity: ['Sarkhej Bavla Highway (NH 47)', 'SP Ring Road'] }],
    ['moraiya', 'Moraiya', ['industrial', 'warehousing', 'logistics', 'plots'], 22.920, 72.430, { priority: 2, popularFor: ['warehouses', 'industrial sheds'], nearbyAreas: ['changodar', 'sanathal', 'bavla'], connectivity: ['Sarkhej-Bavla Highway'] }],
    ['bavla', 'Bavla', ['industrial', 'warehousing', 'logistics', 'plots'], 22.835, 72.370, { priority: 2, popularFor: ['warehousing', 'food/agri industrial', 'plots'], nearbyAreas: ['changodar', 'bagodara', 'dholka'], connectivity: ['NH 47', 'Bavla-Bagodara Highway'] }],
    ['aslali', 'Aslali', ['warehousing', 'logistics', 'industrial', 'plots'], 22.930, 72.640, { priority: 2, popularFor: ['highway warehousing & logistics'], nearbyAreas: ['narol', 'bareja', 'hathijan'], connectivity: ['NH 48 (Ahmedabad-Vadodara)', 'SP Ring Road'] }],
    ['sarkhej-bavla-belt', 'Sarkhej Bavla Highway Belt', ['industrial', 'warehousing', 'logistics', 'plots'], 22.900, 72.430, { aliases: ['NH 47 Belt'], priority: 2, popularFor: ['logistics corridor', 'warehouses', 'industrial plots'], nearbyAreas: ['sarkhej', 'sanathal', 'changodar', 'moraiya', 'bavla'], connectivity: ['Sarkhej Bavla Highway (NH 47)'], description: 'The NH 47 Sarkhej Bavla corridor, Ahmedabad’s main warehousing & logistics belt. // representative point along the corridor' }],
    ['amraiwadi-industrial', 'Amraiwadi Industrial Belt', ['industrial', 'warehousing'], 23.005, 72.628, { priority: 3, popularFor: ['textile & small industry'], nearbyAreas: ['amraiwadi', 'rakhial', 'odhav-gidc'] }],
    ['bagodara', 'Bagodara', ['industrial', 'logistics', 'plots', 'investment'], 22.700, 72.160, { priority: 3, district: 'Ahmedabad (Bagodara)', popularFor: ['highway junction logistics', 'industrial plots'], nearbyAreas: ['bavla', 'dholka'], connectivity: ['NH 47 / NH 751 junction'] }],
    ['kadi', 'Kadi', ['industrial', 'warehousing'], 23.300, 72.330, { priority: 4, city: 'Kadi', district: 'Mehsana', region: 'Mehsana Industrial', popularFor: ['textile & engineering industry'], nearbyAreas: ['chhatral', 'kalol'], description: 'Kadi is an industrial town north of Ahmedabad (Mehsana district). // approximate centroid' }],
    ['chhatral', 'Chhatral GIDC', ['industrial', 'warehousing'], 23.350, 72.450, { priority: 3, city: 'Chhatral', district: 'Gandhinagar', region: 'Gandhinagar Industrial', popularFor: ['pharma & engineering GIDC'], nearbyAreas: ['kalol', 'kadi'], connectivity: ['NH 147', 'Ahmedabad-Mehsana Highway'] }],
    ['kalol', 'Kalol', ['industrial', 'residential', 'plots'], 23.245, 72.495, { priority: 3, city: 'Kalol', district: 'Gandhinagar', region: 'Gandhinagar Industrial', popularFor: ['industrial town', 'plots'], nearbyAreas: ['chhatral', 'adalaj', 'mansa'] }],
  ]),

  // ---------- GIFT CITY & GANDHINAGAR CLUSTER ----------
  ...build('GIFT City & Gandhinagar', [
    ['gift-city', 'GIFT City', ['commercial', 'office', 'residential', 'investment'], 23.160, 72.685, { aliases: ['Gujarat International Finance Tec-City', 'GIFT'], priority: 1, microMarket: 'GIFT City / Gandhinagar', popularFor: ['finance & IT offices', 'IFSC', 'premium apartments', 'corporate professionals', 'future growth investment'], nearbyAreas: ['gandhinagar', 'koba', 'kudasan', 'por', 'infocity'], connectivity: ['SG Highway', 'GIFT Gandhinagar Road', 'Ahmedabad Metro (planned)'], landmarks: ['GIFT One/Two Towers', 'IFSC'], description: 'GIFT City is India’s IFSC and a planned smart finance-tech city; a key office, premium-residential and investment micro-market.' }],
    ['gandhinagar', 'Gandhinagar', ['residential', 'commercial', 'office'], 23.220, 72.650, { priority: 1, popularFor: ['planned sectors', 'government & corporate', 'family housing'], nearbyAreas: ['kudasan', 'sargasan', 'sector-21', 'infocity'], connectivity: ['Gandhinagar-Ahmedabad Highway', 'SG Highway'], description: 'Gandhinagar is the planned state capital (Sectors 1 to 30); calm, green, sector-based residential plus government/corporate offices.' }],
    ['kudasan', 'Kudasan', ['residential', 'commercial', 'office', 'investment'], 23.190, 72.635, { priority: 1, popularFor: ['premium apartments', 'GIFT/Infocity proximity', 'investment'], nearbyAreas: ['sargasan', 'sargaasan', 'infocity', 'gift-city', 'raysan'], connectivity: ['GH-5', 'SG Highway'] }],
    ['sargasan', 'Sargasan', ['residential', 'commercial', 'investment'], 23.205, 72.640, { priority: 2, popularFor: ['new apartments', 'investment'], nearbyAreas: ['kudasan', 'vavol', 'gandhinagar'] }],
    ['raysan', 'Raysan', ['residential', 'investment', 'plots'], 23.175, 72.650, { priority: 2, popularFor: ['premium residential', 'PDEU proximity', 'plots'], nearbyAreas: ['kudasan', 'randesan', 'pdpu-road'] }],
    ['randesan', 'Randesan', ['residential', 'commercial', 'investment'], 23.195, 72.655, { priority: 2, popularFor: ['new residential', 'offices', 'investment'], nearbyAreas: ['raysan', 'kudasan', 'sargasan'] }],
    ['koba', 'Koba', ['residential', 'commercial', 'industrial'], 23.155, 72.625, { priority: 2, popularFor: ['highway frontage', 'institutes', 'GIFT proximity'], nearbyAreas: ['gift-city', 'por', 'adalaj'], connectivity: ['Koba Circle', 'SG Highway', 'Gandhinagar-Mahudi Road'] }],
    ['bhaijipura', 'Bhaijipura', ['residential', 'plots'], 23.200, 72.660, { priority: 4, description: 'Bhaijipura is a village/plotting pocket near Gandhinagar. // approximate centroid', nearbyAreas: ['randesan', 'pethapur'] }],
    ['pdpu-road', 'PDEU / PDPU Road', ['residential', 'commercial', 'office'], 23.155, 72.665, { aliases: ['PDPU Road', 'PDEU Road'], priority: 2, popularFor: ['student & professional housing', 'offices'], nearbyAreas: ['raysan', 'gift-city', 'randesan'], landmarks: ['Pandit Deendayal Energy University'] }],
    ['infocity', 'Infocity', ['office', 'commercial', 'residential'], 23.190, 72.630, { priority: 1, popularFor: ['IT/ITES offices', 'corporate', 'rental for professionals'], nearbyAreas: ['kudasan', 'gandhinagar', 'gift-city'], landmarks: ['Infocity Gandhinagar'] }],
    ['vavol', 'Vavol', ['residential', 'plots'], 23.205, 72.620, { priority: 3, nearbyAreas: ['sargasan', 'gandhinagar', 'urjanagar'] }],
    ['urjanagar', 'Urjanagar', ['residential'], 23.235, 72.610, { priority: 4, nearbyAreas: ['vavol', 'gandhinagar', 'pethapur'] }],
    ['pethapur', 'Pethapur', ['residential', 'industrial', 'plots'], 23.250, 72.665, { priority: 3, nearbyAreas: ['gandhinagar', 'pethapur-gidc', 'randheja'] }],
    ['adalaj', 'Adalaj', ['residential', 'commercial', 'plots', 'investment'], 23.165, 72.580, { priority: 2, popularFor: ['highway townships', 'plots', 'investment'], nearbyAreas: ['zundal', 'khoraj', 'koba', 'gift-city'], connectivity: ['SG Highway', 'Ahmedabad-Gandhinagar Highway'], landmarks: ['Adalaj Stepwell'] }],
    ['khoraj', 'Khoraj', ['residential', 'plots', 'commercial'], 23.145, 72.560, { priority: 3, popularFor: ['plots', 'new schemes'], nearbyAreas: ['zundal', 'adalaj', 'vaishnodevi-circle'] }],
    ['chiloda', 'Chiloda', ['residential', 'industrial', 'plots'], 23.225, 72.730, { aliases: ['Chiloda Naroda Road'], priority: 3, nearbyAreas: ['dehgam', 'gandhinagar', 'kuha'], connectivity: ['Chiloda Circle', 'NH 147'] }],
    ['por', 'Por', ['residential', 'industrial', 'plots'], 23.130, 72.640, { priority: 3, popularFor: ['GIFT-side growth', 'plots'], nearbyAreas: ['gift-city', 'koba', 'randesan'] }],
    ['randheja', 'Randheja', ['residential', 'plots'], 23.255, 72.700, { priority: 4, nearbyAreas: ['pethapur', 'mansa', 'dehgam'] }],
    ['mansa', 'Mansa', ['residential', 'industrial', 'plots'], 23.430, 72.660, { priority: 4, city: 'Mansa', district: 'Gandhinagar', region: 'Outer Gandhinagar', popularFor: ['town + industrial', 'plots'], nearbyAreas: ['randheja', 'kalol'] }],
    ['dehgam', 'Dehgam', ['residential', 'industrial', 'plots'], 23.170, 72.820, { aliases: ['Dahegam'], priority: 3, city: 'Dehgam', district: 'Gandhinagar', region: 'Outer Gandhinagar', popularFor: ['town', 'plots', 'industrial'], nearbyAreas: ['chiloda', 'kuha', 'randheja'] }],
  ]),

  // ---------- LISTING-DERIVED AREAS (added because we have live listings here) ----------
  ...build('West Ahmedabad', [
    ['shyamal', 'Shyamal', ['residential', 'commercial', 'office'], 23.014918, 72.529241, { priority: 2, popularFor: ['offices', 'apartments', 'retail'], nearbyAreas: ['satellite', 'anandnagar', 'prahlad-nagar', 'jodhpur'] }],
    ['surdhara', 'Surdhara', ['residential', 'commercial'], 23.055979, 72.501672, { aliases: ['Surdhara Circle'], priority: 2, popularFor: ['apartments', 'offices'], nearbyAreas: ['thaltej', 'sola', 'bodakdev'] }],
    ['anandnagar', 'Anand Nagar', ['residential', 'commercial'], 22.988388, 72.513750, { priority: 2, popularFor: ['apartments', 'retail'], nearbyAreas: ['prahlad-nagar', 'satellite', 'vejalpur', 'shyamal'] }],
    ['guma', 'Guma', ['residential', 'plots'], 23.042485, 72.439864, { priority: 3, popularFor: ['bungalows', 'plots'], nearbyAreas: ['shilaj', 'bopal', 'rancharda'] }],
    ['gulbai-tekra', 'Gulbai Tekra', ['residential', 'commercial'], 23.02632, 72.55197, { priority: 2, popularFor: ['apartments', 'established central-west locality'], nearbyAreas: ['ambawadi', 'navrangpura', 'law-garden', 'shyamal'] }],
    ['manekbag', 'Manekbag', ['residential'], 23.01919, 72.53997, { priority: 2, popularFor: ['bungalows', 'premium residential'], nearbyAreas: ['shyamal', 'ambawadi', 'satellite'] }],
    ['gokuldham', 'Gokuldham', ['residential', 'plots'], 22.98422, 72.45959, { priority: 3, popularFor: ['bungalows', 'plots'], nearbyAreas: ['shela', 'south-bopal', 'sanathal'] }],
    ['chekhla', 'Chekhla', ['residential', 'plots'], 23.07291, 72.50992, { priority: 3, popularFor: ['plots', 'new schemes'], nearbyAreas: ['sola', 'science-city', 'ghatlodia', 'bhadaj'] }],
  ]),
  ...build('North Ahmedabad', [
    ['shahibaug', 'Shahibaug', ['residential', 'commercial'], 23.057505, 72.592453, { aliases: ['Shahibag'], priority: 2, popularFor: ['premium residential', 'established neighbourhood'], nearbyAreas: ['naranpura', 'sabarmati', 'dudheshwar'] }],
    ['charodi', 'Charodi', ['residential', 'commercial', 'plots'], 23.124715, 72.538710, { priority: 3, popularFor: ['new offices', 'plots', 'growth corridor'], nearbyAreas: ['vaishnodevi-circle', 'zundal', 'thaltej', 'shilaj'] }],
    ['shantigram', 'Shantigram', ['residential', 'commercial', 'investment'], 23.16507, 72.53830, { priority: 2, popularFor: ['township living', 'premium apartments', 'lake-facing homes'], nearbyAreas: ['adalaj', 'vaishnodevi-circle', 'zundal'] }],
  ]),
  ...build('Ahmedabad Outskirts', [
    ['jaspur', 'Jaspur', ['residential', 'plots', 'investment'], 23.15156, 72.52500, { priority: 3, popularFor: ['plots', 'new schemes'], nearbyAreas: ['shantigram', 'lapkaman', 'chekhla'] }],
    ['lapkaman', 'Lapkaman', ['residential', 'plots', 'investment'], 23.12964, 72.48799, { priority: 3, popularFor: ['plots', 'weekend homes'], nearbyAreas: ['jaspur', 'chekhla', 'thol-road'] }],
    ['rancharda', 'Rancharda', ['residential', 'plots'], 23.069940, 72.441026, { priority: 3, popularFor: ['farmhouses', 'bungalows', 'plots'], nearbyAreas: ['shilaj', 'thol-road', 'guma', 'godhavi'] }],
    ['thol-road', 'Thol Road', ['residential', 'plots', 'investment'], 23.092925, 72.427930, { aliases: ['Thol'], priority: 3, popularFor: ['farmhouses', 'weekend homes', 'plots'], nearbyAreas: ['rancharda', 'agol', 'godhavi'], landmarks: ['Thol Lake'] }],
    ['agol', 'Agol', ['residential', 'plots', 'investment'], 23.139044, 72.250928, { priority: 3, popularFor: ['farmhouses', 'agricultural land', 'plots'], nearbyAreas: ['thol-road', 'kadi'], description: 'Agol is a village pocket northwest of Ahmedabad (towards Kadi), known for farmhouses and land. // approximate centroid' }],
  ]),

  // ---------- WAREHOUSE / LOGISTICS BELT VILLAGES (added for warehouse listings) ----------
  ...build('Industrial & Warehousing', [
    ['vadala', 'Vadala', ['warehousing', 'logistics', 'industrial'], 22.805420, 72.621400, { priority: 3, popularFor: ['warehousing & logistics', 'PEB sheds'], nearbyAreas: ['vavdi', 'kheda', 'kanera', 'pinglaj'], connectivity: ['Ahmedabad-Kheda Highway'] }],
    ['vavdi', 'Vavdi', ['warehousing', 'logistics', 'industrial'], 22.738240, 72.653450, { priority: 3, popularFor: ['large warehouses', 'logistics parks'], nearbyAreas: ['kheda', 'vadala', 'hariyala'], connectivity: ['Kheda-Rajkot Highway'] }],
    ['bhayla', 'Bhayla', ['warehousing', 'logistics', 'industrial'], 22.763800, 72.319200, { priority: 3, popularFor: ['warehousing & logistics', 'large sheds'], nearbyAreas: ['bavla', 'rajoda', 'changodar'], connectivity: ['Ahmedabad-Rajkot Highway (NH 47)'] }],
    ['hariyala', 'Hariyala', ['warehousing', 'logistics', 'industrial'], 22.765860, 72.652220, { priority: 3, popularFor: ['large warehouses', 'distribution centres'], nearbyAreas: ['vavdi', 'kheda', 'vadala'], connectivity: ['NH 8', 'Kheda Highway'] }],
    ['rajoda', 'Rajoda', ['warehousing', 'logistics', 'industrial'], 22.869680, 72.407030, { priority: 3, popularFor: ['warehousing & logistics'], nearbyAreas: ['bhayla', 'bavla', 'changodar'], connectivity: ['Ahmedabad-Rajkot Highway (NH 47)'] }],
    ['indrad', 'Indrad', ['warehousing', 'logistics', 'industrial'], 23.283480, 72.403440, { priority: 3, city: 'Gandhinagar', district: 'Gandhinagar', region: 'Gandhinagar Industrial', popularFor: ['warehousing', 'industrial sheds'], nearbyAreas: ['chhatral', 'kadi'], connectivity: ['Kadi-Chhatral Road'] }],
    ['miroli', 'Miroli', ['warehousing', 'logistics', 'industrial'], 22.876550, 72.531040, { priority: 3, popularFor: ['warehousing & logistics'], nearbyAreas: ['pirana', 'kamod', 'moraiya'], connectivity: ['Ahmedabad-Dholka Road'] }],
    ['pinglaj', 'Pinglaj', ['warehousing', 'logistics', 'industrial'], 22.822490, 72.611990, { priority: 3, popularFor: ['warehousing & logistics'], nearbyAreas: ['kanera', 'vadala', 'kheda'], connectivity: ['Ahmedabad-Kheda Highway'] }],
    ['kanera', 'Kanera', ['warehousing', 'logistics', 'industrial'], 22.811290, 72.619360, { priority: 3, popularFor: ['warehousing & logistics'], nearbyAreas: ['pinglaj', 'vadala', 'kheda'], connectivity: ['Ahmedabad-Kheda Highway'] }],
    ['pirana', 'Pirana', ['warehousing', 'logistics', 'industrial'], 22.965000, 72.605000, { priority: 3, popularFor: ['warehousing', 'godowns'], nearbyAreas: ['kamod', 'miroli', 'aslali'], connectivity: ['Ahmedabad-Dholka Road'] }],
    ['vasai', 'Vasai', ['warehousing', 'logistics', 'industrial'], 22.780000, 72.620000, { priority: 4, popularFor: ['warehousing', 'godowns'], nearbyAreas: ['kanera', 'kheda', 'pinglaj'], description: 'Vasai is a warehousing village in the Ahmedabad-Kheda belt. // approximate centroid' }],
    ['kheda', 'Kheda', ['warehousing', 'logistics', 'industrial', 'plots'], 22.701700, 72.568830, { priority: 3, city: 'Kheda', district: 'Kheda', region: 'Kheda Industrial', popularFor: ['warehousing & logistics', 'large distribution centres'], nearbyAreas: ['vavdi', 'vadala', 'hariyala', 'kanera'], connectivity: ['Kheda-Rajkot Highway', 'NH 48'] }],
  ]),
];

// ── HELPER FUNCTIONS ──────────────────────────────────────────────────
const byId = new Map(localities.map((l) => [l.id, l]));

export function getAllLocalities(): Locality[] {
  return localities;
}

/**
 * Text-match tokens for a locality (name + aliases), normalised to alphanumerics
 * and kept to 4+ chars. Used so a locality search/filter matches a property even
 * when it is tagged with its administrative area but its address names the
 * road/sub-locality (e.g. "Sindhu Bhavan Road" inside a Bodakdev-tagged listing).
 */
export function localityMatchTokens(loc: Locality): string[] {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  return Array.from(
    new Set([loc.name, ...loc.aliases].map(norm).filter((t) => t.length >= 4)),
  );
}

/** True if a property's text (title/locality/address) belongs to a locality. */
export function propertyTextMatchesLocality(text: string, loc: Locality): boolean {
  const hay = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  return localityMatchTokens(loc).some((t) => hay.includes(t));
}
export function getLocalityById(id: string): Locality | undefined {
  return byId.get(id);
}
export function getLocalitiesByCity(city: string): Locality[] {
  const c = city.toLowerCase();
  return localities.filter((l) => l.city.toLowerCase() === c);
}
export function getLocalitiesByRegion(region: string): Locality[] {
  const r = region.toLowerCase();
  return localities.filter((l) => l.region.toLowerCase() === r);
}
export function getLocalitiesByGroup(group: LocalityGroup): Locality[] {
  return localities.filter((l) => l.group === group);
}
export function getLocalitiesByType(type: LocalityType): Locality[] {
  return localities.filter((l) => l.type.includes(type));
}
export function getLocalitiesForBuy(): Locality[] {
  return localities.filter((l) => l.propertyRelevance.buy);
}
export function getLocalitiesForRent(): Locality[] {
  return localities.filter((l) => l.propertyRelevance.rent || l.propertyRelevance.lease);
}
export function getIndustrialLocalities(): Locality[] {
  return localities.filter((l) => l.propertyRelevance.industrial);
}
export function getWarehouseLocalities(): Locality[] {
  return localities.filter((l) => l.propertyRelevance.warehousing);
}
export function getPlotLocalities(): Locality[] {
  return localities.filter((l) => l.propertyRelevance.plots);
}
export function getGiftGandhinagarLocalities(): Locality[] {
  return getLocalitiesByGroup('GIFT City & Gandhinagar');
}
export function getNearbyLocalities(localityId: string): Locality[] {
  const l = byId.get(localityId);
  if (!l) return [];
  return l.nearbyAreas.map((id) => byId.get(id)).filter((x): x is Locality => Boolean(x));
}

/** Free-text search across name, aliases, region, microMarket, type, group and keywords. */
export function searchLocalities(query: string, limit = 30): Locality[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...localities].sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)).slice(0, limit);
  const score = (l: Locality): number => {
    const name = l.name.toLowerCase();
    if (name === q) return 0;
    if (name.startsWith(q)) return 1;
    const hay = [
      name, ...l.aliases.map((a) => a.toLowerCase()), l.region.toLowerCase(), l.microMarket.toLowerCase(),
      l.group.toLowerCase(), ...l.type, ...l.popularFor.map((p) => p.toLowerCase()),
      ...l.searchKeywords.map((k) => k.toLowerCase()),
    ].join(' ');
    if (name.includes(q)) return 2;
    if (hay.includes(q)) return 3;
    return 99;
  };
  return localities
    .map((l) => ({ l, s: score(l) }))
    .filter((x) => x.s < 99)
    .sort((a, b) => a.s - b.s || a.l.priority - b.l.priority || a.l.name.localeCompare(b.l.name))
    .slice(0, limit)
    .map((x) => x.l);
}

/** UI grouping order for grouped dropdowns / SEO indexes. */
export const LOCALITY_GROUP_ORDER: LocalityGroup[] = [
  'West Ahmedabad',
  'North Ahmedabad',
  'East Ahmedabad',
  'South Ahmedabad',
  'Central Ahmedabad',
  'Ahmedabad Outskirts',
  'Industrial & Warehousing',
  'GIFT City & Gandhinagar',
];

/** Localities grouped & sorted, ready for grouped <optgroup>-style UIs. */
export function getGroupedLocalities(): { group: LocalityGroup; items: Locality[] }[] {
  return LOCALITY_GROUP_ORDER.map((group) => ({
    group,
    items: getLocalitiesByGroup(group).sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);
}
