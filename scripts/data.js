/* Serendib Travels - Sri Lanka Destinations & Seasonal Weather Data */

(function () {
  var DESTINATIONS_META = [
    {
      id: 'sigiriya',
      number: '01',
      sinhala: 'සීගිරිය',
      regionKey: 'cultural',
      coords: "07°57'25\"N · 80°45'35\"E",
      idealNights: 2,
      image: './assets/images/sigiriya-pidurangala.jpg',
      imageAlt: 'Sigiriya rock fortress seen from Pidurangala'
    },
    {
      id: 'kandy',
      number: '02',
      sinhala: 'මහනුවර',
      regionKey: 'cultural',
      coords: "07°17'37\"N · 80°38'29\"E",
      idealNights: 2,
      image: './assets/images/kandy-temple.jpg',
      imageAlt: 'Temple of the Tooth buildings beside Kandy lake'
    },
    {
      id: 'ella',
      number: '03',
      sinhala: 'ඇල්ල',
      regionKey: 'highlands',
      coords: "06°52'35\"N · 81°03'39\"E",
      idealNights: 2,
      image: './assets/images/ella-train.jpg',
      imageAlt: 'Red train crossing Nine Arch Bridge near Ella'
    },
    {
      id: 'trinco-jaffna',
      number: '04',
      sinhala: 'ත්‍රිකුණාමලය · யாழ்ப்பாணம்',
      regionKey: 'northeast',
      coords: "08°34'16\"N · 81°14'00\"E",
      idealNights: 3,
      image: './assets/images/east-coast-trinco.jpg',
      imageAlt: 'Clear shallow reef bay at Pigeon Island'
    },
    {
      id: 'galle',
      number: '05',
      sinhala: 'ගාල්ල කොටුව',
      regionKey: 'south',
      coords: "06°01'50\"N · 80°13'02\"E",
      idealNights: 2,
      image: './assets/images/galle-fort.jpg',
      imageAlt: 'Galle Fort lighthouse and outer sea walls'
    },
    {
      id: 'mirissa',
      number: '06',
      sinhala: 'මිරිස්ස · වැලිගම',
      regionKey: 'south',
      coords: "05°56'54\"N · 80°27'31\"E",
      idealNights: 2,
      image: './assets/images/mirissa-bay.jpg',
      imageAlt: 'Mirissa sandy beach curve with palms'
    },
    {
      id: 'nuwara-eliya',
      number: '07',
      sinhala: 'හැටන් / නුවරඑළිය',
      regionKey: 'highlands',
      coords: "06°56'57\"N · 80°46'58\"E",
      idealNights: 2,
      image: './assets/images/tea-highlands.jpg',
      imageAlt: 'View over Haputale hills and tea valleys from Lipton Seat'
    },
    {
      id: 'yala',
      number: '08',
      sinhala: 'යාල',
      regionKey: 'wildlife',
      coords: "06°22'20\"N · 81°31'05\"E",
      idealNights: 2,
      image: './assets/images/yala-leopard.jpg',
      imageAlt: 'Wild Sri Lankan leopard beside waterhole in Yala'
    },
    {
      id: 'kumana',
      number: '09',
      sinhala: 'කුමන',
      regionKey: 'wildlife',
      coords: "06°33'30\"N · 81°40'50\"E",
      idealNights: 1,
      image: './assets/images/kumana-birds.jpg',
      imageAlt: 'Black-necked stork wading in Kumana lagoon'
    },
    {
      id: 'udawalawe',
      number: '10',
      sinhala: 'උඩවලව',
      regionKey: 'wildlife',
      coords: "06°26'18\"N · 80°53'18\"E",
      idealNights: 1,
      image: './assets/images/udawalawe-stride.jpg',
      imageAlt: 'Elephants walking through Udawalawe grasslands'
    },
    {
      id: 'anuradhapura',
      number: '11',
      sinhala: 'අනුරාධපුරය',
      regionKey: 'cultural',
      coords: "08°21'00\"N · 80°23'47\"E",
      idealNights: 2,
      image: './assets/images/anuradhapura-stupa.jpg',
      imageAlt: 'Ruwanwelisaya white stupa in Anuradhapura'
    },
    {
      id: 'dambulla',
      number: '12',
      sinhala: 'දඹුල්ල',
      regionKey: 'cultural',
      coords: "07°51'24\"N · 80°38'57\"E",
      idealNights: 1,
      image: './assets/images/dambulla-cave.jpg',
      imageAlt: 'Buddha statues inside Dambulla cave temple'
    },
    {
      id: 'horton-plains',
      number: '13',
      sinhala: 'හෝර්ටන් තැන්න',
      regionKey: 'highlands',
      coords: "06°48'09\"N · 80°48'09\"E",
      idealNights: 1,
      image: './assets/images/horton-plains.jpg',
      imageAlt: 'Mist rolling up the escarpment at Horton Plains'
    },
    {
      id: 'bentota',
      number: '14',
      sinhala: 'බෙන්තොට / තංගල්ල',
      regionKey: 'south',
      coords: "06°25'16\"N · 79°59'45\"E",
      idealNights: 3,
      image: './assets/images/bawa-villa-coast.jpg',
      imageAlt: 'Open wooden veranda at Geoffrey Bawa Lunuganga estate near Bentota'
    },
    {
      id: 'arugam-bay',
      number: '15',
      sinhala: 'ආරුගම් බොක්ක',
      regionKey: 'northeast',
      coords: "06°50'25\"N · 81°49'50\"E",
      idealNights: 3,
      image: './assets/images/arugam-passikudah.jpg',
      imageAlt: 'Blue lagoon bay along the eastern coast'
    },
    {
      id: 'colombo',
      number: '16',
      sinhala: 'කොළඹ',
      regionKey: 'south',
      coords: "06°55'37\"N · 79°51'40\"E",
      idealNights: 1,
      image: './assets/images/colombo-city.jpg',
      imageAlt: 'Fishing boats on the beach looking toward Colombo city buildings'
    },
    {
      id: 'sri-pada',
      number: '17',
      sinhala: 'ශ්‍රී පාදය',
      regionKey: 'highlands',
      coords: "06°48'34\"N · 80°29'59\"E",
      idealNights: 1,
      image: './assets/images/sri-pada.jpg',
      imageAlt: 'Sri Pada mountain peak'
    },
    {
      id: 'riverston',
      number: '18',
      sinhala: 'රිවස්ටන්',
      regionKey: 'highlands',
      coords: "07°31'42\"N · 80°44'19\"E",
      idealNights: 2,
      image: './assets/images/riverston-ridge.jpg',
      imageAlt: 'Valley view from Riverston hills'
    },
    {
      id: 'pinnawala',
      number: '19',
      sinhala: 'පින්නවල',
      regionKey: 'wildlife',
      coords: "07°18'04\"N · 80°23'13\"E",
      idealNights: 1,
      image: './assets/images/pinnawala-elephants.jpg',
      imageAlt: 'Elephants bathing in the river at Pinnawala'
    },
    {
      id: 'peradeniya',
      number: '20',
      sinhala: 'පේරාදෙණිය උද්‍යානය',
      regionKey: 'cultural',
      coords: "07°16'16\"N · 80°35'48\"E",
      idealNights: 1,
      image: './assets/images/peradeniya-garden.jpg',
      imageAlt: 'Lawns and tall royal palms at Peradeniya botanical garden'
    }
  ];

  var MONSOON_LEVELS = {
    JAN: { south: 'optimal', highlands: 'optimal', cultural: 'optimal', northeast: 'caution' },
    FEB: { south: 'optimal', highlands: 'optimal', cultural: 'optimal', northeast: 'good' },
    MAR: { south: 'optimal', highlands: 'optimal', cultural: 'good', northeast: 'optimal' },
    APR: { south: 'good', highlands: 'good', cultural: 'good', northeast: 'optimal' },
    MAY: { south: 'caution', highlands: 'caution', cultural: 'optimal', northeast: 'optimal' },
    JUN: { south: 'caution', highlands: 'good', cultural: 'optimal', northeast: 'optimal' },
    JUL: { south: 'good', highlands: 'optimal', cultural: 'optimal', northeast: 'optimal' },
    AUG: { south: 'good', highlands: 'optimal', cultural: 'optimal', northeast: 'optimal' },
    SEP: { south: 'good', highlands: 'optimal', cultural: 'optimal', northeast: 'optimal' },
    OCT: { south: 'caution', highlands: 'caution', cultural: 'good', northeast: 'caution' },
    NOV: { south: 'optimal', highlands: 'good', cultural: 'good', northeast: 'caution' },
    DEC: { south: 'optimal', highlands: 'optimal', cultural: 'good', northeast: 'caution' }
  };

  var MONTH_CODES = Object.keys(MONSOON_LEVELS);

  var ITINERARY_PRESETS = {
    'classic-arc': ['sigiriya', 'kandy', 'nuwara-eliya', 'ella', 'galle'],
    'wild-south': ['colombo', 'nuwara-eliya', 'yala', 'mirissa', 'bentota'],
    'east-north-sun': ['anuradhapura', 'trinco-jaffna', 'arugam-bay', 'sigiriya']
  };

  var START_HUBS = [
    { id: 'cmbAirport', coords: [7.1808, 79.8841], rail: false, highland: false },
    { id: 'colombo', coords: [6.9271, 79.8612], rail: true, highland: false },
    { id: 'negombo', coords: [7.2008, 79.8737], rail: false, highland: false },
    { id: 'kandy', coords: [7.2906, 80.6337], rail: true, highland: true },
    { id: 'galle', coords: [6.0329, 80.2170], rail: true, highland: false }
  ];

  var DEST_GEO = {
    sigiriya: { coords: [7.9570, 80.7603], rail: false, highland: false },
    kandy: { coords: [7.2906, 80.6337], rail: true, highland: true },
    ella: { coords: [6.8667, 81.0466], rail: true, highland: true },
    'trinco-jaffna': { coords: [8.5711, 81.2335], rail: true, highland: false },
    galle: { coords: [6.0329, 80.2170], rail: true, highland: false },
    mirissa: { coords: [5.9483, 80.4716], rail: true, highland: false },
    'nuwara-eliya': { coords: [6.9497, 80.7891], rail: true, highland: true },
    yala: { coords: [6.3722, 81.5181], rail: false, highland: false },
    kumana: { coords: [6.5583, 81.6806], rail: false, highland: false },
    udawalawe: { coords: [6.4383, 80.8883], rail: false, highland: false },
    anuradhapura: { coords: [8.3114, 80.4037], rail: true, highland: false },
    dambulla: { coords: [7.8606, 80.6517], rail: false, highland: false },
    'horton-plains': { coords: [6.8025, 80.8025], rail: true, highland: true },
    bentota: { coords: [6.4211, 79.9958], rail: true, highland: false },
    'arugam-bay': { coords: [6.8403, 81.8306], rail: false, highland: false },
    colombo: { coords: [6.9271, 79.8612], rail: true, highland: false },
    'sri-pada': { coords: [6.8096, 80.4994], rail: true, highland: true },
    riverston: { coords: [7.5283, 80.7386], rail: false, highland: true },
    pinnawala: { coords: [7.3011, 80.3869], rail: true, highland: false },
    peradeniya: { coords: [7.2712, 80.5966], rail: true, highland: true }
  };

  var DINING_GUIDE = {
    sigiriya: [
      { style: 'local', spot: 'Kamatha Village Rice & Curry · Habarana', detail: 'Heirloom clay-pot feast cooked over open wood fires' },
      { style: 'cafe', spot: 'Priyamali Gedara Treehouse Lunch', detail: 'Lakeside lotus-root curries & fresh tropical fruits' }
    ],
    kandy: [
      { style: 'local', spot: 'Hela Bojun Traditional Kitchen', detail: 'Women-run heritage stalls with fresh milk-rice & sweets' },
      { style: 'cafe', spot: 'Empire Café Veranda', detail: 'Colonial courtyard spot beside the Sacred Temple' }
    ],
    ella: [
      { style: 'street', spot: 'Ella Town Courtyards & Kurakkan Roti', detail: 'Wood-fired millet roti, kottu & scenic rail-view cafés' },
      { style: 'cafe', spot: 'Halpewatte Tea Tasting Terrace', detail: 'High-grown Ceylon Orange Pekoe over mountain mist' }
    ],
    galle: [
      { style: 'seafood', spot: 'Fort Bastion Sea-Breeze Grills', detail: 'Black-pepper ambul thiyal tuna & crisp egg hoppers' },
      { style: 'cafe', spot: "Pedlar's Inn Courtyard & Cafés", detail: 'Historic Fort cobblestones, cinnamon gelato & espresso' }
    ],
    mirissa: [
      { style: 'seafood', spot: 'Mirissa Candlelit Sand Seafood Grills', detail: 'Fresh red snapper, calamari & tiger prawns on the beach' },
      { style: 'cafe', spot: 'Coconut Hill & Weligama Brunch Shacks', detail: 'Cold Ceylon king coconut & ocean-view smoothie bowls' }
    ],
    'nuwara-eliya': [
      { style: 'cafe', spot: 'Grand Hotel Veranda High Tea', detail: 'Crisp upland Dimbula tea, scones & colonial lawns' },
      { style: 'local', spot: 'Planter Bungalow Fireside Dinner', detail: 'Warm pepper broth, roast paan & upland spice curries' }
    ],
    yala: [
      { style: 'local', spot: 'Tissamaharama Clay-Pot Curd & Honey', detail: 'Chilled lake-side buffalo curd with wild forest honey' },
      { style: 'seafood', spot: 'Safari Campfire & Dune Barbeque', detail: 'Open-fire coastal seafood served beneath southern stars' }
    ],
    kumana: [
      { style: 'local', spot: 'Okanda & Kudumbigala Lagoon Rice Parcels', detail: 'Traditional red rice & village vegetable curries after birding dawn drives' },
      { style: 'seafood', spot: 'Panama Coastal Bay Fresh Grill', detail: 'Line-caught eastern lagoon barramundi & lime sambol near Arugam' }
    ],
    udawalawe: [
      { style: 'street', spot: 'Park-Gate Hot Hoppers & Thambili', detail: 'Early-morning egg hoppers & sweet king coconut stops' },
      { style: 'local', spot: 'Reservoir Bank Rice & Jackfruit Curry', detail: 'Hearty rustic southern village buffet near safari exit' }
    ],
    anuradhapura: [
      { style: 'local', spot: 'Nuwara Wewa Lotus-Leaf Lunch', detail: 'Traditional red rice & lotus-seed curry near sacred stupas' },
      { style: 'street', spot: 'Morning Kurakkan & Mung Kiribath Stalls', detail: 'Authentic dry-zone temple town snacks & herbal porridge' }
    ],
    dambulla: [
      { style: 'street', spot: 'Matale Chili-Salt Pineapple & Spice Market', detail: 'Sun-ripened highland mango, jackfruit & roasted cashews' },
      { style: 'local', spot: 'Cliffside Vegetable & Tamarind Curry Table', detail: 'Bright home-style rice & pickled brinjal moju' }
    ],
    'horton-plains': [
      { style: 'street', spot: 'Ohiya / Park Gate Dawn Ginger Tea', detail: 'Steaming sweet ginger tea & hot toast at 2,100m chill' },
      { style: 'cafe', spot: 'Ambewela Upland Dairy Creamery', detail: 'Fresh mountain cheeses, hot chocolate & strawberry bowls' }
    ],
    bentota: [
      { style: 'seafood', spot: 'Bentota Lagoon Mud Crab & Tiger Prawns', detail: 'Fresh lagoon-to-pan pepper crab overlooking mangroves' },
      { style: 'cafe', spot: 'River Pavilion Sunset Terrace', detail: 'Sri Lankan hoppers, jaggery sweets & tropical fruit' }
    ],
    'trinco-jaffna': [
      { style: 'seafood', spot: 'Jaffna Crab Curry & Uppuveli Beach Shacks', detail: 'Bold roasted eastern curry spices & Pigeon Island catch' },
      { style: 'street', spot: 'Odiyal Seafood Kool & Rio Ice Cream', detail: 'Signature northern palmyrah broth & local dessert shops' }
    ],
    'arugam-bay': [
      { style: 'seafood', spot: 'Main Point Flame-Grilled Surf-Coast Catch', detail: 'Line-caught seer fish & smoky sambol steps from the break' },
      { style: 'cafe', spot: 'Sandy Lane Surfer Espresso & Fruit Bowls', detail: 'Laid-back morning smoothie cafés & wood-fired flatbreads' }
    ],
    colombo: [
      { style: 'seafood', spot: 'Ministry of Crab (Dutch Hospital)', detail: 'Iconic garlic-pepper Sri Lankan lagoon crab in heritage square' },
      { style: 'cafe', spot: "The Gallery Café (Geoffrey Bawa's Studio)", detail: 'Architectural candlelit courtyard & black-pork / kithul desserts' },
      { style: 'street', spot: 'Galle Face Green Sunset Kottu & Isso Wadei', detail: 'Sizzling beach-promenade prawn fritters & ocean-breeze street food' }
    ],
    'sri-pada': [
      { style: 'street', spot: 'Candlelit Trailside Ginger Tea & Vadai Stalls', detail: 'Hot sweet mountain tea & crispy lentil fritters on pilgrim steps' },
      { style: 'local', spot: 'Nallathanniya Morning Kiribath', detail: 'Spiced onion sambol & hot milk-rice after dawn descent' }
    ],
    riverston: [
      { style: 'local', spot: 'Illukkumbura & Pitawala Village Kitchen', detail: 'Wood-fired red rice, brinjal moju & highland spice curries after misty trails' },
      { style: 'cafe', spot: 'Riverston Gap Tea & Ginger Veranda', detail: 'Hot sweet Ceylon tea overlooking cloud-swept Matale valleys' }
    ],
    pinnawala: [
      { style: 'local', spot: 'Maha Oya Riverside Veranda Rice & Curry', detail: 'Open-air river deck overlooking bathing elephants with clay-pot curries' },
      { style: 'cafe', spot: 'Rambukkana Spice & King Coconut Pavilion', detail: 'Chilled thambili, fresh jaggery sweets & sunlit river breeze' }
    ],
    peradeniya: [
      { style: 'cafe', spot: 'Royal Garden Courtyard & Spice Tea Pavilion', detail: 'Chilled Ceylon iced tea, fresh tropical fruits & colonial veranda cakes beneath giant fig trees' },
      { style: 'local', spot: 'Mahaweli Riverbank Kandyan Rice & Curry', detail: 'Traditional clay-pot mountain curries & jackfruit mallung beside Peradeniya bridge' }
    ]
  };

  function haversineKm(a, b) {
    var R = 6371;
    var toRad = function (deg) { return deg * Math.PI / 180; };
    var dLat = toRad(b[0] - a[0]);
    var dLng = toRad(b[1] - a[1]);
    var s1 = Math.sin(dLat / 2);
    var s2 = Math.sin(dLng / 2);
    var h = s1 * s1 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * s2 * s2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  function estimateRouteLeg(origin, targetId, transportMode) {
    var fromMeta = typeof origin === 'string'
      ? (DEST_GEO[origin] || START_HUBS.filter(function (h) { return h.id === origin; })[0])
      : origin;
    var toMeta = DEST_GEO[targetId];
    if (!fromMeta || !toMeta) return null;

    var crowKm = haversineKm(fromMeta.coords, toMeta.coords);
    if (crowKm < 12) {
      return { km: Math.round(crowKm * 1.2), mins: 25, railAvailable: false, mode: transportMode || 'chauffeur' };
    }
    var bendFactor = (fromMeta.highland || toMeta.highland) ? 1.38 : 1.20;
    var roadKm = Math.round(crowKm * bendFactor);
    var avgKmh = (fromMeta.highland || toMeta.highland) ? 31 : 46;
    if (transportMode === 'suv') avgKmh = Math.max(29, avgKmh - 2);
    var mins = Math.max(30, Math.round((roadKm / avgKmh) * 60 / 5) * 5);
    var railAvailable = Boolean(fromMeta.rail && toMeta.rail);
    return {
      km: roadKm,
      mins: mins,
      railAvailable: railAvailable,
      scenicHillRail: Boolean(railAvailable && fromMeta.highland && toMeta.highland),
      mode: transportMode || 'chauffeur'
    };
  }

  window.SERENDIB_DATA = {
    DESTINATIONS_META: DESTINATIONS_META,
    MONSOON_LEVELS: MONSOON_LEVELS,
    MONTH_CODES: MONTH_CODES,
    ITINERARY_PRESETS: ITINERARY_PRESETS,
    START_HUBS: START_HUBS,
    DEST_GEO: DEST_GEO,
    DINING_GUIDE: DINING_GUIDE,
    estimateRouteLeg: estimateRouteLeg
  };
})();
