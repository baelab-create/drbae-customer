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
  /* 국기 — 이모지(KR/US/JP/FR 리저널 인디케이터)는 Windows의 Segoe UI Emoji에
     국기 글리프가 없어 'KR' 같은 문자 두 개로 깨져 보인다.
     모든 기기에서 같게 보이도록 인라인 SVG로 그린다. 좌표계는 36×24 (3:2). */
  function svg(inner) {
    return '<svg viewBox="0 0 36 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + inner + '</svg>';
  }
  function star(cx, cy, r) {
    var d = '', i, a, rr;
    for (i = 0; i < 10; i++) {
      a = -Math.PI / 2 + i * Math.PI / 5;
      rr = (i % 2 === 0) ? r : r * 0.382;
      d += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2);
    }
    return d + 'Z';
  }
  /* 성조기 별 50개 — 6개 행과 5개 행이 번갈아 9줄 */
  function usStars() {
    var CW = 14.4, CH = 12.92, d = '', row, i, six, n;
    for (row = 0; row < 9; row++) {
      six = row % 2 === 0; n = six ? 6 : 5;
      for (i = 0; i < n; i++) {
        d += star(CW * ((six ? 1 + i * 2 : 2 + i * 2) / 12), CH * ((row + 1) / 10), 0.55);
      }
    }
    return d;
  }
  var FLAGS = {
    /* 태극기 — 위키미디어 공용 Flag_of_South_Korea.svg(퍼블릭 도메인)의 도형을
       그대로 옮겨 36×24 안에 축척했다. 원본 좌표계는 144×96(중심 0,0).
       4괘는 시계방향으로 건(좌상)·감(우상)·곤(우하)·리(좌하) */
    ko: svg(
      '<rect width="36" height="24" fill="#fff"/>' +
      '<g transform="translate(18 12) scale(.25)">' +
        '<g fill="none" stroke="#000" stroke-width="4">' +
          '<path transform="rotate(33.69006752598)" d="M-50-12v24m6 0v-24m6 0v24m76 0V1m0-2v-11m6 0v11m0 2v11m6 0V1m0-2v-11"/>' +
          '<path transform="rotate(-33.69006752598)" d="M-50-12v24m6 0V1m0-2v-11m6 0v24m76 0V1m0-2v-11m6 0v24m6 0V1m0-2v-11"/>' +
        '</g>' +
        '<g transform="rotate(33.69006752598)">' +
          '<path fill="#cd2e3a" d="M12 0a18 18 0 11-36 0 24 24 0 1148 0"/>' +
          '<path fill="#0047a0" d="M-24 0a24 24 0 1048 0A12 12 0 100 0a12 12 0 11-24 0"/>' +
        '</g>' +
      '</g>'
    ),
    /* 성조기 — 13줄 무늬 + 유니온(별 50개) */
    en: svg(
      '<rect width="36" height="24" fill="#fff"/>' +
      '<g fill="#b22234">' +
        '<rect width="36" height="1.846" y="0"/><rect width="36" height="1.846" y="3.692"/>' +
        '<rect width="36" height="1.846" y="7.385"/><rect width="36" height="1.846" y="11.077"/>' +
        '<rect width="36" height="1.846" y="14.769"/><rect width="36" height="1.846" y="18.462"/>' +
        '<rect width="36" height="1.846" y="22.154"/>' +
      '</g>' +
      '<rect width="14.4" height="12.92" fill="#3c3b6e"/>' +
      '<path fill="#fff" d="' + usStars() + '"/>'
    ),
    /* 일장기 — 붉은 원 지름은 세로의 3/5 */
    ja: svg('<rect width="36" height="24" fill="#fff"/><circle cx="18" cy="12" r="7.2" fill="#bc002d"/>'),
    /* 삼색기 */
    fr: svg(
      '<rect width="12" height="24" fill="#002395"/>' +
      '<rect width="12" height="24" x="12" fill="#fff"/>' +
      '<rect width="12" height="24" x="24" fill="#ed2939"/>'
    )
  };
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
