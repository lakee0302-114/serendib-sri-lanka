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
      imageAlt: 'Sunlit pathway through royal water gardens toward Sigiriya Lion Rock under bright blue sky'
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
      imageAlt: 'Iconic blue Sri Lankan highland train crossing stone Nine Arch Bridge surrounded by lush forest'
    },
    {
      id: 'wilpattu',
      number: '04',
      sinhala: 'විල්පත්තුව',
      regionKey: 'wildlife',
      coords: "08°27'15\"N · 80°02'30\"E",
      idealNights: 2,
      image: './assets/images/wilpattu-trunk-spray.jpg',
      imageAlt: 'Wild Sri Lankan elephant raising its trunk high to spray cooling bath water in sunlight'
    },
    {
      id: 'galle',
      number: '05',
      sinhala: 'ගාල්ල කොටුව',
      regionKey: 'south',
      coords: "06°01'50\"N · 80°13'02\"E",
      idealNights: 2,
      image: './assets/images/galle-fort.jpg',
      imageAlt: 'Galle Fort coral-stone sea ramparts, white lighthouse, and palms overlooking the Indian Ocean'
    },
    {
      id: 'mirissa',
      number: '06',
      sinhala: 'මිරිස්ස · වැලිගම',
      regionKey: 'south',
      coords: "05°56'54\"N · 80°27'31\"E",
      idealNights: 2,
      image: './assets/images/mirissa-coast.jpg',
      imageAlt: 'Sun-drenched Coconut Tree Hill headland in Mirissa lined with swaying palms above turquoise surf'
    },
    {
      id: 'nuwara-eliya',
      number: '07',
      sinhala: 'හැටන් / නුවරඑළිය',
      regionKey: 'highlands',
      coords: "06°56'57\"N · 80°46'58\"E",
      idealNights: 2,
      image: './assets/images/tea-highlands.jpg',
      imageAlt: 'Sunlit terraced emerald Ceylon tea plantations rolling across high mountain ridges'
    },
    {
      id: 'yala',
      number: '08',
      sinhala: 'යාල',
      regionKey: 'wildlife',
      coords: "06°22'20\"N · 81°31'05\"E",
      idealNights: 2,
      image: './assets/images/yala-leopard.jpg',
      imageAlt: 'Wild Sri Lankan leopard drinking at a sunlit mirror waterhole inside Yala National Park'
    },
    {
      id: 'udawalawe',
      number: '09',
      sinhala: 'උඩවලව',
      regionKey: 'wildlife',
      coords: "06°26'18\"N · 80°53'18\"E",
      idealNights: 1,
      image: './assets/images/udawalawe-elephants.jpg',
      imageAlt: 'Close-up of a wild Sri Lankan elephant curling its trunk in green savannah flora'
    },
    {
      id: 'anuradhapura',
      number: '10',
      sinhala: 'අනුරාධපුරය',
      regionKey: 'cultural',
      coords: "08°21'00\"N · 80°23'47\"E",
      idealNights: 2,
      image: './assets/images/anuradhapura-stupa.jpg',
      imageAlt: 'Great white Ruwanwelisaya Maha Stupa lined with carved elephant walls in ancient Anuradhapura'
    },
    {
      id: 'dambulla',
      number: '11',
      sinhala: 'දඹුල්ල',
      regionKey: 'cultural',
      coords: "07°51'24\"N · 80°38'57\"E",
      idealNights: 1,
      image: './assets/images/dambulla-cave.jpg',
      imageAlt: 'Ancient carved reclining Buddha and painted floral murals inside Dambulla Royal Cave Temple'
    },
    {
      id: 'polonnaruwa',
      number: '12',
      sinhala: 'පොළොන්නරුව',
      regionKey: 'cultural',
      coords: "07°56'40\"N · 81°00'08\"E",
      idealNights: 1,
      image: './assets/images/ancient-polonnaruwa.jpg',
      imageAlt: 'Carved stone moonstone stairway leading up to serene granite Buddha at Polonnaruwa Vatadage'
    },
    {
      id: 'horton-plains',
      number: '13',
      sinhala: 'හෝර්ටන් තැන්න',
      regionKey: 'highlands',
      coords: "06°48'09\"N · 80°48'09\"E",
      idealNights: 1,
      image: './assets/images/horton-plains.jpg',
      imageAlt: 'Natural highland rock infinity pool overlooking sunset valleys and Sri Lankan peaks'
    },
    {
      id: 'bentota',
      number: '14',
      sinhala: 'බෙන්තොට / තංගල්ල',
      regionKey: 'south',
      coords: "06°25'16\"N · 79°59'45\"E",
      idealNights: 3,
      image: './assets/images/bawa-villa-coast.jpg',
      imageAlt: 'Aerial cape resort with oceanfront pool overlooking twin crescent Sri Lankan beaches'
    },
    {
      id: 'trinco-jaffna',
      number: '15',
      sinhala: 'ත්‍රිකුණාමලය · யாழ்ப்பாணம்',
      regionKey: 'northeast',
      coords: "08°34'16\"N · 81°14'00\"E",
      idealNights: 3,
      image: './assets/images/east-coast-trinco.jpg',
      imageAlt: 'Crystal clear turquoise reef water, sandy shoreline, and boat along Sri Lanka calm bay'
    },
    {
      id: 'arugam-bay',
      number: '16',
      sinhala: 'ආරුගම් බොක්ක',
      regionKey: 'northeast',
      coords: "06°50'25\"N · 81°49'50\"E",
      idealNights: 3,
      image: './assets/images/arugam-passikudah.jpg',
      imageAlt: 'Sweeping emerald coastal headland and foaming turquoise surf waves under bright clouds'
    },
    {
      id: 'colombo',
      number: '17',
      sinhala: 'කොළඹ',
      regionKey: 'south',
      coords: "06°55'37\"N · 79°51'40\"E",
      idealNights: 1,
      image: './assets/images/colombo-city.jpg',
      imageAlt: 'Illuminated Colombo skyline and lakeside pavilion reflecting golden twilight lights on Beira Lake'
    },
    {
      id: 'sri-pada',
      number: '18',
      sinhala: 'ශ්‍රී පාදය',
      regionKey: 'highlands',
      coords: "06°48'34\"N · 80°29'59\"E",
      idealNights: 1,
      image: './assets/images/sri-pada.jpg',
      imageAlt: 'Golden amber sunrise glowing above a sea of highland clouds seen from the sacred summit of Sri Pada'
    },
    {
      id: 'minneriya',
      number: '19',
      sinhala: 'මින්නේරිය',
      regionKey: 'wildlife',
      coords: "08°01'15\"N · 80°53'10\"E",
      idealNights: 1,
      image: './assets/images/minneriya-gathering.jpg',
      imageAlt: 'Herd of wild Sri Lankan elephants and calf grazing across lush green Minneriya grasslands'
    },
    {
      id: 'knuckles',
      number: '20',
      sinhala: 'නකල්ස් කඳු වැටිය',
      regionKey: 'highlands',
      coords: "07°27'30\"N · 80°46'50\"E",
      idealNights: 2,
      image: './assets/images/knuckles-range.jpg',
      imageAlt: 'Lush emerald mountain ridge and sunlit valley under bright clouds in Knuckles Range'
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
