/* ==========================================================================
   SERENDIB — Structural Metadata (Locale-independent geometry & seasons)
   ========================================================================== */

(function () {
  var DESTINATIONS_META = [
    {
      id: 'sigiriya',
      number: '01',
      sinhala: 'සීගිරිය',
      regionKey: 'cultural',
      coords: "07°57'25\"N · 80°45'35\"E",
      idealNights: 2,
      image: './assets/images/hero-sigiriya.jpg',
      imageAlt: 'Sigiriya Lion Rock rising through dawn mist above ancient stone water gardens in Sri Lanka'
    },
    {
      id: 'ella',
      number: '02',
      sinhala: 'ඇල්ල',
      regionKey: 'highlands',
      coords: "06°52'35\"N · 81°03'39\"E",
      idealNights: 2,
      image: './assets/images/ella-train.jpg',
      imageAlt: 'Classic blue highland train crossing stone Nine Arches Bridge in misty green Ella hills'
    },
    {
      id: 'galle',
      number: '03',
      sinhala: 'ගාල්ල කොටුව',
      regionKey: 'south',
      coords: "06°01'50\"N · 80°13'02\"E",
      idealNights: 2,
      image: './assets/images/galle-fort.jpg',
      imageAlt: 'Galle Fort white lighthouse and weathered coral-stone ramparts beside Indian Ocean palms at dusk'
    },
    {
      id: 'yala',
      number: '04',
      sinhala: 'යාල',
      regionKey: 'wildlife',
      coords: "06°22'20\"N · 81°31'05\"E",
      idealNights: 2,
      image: './assets/images/yala-leopard.jpg',
      imageAlt: 'Wild Sri Lankan leopard resting on a weathered granite boulder at golden morning light in Yala'
    },
    {
      id: 'nuwara-eliya',
      number: '05',
      sinhala: 'හැටන් / නුවරඑළිය',
      regionKey: 'highlands',
      coords: "06°56'57\"N · 80°46'58\"E",
      idealNights: 2,
      image: './assets/images/tea-highlands.jpg',
      imageAlt: 'Misty terraced Ceylon tea plantations at sunrise in Nuwara Eliya and Hatton hills'
    },
    {
      id: 'polonnaruwa',
      number: '06',
      sinhala: 'පොළොන්නරුව',
      regionKey: 'cultural',
      coords: "07°56'40\"N · 81°00'08\"E",
      idealNights: 1,
      image: './assets/images/ancient-polonnaruwa.jpg',
      imageAlt: 'Ancient carved stone Vatadage ruins in golden afternoon light at Polonnaruwa Sri Lanka'
    },
    {
      id: 'bentota',
      number: '07',
      sinhala: 'බෙන්තොට / තංගල්ල',
      regionKey: 'south',
      coords: "06°25'16\"N · 79°59'45\"E",
      idealNights: 3,
      image: './assets/images/bawa-villa-coast.jpg',
      imageAlt: 'Tropical modernist Sri Lankan courtyard villa with reflection pool and palm horizon'
    },
    {
      id: 'trinco-jaffna',
      number: '08',
      sinhala: 'ත්‍රිකුණාමලය · யாழ்ப்பாணம்',
      regionKey: 'northeast',
      coords: "08°34'16\"N · 81°14'00\"E",
      idealNights: 3,
      image: './assets/images/east-coast-trinco.jpg',
      imageAlt: 'Calm turquoise east coast bay in Trincomalee with wooden outrigger canoe and palmyrah palms'
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
    'classic-arc': ['sigiriya', 'nuwara-eliya', 'ella', 'galle'],
    'wild-south': ['nuwara-eliya', 'ella', 'yala', 'bentota', 'galle'],
    'east-north-sun': ['polonnaruwa', 'trinco-jaffna', 'sigiriya']
  };

  window.SERENDIB_DATA = {
    DESTINATIONS_META: DESTINATIONS_META,
    MONSOON_LEVELS: MONSOON_LEVELS,
    MONTH_CODES: MONTH_CODES,
    ITINERARY_PRESETS: ITINERARY_PRESETS
  };
})();
