// Lớp đồng bộ Supabase: đăng nhập email/mật khẩu + lưu dữ liệu (appData) mỗi tài khoản 1 dòng trong bảng app_state
(function () {
  const cfg = window.APP_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY && !/YOUR_/.test(cfg.SUPABASE_URL + cfg.SUPABASE_ANON_KEY);
  const inp = 'w-full border border-slate-300 rounded-lg p-2.5 text-sm mb-2 outline-none focus:border-indigo-500';
  const ov = document.createElement('div');
  ov.className = 'fixed inset-0 z-[100] bg-slate-100 flex items-center justify-center p-4';
  ov.innerHTML = `<div class="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-6">
    <h2 class="text-lg font-bold text-indigo-700 mb-1"><i class="fa-solid fa-clipboard-user"></i> Sổ Điểm Danh Quân Số</h2>
    <p id="auth-msg" class="text-xs text-slate-500 mb-4">Đăng nhập để đồng bộ dữ liệu lên Supabase.</p>
    <input id="auth-email" type="email" placeholder="Email" class="${inp}">
    <input id="auth-pass" type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)" class="${inp}">
    <div class="flex gap-2 mt-2">
      <button id="auth-login" class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold">Đăng nhập</button>
      <button id="auth-signup" class="flex-1 py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-semibold">Đăng ký</button>
    </div></div>`;
  document.body.appendChild(ov);
  const $ = id => document.getElementById(id);
  const msg = t => { $('auth-msg').textContent = t; };

  if (!configured) {
    msg('Chưa cấu hình Supabase: điền SUPABASE_URL và SUPABASE_ANON_KEY trong file config.js.');
    $('auth-login').disabled = $('auth-signup').disabled = true;
    return;
  }

  const sb = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  let uid = null, timer = null, dirty = false, saving = false;

  // Trạng thái đồng bộ + nút đăng xuất trên header
  const bar = document.querySelector('header button[onclick="backupData()"]').parentElement;
  const st = document.createElement('span');
  st.className = 'text-[11px] text-indigo-100 hidden sm:inline';
  bar.prepend(st);
  const out = document.createElement('button');
  out.title = 'Đăng xuất';
  out.className = 'bg-indigo-700 hover:bg-indigo-800 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold transition';
  out.innerHTML = '<i class="fa-solid fa-right-from-bracket"></i>';
  out.onclick = async () => {
    if ((dirty || saving) && !confirm('Còn dữ liệu chưa đồng bộ xong, vẫn đăng xuất?')) return;
    await sb.auth.signOut();
    location.reload();
  };
  bar.appendChild(out);
  const setSt = (t, bad) => { st.textContent = t; st.style.color = bad ? '#fecaca' : ''; };

  async function flush() {
    if (!uid || !dirty) return;
    if (saving) { timer = setTimeout(flush, 500); return; }
    saving = true; dirty = false;
    const { error } = await sb.from('app_state').upsert({ owner_id: uid, data: appData, updated_at: new Date().toISOString() });
    saving = false;
    if (error) {
      console.error(error); dirty = true;
      setSt('Lỗi đồng bộ, đang thử lại…', true);
      timer = setTimeout(flush, 5000);
    } else if (!dirty) setSt('Đã đồng bộ ☁');
  }
  window.cloudPush = () => { dirty = true; setSt('Đang lưu…'); clearTimeout(timer); timer = setTimeout(flush, 500); };

  window.addEventListener('beforeunload', e => { if (dirty || saving) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && dirty) { clearTimeout(timer); flush(); } });

  async function start(session) {
    uid = session.user.id;
    const { data, error } = await sb.from('app_state').select('data').eq('owner_id', uid).maybeSingle();
    if (error) { uid = null; msg('Không tải được dữ liệu: ' + error.message + ' (đã chạy supabase/schema.sql chưa?)'); return; }
    let d = data && data.data && data.data.classes ? data.data : null;
    let isNew = false;
    if (!d) {
      isNew = true;
      let old = null;
      try { old = JSON.parse(localStorage.getItem('app_attendance_data')); } catch (e) {}
      d = (old && old.classes && old.classes.length && confirm('Tìm thấy dữ liệu điểm danh cũ lưu trên trình duyệt này. Nhập lên tài khoản của bạn?'))
        ? old : { classes: [], records: {} };
    }
    d.records = d.records || {};
    appData = d;
    renderClassGrid();
    ov.classList.add('hidden');
    setSt('Đã đồng bộ ☁');
    if (isNew) window.cloudPush();
  }

  sb.auth.onAuthStateChange((ev, session) => {
    if (session && !uid) setTimeout(() => start(session), 0);
  });

  const cred = () => ({ email: $('auth-email').value.trim(), password: $('auth-pass').value });
  $('auth-login').onclick = async () => {
    msg('Đang đăng nhập…');
    const { error } = await sb.auth.signInWithPassword(cred());
    if (error) msg('Lỗi: ' + error.message);
  };
  $('auth-signup').onclick = async () => {
    msg('Đang đăng ký…');
    const { data, error } = await sb.auth.signUp(cred());
    if (error) msg('Lỗi: ' + error.message);
    else if (!data.session) msg('Đã đăng ký. Hãy kiểm tra email để xác nhận, rồi đăng nhập.');
  };
  $('auth-pass').addEventListener('keydown', e => { if (e.key === 'Enter') $('auth-login').click(); });
})();
