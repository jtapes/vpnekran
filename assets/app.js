/* Google Analytics 4 (G-Y7LH4PH5QB, поток «siberian.uk», решение Влада 13.10 — карточка B-46).
   Здесь, а не в HTML: app.js грузит каждая страница, а HTML трогать нельзя — волны статей
   (lendings/waves/apply.mjs) сверяют md5 страниц. Метрика стоит в HTML отдельно и от этого блока
   не зависит. Без cookie-баннера; сигналы Google и рекламная персонализация выключены.
   page_location — без query, кроме utm_*; один page_view на страницу (штатный, от config).
   На localhost и с диска не поднимаем — проверки не капают в боевую статистику. */
(function () {
  var id = 'G-Y7LH4PH5QB';
  var host = location.hostname;
  if (location.protocol === 'file:' || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(host)) return;
  if (window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  /* gtag.js разбирает только объект arguments, не массив */
  window.gtag = function () { window.dataLayer.push(arguments); };
  var utm = [];
  var q = location.search.replace(/^\?/, '').split('&');
  for (var i = 0; i < q.length; i++) if (/^utm_[^=]*=/.test(q[i])) utm.push(q[i]);
  window.gtag('js', new Date());
  window.gtag('config', id, {
    page_location: location.protocol + '//' + location.host + location.pathname + (utm.length ? '?' + utm.join('&') : ''),
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.getElementsByTagName('head')[0].appendChild(s);
})();

/* Экран: появление блоков по скроллу и «набор с пульта» на экране телевизора.
   Без IntersectionObserver (старые браузеры и телевизоры) блоки показываются сразу,
   без JS то же делает <noscript> в шапке каждой страницы. При prefers-reduced-motion
   клавиатура не анимируется: в HTML уже стоит набранная ссылка и итоговый счётчик. */
(function () {
  var hasIO = 'IntersectionObserver' in window;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var blocks = document.querySelectorAll('.tune');
  var n;

  function show(el) {
    if (el.className.indexOf('tuned') === -1) el.className += ' tuned';
  }

  if (!hasIO) {
    for (n = 0; n < blocks.length; n++) show(blocks[n]);
  } else {
    var watcher = new IntersectionObserver(function (list) {
      for (var k = 0; k < list.length; k++) {
        if (!list[k].isIntersecting) continue;
        show(list[k].target);
        watcher.unobserve(list[k].target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    for (n = 0; n < blocks.length; n++) watcher.observe(blocks[n]);
  }

  if (still || !hasIO) return;

  /* ── Набор ссылки с пульта ───────────────────────────────────────────── */
  var screens = document.querySelectorAll('.tele');
  for (n = 0; n < screens.length; n++) {
    var typed = screens[n].querySelector('.tele-typed');
    if (typed) runScreen(screens[n], typed);
  }

  function runScreen(root, typed) {
    var text = typed.getAttribute('data-text') || '';
    var cost = (typed.getAttribute('data-cost') || '').split(',');
    var counter = root.querySelector('.press-num[data-final]');
    var keys = root.querySelectorAll('.key');
    var map = {};
    for (var i = 0; i < keys.length; i++) map[keys[i].getAttribute('data-k')] = keys[i];

    var pos = 0, sum = 0, timer = null, lit = null, visible = false;

    function light(el) {
      if (lit) lit.className = lit.className.replace(' key-hit', '');
      lit = el;
      if (el) el.className += ' key-hit';
    }

    function tick() {
      if (!visible) { timer = null; return; }
      if (pos >= text.length) {
        light(map.OK || null);
        timer = setTimeout(restart, 2600);
        return;
      }
      var ch = text.charAt(pos);
      light(map[ch] || null);
      sum += parseInt(cost[pos], 10) || 1;
      pos++;
      typed.textContent = text.slice(0, pos);
      if (counter) counter.textContent = sum;
      timer = setTimeout(tick, 170);
    }

    function restart() {
      pos = 0; sum = 0;
      light(null);
      typed.textContent = '';
      if (counter) counter.textContent = '0';
      timer = setTimeout(tick, 500);
    }

    var eye = new IntersectionObserver(function (list) {
      visible = list[0].isIntersecting;
      if (visible && !timer) restart();
    }, { threshold: 0.4 });
    eye.observe(root);
  }
})();
