/* Giỏ hàng + giao diện kiểu demo cho landing page Webcake – Thanh Thỏ (v2)
 * Dán vào Webcake (Cài đặt → HTML/JavaScript → Trước thẻ body):
 *   <script src="https://vietanh9xnd.github.io/thanhtho-gio-hang-demo/webcake-gio-hang.js" defer></script>
 *
 * - Thay khối đầu trang (section đầu tiên: ảnh/giá/tiêu đề) bằng khối kiểu demo: header có giỏ hàng,
 *   khung ảnh có nút chuyển, chọn phân loại, sản phẩm khác. Các section còn lại giữ nguyên.
 * - Tự đọc dữ liệu của trang: ảnh từ phần tử Gallery, phân loại + giá từ ô radio So_Luong ("680K"),
 *   size từ ô SIZE. Không cần nhập gì cho từng trang.
 * - Nút "Thêm vào giỏ hàng" có sẵn ở thanh dưới mở bảng chọn; "Mua với Voucher" giữ nguyên (mua 1 món).
 * - Đặt hàng giỏ: mở popup form của Webcake, điền danh sách giỏ vào ô gio_hang (hoặc nối vào địa chỉ),
 *   khách bấm ĐẶT HÀNG của Webcake → đơn về Pancake như bình thường.
 * - Thêm ?nogiohang vào link để xem trang gốc không có script.
 */
(function () {
  'use strict';
  if (window.__tghLoaded || /[?&]nogiohang\b/.test(location.search)) return;
  window.__tghLoaded = true;

  // ===== Cấu hình =====
  var CFG = {
    key: 'thanhtho_webcake_cart_v2',
    shop: 'THANH THỎ', shopSub: 'Clothing',
    freeShipFrom: 800000, shipFee: 20000, shipOld: 40000,
    noteFields: ['gio_hang', 'GIO_HANG', 'ghi_chu', 'GHI_CHU', 'note'],
    // "Sản phẩm khác" – mỗi mã là 1 link riêng
    others: [
      { code: 'TT037', name: 'Áo blazer vạt kiểu kèm chân váy nhung', from: 390000, img: '4c/2a/40/a5/01c4fe9c8f540b0f79d22a1cdbc51057fb69590604a3bddd717c2655-w:876-h:1280-l:73174-t:image/jpeg.jpg' },
      { code: 'TT036', name: 'Set áo lửng viền bèo & chân váy bút chì', from: 680000, img: 'bb/b3/f3/55/821ea90514897a97158aa87fdb01773c0b27dcbdc91768ccd3def598-w:1316-h:2048-l:240722-t:image/jpeg.jpg' },
      { code: 'TT035', name: 'Áo Blazer tôn dáng', from: 350000, img: '09/a3/07/05/23d6da50308889f14ec41df3a7d62959a44ff4de4668334f0e84bd05-w:1306-h:2048-l:178698-t:image/jpeg.jpg' },
      { code: 'TT034', name: 'Set đồ dạ Tweed phong cách sang trọng', from: 980000, img: 'b3/5f/1a/8c/138aa4d0ffa0d12d8a2a97d1dc48a118652be14fc9761c455ca2aeee-w:1260-h:2296-l:479562-t:image/jpeg.jpg' },
      { code: 'TT033', name: 'Set áo ren hoa & chân váy lụa', from: 390000, img: 'f9/ba/36/60/5769415a1605d1ae8487a1c8cbb60828c60301a095a339254222cf3e-w:1080-h:1920-l:262505-t:image/jpeg.jpg' }
    ],
    // "Mô tả sản phẩm" theo mã trang (mã không có ở đây thì lấy mô tả SEO của trang)
    desc: {
      TT037: 'Set gồm áo khoác dạ nữ dáng ngắn ngang hông kèm đai và chân váy nhung ngắn. Áo nâu socola, cúc kim loại hình trái tim; chân váy chữ A đen, phom trơn tối giản.',
      TT036: 'Set áo lửng viền bèo phối chân váy bút chì, tôn dáng, phù hợp đi làm, đi chơi.',
      TT035: 'Áo blazer form tôn dáng, tặng kèm áo 2 dây.',
      TT034: 'Set dạ Tweed sang trọng, chuẩn chất thu đông.',
      TT033: 'Set áo ren hoa nữ tính phối chân váy lụa mềm.'
    }
  };
  var MARK = ' || GIỎ HÀNG: ';
  var CDN = function (p) { return 'https://content.pancake.vn/web-media-264/fwebp80/' + p; };

  // ===== Tiện ích =====
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var vnd = function (n) { return n ? n.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'; };
  var load = function () { try { return JSON.parse(localStorage.getItem(CFG.key)) || []; } catch (e) { return []; } };
  var save = function (c) { try { localStorage.setItem(CFG.key, JSON.stringify(c)); } catch (e) {} };
  var parsePrice = function (t) {
    var m = String(t).match(/(\d{1,3}(?:[.,]\d{3})+|\d+)\s*K\b/i);
    return m ? parseInt(m[1].replace(/[.,]/g, ''), 10) * 1000 : 0;
  };
  var isFree = function (t) { return /MI[ỄE]N\s*(PH[ÍI]\s*)?SHIP|FREE\s*SHIP/i.test(t); };
  var shortName = function (t) {
    var s = String(t).replace(/\s*[:\-–]\s*\d.*$/, '').replace(/^MUA\s+/i, '').trim().toLowerCase();
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : t;
  };
  var setVal = function (el, v) {
    var d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
    if (d && d.set) d.set.call(el, v); else el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };
  var vmAll = function () { return (window.WebcakeScript && WebcakeScript.runtime && WebcakeScript.runtime.vm) || {}; };
  var smallImg = function (u) { return String(u || '').replace('https://statics.pancake.vn/web-media-264/', 'https://content.pancake.vn/web-media-264/fwebp80/'); };

  // ===== Đọc sản phẩm từ trang =====
  function readProduct() {
    var radios = $$('input[type=radio][name=So_Luong]');
    if (!radios.length) radios = $$('form input[type=radio]');
    if (!radios.length) return null;
    var form = radios[0].closest('form');
    var sizeSel = form && ($('select[name=SIZE]', form) || $('select[name=Size]', form) || $('select[name=size]', form));
    var code = (location.pathname.split('/').filter(Boolean).pop() || 'SP').toUpperCase();
    var sec = $$('.com-section').filter(function (s) { return !s.closest('.com-popup'); })[0] || null;
    var vm = vmAll(), imgs = [];
    Object.keys(vm).forEach(function (id) {
      if (vm[id].type === 'gallery' && sec && sec.querySelector('#w-' + id))
        ((vm[id].specials || {}).media || []).forEach(function (m) { if (m.type !== 'video' && m.link) imgs.push(smallImg(m.link)); });
    });
    if (!imgs.length) { var og = $('meta[property="og:image"]'); if (og) imgs.push(og.content); }
    var txt = sec ? sec.innerText.replace(/\s+/g, ' ') : '';
    var old = (txt.match(/(\d{1,3}(?:[.,]\d{3})+)\s*đ/) || [])[1];
    var variants = radios.map(function (r) {
      return { id: r.id, value: r.value, label: shortName(r.value), price: parsePrice(r.value), free: isFree(r.value) };
    });
    return {
      code: code,
      name: (document.title || code).trim(),
      imgs: imgs,
      form: form,
      sec: sec,
      sizeSel: sizeSel,
      old: old ? parseInt(old.replace(/[.,]/g, ''), 10) : 0,
      rating: (txt.match(/(\d[.,]\d)\s*\/\s*5\s*\(([^)]+)\)/) || []).slice(1),
      sold: (txt.match(/Đã bán\s*([\d.,]+\s*K?)/i) || [])[1] || '',
      variants: variants,
      sizes: sizeSel ? $$('option', sizeSel).map(function (o) { return o.value; }).filter(Boolean) : []
    };
  }

  var P = readProduct();
  var cart = load();

  // ===== CSS (mọi class có tiền tố tt- để không đụng CSS của Webcake) =====
  var css = '' +
    '.tt,.tt *{box-sizing:border-box;margin:0;padding:0}' +
    '.tt{--b:#ee4d2d;--bd:#d73211;--bs:#fff1ee;--ink:#222;--mu:#757575;--ln:#eee;--bg:#f5f5f5;--ok:#00a86b;color:var(--ink);font-size:14px;line-height:1.45;font-family:inherit}' +
    '.tt button{font:inherit;cursor:pointer;border:0;background:none;color:inherit;text-align:inherit}' +
    '.tt-top{max-width:420px;margin:0 auto;background:var(--bg);position:relative;z-index:0;isolation:isolate}' +
    '.tt-hdr{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:10px;padding:10px 14px;background:#fff;border-bottom:1px solid var(--ln)}' +
    '.tt-logo{font-weight:800;letter-spacing:.3px;flex:1;font-size:15px}.tt-logo span{color:var(--b)}' +
    '.tt-cb{position:relative;width:38px;height:38px;border-radius:50%;display:grid;place-items:center}' +
    '.tt-cb svg{width:24px;height:24px;stroke:var(--b)}' +
    '.tt-badge{position:absolute;top:1px;right:0;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--b);color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;border:2px solid #fff}' +
    '.tt-badge[hidden]{display:none}' +
    '.tt-bump{animation:ttbump .45s ease}@keyframes ttbump{30%{transform:scale(1.35)}60%{transform:scale(.9)}100%{transform:scale(1)}}' +
    '.tt-gal{position:relative;background:#fff}' +
    '.tt-slides{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;scroll-behavior:smooth;cursor:grab}' +
    '.tt-slides::-webkit-scrollbar{display:none}' +
    '.tt-slides img{flex:0 0 100%;width:100%;aspect-ratio:3/4;object-fit:cover;scroll-snap-align:start;background:#eee;display:block}' +
    '.tt-gnav{position:absolute;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.85)!important;color:#333;font-size:24px!important;line-height:34px;text-align:center!important;box-shadow:0 1px 4px rgba(0,0,0,.25);z-index:2}' +
    '.tt-gnav.p{left:10px}.tt-gnav.n{right:10px}' +
    '.tt-dots{position:absolute;left:0;right:0;bottom:16px;display:flex;justify-content:center;gap:6px;pointer-events:none}' +
    '.tt-dots i{width:7px;height:7px;border-radius:4px;background:rgba(255,255,255,.6);box-shadow:0 0 2px rgba(0,0,0,.4);transition:width .2s}' +
    '.tt-dots i.on{background:#fff;width:18px}' +
    '.tt-cnt{position:absolute;right:12px;bottom:12px;background:rgba(0,0,0,.55);color:#fff;font-size:12px;padding:2px 10px;border-radius:12px}' +
    '.tt-blk{background:#fff;padding:14px;margin-bottom:8px}' +
    '.tt-pr{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}' +
    '.tt-price{color:var(--b);font-size:24px;font-weight:700}' +
    '.tt-old{color:var(--mu);text-decoration:line-through;font-size:14px}' +
    '.tt-off{background:var(--bs);color:var(--b);font-size:12px;font-weight:700;padding:1px 6px;border-radius:3px}' +
    '.tt-title{font-size:16px;font-weight:600;margin-top:6px}' +
    '.tt-meta{display:flex;gap:12px;color:var(--mu);font-size:13px;margin-top:6px;flex-wrap:wrap}.tt-meta .s{color:#ffb400}' +
    '.tt-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0;border-top:1px solid var(--ln);width:100%}' +
    '.tt-row:first-child{border-top:0;padding-top:0}' +
    '.tt-row .k{color:var(--mu);min-width:84px}.tt-row .v{flex:1}.tt-row .c{color:var(--mu)}' +
    '.tt-free{color:var(--ok);font-weight:600}' +
    '.tt-st{font-weight:700;font-size:15px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center}' +
    '.tt-st small{color:var(--mu);font-weight:400;font-size:12px}' +
    '.tt-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}' +
    '.tt-pc{background:#fff;border:1px solid var(--ln);border-radius:6px;overflow:hidden;display:flex;flex-direction:column;color:inherit;text-decoration:none}' +
    '.tt-pc img{display:block;width:100%;aspect-ratio:3/4;object-fit:cover;background:#eee}' +
    '.tt-pc .in{padding:8px;display:flex;flex-direction:column;gap:4px;flex:1}' +
    '.tt-pc .nm{font-size:13px;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:34px}' +
    '.tt-pc .p{color:var(--b);font-weight:700}' +
    '.tt-pc .go{margin-top:auto;border:1px solid var(--b);color:var(--b);border-radius:4px;padding:6px;font-size:12.5px;font-weight:600;text-align:center}' +
    '.tt-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2147483001;opacity:0;visibility:hidden;transition:opacity .2s,visibility 0s linear .2s}' +
    '.tt-ov.on{opacity:1;visibility:visible;transition:opacity .2s}' +
    '.tt-sheet{position:fixed;left:50%;bottom:0;width:100%;max-width:480px;background:#fff;z-index:2147483002;border-radius:12px 12px 0 0;transform:translate(-50%,105%);visibility:hidden;transition:transform .25s,visibility 0s linear .25s;max-height:88vh;display:flex;flex-direction:column;padding-bottom:env(safe-area-inset-bottom)}' +
    '.tt-sheet.on{transform:translate(-50%,0);visibility:visible;transition:transform .25s}' +
    '.tt-sht{display:flex;gap:12px;padding:14px;border-bottom:1px solid var(--ln);position:relative}' +
    '.tt-sht img{width:96px;height:120px;object-fit:cover;border-radius:4px;margin-top:-40px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.15);background:#eee}' +
    '.tt-sht .tt-price{font-size:20px}.tt-sht .sm{color:var(--mu);font-size:12px}' +
    '.tt-x{position:absolute;right:10px;top:8px;width:32px;height:32px;font-size:22px!important;color:var(--mu)!important;text-align:center!important}' +
    '.tt-shb{padding:14px;overflow:auto}' +
    '.tt-lbl{font-weight:600;margin:4px 0 8px}' +
    '.tt-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}' +
    '.tt-chip{border:1px solid #ddd!important;background:#fafafa!important;border-radius:4px;padding:7px 12px!important;font-size:13px}' +
    '.tt-chip small{display:block;color:var(--mu);font-size:11.5px}' +
    '.tt-chip.on{border-color:var(--b)!important;color:var(--b)!important;background:var(--bs)!important}.tt-chip.on small{color:var(--b)}' +
    '.tt-qr{display:flex;justify-content:space-between;align-items:center;padding:6px 0 4px}' +
    '.tt-step{display:inline-flex;border:1px solid #ddd;border-radius:4px;overflow:hidden}' +
    '.tt-step button{width:32px;height:30px;font-size:16px;color:#555;text-align:center!important}' +
    '.tt-step button:disabled{color:#ccc;cursor:default}' +
    '.tt-step span{width:40px;display:grid;place-items:center;border-left:1px solid #ddd;border-right:1px solid #ddd;font-weight:600}' +
    '.tt-err{color:var(--b);font-size:12.5px;min-height:18px;margin-top:4px}' +
    '.tt-shf{padding:10px 14px 14px;border-top:1px solid var(--ln)}' +
    '.tt-btn{width:100%;background:var(--b)!important;color:#fff!important;font-weight:700;padding:12px;border-radius:4px;font-size:15px;text-align:center!important}' +
    '.tt-btn.gh{background:#fff!important;color:var(--b)!important;border:1px solid var(--b)!important}' +
    '.tt-cart{position:fixed;top:0;bottom:0;left:50%;width:100%;max-width:480px;z-index:2147483003;background:var(--bg);transform:translateX(calc(-50% + 100vw));visibility:hidden;transition:transform .25s ease,visibility 0s linear .25s;display:flex;flex-direction:column;box-shadow:0 0 24px rgba(0,0,0,.12)}' +
    '.tt-cart.on{transform:translateX(-50%);visibility:visible;transition:transform .25s ease,visibility 0s}' +
    '.tt-ch{display:flex;align-items:center;gap:8px;padding:12px 10px;background:#fff;border-bottom:1px solid var(--ln)}' +
    '.tt-ch .bk{width:34px;height:34px;font-size:22px!important;color:var(--b)!important;text-align:center!important}' +
    '.tt-ch h2{font-size:16px;flex:1;font-weight:700}' +
    '.tt-cbd{flex:1;overflow:auto;padding-bottom:10px}' +
    '.tt-ship{background:#fff;padding:10px 14px;margin-bottom:8px;font-size:13px}' +
    '.tt-prog{height:6px;background:#f0f0f0;border-radius:3px;margin-top:6px;overflow:hidden}' +
    '.tt-prog i{display:block;height:100%;background:linear-gradient(90deg,#ff7a45,var(--b));border-radius:3px}' +
    '.tt-ship.ok{color:var(--ok);font-weight:600}.tt-ship.ok .tt-prog i{background:var(--ok)}' +
    '.tt-it{background:#fff;display:flex;gap:10px;padding:12px 14px;border-bottom:1px solid var(--ln)}' +
    '.tt-it img{width:72px;height:92px;object-fit:cover;border-radius:4px;background:#eee;flex:none}' +
    '.tt-it .inf{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}' +
    '.tt-it .nm{font-size:13.5px;font-weight:600;line-height:1.3}' +
    '.tt-it .var{font-size:12px;color:var(--mu);background:#f7f7f7;padding:2px 6px;border-radius:3px;align-self:flex-start}' +
    '.tt-it .src{font-size:11px;color:#999}' +
    '.tt-it .bot{display:flex;justify-content:space-between;align-items:center;margin-top:auto}' +
    '.tt-it .pr{color:var(--b);font-weight:700}' +
    '.tt-it .rm{color:var(--mu)!important;font-size:12px;text-decoration:underline;align-self:flex-start}' +
    '.tt-empty{text-align:center;padding:60px 20px;color:var(--mu)}' +
    '.tt-sum{background:#fff;padding:12px 14px;border-top:1px solid var(--ln);padding-bottom:calc(12px + env(safe-area-inset-bottom))}' +
    '.tt-sum .l{display:flex;justify-content:space-between;font-size:13.5px;padding:2px 0;color:#444}' +
    '.tt-sum .l.t{font-size:16px;font-weight:700;color:var(--ink);padding-top:6px}.tt-sum .l.t b{color:var(--b)}' +
    '.tt-sum .tt-btn{margin-top:10px}' +
    '.tt-top{padding-bottom:64px}' +
    '.tt-form{background:#fff;padding:14px;margin-bottom:8px}.tt-form h3{font-size:14px;margin-bottom:10px;font-weight:700}' +
    '.tt-fld{margin-bottom:10px}' +
    '.tt-fld input,.tt-fld textarea{width:100%;border:1px solid #ddd;border-radius:4px;padding:10px 12px;outline:none;background:#fff;color:var(--ink);font:inherit;font-size:14px}' +
    '.tt-fld input:focus,.tt-fld textarea:focus{border-color:var(--b)}' +
    '.tt-fld.bad input{border-color:var(--b)}.tt-fld .msg{color:var(--b);font-size:12px;margin-top:3px;display:none}.tt-fld.bad .msg{display:block}' +
    '.tt-cod{display:flex;align-items:center;gap:8px;border:1px solid var(--b);background:var(--bs);border-radius:4px;padding:10px 12px;color:var(--b);font-weight:600}' +
    '.tt-mini{font-size:13px}.tt-mini .r{display:flex;justify-content:space-between;gap:10px;padding:4px 0;border-bottom:1px dashed #eee}.tt-mini .r:last-child{border-bottom:0}' +
    '.tt-ok{text-align:center;padding:30px 18px}.tt-ok .tick{width:64px;height:64px;border-radius:50%;background:var(--ok);color:#fff;font-size:34px;display:grid;place-items:center;margin:0 auto 12px}' +
    '.tt-ok h3{font-size:17px;font-weight:700}.tt-ok .sm{color:var(--mu);margin-top:4px}' +
    '.tt-ok pre{text-align:left;white-space:pre-wrap;background:#fff;border:1px solid #eee;border-radius:6px;padding:12px;font-size:12.5px;margin:14px 0;font-family:inherit}' +
    '.tt-load{position:fixed;inset:0;z-index:2147483005;background:rgba(255,255,255,.92);display:none;align-items:center;justify-content:center;font-weight:600;color:#333}' +
    '.tt-load.on{display:flex}.tt-load div{display:flex;flex-direction:column;align-items:center;gap:12px}' +
    '.tt-load i{width:36px;height:36px;border:3px solid #eee;border-top-color:#ee4d2d;border-radius:50%;animation:ttspin .8s linear infinite}@keyframes ttspin{to{transform:rotate(360deg)}}' +
    '.tt-desc h3{font-size:14px;margin-bottom:8px;font-weight:700}.tt-desc p,.tt-desc li{color:#444;font-size:13.5px}.tt-desc ul{padding-left:18px!important;margin:8px 0!important}' +
    '.tt-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:0;width:100%;max-width:420px;height:56px;display:flex;background:#fff;border-top:1px solid #eee;z-index:30;padding-bottom:env(safe-area-inset-bottom)}' +
    '.tt-bar .ico{width:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;color:#555;gap:2px;text-align:center!important}' +
    '.tt-bar .ico svg{width:20px;height:20px;stroke:#555}' +
    '.tt-bar .add{flex:1;background:#fff3f0!important;color:var(--b)!important;font-weight:700;font-size:13px;line-height:1.2;border-left:1px solid #eee!important;text-align:center!important}' +
    '.tt-bar .buy{flex:1;background:var(--b)!important;color:#fff!important;font-weight:700;font-size:14px;text-align:center!important}' +
    '.tt-toast{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%) scale(.9);background:rgba(0,0,0,.78);color:#fff;padding:16px 22px;border-radius:8px;text-align:center;z-index:2147483004;opacity:0;pointer-events:none;transition:all .2s;min-width:200px;font-size:14px}' +
    '.tt-toast.on{opacity:1;transform:translate(-50%,-50%) scale(1)}.tt-toast .a{font-size:28px;line-height:1}.tt-toast .b{margin-top:6px}';

  var CART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';

  // ===== Khung chung: lớp phủ, bảng chọn, giỏ hàng, thông báo =====
  var root = document.createElement('div'); root.className = 'tt';
  root.innerHTML = '<style>' + css + '</style>' +
    '<div class="tt-ov" id="ttOv"></div>' +
    '<section class="tt-sheet" id="ttSheet"></section>' +
    '<section class="tt-cart" id="ttCart"><div class="tt-ch"><button class="bk" id="ttBack" aria-label="Quay lại">‹</button><h2 id="ttCTitle">Giỏ hàng</h2></div><div class="tt-cbd" id="ttCBody"></div><div class="tt-sum" id="ttCSum"></div></section>' +
    '<div class="tt-toast" id="ttToast"><div class="a" id="ttTA">✓</div><div class="b" id="ttTB"></div></div>';
  document.body.appendChild(root);

  function toast(a, b) { $('#ttTA').textContent = a; $('#ttTB').textContent = b; var t = $('#ttToast'); t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 1300); }
  function totals() {
    var sub = 0, n = 0, free = false;
    cart.forEach(function (it) { sub += it.price * it.q; n += it.q; if (it.free) free = true; });
    if (CFG.freeShipFrom && sub >= CFG.freeShipFrom) free = true;
    var ship = cart.length ? (free ? 0 : CFG.shipFee) : 0;
    return { sub: sub, n: n, free: free, ship: ship, total: sub + ship };
  }
  function badge(bump) {
    var n = totals().n;
    $$('.tt-badge').forEach(function (b) {
      b.hidden = !n; b.textContent = n > 99 ? '99+' : n;
      if (bump) { b.classList.remove('tt-bump'); void b.offsetWidth; b.classList.add('tt-bump'); }
    });
  }

  // ===== Khối đầu trang kiểu demo (thay section đầu tiên) =====
  function renderTop() {
    if (!P || !P.sec) return;
    // giá hiển thị = giá phân loại đầu tiên (giống giá to trên trang gốc), giá gạch = giá gốc của trang
    var low = (P.variants.filter(function (v) { return v.price; })[0] || {}).price || 0;
    var off = P.old && low ? Math.round((1 - low / P.old) * 100) : 0;
    var others = CFG.others.filter(function (o) { return o.code !== P.code; });
    var hasFree = P.variants.some(function (v) { return v.free; });
    var top = document.createElement('div'); top.className = 'tt tt-top'; top.id = 'ttTop';
    top.innerHTML =
      '<header class="tt-hdr"><div class="tt-logo">' + esc(CFG.shop) + ' <span>' + esc(CFG.shopSub) + '</span></div>' +
        '<button class="tt-cb" data-cart aria-label="Mở giỏ hàng">' + CART_SVG + '<span class="tt-badge" hidden>0</span></button></header>' +
      (P.imgs.length ? '<div class="tt-gal"><div class="tt-slides" id="ttSl">' +
        P.imgs.map(function (s, i) { return '<img src="' + esc(s) + '" alt="' + esc(P.name) + ' ' + (i + 1) + '"' + (i ? ' loading="lazy"' : '') + '>'; }).join('') + '</div>' +
        (P.imgs.length > 1 ? '<button class="tt-gnav p" id="ttGP" aria-label="Ảnh trước">‹</button><button class="tt-gnav n" id="ttGN" aria-label="Ảnh sau">›</button><div class="tt-dots" id="ttDots">' +
          P.imgs.map(function (_, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join('') + '</div>' : '') +
        '<div class="tt-cnt" id="ttCnt">1/' + P.imgs.length + '</div></div>' : '') +
      '<div class="tt-blk"><div class="tt-pr"><span class="tt-price">' + vnd(low) + '</span>' +
        (P.old ? '<span class="tt-old">' + vnd(P.old) + '</span>' : '') + (off > 0 ? '<span class="tt-off">-' + off + '%</span>' : '') + '</div>' +
        '<div class="tt-title">' + esc(P.name) + '</div>' +
        '<div class="tt-meta">' + (P.rating.length ? '<span><span class="s">★</span> ' + esc(P.rating[0]) + '/5 (' + esc(P.rating[1]) + ')</span>' : '') +
          (P.sold ? '<span>Đã bán ' + esc(P.sold) + '</span>' : '') + '<span>Mã: ' + esc(P.code) + '</span></div></div>' +
      '<div class="tt-blk">' +
        '<div class="tt-row"><span class="k">Thanh toán</span><span class="v">Thanh toán khi nhận hàng (COD)</span></div>' +
        '<div class="tt-row"><span class="k">Vận chuyển</span><span class="v">' + (CFG.shipOld ? '<s style="color:#999">' + vnd(CFG.shipOld) + '</s> ' : '') + vnd(CFG.shipFee) +
          ' · <span class="tt-free">Miễn phí đơn từ ' + vnd(CFG.freeShipFrom) + (hasFree ? ' hoặc mua set' : '') + '</span></span></div>' +
        '<div class="tt-row"><span class="k">Đổi trả</span><span class="v">Kiểm tra hàng trước khi thanh toán</span></div>' +
        '<button class="tt-row" data-pick><span class="k">Phân loại</span><span class="v">' + P.variants.map(function (v) { return esc(v.label); }).join(', ') +
          (P.sizes.length ? ' · <b>' + P.sizes.length + ' size</b>' : '') + '</span><span class="c">›</span></button></div>' +
      '<div class="tt-blk tt-desc"><h3>Mô tả sản phẩm</h3><p>' + esc(CFG.desc[P.code] || ($('meta[name=description]') || {}).content || P.name) + '</p>' +
        '<ul>' + P.variants.map(function (v) { return '<li>' + esc(v.label) + ': <b>' + vnd(v.price) + '</b>' + (v.free ? ' + miễn ship' : '') + '</li>'; }).join('') + '</ul>' +
        (P.sizes.length ? '<p><b>Bảng size:</b> ' + P.sizes.map(esc).join(' · ') + '</p>' : '') + '</div>' +
      (others.length ? '<div class="tt-blk"><div class="tt-st">Sản phẩm khác của shop <small>Gộp nhiều món vào 1 đơn</small></div><div class="tt-grid">' +
        others.map(function (o) {
          return '<a class="tt-pc" href="/' + esc(o.code) + '"><img src="' + esc(CDN(o.img)) + '" alt="" loading="lazy"><div class="in"><div class="nm">' + esc(o.name) +
            '</div><div class="p">từ ' + vnd(o.from) + '</div><div class="go">Xem & thêm vào giỏ</div></div></a>';
        }).join('') + '</div></div>' : '');
    P.sec.parentNode.insertBefore(top, P.sec);
    // ẩn toàn bộ section của Webcake (popup đặt hàng vẫn giữ để dùng form)
    $$('.com-section').forEach(function (s) { if (!s.closest('.com-popup') && !s.contains(top)) s.style.display = 'none'; });
    document.body.style.background = '#f5f5f5';
    // thanh dưới kiểu demo
    var bar = document.createElement('nav'); bar.className = 'tt tt-bar';
    bar.innerHTML =
      '<button class="ico" data-native="cửa hàng"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 9l1-5h16l1 5M4 9v11h16V9M3 9h18"/></svg>Cửa hàng</button>' +
      '<button class="ico" data-native="trò chuyện"><svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>Trò chuyện</button>' +
      '<button class="add" data-mode="add">Thêm vào<br>Giỏ hàng</button><button class="buy" data-mode="buy">Mua ngay</button>';
    document.body.appendChild(bar);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.mode) return openSheet(b.dataset.mode);
      // "Cửa hàng"/"Trò chuyện": chạy đúng hành động của nút gốc trên trang Webcake
      var key = b.dataset.native, orig = $$('[id^="w-"]').filter(function (el) {
        return !el.closest('.tt') && (el.innerText || '').trim().toLowerCase() === key && (vmAll()[el.id.slice(2)] || {}).events && vmAll()[el.id.slice(2)].events.length;
      })[0];
      if (orig) orig.click(); else toast('ℹ', 'Liên hệ shop qua hotline hoặc Messenger');
    });

    var sl = $('#ttSl');
    if (sl) {
      var n = P.imgs.length, gT = 0, gAt = 0;
      var gIdx = function () { return Date.now() - gAt < 700 ? gT : Math.round(sl.scrollLeft / sl.clientWidth); };
      var gTo = function (i) { gT = (i + n) % n; gAt = Date.now(); sl.scrollTo({ left: gT * sl.clientWidth }); };
      sl.addEventListener('scroll', function () {
        var i = gIdx(); $('#ttCnt').textContent = (i + 1) + '/' + n;
        $$('#ttDots i').forEach(function (d, k) { d.classList.toggle('on', k === i); });
      }, { passive: true });
      if ($('#ttGP')) { $('#ttGP').onclick = function () { gTo(gIdx() - 1); }; $('#ttGN').onclick = function () { gTo(gIdx() + 1); }; }
      var gx = null;
      sl.addEventListener('mousedown', function (e) { gx = e.clientX; e.preventDefault(); });
      window.addEventListener('mouseup', function (e) { if (gx === null) return; var d = e.clientX - gx; gx = null; if (Math.abs(d) > 40) gTo(gIdx() + (d < 0 ? 1 : -1)); });
    }
    $('[data-pick]', top).onclick = function () { openSheet(); };
  }

  // ===== Bảng chọn phân loại =====
  var sh = { vi: -1, si: -1, q: 1 };
  var sheet = $('#ttSheet'), ov = $('#ttOv');
  function openSheet(mode) {
    sh = { vi: P.variants.length === 1 ? 0 : -1, si: P.sizes.length === 1 ? 0 : -1, q: 1, mode: mode === 'buy' ? 'buy' : 'add' };
    renderSheet(); ov.classList.add('on'); sheet.classList.add('on');
  }
  function closeAll() { ov.classList.remove('on'); sheet.classList.remove('on'); }
  ov.onclick = closeAll;
  function renderSheet() {
    var v = P.variants[sh.vi], prices = P.variants.map(function (x) { return x.price; }).filter(Boolean);
    var priceTxt = v ? vnd(v.price * sh.q) : (prices.length ? vnd(Math.min.apply(null, prices)) + ' – ' + vnd(Math.max.apply(null, prices)) : '');
    sheet.innerHTML =
      '<div class="tt-sht">' + (P.imgs[0] ? '<img src="' + esc(P.imgs[0]) + '" alt="">' : '') +
        '<div><div class="tt-price">' + priceTxt + '</div><div class="sm">' + (P.old ? '<s>' + vnd(P.old) + '</s> · ' : '') + esc(P.name) + '</div>' +
        '<div class="sm">' + esc([v && v.label, P.sizes[sh.si]].filter(Boolean).join(' · ') || 'Chọn phân loại & size') + '</div></div>' +
        '<button class="tt-x" data-close aria-label="Đóng">×</button></div>' +
      '<div class="tt-shb"><div class="tt-lbl">Phân loại</div><div class="tt-chips">' +
        P.variants.map(function (x, i) {
          return '<button class="tt-chip' + (i === sh.vi ? ' on' : '') + '" data-v="' + i + '">' + esc(x.label) + '<small>' + vnd(x.price) + (x.free ? ' · miễn ship' : '') + '</small></button>';
        }).join('') + '</div>' +
        (P.sizes.length ? '<div class="tt-lbl">Kích cỡ</div><div class="tt-chips">' +
          P.sizes.map(function (s, i) { return '<button class="tt-chip' + (i === sh.si ? ' on' : '') + '" data-s="' + i + '">' + esc(s) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="tt-qr"><div class="tt-lbl" style="margin:0">Số lượng</div><div class="tt-step"><button data-q="-1"' + (sh.q <= 1 ? ' disabled' : '') + '>−</button><span>' + sh.q +
          '</span><button data-q="1"' + (sh.q >= 10 ? ' disabled' : '') + '>+</button></div></div>' +
        '<div class="tt-err" id="ttErr"></div></div>' +
      '<div class="tt-shf"><button class="tt-btn" id="ttOk">Thêm vào giỏ hàng</button></div>';
  }
  sheet.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.hasAttribute('data-close')) return closeAll();
    if (t.dataset.v) sh.vi = +t.dataset.v;
    else if (t.dataset.s) sh.si = +t.dataset.s;
    else if (t.dataset.q) sh.q = Math.max(1, Math.min(10, sh.q + +t.dataset.q));
    else if (t.id === 'ttOk') {
      if (sh.vi < 0) { $('#ttErr').textContent = 'Vui lòng chọn phân loại'; return; }
      if (P.sizes.length && sh.si < 0) { $('#ttErr').textContent = 'Vui lòng chọn size'; return; }
      var v = P.variants[sh.vi], size = P.sizes[sh.si] || '';
      var ex = cart.filter(function (it) { return it.code === P.code && it.value === v.value && it.size === size; })[0];
      if (ex) ex.q = Math.min(10, ex.q + sh.q);
      else cart.push({ code: P.code, name: P.name, img: P.imgs[0] || '', value: v.value, label: v.label, price: v.price, free: v.free, size: size, q: sh.q });
      save(cart); closeAll(); badge(true);
      if (sh.mode === 'buy') openCart('checkout'); else toast('✓', 'Đã thêm vào giỏ hàng');
      return;
    } else return;
    renderSheet();
  });

  // ===== Giỏ hàng =====
  var cartEl = $('#ttCart'), view = 'cart', draft = {};
  function openCart(v) { cart = load(); view = v || 'cart'; renderCart(); cartEl.classList.add('on'); }
  $('#ttBack').onclick = function () {
    if (view === 'checkout') { view = 'cart'; renderCart(); }
    else { cartEl.classList.remove('on'); view = 'cart'; }
  };
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-cart]')) openCart(); });
  function sumHtml(t, btn) {
    return '<div class="l"><span>Tạm tính (' + t.n + ' sản phẩm)</span><span>' + vnd(t.sub) + '</span></div>' +
      '<div class="l"><span>Phí vận chuyển</span><span>' + (t.ship ? vnd(t.ship) : '<span class="tt-free">Miễn phí</span>') + '</span></div>' +
      '<div class="l t"><span>Tổng thanh toán</span><b>' + vnd(t.total) + '</b></div>' + btn;
  }
  function renderCart() {
    var t = totals(), body = $('#ttCBody'), sum = $('#ttCSum');
    if (view === 'done') return;
    $('#ttCTitle').textContent = 'Giỏ hàng' + (t.n ? ' (' + t.n + ')' : '');
    if (cart.length && view === 'checkout') return renderCheckout(t, body, sum);
    if (!cart.length) {
      body.innerHTML = '<div class="tt-empty">' + CART_SVG.replace('<svg', '<svg style="width:72px;height:72px;stroke:#ccc;margin-bottom:10px"') +
        '<p>Giỏ hàng đang trống</p><button class="tt-btn gh" style="margin-top:14px;width:auto;padding:10px 22px" data-shop>Tiếp tục mua sắm</button></div>';
      sum.style.display = 'none'; return;
    }
    sum.style.display = '';
    var need = CFG.freeShipFrom - t.sub, pct = Math.min(100, t.sub / CFG.freeShipFrom * 100);
    body.innerHTML = (t.free
        ? '<div class="tt-ship ok">✓ Đơn hàng được MIỄN PHÍ VẬN CHUYỂN<div class="tt-prog"><i style="width:100%"></i></div></div>'
        : '<div class="tt-ship">Mua thêm <b style="color:var(--b)">' + vnd(need) + '</b> để được <b>miễn phí vận chuyển</b><div class="tt-prog"><i style="width:' + pct + '%"></i></div></div>') +
      cart.map(function (it, i) {
        return '<div class="tt-it">' + (it.img ? '<img src="' + esc(it.img) + '" alt="">' : '') + '<div class="inf">' +
          '<div class="nm">' + esc(it.name) + '</div><div class="var">' + esc(it.label) + (it.size ? ' · ' + esc(it.size) : '') + '</div>' +
          '<div class="src">/' + esc(it.code) + ' · ' + vnd(it.price) + '/sp' + (it.free ? ' · miễn ship' : '') + '</div>' +
          '<div class="bot"><span class="pr">' + vnd(it.price * it.q) + '</span><div class="tt-step"><button data-d="-1" data-i="' + i + '"' + (it.q <= 1 ? ' disabled' : '') +
          '>−</button><span>' + it.q + '</span><button data-d="1" data-i="' + i + '"' + (it.q >= 10 ? ' disabled' : '') + '>+</button></div></div></div>' +
          '<button class="rm" data-rm="' + i + '">Xoá</button></div>';
      }).join('');
    sum.innerHTML = sumHtml(t, '<button class="tt-btn" id="ttCheckout">Đặt hàng</button>');
  }
  // ----- Trang "Thông tin đặt hàng" (giống bản demo) -----
  function renderCheckout(t, body, sum) {
    $('#ttCTitle').textContent = 'Thông tin đặt hàng';
    var fld = function (id, name, ph, type, msg) {
      return '<div class="tt-fld" id="' + id + '"><input name="' + name + '" type="' + type + '" placeholder="' + ph + '" value="' + esc(draft[name] || '') + '">' +
        '<div class="msg">' + msg + '</div></div>';
    };
    body.innerHTML =
      '<form class="tt-form" id="ttCo" novalidate><h3>Địa chỉ nhận hàng</h3>' +
        fld('ttFN', 'full_name', 'Họ và tên', 'text', 'Vui lòng nhập họ tên') +
        fld('ttFP', 'phone_number', 'Số điện thoại', 'tel', 'Số điện thoại không hợp lệ') +
        fld('ttFA', 'address', 'Địa chỉ: số nhà / thôn / xóm, phường/xã, tỉnh', 'text', 'Vui lòng nhập địa chỉ') +
        '<div class="tt-fld"><textarea name="note" rows="2" placeholder="Ghi chú cho shop (không bắt buộc)">' + esc(draft.note || '') + '</textarea></div></form>' +
      '<div class="tt-form"><h3>Phương thức thanh toán</h3><div class="tt-cod">💵 Thanh toán khi nhận hàng (COD)</div></div>' +
      '<div class="tt-form tt-mini"><h3>Sản phẩm (' + t.n + ')</h3>' + cart.map(function (it) {
        return '<div class="r"><span>' + esc(it.name) + ' — ' + esc(it.label) + (it.size ? ', ' + esc(it.size) : '') + ' × ' + it.q + '</span><b>' + vnd(it.price * it.q) + '</b></div>';
      }).join('') + '</div>';
    sum.innerHTML = sumHtml(t, '<button class="tt-btn" id="ttPlace">Xác nhận đặt hàng · ' + vnd(t.total) + '</button>');
    $('#ttCo').oninput = function () { $$('#ttCo [name]').forEach(function (i) { draft[i.name] = i.value; }); };
  }
  function renderDone(info) {
    view = 'done';
    $('#ttCTitle').textContent = 'Đặt hàng thành công';
    $('#ttCBody').innerHTML = '<div class="tt-ok"><div class="tick">✓</div><h3>Cảm ơn bạn đã đặt hàng!</h3>' +
      '<p class="sm">Shop sẽ gọi xác nhận trong thời gian sớm nhất.</p><pre>' + esc(info) + '</pre>' +
      '<button class="tt-btn" data-again>Tiếp tục mua sắm</button></div>';
    $('#ttCSum').style.display = 'none';
  }
  cartEl.addEventListener('click', function (e) {
    var t = e.target.closest('button'); if (!t) return;
    if (t.dataset.d) { var it = cart[+t.dataset.i]; it.q = Math.max(1, Math.min(10, it.q + +t.dataset.d)); }
    else if (t.dataset.rm) cart.splice(+t.dataset.rm, 1);
    else if (t.hasAttribute('data-shop') || t.hasAttribute('data-again')) { cartEl.classList.remove('on'); view = 'cart'; return; }
    else if (t.id === 'ttCheckout') { view = 'checkout'; renderCart(); return; }
    else if (t.id === 'ttPlace') { placeOrder(); return; }
    else return;
    save(cart); badge(); renderCart();
  });

  // ===== Đặt hàng qua form Webcake =====
  function summary() {
    var t = totals();
    return cart.map(function (it) { return it.q + 'x ' + it.code + ' ' + it.value + (it.size ? ' [' + it.size + ']' : ''); }).join('; ') +
      ' | TỔNG ' + t.n + ' SP: ' + vnd(t.total) + (t.free ? ' (MIỄN SHIP)' : ' (gồm ship ' + vnd(t.ship) + ')');
  }
  function noteField(form) {
    for (var i = 0; i < CFG.noteFields.length; i++) { var f = $('[name="' + CFG.noteFields[i] + '"]', form); if (f) return f; }
    return null;
  }
  // nút Webcake mở popup chứa form (ưu tiên "Mua…/Đặt…", bỏ qua "Thêm vào giỏ")
  function formOpener() {
    var pop = P.form.closest('.com-popup'); if (!pop) return null;
    var pid = pop.id.replace(/^w-/, ''), vm = vmAll(), best = null, bestScore = -1;
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
  // ----- Xác nhận đặt hàng: kiểm tra, rồi gửi ngầm qua form Webcake (đơn về Pancake) -----
  var sending = false;
  function phoneRe() {
    var vm = vmAll(), re = null;
    Object.keys(vm).forEach(function (id) { var sp = vm[id].specials || {}; if (sp.phone_validator) re = sp.phone_validator; });
    try { return new RegExp(re || '^(\\+84|84|0)(3([2-9])|5(2|5|6|8|9)|7(0|[6-9])|8([1-9])|9([0-4]|[6-9]))([0-9]{7})$'); } catch (e) { return /^(\+?84|0)\d{9}$/; }
  }
  function loader(on) {
    var l = $('#ttLoad');
    if (!l) { l = document.createElement('div'); l.id = 'ttLoad'; l.className = 'tt tt-load'; l.innerHTML = '<div><i></i>Đang gửi đơn hàng…</div>'; document.body.appendChild(l); }
    l.classList.toggle('on', !!on);
  }
  function placeOrder() {
    if (sending) return;
    var f = {}; $$('#ttCo [name]').forEach(function (i) { f[i.name] = i.value.trim(); });
    var phone = (f.phone_number || '').replace(/[\s.]/g, '');
    var okN = f.full_name.length >= 2, okP = phoneRe().test(phone), okA = f.address.length >= 5;
    $('#ttFN').classList.toggle('bad', !okN); $('#ttFP').classList.toggle('bad', !okP); $('#ttFA').classList.toggle('bad', !okA);
    if (!(okN && okP && okA)) return;
    if (!P || !P.form) { toast('!', 'Không tìm thấy form đặt hàng của trang'); return; }
    var t = totals();
    var info = 'Khách: ' + f.full_name + ' · ' + phone + '\nĐ/c: ' + f.address + (f.note ? '\nGhi chú: ' + f.note : '') + '\n\n' +
      cart.map(function (it) { return '• [' + it.code + '] ' + it.name + ' — ' + it.label + (it.size ? ', ' + it.size : '') + ' × ' + it.q + ' = ' + vnd(it.price * it.q); }).join('\n') +
      '\n\nTạm tính: ' + vnd(t.sub) + '\nVận chuyển: ' + (t.ship ? vnd(t.ship) : 'Miễn phí') + '\nTổng (COD): ' + vnd(t.total);
    var cartTxt = 'GIỎ HÀNG: ' + summary() + (f.note ? ' | GHI CHÚ: ' + f.note : '');
    sending = true; loader(true);
    // form Webcake chỉ đọc ô đang hiển thị → mở popup đặt hàng (nằm dưới lớp "Đang gửi")
    var opener = formOpener(); if (opener) opener.click();
    setTimeout(function () {
      var F = P.form, q = function (n) { return $('[name="' + n + '"]', F); };
      var mine = cart.filter(function (it) { return it.code === P.code; })[0];
      if (mine) {
        var r = P.variants.filter(function (v) { return v.value === mine.value; })[0];
        var re = r && document.getElementById(r.id); if (re && !re.checked) re.click();
        if (P.sizeSel && mine.size) setVal(P.sizeSel, mine.size);
      }
      if (q('full_name')) setVal(q('full_name'), f.full_name);
      if (q('phone_number')) setVal(q('phone_number'), phone);
      var note = noteField(F);
      if (note) { setVal(note, cartTxt); if (q('address')) setVal(q('address'), f.address); }
      else if (q('address')) setVal(q('address'), f.address + MARK + cartTxt.replace(/^GIỎ HÀNG: /, ''));
      var btn = $('button[type=submit]', F) || $('.com-button', F);
      sentAt = Date.now();
      if (btn) btn.click();
      // chờ Webcake xử lý: chuyển trang cảm ơn (pagehide xóa giỏ) hoặc xóa trắng form / đóng popup
      var pop = F.closest('.com-popup'), popWasOpen = pop && !pop.classList.contains('d-none'), start = Date.now();
      (function watch() {
        var ph = q('phone_number'), done = (ph && !ph.value) || (popWasOpen && pop.classList.contains('d-none'));
        if (done) {
          sending = false; loader(false); cart = []; save(cart); badge(); draft = {}; renderDone(info); return;
        }
        if (Date.now() - start > 12000) {
          // Webcake báo lỗi / chưa gửi được → hiện popup Webcake để khách xem thông báo
          sending = false; loader(false); sentAt = 0; cartEl.classList.remove('on'); view = 'cart';
          toast('!', 'Vui lòng kiểm tra lại thông tin'); return;
        }
        setTimeout(watch, 400);
      })();
    }, 600);
  }
  // Khi khách bấm ĐẶT HÀNG của Webcake (trường hợp tự mở popup): ghi danh sách giỏ vào ô gio_hang hoặc cuối địa chỉ
  var sentAt = 0, sentTimer = 0;
  function onSubmitIntent(e) {
    if (sending || !P || !P.form || !cart.length || !P.form.contains(e.target)) return;
    if (e.type === 'click' && !e.target.closest('button[type=submit], .com-button')) return;
    var note = noteField(P.form), addr = $('input[name=address], textarea[name=address]', P.form);
    if (note) setVal(note, 'GIỎ HÀNG: ' + summary());
    else if (addr) { var base = addr.value.split(MARK)[0]; if (base.trim()) setVal(addr, base + MARK + summary()); }
    var phone = $('input[name=phone_number]', P.form);
    clearTimeout(sentTimer); sentAt = 0;
    if (!phone || !/^(\+?84|0)\d{9}$/.test(phone.value.replace(/[\s.]/g, '')) || !(addr && addr.value.trim())) return;
    sentAt = Date.now();
    sentTimer = setTimeout(function () { if (!phone.value) { cart = []; save(cart); badge(); } }, 4000);
  }
  document.addEventListener('click', onSubmitIntent, true);
  document.addEventListener('submit', onSubmitIntent, true);
  window.addEventListener('pagehide', function () { if (sentAt && Date.now() - sentAt < 15000) { cart = []; save(cart); } });
  window.addEventListener('storage', function (e) { if (e.key === CFG.key) { cart = load(); badge(); } });

  // ===== Nút "Thêm vào giỏ hàng" có sẵn của Webcake → mở bảng chọn =====
  if (P) {
    var nativeAdd = $$('.com-button').filter(function (b) { return /thêm\s*vào\s*giỏ/i.test(b.innerText || ''); });
    document.addEventListener('click', function (e) {
      if (!e.target.closest) return;
      var b = e.target.closest('.com-button');
      if (b && nativeAdd.indexOf(b) >= 0) { e.preventDefault(); e.stopImmediatePropagation(); openSheet('add'); }
    }, true);
    renderTop();
    if (!P.sec) {
      // trang không có thanh dưới → thêm nút nổi
      var fab = document.createElement('div'); fab.className = 'tt';
      fab.innerHTML = '<button class="tt-btn" style="position:fixed;right:12px;bottom:16px;width:auto;padding:12px 18px;border-radius:24px;z-index:2147483000;box-shadow:0 3px 10px rgba(0,0,0,.25)">Thêm vào giỏ</button>';
      fab.firstChild.onclick = function () { openSheet('add'); }; document.body.appendChild(fab);
    }
  }
  badge();
})();
