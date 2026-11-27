/* Giỏ hàng cho landing page Webcake – Thanh Thỏ
 * Dán 1 dòng vào Webcake (Cài đặt trang → mã chèn cuối <body>):
 *   <script src="https://vietanh9xnd.github.io/thanhtho-gio-hang-demo/webcake-gio-hang.js" defer></script>
 * Script tự đọc lựa chọn (ô radio So_Luong + giá "680K") và SIZE của form trên từng trang,
 * giỏ lưu chung cho mọi link cùng tên miền. Khi khách bấm ĐẶT HÀNG của form, danh sách giỏ
 * được ghi vào ô "gio_hang"/"ghi_chu" (nếu form có) hoặc nối vào cuối ô địa chỉ.
 */
(function () {
  'use strict';
  if (window.__tghLoaded) return; window.__tghLoaded = true;

  // ===== Cấu hình =====
  var CFG = {
    key: 'thanhtho_webcake_cart_v1',
    freeShipFrom: 800000,            // tổng từ mức này thì miễn ship (0 = tắt)
    noteFields: ['gio_hang', 'GIO_HANG', 'ghi_chu', 'GHI_CHU', 'note', 'Ghi_Chu'],
    color: '#ee4d2d'
  };
  var MARK = ' || GIỎ HÀNG: ';

  // ===== Tiện ích =====
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); };
  var vnd = function (n) { return n ? n.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'; };
  var load = function () { try { return JSON.parse(localStorage.getItem(CFG.key)) || []; } catch (e) { return []; } };
  var save = function (c) { try { localStorage.setItem(CFG.key, JSON.stringify(c)); } catch (e) {} };
  var parsePrice = function (t) {
    var m = String(t).match(/(\d{1,3}(?:[.,]\d{3})+|\d+)\s*K\b/i);
    return m ? parseInt(m[1].replace(/[.,]/g, ''), 10) * 1000 : 0;
  };
  var isFree = function (t) { return /MI[ỄE]N\s*(PH[ÍI]\s*)?SHIP|FREE\s*SHIP/i.test(t); };
  var shortName = function (t) { return String(t).replace(/\s*[:\-–]\s*\d.*$/, '').replace(/^MUA\s+/i, '').trim() || t; };
  var setVal = function (el, v) {
    var d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
    if (d && d.set) d.set.call(el, v); else el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  // ===== Đọc sản phẩm từ form của trang =====
  function readProduct() {
    var radios = $$('input[type=radio][name=So_Luong]');
    if (!radios.length) radios = $$('form input[type=radio]');
    if (!radios.length) return null;
    var form = radios[0].closest('form');
    var sizeSel = form && ($('select[name=SIZE]', form) || $('select[name=Size]', form) || $('select[name=size]', form));
    var og = $('meta[property="og:image"]');
    var code = (location.pathname.split('/').filter(Boolean).pop() || 'SP').toUpperCase();
    return {
      code: code,
      name: (document.title || code).trim(),
      img: og ? og.content : '',
      form: form,
      sizeSel: sizeSel,
      variants: radios.map(function (r) {
        return { id: r.id, value: r.value, label: shortName(r.value), price: parsePrice(r.value), free: isFree(r.value) };
      }),
      sizes: sizeSel ? $$('option', sizeSel).map(function (o) { return o.value; }).filter(Boolean) : []
    };
  }

  // ===== Giao diện =====
  var css = '' +
    '.tgh *{box-sizing:border-box;font-family:inherit}' +
    '.tgh-fab{position:fixed;right:12px;bottom:96px;z-index:2147483000;display:flex;flex-direction:column;gap:10px;align-items:flex-end}' +
    '.tgh-btn{border:0;cursor:pointer;font:700 14px/1 Arial,sans-serif;border-radius:24px;padding:12px 16px;box-shadow:0 3px 10px rgba(0,0,0,.25);color:#fff;background:' + CFG.color + '}' +
    '.tgh-cartbtn{position:relative;width:52px;height:52px;border-radius:50%;background:#fff;color:' + CFG.color + ';font-size:24px;padding:0;border:2px solid ' + CFG.color + '}' +
    '.tgh-badge{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:' + CFG.color + ';color:#fff;font:700 12px/20px Arial,sans-serif;text-align:center;padding:0 5px}' +
    '.tgh-badge[data-n="0"]{display:none}' +
    '.tgh-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2147483001;opacity:0;visibility:hidden;transition:opacity .2s,visibility 0s linear .2s}' +
    '.tgh-mask.on{opacity:1;visibility:visible;transition:opacity .2s}' +
    '.tgh-panel{position:fixed;left:50%;bottom:0;width:100%;max-width:480px;max-height:88vh;background:#fff;z-index:2147483002;border-radius:14px 14px 0 0;display:flex;flex-direction:column;transform:translate(-50%,105%);visibility:hidden;transition:transform .25s,visibility 0s linear .25s;color:#222;font:14px/1.4 Arial,sans-serif;padding-bottom:env(safe-area-inset-bottom)}' +
    '.tgh-panel.on{transform:translate(-50%,0);visibility:visible;transition:transform .25s}' +
    '.tgh-hd{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #eee;font-weight:700;font-size:16px}' +
    '.tgh-x{border:0;background:none;font-size:26px;line-height:1;cursor:pointer;color:#888;padding:0 4px}' +
    '.tgh-bd{overflow:auto;padding:12px 16px;flex:1}' +
    '.tgh-ft{padding:12px 16px;border-top:1px solid #eee}' +
    '.tgh-lbl{font-weight:700;margin:10px 0 8px}' +
    '.tgh-opts{display:flex;flex-wrap:wrap;gap:8px}' +
    '.tgh-opt{border:1px solid #ddd;background:#fff;border-radius:6px;padding:8px 10px;cursor:pointer;font-size:13px;text-align:left;color:#222}' +
    '.tgh-opt.on{border-color:' + CFG.color + ';color:' + CFG.color + ';background:#fff5f2}' +
    '.tgh-opt small{display:block;color:#888;margin-top:2px}' +
    '.tgh-qty{display:inline-flex;border:1px solid #ddd;border-radius:6px;overflow:hidden}' +
    '.tgh-qty button{width:32px;height:30px;border:0;background:#f5f5f5;cursor:pointer;font-size:16px}' +
    '.tgh-qty span{min-width:36px;text-align:center;line-height:30px}' +
    '.tgh-main{width:100%;border-radius:8px;padding:14px;font-size:15px}' +
    '.tgh-main:disabled{opacity:.5}' +
    '.tgh-item{display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #f2f2f2}' +
    '.tgh-item img{width:64px;height:80px;object-fit:cover;border-radius:6px;background:#eee;flex:none}' +
    '.tgh-item .nm{font-weight:700;font-size:13px}' +
    '.tgh-item .vr{color:#666;font-size:12px;margin:2px 0 6px}' +
    '.tgh-item .row{display:flex;justify-content:space-between;align-items:center}' +
    '.tgh-item .pr{color:' + CFG.color + ';font-weight:700}' +
    '.tgh-del{border:0;background:none;color:#999;cursor:pointer;font-size:12px;text-decoration:underline}' +
    '.tgh-sum{display:flex;justify-content:space-between;margin:4px 0}' +
    '.tgh-sum b{color:' + CFG.color + ';font-size:17px}' +
    '.tgh-note{font-size:12px;color:#888;margin:6px 0 10px}' +
    '.tgh-empty{text-align:center;color:#888;padding:30px 0}' +
    '.tgh-toast{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);background:rgba(0,0,0,.8);color:#fff;padding:12px 18px;border-radius:8px;z-index:2147483003;font:14px Arial,sans-serif;opacity:0;transition:opacity .2s;pointer-events:none}' +
    '.tgh-toast.on{opacity:1}' +
    '.tgh-strip{position:fixed;left:50%;top:0;transform:translateX(-50%);width:100%;max-width:480px;z-index:2147483000;background:#fff5f2;border-bottom:2px solid ' + CFG.color + ';color:#222;font:13px/1.4 Arial,sans-serif;padding:8px 12px;display:none}' +
    '.tgh-strip.on{display:block}';

  var P = readProduct();
  var cart = load();
  var st = { vi: 0, si: -1, q: 1 };

  var root = document.createElement('div'); root.className = 'tgh';
  root.innerHTML =
    '<style>' + css + '</style>' +
    '<div class="tgh-fab">' +
      (P ? '<button class="tgh-btn" id="tghAdd">🛒 Thêm vào giỏ</button>' : '') +
      '<button class="tgh-btn tgh-cartbtn" id="tghCart" aria-label="Giỏ hàng">🛍<span class="tgh-badge" id="tghBadge" data-n="0">0</span></button>' +
    '</div>' +
    '<div class="tgh-mask" id="tghMask"></div>' +
    '<div class="tgh-panel" id="tghSheet"></div>' +
    '<div class="tgh-panel" id="tghDrawer"></div>' +
    '<div class="tgh-strip" id="tghStrip"></div>' +
    '<div class="tgh-toast" id="tghToast"></div>';
  document.body.appendChild(root);

  var mask = $('#tghMask'), sheet = $('#tghSheet'), drawer = $('#tghDrawer');
  function closeAll() { mask.classList.remove('on'); sheet.classList.remove('on'); drawer.classList.remove('on'); }
  mask.onclick = closeAll;
  function toast(t) { var e = $('#tghToast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { e.classList.remove('on'); }, 1400); }

  function totals() {
    var sub = 0, n = 0, free = false;
    cart.forEach(function (it) { sub += it.price * it.q; n += it.q; if (it.free) free = true; });
    if (CFG.freeShipFrom && sub >= CFG.freeShipFrom) free = true;
    return { sub: sub, n: n, free: free };
  }
  function badge() { var n = totals().n, b = $('#tghBadge'); b.textContent = n; b.setAttribute('data-n', n); strip(); }

  // ----- Bảng chọn phân loại -----
  function renderSheet() {
    var v = P.variants[st.vi];
    sheet.innerHTML =
      '<div class="tgh-hd"><span>' + esc(P.name) + '</span><button class="tgh-x" data-close>×</button></div>' +
      '<div class="tgh-bd">' +
        '<div class="tgh-lbl">Phân loại</div><div class="tgh-opts">' +
        P.variants.map(function (x, i) {
          return '<button class="tgh-opt' + (i === st.vi ? ' on' : '') + '" data-v="' + i + '">' + esc(x.label) +
            '<small>' + vnd(x.price) + (x.free ? ' · Miễn ship' : '') + '</small></button>';
        }).join('') + '</div>' +
        (P.sizes.length ? '<div class="tgh-lbl">Size</div><div class="tgh-opts">' +
          P.sizes.map(function (s, i) { return '<button class="tgh-opt' + (i === st.si ? ' on' : '') + '" data-s="' + i + '">' + esc(s) + '</button>'; }).join('') +
          '</div>' : '') +
        '<div class="tgh-lbl">Số lượng</div><div class="tgh-qty"><button data-q="-1">−</button><span>' + st.q + '</span><button data-q="1">+</button></div>' +
      '</div>' +
      '<div class="tgh-ft"><button class="tgh-btn tgh-main" id="tghOk"' + (P.sizes.length && st.si < 0 ? ' disabled' : '') + '>' +
        (P.sizes.length && st.si < 0 ? 'Chọn size' : 'Thêm vào giỏ · ' + vnd(v.price * st.q)) + '</button></div>';
  }
  sheet.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-close')) return closeAll();
    if (t.dataset.v) st.vi = +t.dataset.v;
    else if (t.dataset.s) st.si = +t.dataset.s;
    else if (t.dataset.q) st.q = Math.max(1, Math.min(20, st.q + +t.dataset.q));
    else if (t.id === 'tghOk') {
      var v = P.variants[st.vi], size = P.sizes[st.si] || '';
      var ex = cart.filter(function (it) { return it.code === P.code && it.value === v.value && it.size === size; })[0];
      if (ex) ex.q += st.q;
      else cart.push({ code: P.code, name: P.name, img: P.img, url: location.pathname, value: v.value, label: v.label, price: v.price, free: v.free, size: size, q: st.q });
      save(cart); badge(); closeAll(); toast('Đã thêm vào giỏ hàng'); st.q = 1;
      return;
    } else return;
    renderSheet();
  });

  // ----- Giỏ hàng -----
  function renderDrawer() {
    var t = totals();
    var body = cart.length ? cart.map(function (it, i) {
      return '<div class="tgh-item">' + (it.img ? '<img src="' + esc(it.img) + '" alt="">' : '') + '<div style="flex:1;min-width:0">' +
        '<div class="nm">' + esc(it.code) + ' · ' + esc(it.label) + '</div>' +
        '<div class="vr">' + esc(it.size || '') + (it.free ? ' · Miễn ship' : '') + '</div>' +
        '<div class="row"><span class="pr">' + vnd(it.price) + '</span>' +
        '<span class="tgh-qty"><button data-dq="' + i + '" data-d="-1">−</button><span>' + it.q + '</span><button data-dq="' + i + '" data-d="1">+</button></span></div>' +
        '<button class="tgh-del" data-del="' + i + '">Xóa</button></div></div>';
    }).join('') : '<div class="tgh-empty">Giỏ hàng trống</div>';
    drawer.innerHTML =
      '<div class="tgh-hd"><span>Giỏ hàng (' + t.n + ')</span><button class="tgh-x" data-close>×</button></div>' +
      '<div class="tgh-bd">' + body + '</div>' +
      (cart.length ? '<div class="tgh-ft">' +
        '<div class="tgh-sum"><span>Tạm tính</span><b>' + vnd(t.sub) + '</b></div>' +
        '<div class="tgh-note">' + (t.free ? '✓ Đơn được miễn phí ship' :
          (CFG.freeShipFrom ? 'Mua thêm ' + vnd(CFG.freeShipFrom - t.sub) + ' để được miễn ship' : 'Phí ship báo khi xác nhận đơn')) + '</div>' +
        '<button class="tgh-btn tgh-main" id="tghCheckout">Đặt hàng</button></div>' : '');
  }
  drawer.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-close')) return closeAll();
    if (t.dataset.dq) { var it = cart[+t.dataset.dq]; it.q = Math.max(1, Math.min(20, it.q + +t.dataset.d)); }
    else if (t.dataset.del) cart.splice(+t.dataset.del, 1);
    else if (t.id === 'tghCheckout') return checkout();
    save(cart); badge(); renderDrawer();
  });

  function openSheet() { st.si = P.sizes.length === 1 ? 0 : st.si; renderSheet(); mask.classList.add('on'); sheet.classList.add('on'); }
  function openDrawer() { cart = load(); renderDrawer(); mask.classList.add('on'); drawer.classList.add('on'); }
  if ($('#tghAdd')) $('#tghAdd').onclick = openSheet;
  $('#tghCart').onclick = openDrawer;

  // ----- Gửi kèm đơn qua form Webcake -----
  function summary() {
    var t = totals();
    return cart.map(function (it) { return it.q + 'x ' + it.code + ' ' + it.value + (it.size ? ' [' + it.size + ']' : ''); }).join('; ') +
      ' | TỔNG ' + t.n + ' SP: ' + vnd(t.sub) + (t.free ? ' (MIỄN SHIP)' : '');
  }
  function strip() {
    var s = $('#tghStrip'), t = totals();
    if (!cart.length || !P) { s.classList.remove('on'); return; }
    s.innerHTML = '🛍 Giỏ hàng <b>' + t.n + ' sp · ' + vnd(t.sub) + '</b> sẽ được gửi kèm khi bạn bấm ĐẶT HÀNG ở form. <a href="#" id="tghStripOpen" style="color:' + CFG.color + '">Xem giỏ</a>';
    s.classList.toggle('on', !!s.dataset.show);
    var a = $('#tghStripOpen'); if (a) a.onclick = function (e) { e.preventDefault(); openDrawer(); };
  }
  function checkout() {
    closeAll();
    if (!P || !P.form) { toast('Mở trang sản phẩm để đặt hàng'); return; }
    // chọn sẵn phân loại + size của món đầu tiên thuộc trang này
    var mine = cart.filter(function (it) { return it.code === P.code; })[0];
    if (mine) {
      var r = P.variants.filter(function (v) { return v.value === mine.value; })[0];
      var re = r && document.getElementById(r.id); if (re && !re.checked) re.click();
      if (P.sizeSel && mine.size) setVal(P.sizeSel, mine.size);
    }
    $('#tghStrip').dataset.show = '1'; strip();
    var opener = formOpener();
    if (opener) opener.click(); // form nằm trong popup → bấm nút mở popup của trang
    else {
      var box = P.form.parentElement || P.form;
      window.scrollTo({ top: box.getBoundingClientRect().top + window.pageYOffset - 70, behavior: 'smooth' });
    }
    var first = $('input[name=full_name], input[name=phone_number]', P.form); if (first) setTimeout(function () { first.focus(); }, 500);
  }
  // Tìm nút Webcake mở popup chứa form (ưu tiên nút "Mua…/Đặt hàng", bỏ qua nút "Thêm vào giỏ")
  function formOpener() {
    var pop = P.form.closest('.com-popup'); if (!pop) return null;
    var pid = pop.id.replace(/^w-/, ''), vm = (window.WebcakeScript && WebcakeScript.runtime && WebcakeScript.runtime.vm) || {};
    var best = null, bestScore = -1;
    Object.keys(vm).forEach(function (id) {
      (vm[id].events || []).forEach(function (ev) {
        if (ev.action !== 'open_popup' || ev.target !== pid) return;
        var el = document.getElementById('w-' + id); if (!el) return;
        var tx = el.innerText || '', sc = (vm[id].type === 'button' ? 2 : 0) + (/mua|đặt/i.test(tx) ? 3 : 0) - (/giỏ/i.test(tx) ? 5 : 0);
        if (sc > bestScore) { bestScore = sc; best = el; }
      });
    });
    return best;
  }
  // Nút "Thêm vào giỏ hàng" có sẵn trên trang → mở bảng chọn của giỏ thay vì popup đặt hàng
  var nativeAdd = P && $$('.com-button').filter(function (b) { return /thêm\s*vào\s*giỏ/i.test(b.innerText || ''); });
  if (nativeAdd && nativeAdd.length) {
    if ($('#tghAdd')) $('#tghAdd').style.display = 'none';
    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      var b = e.target.closest('.com-button');
      if (b && nativeAdd.indexOf(b) >= 0) { e.preventDefault(); e.stopImmediatePropagation(); openSheet(); }
    }, true);
  }
  function noteField(form) {
    for (var i = 0; i < CFG.noteFields.length; i++) { var f = $('[name="' + CFG.noteFields[i] + '"]', form); if (f) return f; }
    return null;
  }
  function onSubmitIntent(e) {
    if (!P || !P.form || !cart.length) return;
    if (!P.form.contains(e.target)) return;
    if (e.type === 'click' && !e.target.closest('button[type=submit], .com-button')) return;
    var note = noteField(P.form), addr = $('input[name=address], textarea[name=address]', P.form);
    var text = summary();
    if (note) setVal(note, text);
    else if (addr) {
      var base = addr.value.split(MARK)[0];
      if (base.trim()) setVal(addr, base + MARK + text);
    }
    // xóa giỏ khi Webcake báo thành công (form bị xóa trắng / chuyển trang)
    var phone = $('input[name=phone_number]', P.form);
    clearTimeout(onSubmitIntent.t); onSubmitIntent.t = 0;
    if (!phone || !/^(\+?84|0)\d{9}$/.test(phone.value.replace(/[\s.]/g, '')) || !(addr && addr.value.trim())) return;
    onSubmitIntent.at = Date.now();
    onSubmitIntent.t = setTimeout(function () {
      if (phone && !phone.value) { cart = []; save(cart); badge(); }
    }, 4000);
  }
  document.addEventListener('click', onSubmitIntent, true);
  document.addEventListener('submit', onSubmitIntent, true);
  window.addEventListener('pagehide', function () {
    // chuyển sang trang cảm ơn sau khi bấm đặt hàng → coi như thành công
    if (onSubmitIntent.t && Date.now() - onSubmitIntent.at < 15000) { cart = []; save(cart); }
  });
  window.addEventListener('storage', function (e) { if (e.key === CFG.key) { cart = load(); badge(); } });

  badge();
})();
