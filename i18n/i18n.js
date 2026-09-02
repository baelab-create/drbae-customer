/* ==========================================================================
   Dr. BAE customer page — i18n runtime
   ------------------------------------------------------------------
   · 기본 언어(ko)는 HTML 원문. 다른 언어는 i18n/<lang>.js 사전(window.I18N.<lang>)으로 치환.
   · 치환 대상: [data-i18n] innerHTML, [data-i18n-alt] alt, [data-i18n-meta] content, <title>, <html lang>
   · 언어 결정 우선순위: ?lang=xx → localStorage → 브라우저 언어 → ko
   · 사전에 키가 없으면 한국어 원문을 그대로 둔다(누락 안전).
   ========================================================================== */
(function () {
  var LANGS = { ko: 'KO', en: 'EN', ja: 'JA', fr: 'FR' };
  var FLAGS = { ko: '\uD83C\uDDF0\uD83C\uDDF7', en: '\uD83C\uDDFA\uD83C\uDDF8', ja: '\uD83C\uDDEF\uD83C\uDDF5', fr: '\uD83C\uDDEB\uD83C\uDDF7' }; // 🇰🇷 🇺🇸 🇯🇵 🇫🇷
  var LABEL = { ko: '한국어', en: 'English', ja: '日本語', fr: 'Français' };
  var STORE = 'drbae.lang';
  var FONTS = {
    ja: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&family=Noto+Serif+JP:wght@500;700&display=swap'
  };
  var loadedFonts = {};
  var KO = {};          // 원문 캐시(innerHTML / alt / meta / title)
  var current = 'ko';

  window.I18N = window.I18N || {};

  function $all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function cacheOriginal() {
    $all('[data-i18n]').forEach(function (el) { KO[el.getAttribute('data-i18n')] = el.innerHTML; });
    $all('[data-i18n-alt]').forEach(function (el) { KO[el.getAttribute('data-i18n-alt')] = el.getAttribute('alt'); });
    $all('[data-i18n-meta]').forEach(function (el) { KO[el.getAttribute('data-i18n-meta')] = el.getAttribute('content'); });
    KO.title = document.title;
  }

  function ensureFont(lang) {
    if (!FONTS[lang] || loadedFonts[lang]) return;
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = FONTS[lang];
    document.head.appendChild(l);
    loadedFonts[lang] = true;
  }

  function dict(lang) { return lang === 'ko' ? KO : (window.I18N[lang] || {}); }

  function apply(lang) {
    if (!LANGS[lang]) lang = 'ko';
    var d = dict(lang);
    var get = function (k) { return (d[k] != null && d[k] !== '') ? d[k] : KO[k]; };

    $all('[data-i18n]').forEach(function (el) { el.innerHTML = get(el.getAttribute('data-i18n')); });
    $all('[data-i18n-alt]').forEach(function (el) { el.setAttribute('alt', get(el.getAttribute('data-i18n-alt'))); });
    $all('[data-i18n-meta]').forEach(function (el) { el.setAttribute('content', get(el.getAttribute('data-i18n-meta'))); });
    document.title = get('title');

    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-lang', lang);
    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute('content', { ko: 'ko_KR', en: 'en_US', ja: 'ja_JP', fr: 'fr_FR' }[lang]);

    $all('.lang-sw button').forEach(function (b) {
      var on = b.getAttribute('data-lang') === lang;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    ensureFont(lang);
    current = lang;
    try { localStorage.setItem(STORE, lang); } catch (e) {}
    try {
      var u = new URL(window.location.href);
      if (lang === 'ko') u.searchParams.delete('lang'); else u.searchParams.set('lang', lang);
      history.replaceState(null, '', u.toString());
    } catch (e) {}
  }

  function detect() {
    var q = null;
    try { q = new URL(window.location.href).searchParams.get('lang'); } catch (e) {}
    if (q && LANGS[q]) return q;
    var s = null;
    try { s = localStorage.getItem(STORE); } catch (e) {}
    if (s && LANGS[s]) return s;
    var nav = (navigator.language || navigator.userLanguage || 'ko').slice(0, 2).toLowerCase();
    return LANGS[nav] ? nav : 'ko';
  }

  function buildSwitchers() {
    $all('.lang-sw').forEach(function (box) {
      box.innerHTML = '';
      box.setAttribute('role', 'group');
      box.setAttribute('aria-label', 'Language');
      Object.keys(LANGS).forEach(function (code) {
        var b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('data-lang', code);
        b.setAttribute('title', LABEL[code]);
        b.innerHTML = '<span class="flag">' + FLAGS[code] + '</span><span class="code">' + LANGS[code] + '</span>';
        b.addEventListener('click', function () {
          var compact = box.closest('.nav');           // 스티키 바의 컴팩트 모드
          if (compact && !box.classList.contains('open') && code === current) { box.classList.add('open'); return; }
          box.classList.remove('open');
          if (current !== code) apply(code);
        });
        box.appendChild(b);
      });
    });
  }

  document.addEventListener('click', function (e) {
    $all('.nav .lang-sw.open').forEach(function (box) { if (!box.contains(e.target)) box.classList.remove('open'); });
  });

  function init() {
    cacheOriginal();
    buildSwitchers();
    apply(detect());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.DrBaeI18N = { apply: apply, current: function () { return current; } };
})();
