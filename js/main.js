// スマートフォン用メニューの開閉
const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.global-nav');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open);
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', false);
  });
});

// フッターの年表示
document.getElementById('year').textContent = new Date().getFullYear();

// お問い合わせフォーム
const form = document.getElementById('contact-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const error = form.querySelector('.form-error');
    if (!form.checkValidity()) {
      error.hidden = false;
      form.querySelector(':invalid').focus();
      return;
    }
    error.hidden = true;
    const data = new FormData(form);

    // 送信サービス未設定のあいだは、メールソフトを開いて送る
    if (!form.getAttribute('action')) {
      const lines = [];
      data.forEach((v, k) => { if (v) lines.push(`【${k}】\n${v}`); });
      const subject = `【HPお問い合わせ】${data.get('ご相談の内容')}（${data.get('お名前')}様）`;
      location.href = `mailto:${form.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n\n'))}`;
      return;
    }

    // 返信ボタンでお客様のアドレスに返せるようにする
    data.append('_replyto', data.get('メールアドレス'));
    const button = form.querySelector('.form-submit');
    button.disabled = true;
    try {
      const res = await fetch(form.action, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.querySelectorAll('.form-row, .form-agree, .center, .form-lead').forEach((el) => { el.hidden = true; });
      form.querySelector('.form-thanks').hidden = false;
    } catch (err) {
      error.textContent = '送信できませんでした。お手数ですが、メールでご連絡ください。';
      error.hidden = false;
      button.disabled = false;
    }
  });
}

// リンク元に合わせて、ご相談の内容を選んでおく（?topic=nisa-pack / ?topic=owner-plan / ?topic=dc / ?topic=asset）
const topic = document.getElementById('f-topic');
const topicMap = { 'nisa-pack': 'NISAはじめてパック', 'owner-plan': '株式オーナー投資プラン', 'dc': '企業型確定拠出年金', asset: '資産形成（株式・債券）プランニング', retirement: 'リタイアメント（退職金活用）プランニング', insurance: '保険見直し（生保・損保）プランニング' };
const topicKey = new URLSearchParams(location.search).get('topic');
if (topic && topicMap[topicKey]) {
  topic.value = topicMap[topicKey];
}

// 入門編スライド（動画）をポップアップで再生
const modal = document.getElementById('video-modal');
if (modal && typeof modal.showModal === 'function') {
  const video = modal.querySelector('video');
  const close = () => modal.close();
  document.querySelectorAll('[data-video-open]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.showModal();
      video.play().catch(() => {});
    });
  });
  modal.querySelector('.video-modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.addEventListener('close', () => video.pause());
}

// 動画の最後に映る「ご相談はこちら」を押せるようにする（終わりの画面の間だけ、ボタンの位置にリンクを重ねる）
document.querySelectorAll('video[data-cta-from]').forEach((v) => {
  const cta = v.parentElement.querySelector('.video-cta');
  if (!cta) return;
  const from = parseFloat(v.dataset.ctaFrom);
  const update = () => { cta.hidden = !(v.ended || v.currentTime >= from); };
  ['timeupdate', 'seeked', 'ended', 'loadedmetadata'].forEach((ev) => v.addEventListener(ev, update));
  cta.addEventListener('click', () => {
    v.pause();
    const dlg = v.closest('dialog');
    if (dlg && dlg.open) dlg.close();
  });
});
