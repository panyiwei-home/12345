(function () {
  var DEFAULT_CONFIG = {
    portrait: [
      "/scenes/start/index.html"
    ],
    landscape: [
      "/scenes/scene1/index.html",
      "/scenes/scene2/index.html",
      "/scenes/global/index.html"
    ]
  };

  function normalizePath(pathname) {
    if (!pathname) {
      return "/";
    }
    return pathname.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  }

  function matchesPath(pathname, targetPath) {
    var normalizedPath = normalizePath(pathname);
    var normalizedTarget = normalizePath(targetPath);
    return normalizedPath === normalizedTarget || normalizedPath.slice(-normalizedTarget.length) === normalizedTarget;
  }

  function getExpectedOrientation(pathname) {
    var currentPath = pathname || window.location.pathname;
    var i;

    for (i = 0; i < DEFAULT_CONFIG.portrait.length; i += 1) {
      if (matchesPath(currentPath, DEFAULT_CONFIG.portrait[i])) {
        return "portrait";
      }
    }

    for (i = 0; i < DEFAULT_CONFIG.landscape.length; i += 1) {
      if (matchesPath(currentPath, DEFAULT_CONFIG.landscape[i])) {
        return "landscape";
      }
    }

    return "portrait";
  }

  function buildOverlay() {
    var existingOverlay = document.getElementById("global-rotate-overlay");
    var overlay;
    var style;

    if (existingOverlay) {
      return existingOverlay;
    }

    overlay = document.createElement("div");
    overlay.id = "global-rotate-overlay";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML =
      '<div class="rotate-card" role="dialog" aria-modal="true" aria-labelledby="rotate-title">' +
        '<div class="phone-wrap" aria-hidden="true">' +
          '<div class="phone-shell">' +
            '<div class="phone-screen"></div>' +
          "</div>" +
          '<div class="rotate-arrow"></div>' +
        "</div>" +
        '<h1 id="rotate-title">请横屏查看</h1>' +
        "<p>当前页面需要横屏展示，请旋转手机后继续。</p>" +
      "</div>";

    style = document.createElement("style");
    style.id = "global-rotate-style";
    style.textContent = [
      "#global-rotate-overlay {",
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
      "#global-rotate-overlay.active {",
      "opacity: 1;",
      "visibility: visible;",
      "pointer-events: auto;",
      "}",
      "#global-rotate-overlay .rotate-card {",
      "display: flex;",
      "flex-direction: column;",
      "align-items: center;",
      "justify-content: center;",
      "gap: 18px;",
      "text-align: center;",
      "color: #f4f7fb;",
      "}",
      "#global-rotate-overlay h1 {",
      "margin: 0;",
      "font-size: clamp(28px, 8vw, 38px);",
      "letter-spacing: 0.08em;",
      "}",
      "#global-rotate-overlay p {",
      "margin: 0;",
      "max-width: 280px;",
      "font-size: 15px;",
      "line-height: 1.7;",
      "color: rgba(244, 247, 251, 0.78);",
      "}",
      "#global-rotate-overlay .phone-wrap {",
      "position: relative;",
      "width: 132px;",
      "height: 132px;",
      "}",
      "#global-rotate-overlay .phone-shell {",
      "position: absolute;",
      "left: 50%;",
      "top: 50%;",
      "width: 54px;",
      "height: 92px;",
      "border: 3px solid #67ff8f;",
      "border-radius: 16px;",
      "transform: translate(-50%, -50%);",
      "animation: global-rotate-phone 2.2s ease-in-out infinite;",
      "box-shadow: 0 0 24px rgba(103, 255, 143, 0.18);",
      "}",
      "#global-rotate-overlay .phone-screen {",
      "position: absolute;",
      "inset: 8px;",
      "border-radius: 10px;",
      "background: linear-gradient(180deg, rgba(103, 255, 143, 0.12), rgba(103, 255, 143, 0.02));",
      "}",
      "#global-rotate-overlay .phone-screen::before {",
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
      "#global-rotate-overlay .rotate-arrow {",
      "position: absolute;",
      "inset: 0;",
      "border: 3px dashed rgba(103, 255, 143, 0.5);",
      "border-radius: 50%;",
      "}",
      "#global-rotate-overlay .rotate-arrow::before, #global-rotate-overlay .rotate-arrow::after {",
      "content: '';",
      "position: absolute;",
      "width: 14px;",
      "height: 14px;",
      "border-top: 3px solid #67ff8f;",
      "border-right: 3px solid #67ff8f;",
      "}",
      "#global-rotate-overlay .rotate-arrow::before {",
      "top: 10px;",
      "right: 26px;",
      "transform: rotate(12deg);",
      "}",
      "#global-rotate-overlay .rotate-arrow::after {",
      "left: 26px;",
      "bottom: 10px;",
      "transform: rotate(192deg);",
      "}",
      "@keyframes global-rotate-phone {",
      "0%, 12% { transform: translate(-50%, -50%) rotate(0deg); }",
      "34%, 66% { transform: translate(-50%, -50%) rotate(90deg); }",
      "88%, 100% { transform: translate(-50%, -50%) rotate(0deg); }",
      "}"
    ].join("");

    if (document.head) {
      document.head.appendChild(style);
    }
    if (document.body) {
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function isPortraitViewport() {
    return window.innerHeight >= window.innerWidth;
  }

  function updateOverlay(overlay, expectedOrientation) {
    var shouldShow = expectedOrientation === "landscape" && isPortraitViewport();
    if (shouldShow) {
      overlay.classList.add("active");
    } else {
      overlay.classList.remove("active");
    }
    overlay.setAttribute("aria-hidden", shouldShow ? "false" : "true");
  }

  function ensureOrientation(options) {
    var settings = options || {};
    var expectedOrientation = settings.expectedOrientation || getExpectedOrientation();
    var overlay = buildOverlay();

    updateOverlay(overlay, expectedOrientation);
    window.addEventListener("resize", function () {
      updateOverlay(overlay, expectedOrientation);
    }, false);
    window.addEventListener("orientationchange", function () {
      updateOverlay(overlay, expectedOrientation);
    }, false);

    return expectedOrientation;
  }

  window["SceneOrientation"] = {
    config: DEFAULT_CONFIG,
    ensureOrientation: ensureOrientation,
    getExpectedOrientation: getExpectedOrientation
  };
}());
