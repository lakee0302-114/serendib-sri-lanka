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
      imageAlt: 'Sunrise glow over Sigiriya Lion Rock surrounded by misty green Sri Lankan jungle canopy'
    },
    {
      id: 'ella',
      number: '02',
      sinhala: 'ඇල්ල',
      regionKey: 'highlands',
      coords: "06°52'35\"N · 81°03'39\"E",
      idealNights: 2,
      image: './assets/images/ella-train.jpg',
      imageAlt: 'Blue Sri Lankan highland train crossing Nine Arches Bridge near Ella amidst tea hills'
    },
    {
      id: 'galle',
      number: '03',
      sinhala: 'ගාල්ල කොටුව',
      regionKey: 'south',
      coords: "06°01'50\"N · 80°13'02\"E",
      idealNights: 2,
      image: './assets/images/galle-fort.jpg',
      imageAlt: 'Galle Fort coral-stone sea ramparts, white lighthouse, and palms overlooking the Indian Ocean'
    },
    {
      id: 'yala',
      number: '04',
      sinhala: 'යාල',
      regionKey: 'wildlife',
      coords: "06°22'20\"N · 81°31'05\"E",
      idealNights: 2,
      image: './assets/images/yala-leopard.jpg',
      imageAlt: 'Wild Sri Lankan leopard walking across forest undergrowth in Yala National Park'
    },
    {
      id: 'nuwara-eliya',
      number: '05',
      sinhala: 'හැටන් / නුවරඑළිය',
      regionKey: 'highlands',
      coords: "06°56'57\"N · 80°46'58\"E",
      idealNights: 2,
      image: './assets/images/tea-highlands.jpg',
      imageAlt: 'Emerald green tea terraces stretching across Labukele and Nuwara Eliya highlands'
    },
    {
      id: 'polonnaruwa',
      number: '06',
      sinhala: 'පොළොන්නරුව',
      regionKey: 'cultural',
      coords: "07°56'40\"N · 81°00'08\"E",
      idealNights: 1,
      image: './assets/images/ancient-polonnaruwa.jpg',
      imageAlt: 'Carved stone moonstone and guardian steps at the ancient Polonnaruwa Vatadage'
    },
    {
      id: 'bentota',
      number: '07',
      sinhala: 'බෙන්තොට / තංගල්ල',
      regionKey: 'south',
      coords: "06°25'16\"N · 79°59'45\"E",
      idealNights: 3,
      image: './assets/images/bawa-villa-coast.jpg',
      imageAlt: 'Golden evening light over Goyambokka cove boulders, palms, and Indian Ocean surf in Tangalle'
    },
    {
      id: 'trinco-jaffna',
      number: '08',
      sinhala: 'ත්‍රිකුණාමලය · யாழ்ப்பாணம்',
      regionKey: 'northeast',
      coords: "08°34'16\"N · 81°14'00\"E",
      idealNights: 3,
      image: './assets/images/east-coast-trinco.jpg',
      imageAlt: 'Traditional wooden fishing boats resting on wide white sand at Nilaveli Beach in Trincomalee'
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
