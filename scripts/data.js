/* ==========================================================================
   SERENDIB — Structural Metadata (16 Top Attractions & Twin Monsoons)
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
      id: 'kandy',
      number: '02',
      sinhala: 'මහනුවර',
      regionKey: 'cultural',
      coords: "07°17'37\"N · 80°38'29\"E",
      idealNights: 2,
      image: './assets/images/kandy-temple.jpg',
      imageAlt: 'Temple of the Sacred Tooth Relic in Kandy reflecting across calm water and palm gardens'
    },
    {
      id: 'ella',
      number: '03',
      sinhala: 'ඇල්ල',
      regionKey: 'highlands',
      coords: "06°52'35\"N · 81°03'39\"E",
      idealNights: 2,
      image: './assets/images/ella-train.jpg',
      imageAlt: 'Blue Sri Lankan highland train crossing Nine Arches Bridge near Ella amidst tea hills'
    },
    {
      id: 'galle',
      number: '04',
      sinhala: 'ගාල්ල කොටුව',
      regionKey: 'south',
      coords: "06°01'50\"N · 80°13'02\"E",
      idealNights: 2,
      image: './assets/images/galle-fort.jpg',
      imageAlt: 'Galle Fort coral-stone sea ramparts, white lighthouse, and palms overlooking the Indian Ocean'
    },
    {
      id: 'mirissa',
      number: '05',
      sinhala: 'මිරිස්ස · වැලිගම',
      regionKey: 'south',
      coords: "05°56'54\"N · 80°27'31\"E",
      idealNights: 2,
      image: './assets/images/mirissa-coast.jpg',
      imageAlt: 'Traditional stilt fishermen balancing above shallow Indian Ocean swells along Sri Lanka southern coast'
    },
    {
      id: 'nuwara-eliya',
      number: '06',
      sinhala: 'හැටන් / නුවරඑළිය',
      regionKey: 'highlands',
      coords: "06°56'57\"N · 80°46'58\"E",
      idealNights: 2,
      image: './assets/images/tea-highlands.jpg',
      imageAlt: 'Emerald green tea terraces stretching across Labukele and Nuwara Eliya highlands'
    },
    {
      id: 'yala',
      number: '07',
      sinhala: 'යාල',
      regionKey: 'wildlife',
      coords: "06°22'20\"N · 81°31'05\"E",
      idealNights: 2,
      image: './assets/images/yala-leopard.jpg',
      imageAlt: 'Wild Sri Lankan leopard walking across forest undergrowth in Yala National Park'
    },
    {
      id: 'udawalawe',
      number: '08',
      sinhala: 'උඩවලව',
      regionKey: 'wildlife',
      coords: "06°26'18\"N · 80°53'18\"E",
      idealNights: 1,
      image: './assets/images/udawalawe-elephants.jpg',
      imageAlt: 'Wild Sri Lankan elephant mother and calf roaming green bushland in Udawalawe National Park'
    },
    {
      id: 'anuradhapura',
      number: '09',
      sinhala: 'අනුරාධපුරය',
      regionKey: 'cultural',
      coords: "08°21'00\"N · 80°23'47\"E",
      idealNights: 2,
      image: './assets/images/anuradhapura-stupa.jpg',
      imageAlt: 'Great white Ruwanwelisaya Maha Stupa lined with carved elephant walls in ancient Anuradhapura'
    },
    {
      id: 'dambulla',
      number: '10',
      sinhala: 'දඹුල්ල',
      regionKey: 'cultural',
      coords: "07°51'24\"N · 80°38'57\"E",
      idealNights: 1,
      image: './assets/images/dambulla-cave.jpg',
      imageAlt: 'Ancient carved reclining Buddha and painted floral murals inside Dambulla Royal Cave Temple'
    },
    {
      id: 'polonnaruwa',
      number: '11',
      sinhala: 'පොළොන්නරුව',
      regionKey: 'cultural',
      coords: "07°56'40\"N · 81°00'08\"E",
      idealNights: 1,
      image: './assets/images/ancient-polonnaruwa.jpg',
      imageAlt: 'Carved stone moonstone and guardian steps at the ancient Polonnaruwa Vatadage'
    },
    {
      id: 'horton-plains',
      number: '12',
      sinhala: 'හෝර්ටන් තැන්න',
      regionKey: 'highlands',
      coords: "06°48'09\"N · 80°48'09\"E",
      idealNights: 1,
      image: './assets/images/horton-plains.jpg',
      imageAlt: 'Cascading highland waterfall across dark mossy basalt rock inside Horton Plains cloud forest'
    },
    {
      id: 'bentota',
      number: '13',
      sinhala: 'බෙන්තොට / තංගල්ල',
      regionKey: 'south',
      coords: "06°25'16\"N · 79°59'45\"E",
      idealNights: 3,
      image: './assets/images/bawa-villa-coast.jpg',
      imageAlt: 'Golden evening light over Goyambokka cove boulders, palms, and Indian Ocean surf in Tangalle'
    },
    {
      id: 'trinco-jaffna',
      number: '14',
      sinhala: 'ත්‍රිකුණාමලය · யாழ்ப்பாணம்',
      regionKey: 'northeast',
      coords: "08°34'16\"N · 81°14'00\"E",
      idealNights: 3,
      image: './assets/images/east-coast-trinco.jpg',
      imageAlt: 'Traditional wooden fishing boats resting on wide white sand at Nilaveli Beach in Trincomalee'
    },
    {
      id: 'arugam-bay',
      number: '15',
      sinhala: 'ආරුගම් බොක්ක',
      regionKey: 'northeast',
      coords: "06°50'25\"N · 81°49'50\"E",
      idealNights: 3,
      image: './assets/images/arugam-passikudah.jpg',
      imageAlt: 'Calm turquoise water and white sandy sweep along the sunny eastern shoreline of Sri Lanka'
    },
    {
      id: 'colombo',
      number: '16',
      sinhala: 'කොළඹ',
      regionKey: 'south',
      coords: "06°55'37\"N · 79°51'40\"E",
      idealNights: 1,
      image: './assets/images/colombo-city.jpg',
      imageAlt: 'Historic white colonnaded facade of the Colombo National Museum framed by landscaped lawns'
    },
    {
      id: 'sri-pada',
      number: '17',
      sinhala: 'ශ්‍රී පාදය',
      regionKey: 'highlands',
      coords: "06°48'34\"N · 80°29'59\"E",
      idealNights: 1,
      image: './assets/images/sri-pada.jpg',
      imageAlt: 'Golden amber sunrise glowing above a sea of highland clouds seen from the sacred summit of Sri Pada'
    },
    {
      id: 'minneriya',
      number: '18',
      sinhala: 'මින්නේරිය',
      regionKey: 'wildlife',
      coords: "08°01'15\"N · 80°53'10\"E",
      idealNights: 1,
      image: './assets/images/minneriya-gathering.jpg',
      imageAlt: 'Wild Sri Lankan elephant mother and calf grazing beside calm Minneriya Reservoir water'
    },
    {
      id: 'wilpattu',
      number: '19',
      sinhala: 'විල්පත්තුව',
      regionKey: 'wildlife',
      coords: "08°27'15\"N · 80°02'30\"E",
      idealNights: 2,
      image: './assets/images/wilpattu-leopard.jpg',
      imageAlt: 'Wild Sri Lankan leopard walking along a quiet sandy forest track in Wilpattu National Park'
    },
    {
      id: 'knuckles',
      number: '20',
      sinhala: 'නකල්ස් කඳු වැටිය',
      regionKey: 'highlands',
      coords: "07°27'30\"N · 80°46'50\"E",
      idealNights: 2,
      image: './assets/images/knuckles-range.jpg',
      imageAlt: 'Misty emerald mountain peaks and grassy ridges across the Knuckles Wilderness at sunset'
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

  window.SERENDIB_DATA = {
    DESTINATIONS_META: DESTINATIONS_META,
    MONSOON_LEVELS: MONSOON_LEVELS,
    MONTH_CODES: MONTH_CODES,
    ITINERARY_PRESETS: ITINERARY_PRESETS
  };
})();
