(function () {
  function buildOverlay() {
    var existing = document.getElementById("scene2-rotate-overlay");
    var overlay;
    var style;

    if (existing) {
      return existing;
    }

    overlay = document.createElement("div");
    overlay.id = "scene2-rotate-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="rotate-card" role="dialog" aria-modal="true" aria-labelledby="scene2-rotate-title">' +
        '<div class="phone-wrap" aria-hidden="true">' +
          '<div class="phone-shell">' +
            '<div class="phone-screen"></div>' +
          "</div>" +
          '<div class="rotate-arrow"></div>' +
        "</div>" +
        '<h1 id="scene2-rotate-title">请横屏体验</h1>' +
        "<p>飞鸟穿云场景需要横屏显示，请旋转手机后继续。</p>" +
      "</div>";

    style = document.createElement("style");
    style.id = "scene2-rotate-style";
    style.textContent = [
      "#scene2-rotate-overlay {",
      "position: fixed;",
      "inset: 0;",
      "z-index: 9999;",
      "display: flex;",
      "align-items: center;",
      "justify-content: center;",
      "padding: max(24px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left));",
      "background: #000;",
      "opacity: 0;",
      "visibility: hidden;",
      "pointer-events: none;",
      "transition: opacity 200ms ease, visibility 200ms ease;",
      "}",
      "#scene2-rotate-overlay.active {",
      "opacity: 1;",
      "visibility: visible;",
      "pointer-events: auto;",
      "}",
      "#scene2-rotate-overlay .rotate-card {",
      "display: flex;",
      "flex-direction: column;",
      "align-items: center;",
      "justify-content: center;",
      "gap: 18px;",
      "text-align: center;",
      "color: #f4f7fb;",
      "}",
      "#scene2-rotate-overlay h1 {",
      "margin: 0;",
      "font-size: clamp(28px, 8vw, 38px);",
      "letter-spacing: 0.08em;",
      "}",
      "#scene2-rotate-overlay p {",
      "margin: 0;",
      "max-width: 280px;",
      "font-size: 15px;",
      "line-height: 1.7;",
      "color: rgba(244, 247, 251, 0.78);",
      "}",
      "#scene2-rotate-overlay .phone-wrap {",
      "position: relative;",
      "width: 132px;",
      "height: 132px;",
      "}",
      "#scene2-rotate-overlay .phone-shell {",
      "position: absolute;",
      "left: 50%;",
      "top: 50%;",
      "width: 54px;",
      "height: 92px;",
      "border: 3px solid #67ff8f;",
      "border-radius: 16px;",
      "transform: translate(-50%, -50%);",
      "animation: scene2-rotate-phone 2.2s ease-in-out infinite;",
      "box-shadow: 0 0 24px rgba(103, 255, 143, 0.18);",
      "}",
      "#scene2-rotate-overlay .phone-screen {",
      "position: absolute;",
      "inset: 8px;",
      "border-radius: 10px;",
      "background: linear-gradient(180deg, rgba(103, 255, 143, 0.12), rgba(103, 255, 143, 0.02));",
      "}",
      "#scene2-rotate-overlay .phone-screen::before {",
      "content: '';",
      "position: absolute;",
      "left: 50%;",
      "top: 4px;",
      "width: 16px;",
      "height: 3px;",
      "border-radius: 999px;",
      "transform: translateX(-50%);",
      "background: rgba(103, 255, 143, 0.88);",
      "}",
      "#scene2-rotate-overlay .rotate-arrow {",
      "position: absolute;",
      "inset: 0;",
      "border: 3px dashed rgba(103, 255, 143, 0.5);",
      "border-radius: 50%;",
      "}",
      "#scene2-rotate-overlay .rotate-arrow::before, #scene2-rotate-overlay .rotate-arrow::after {",
      "content: '';",
      "position: absolute;",
      "width: 14px;",
      "height: 14px;",
      "border-top: 3px solid #67ff8f;",
      "border-right: 3px solid #67ff8f;",
      "}",
      "#scene2-rotate-overlay .rotate-arrow::before {",
      "top: 10px;",
      "right: 26px;",
      "transform: rotate(12deg);",
      "}",
      "#scene2-rotate-overlay .rotate-arrow::after {",
      "left: 26px;",
      "bottom: 10px;",
      "transform: rotate(192deg);",
      "}",
      "@keyframes scene2-rotate-phone {",
      "0%, 12% { transform: translate(-50%, -50%) rotate(0deg); }",
      "34%, 66% { transform: translate(-50%, -50%) rotate(90deg); }",
      "88%, 100% { transform: translate(-50%, -50%) rotate(0deg); }",
      "}"
    ].join("");

    document.head.appendChild(style);
    document.body.appendChild(overlay);
    return overlay;
  }

  function isPortraitViewport() {
    return window.innerHeight >= window.innerWidth;
  }

  function updateOverlay() {
    var overlay = buildOverlay();
    var shouldShow = isPortraitViewport();
    if (shouldShow) {
      overlay.classList.add("active");
    } else {
      overlay.classList.remove("active");
    }
    overlay.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  }

  function ensureOrientation() {
    updateOverlay();
    window.addEventListener("resize", updateOverlay, false);
    window.addEventListener("orientationchange", updateOverlay, false);
    return "landscape";
  }

  window["SceneOrientation"] = {
    ensureOrientation: ensureOrientation
  };
}());
