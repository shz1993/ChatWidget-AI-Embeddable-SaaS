// public/widget.js
(function () {
  console.log('🚀 ChatWidget AI: Loading script...');

  function initWidget() {
    // Cari tag script yang memanggil file ini
    const scriptTag = document.currentScript || document.querySelector('script[data-bot-id]');
    
    if (!scriptTag) {
      console.error('❌ ChatWidget AI: Tag <script data-bot-id="..."> tidak ditemukan!');
      return;
    }

    const botId = scriptTag.getAttribute('data-bot-id');

    if (!botId || botId === 'MASUKKAN_ID_BOT_ASLI_DISINI') {
      console.error('❌ ChatWidget AI: Invalid atau missing data-bot-id pada tag script!');
      return;
    }

    if (document.getElementById('chatwidget-ai-button')) return;

    const scriptUrl = scriptTag.src ? new URL(scriptTag.src) : new URL(window.location.href);
    const baseUrl = scriptUrl.origin;

    // 1. Buat Tombol Floating Biru
    const button = document.createElement('div');
    button.id = 'chatwidget-ai-button';
    button.style.cssText = `
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      width: 60px !important;
      height: 60px !important;
      border-radius: 50% !important;
      background-color: #2563eb !important;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3) !important;
      cursor: pointer !important;
      z-index: 9999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      user-select: none !important;
    `;

    button.innerHTML = `
      <svg id="chatwidget-icon-open" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="pointer-events: none;">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <svg id="chatwidget-icon-close" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none; pointer-events: none;">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

    // 2. Buat Container Iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'chatwidget-ai-iframe';
    iframe.src = `${baseUrl}/widget/${botId}`;
    iframe.style.cssText = `
      position: fixed !important;
      bottom: 96px !important;
      right: 24px !important;
      width: 380px !important;
      height: 580px !important;
      max-width: calc(100vw - 32px) !important;
      max-height: calc(100vh - 120px) !important;
      border: none !important;
      border-radius: 20px !important;
      box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.25) !important;
      z-index: 9999998 !important;
      display: none !important;
      background: white !important;
    `;

    document.body.appendChild(button);
    document.body.appendChild(iframe);

    // Click Handler
    let isOpen = false;
    button.onclick = function (e) {
      e.preventDefault();
      e.stopPropagation();
      isOpen = !isOpen;

      const iconOpen = document.getElementById('chatwidget-icon-open');
      const iconClose = document.getElementById('chatwidget-icon-close');

      if (isOpen) {
        iframe.style.display = 'block';
        if (iconOpen) iconOpen.style.display = 'none';
        if (iconClose) iconClose.style.display = 'block';
      } else {
        iframe.style.display = 'none';
        if (iconOpen) iconOpen.style.display = 'block';
        if (iconClose) iconClose.style.display = 'none';
      }
    };

    console.log('✅ ChatWidget AI: Tombol berhasil dimuat!');
  }

  // Pastikan DOM HTML sudah siap sebelum menyuntikkan tombol
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();