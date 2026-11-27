/* Theme & language pre-hydration */
(function () {
  'use strict';
  try {
    var savedTheme = localStorage.getItem('serendib_theme_v1');
    var theme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.getElementById('meta-theme-color');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#07151D' : '#FFFFFF');

    var savedLang = localStorage.getItem('serendib_lang_v1');
    var allowed = ['en', 'ta', 'hi', 'fr', 'de', 'es', 'it', 'nl', 'pt', 'ru', 'ja', 'ko', 'zh', 'ar'];
    if (savedLang && allowed.indexOf(savedLang) !== -1) {
      document.documentElement.setAttribute('lang', savedLang);
      document.documentElement.setAttribute('dir', savedLang === 'ar' ? 'rtl' : 'ltr');
    }
  } catch (e) {}
})();
