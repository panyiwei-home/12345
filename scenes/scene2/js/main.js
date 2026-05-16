import * as THREE from "../vendor/three.module.js";

const STORAGE_KEY = "scene2_best_speed";

function hideAllScreens() {
  document.querySelectorAll(".screen").forEach((node) => {
    node.classList.remove("active");
    node.setAttribute("aria-hidden", "true");
  });
}

function showScreen(id) {
  hideAllScreens();
  const target = document.getElementById(id);
  if (!target) {
    return;
  }
  target.classList.add("active");
  target.setAttribute("aria-hidden", "false");
}

function loadBestSpeed() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? Number(value) : 0;
  } catch (error) {
    console.warn("读取最高速度失败", error);
    return 0;
  }
}

function saveBestSpeed(value) {
  try {
    const currentBest = loadBestSpeed();
    if (value > currentBest) {
      window.localStorage.setItem(STORAGE_KEY, String(Math.round(value)));
    }
  } catch (error) {
    console.warn("保存最高速度失败", error);
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createBird() {
  const bird = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 24, 24),
    new THREE.MeshStandardMaterial({
      color: 0xf4a321,
      roughness: 0.88,
      metalness: 0.02,
      flatShading: true
    })
  );
  body.scale.set(1.1, 0.78, 1.9);
  bird.add(body);

  const chest = new THREE.Mesh(
    new THREE.SphereGeometry(0.19, 18, 18),
    new THREE.MeshStandardMaterial({
      color: 0xffde8e,
      roughness: 0.92,
      metalness: 0.02,
      flatShading: true
    })
  );
  chest.position.set(0, -0.02, 0.26);
  chest.scale.set(1, 0.95, 1.25);
  bird.add(chest);

  const wingGeometry = new THREE.BoxGeometry(0.78, 0.05, 0.34);
  const wingMaterial = new THREE.MeshStandardMaterial({
    color: 0xcf6c24,
    roughness: 0.84,
    metalness: 0.02,
    flatShading: true
  });

  const wingLeft = new THREE.Mesh(wingGeometry, wingMaterial);
  wingLeft.position.set(-0.48, 0.03, -0.05);
  wingLeft.rotation.z = 0.45;
  bird.add(wingLeft);

  const wingRight = wingLeft.clone();
  wingRight.position.x = 0.48;
  wingRight.rotation.z = -0.45;
  bird.add(wingRight);

  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.4, 4),
    new THREE.MeshStandardMaterial({
      color: 0xcd5b1a,
      roughness: 0.82,
      metalness: 0.02,
      flatShading: true
    })
  );
  tail.rotation.z = Math.PI / 2;
  tail.position.set(0, -0.02, -0.62);
  bird.add(tail);

  const beak = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.3, 6),
    new THREE.MeshStandardMaterial({
      color: 0xffe4a1,
      roughness: 0.76,
      metalness: 0.02,
      flatShading: true
    })
  );
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0, 0.01, 0.62);
  bird.add(beak);

  const eyeGeometry = new THREE.SphereGeometry(0.03, 10, 10);
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x2b2119 });
  const eyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
  eyeLeft.position.set(-0.11, 0.12, 0.36);
  bird.add(eyeLeft);

  const eyeRight = eyeLeft.clone();
  eyeRight.position.x = 0.11;
  bird.add(eyeRight);

  return { bird, wingLeft, wingRight };
}

function createCloudCluster(materials, scaleMultiplier) {
  const cluster = new THREE.Group();
  const puffCount = 4 + Math.floor(Math.random() * 4);

  for (let i = 0; i < puffCount; i += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(randomBetween(0.45, 1.28), 18, 18),
      materials[i % materials.length].clone()
    );
    puff.position.set(
      randomBetween(-1.1, 1.1),
      randomBetween(-0.7, 0.7),
      randomBetween(-0.75, 0.75)
    );
    puff.scale.set(
      randomBetween(0.9, 1.6) * scaleMultiplier,
      randomBetween(0.8, 1.35) * scaleMultiplier,
      randomBetween(0.95, 1.7) * scaleMultiplier
    );
    cluster.add(puff);
  }

  cluster.userData.spinX = randomBetween(-0.12, 0.12);
  cluster.userData.spinY = randomBetween(-0.16, 0.16);
  cluster.userData.spinZ = randomBetween(-0.12, 0.12);
  cluster.userData.floatSeed = Math.random() * Math.PI * 2;
  cluster.userData.baseScale = cluster.scale.clone();
  return cluster;
}

function createTunnelSegment(materials, index) {
  const group = new THREE.Group();
  const count = 14 + (index % 5);
  const baseRadius = randomBetween(3.6, 5.1);

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + randomBetween(-0.16, 0.16);
    const radius = baseRadius + randomBetween(-0.55, 0.95);
    const cluster = createCloudCluster(materials, randomBetween(0.78, 1.22));
    cluster.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * randomBetween(0.7, 0.92),
      randomBetween(-0.9, 0.9)
    );
    cluster.lookAt(0, 0, 0);
    cluster.rotateZ(randomBetween(-0.9, 0.9));
    group.add(cluster);
  }

  group.userData.spin = randomBetween(-0.42, 0.42);
  group.userData.seed = Math.random() * Math.PI * 2;
  group.userData.wobble = randomBetween(0.35, 0.85);
  return group;
}

function createTunnel(scene) {
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, transparent: true, opacity: 0.96 }),
    new THREE.MeshStandardMaterial({ color: 0xf7f1f3, roughness: 1, metalness: 0, transparent: true, opacity: 0.88 }),
    new THREE.MeshStandardMaterial({ color: 0xebdde2, roughness: 1, metalness: 0, transparent: true, opacity: 0.82 })
  ];

  const segments = [];
  for (let i = 0; i < 18; i += 1) {
    const segment = createTunnelSegment(materials, i);
    segment.position.z = -i * 5.6 - 8;
    scene.add(segment);
    segments.push(segment);
  }
  return segments;
}

function createFrontClouds(scene) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xf8f2f4,
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.95
  });

  const frontClouds = [];
  const anchors = [
    { x: -7.2, y: 4.8, z: 2.2, s: 2.8 },
    { x: 7.5, y: 4.4, z: 2.4, s: 2.6 },
    { x: -8.3, y: -3.8, z: 1.4, s: 2.4 },
    { x: 8.5, y: -4.1, z: 1.6, s: 2.3 }
  ];

  anchors.forEach((anchor, index) => {
    const cloud = createCloudCluster([material], anchor.s);
    cloud.position.set(anchor.x, anchor.y, anchor.z);
    cloud.userData.anchor = anchor;
    cloud.userData.index = index;
    scene.add(cloud);
    frontClouds.push(cloud);
  });

  return frontClouds;
}

function createSkyOpening(scene) {
  const portal = new THREE.Group();

  const outerGlow = new THREE.Mesh(
    new THREE.CircleGeometry(4.4, 56),
    new THREE.MeshBasicMaterial({ color: 0xf7fbff, transparent: true, opacity: 0.22 })
  );
  outerGlow.position.set(0, 0, -72);
  portal.add(outerGlow);

  const skyCore = new THREE.Mesh(
    new THREE.CircleGeometry(2.55, 48),
    new THREE.MeshBasicMaterial({ color: 0xc8eeff, transparent: true, opacity: 0.96 })
  );
  skyCore.position.set(0, 0, -71.8);
  portal.add(skyCore);

  const skyInner = new THREE.Mesh(
    new THREE.CircleGeometry(1.45, 40),
    new THREE.MeshBasicMaterial({ color: 0x8bd9ff, transparent: true, opacity: 0.92 })
  );
  skyInner.position.set(0.05, -0.05, -71.6);
  portal.add(skyInner);

  const mistRing = new THREE.Mesh(
    new THREE.RingGeometry(2.4, 4.2, 48),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, side: THREE.DoubleSide })
  );
  mistRing.position.set(0, 0, -71.9);
  portal.add(mistRing);

  scene.add(portal);
  return { portal, outerGlow, skyCore, skyInner, mistRing };
}

function createSpeedLines(scene) {
  const group = new THREE.Group();
  const count = 56;

  for (let i = 0; i < count; i += 1) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, -2.6)
    ]);
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12 })
    );
    line.userData.angle = Math.random() * Math.PI * 2;
    line.userData.radius = randomBetween(1.4, 7.6);
    line.userData.speed = randomBetween(16, 24);
    line.userData.length = randomBetween(1.4, 3.8);
    line.position.set(
      Math.cos(line.userData.angle) * line.userData.radius,
      Math.sin(line.userData.angle) * line.userData.radius * 0.72,
      -Math.random() * 48
    );
    group.add(line);
  }

  scene.add(group);
  return group;
}

function createDust(scene) {
  const geometry = new THREE.BufferGeometry();
  const count = 240;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const radius = randomBetween(0.8, 7.4);
    const angle = Math.random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius * 0.72;
    positions[i * 3 + 2] = -Math.random() * 82;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.36,
      sizeAttenuation: true
    })
  );
  scene.add(points);
  return points;
}

async function requestMotionPermission() {
  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    const result = await DeviceOrientationEvent.requestPermission();
    return result === "granted";
  }
  return typeof window.DeviceOrientationEvent !== "undefined";
}

function initApp() {
  const orientationHelper = window["SceneOrientation"];
  if (orientationHelper) {
    orientationHelper.ensureOrientation({ expectedOrientation: "landscape" });
  }

  const sceneRoot = document.getElementById("scene-root");
  const startButton = document.getElementById("startButton");
  const speedValue = document.getElementById("speedValue");
  const controlValue = document.getElementById("controlValue");
  const boostHint = document.getElementById("boostHint");
  const messageText = document.getElementById("messageText");
  const messageButton = document.getElementById("messageButton");

  if (!sceneRoot || !startButton || !speedValue || !controlValue || !boostHint || !messageText || !messageButton) {
    throw new Error("场景节点缺失");
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  sceneRoot.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xeef1f6, 0.018);

  const camera = new THREE.PerspectiveCamera(49, window.innerWidth / Math.max(window.innerHeight, 1), 0.1, 160);
  camera.position.set(0, 0.05, 10.5);
  scene.add(camera);

  scene.add(new THREE.HemisphereLight(0xffffff, 0xcfe5ef, 1.55));

  const fillLight = new THREE.DirectionalLight(0xffffff, 1.25);
  fillLight.position.set(-2.5, 3.8, 7.2);
  scene.add(fillLight);

  const sunLight = new THREE.PointLight(0x9ae6ff, 12, 150, 1.6);
  sunLight.position.set(0, 0, -68);
  scene.add(sunLight);

  const softLight = new THREE.DirectionalLight(0xfff6f6, 0.55);
  softLight.position.set(4.2, -2.6, 6.8);
  scene.add(softLight);

  const { bird, wingLeft, wingRight } = createBird();
  bird.position.set(0, -0.14, 1.8);
  scene.add(bird);

  const tunnelSegments = createTunnel(scene);
  const frontClouds = createFrontClouds(scene);
  const speedLines = createSpeedLines(scene);
  const dust = createDust(scene);
  const portalParts = createSkyOpening(scene);

  const state = {
    running: false,
    boosting: false,
    controlMode: "waiting",
    targetX: 0,
    deviceGamma: 0,
    currentSpeed: 180,
    displaySpeed: 180,
    tunnelShiftX: 0,
    tunnelShiftY: 0,
    tunnelTwist: 0
  };

  function updateHud() {
    speedValue.textContent = String(Math.round(state.displaySpeed));
    controlValue.textContent = state.controlMode === "gyro" ? "陀螺仪" : state.controlMode === "touch" ? "拖动" : "待启动";
    boostHint.classList.toggle("boosting", state.boosting);
    sceneRoot.classList.toggle("boosting", state.boosting);
  }

  function showMessage(text) {
    messageText.textContent = text;
    showScreen("screen-message");
  }

  function clampBirdToViewport() {
    const visibleHeight = 2 * Math.tan((camera.fov * Math.PI / 180) / 2) * camera.position.z;
    const visibleWidth = visibleHeight * camera.aspect;
    const minX = -visibleWidth * 0.2;
    const maxX = visibleWidth * 0.2;
    bird.position.x = clamp(bird.position.x, minX, maxX);
    state.targetX = clamp(state.targetX, minX, maxX);
  }

  function handleResize() {
    camera.aspect = window.innerWidth / Math.max(window.innerHeight, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    clampBirdToViewport();
  }

  function setBoosting(value) {
    state.boosting = value;
    updateHud();
  }

  function useTouchControl() {
    state.controlMode = "touch";
    updateHud();
  }

  function onDeviceOrientation(event) {
    if (!state.running || typeof event.gamma !== "number") {
      return;
    }
    state.deviceGamma = clamp(event.gamma, -35, 35);
    state.controlMode = "gyro";
    updateHud();
  }

  let pressTimer = 0;
  let pointerActive = false;

  sceneRoot.addEventListener("pointerdown", (event) => {
    pointerActive = true;
    sceneRoot.setPointerCapture(event.pointerId);
    pressTimer = window.setTimeout(() => {
      if (pointerActive) {
        setBoosting(true);
      }
    }, 120);
  });

  sceneRoot.addEventListener("pointermove", (event) => {
    if (!pointerActive || state.controlMode !== "touch") {
      return;
    }
    const ratio = event.clientX / Math.max(window.innerWidth, 1);
    state.targetX = (ratio - 0.5) * 4;
  });

  function endPointer(event) {
    if (event && sceneRoot.hasPointerCapture(event.pointerId)) {
      sceneRoot.releasePointerCapture(event.pointerId);
    }
    pointerActive = false;
    window.clearTimeout(pressTimer);
    setBoosting(false);
  }

  sceneRoot.addEventListener("pointerup", endPointer);
  sceneRoot.addEventListener("pointercancel", endPointer);
  sceneRoot.addEventListener("pointerleave", () => {
    if (!pointerActive) {
      setBoosting(false);
    }
  });

  messageButton.addEventListener("click", () => {
    hideAllScreens();
  });

  async function startExperience() {
    state.running = true;
    hideAllScreens();

    let granted = false;
    try {
      granted = await requestMotionPermission();
    } catch (error) {
      console.warn("陀螺仪权限请求失败", error);
    }

    if (granted) {
      state.controlMode = "gyro";
      updateHud();
    } else {
      useTouchControl();
      showMessage("当前设备未开启或不支持陀螺仪，已自动切换为手指左右拖动控制。长按仍可俯冲加速。");
    }
  }

  startButton.addEventListener("click", () => {
    startExperience();
  });

  window.addEventListener("deviceorientation", onDeviceOrientation);
  window.addEventListener("resize", handleResize);

  const clock = new THREE.Clock();

  function animateBird(delta, elapsedTime) {
    if (state.controlMode === "gyro") {
      state.targetX = THREE.MathUtils.lerp(state.targetX, state.deviceGamma * 0.05, 4.8 * delta);
    }

    const bob = Math.sin(elapsedTime * 7.4) * 0.06;
    bird.position.x = THREE.MathUtils.lerp(bird.position.x, state.targetX, 4.3 * delta);
    bird.position.y = -0.14 + bob;
    clampBirdToViewport();

    const birdTilt = clamp((state.targetX - bird.position.x) * 1.18 + state.deviceGamma * 0.004, -0.52, 0.52);
    bird.rotation.z = THREE.MathUtils.lerp(bird.rotation.z, -birdTilt, 4.8 * delta);
    bird.rotation.x = THREE.MathUtils.lerp(bird.rotation.x, -0.04 + Math.sin(elapsedTime * 3.1) * 0.04, 3.1 * delta);
    bird.rotation.y = THREE.MathUtils.lerp(bird.rotation.y, birdTilt * 0.25, 3.2 * delta);

    const flap = Math.sin(elapsedTime * (state.boosting ? 21 : 15)) * 0.72;
    wingLeft.rotation.z = 0.45 + flap * 0.38;
    wingRight.rotation.z = -0.45 - flap * 0.38;
  }

  function animateTunnel(delta, elapsedTime) {
    state.tunnelTwist = THREE.MathUtils.lerp(
      state.tunnelTwist,
      state.boosting ? 1.55 : 0.72,
      1.9 * delta
    );

    state.tunnelShiftX = THREE.MathUtils.lerp(state.tunnelShiftX, -bird.position.x * 0.32, 2.6 * delta);
    state.tunnelShiftY = THREE.MathUtils.lerp(state.tunnelShiftY, bird.rotation.z * 0.4, 2.3 * delta);

    tunnelSegments.forEach((segment, index) => {
      segment.position.z += state.currentSpeed * delta * 0.062;
      if (segment.position.z > 12) {
        segment.position.z -= tunnelSegments.length * 5.6;
      }

      const twist = elapsedTime * state.tunnelTwist + index * 0.31 + segment.userData.seed + segment.position.z * 0.052;
      segment.rotation.z = twist + segment.userData.spin;
      segment.position.x = Math.sin(twist * 0.58) * 0.82 + state.tunnelShiftX;
      segment.position.y = Math.cos(twist * 0.64) * 0.4 + state.tunnelShiftY;

      segment.children.forEach((cluster, clusterIndex) => {
        cluster.rotation.x += cluster.userData.spinX * delta;
        cluster.rotation.y += cluster.userData.spinY * delta;
        cluster.rotation.z += cluster.userData.spinZ * delta;
        cluster.position.z += Math.sin(elapsedTime * 1.1 + clusterIndex + segment.userData.seed) * delta * 0.12;
      });
    });
  }

  function animateFrontClouds(delta, elapsedTime) {
    frontClouds.forEach((cloud) => {
      const anchor = cloud.userData.anchor;
      cloud.position.x = anchor.x + Math.sin(elapsedTime * 0.36 + cloud.userData.index) * 0.38 - state.tunnelShiftX * 0.32;
      cloud.position.y = anchor.y + Math.cos(elapsedTime * 0.44 + cloud.userData.index) * 0.26 - state.tunnelShiftY * 0.32;
      cloud.rotation.z += delta * 0.03 * (cloud.userData.index % 2 === 0 ? 1 : -1);
    });
  }

  function animateSpeedLines(delta, elapsedTime) {
    speedLines.children.forEach((line, index) => {
      line.position.z += (line.userData.speed + state.currentSpeed * 0.07) * delta;
      if (line.position.z > 8) {
        line.position.z = -60 - Math.random() * 22;
        line.userData.angle = Math.random() * Math.PI * 2;
        line.userData.radius = randomBetween(1.2, 7.8);
      }
      const angle = line.userData.angle + elapsedTime * 0.3 + line.position.z * 0.003;
      line.rotation.z = angle;
      line.position.x = Math.cos(angle) * line.userData.radius + state.tunnelShiftX * 1.8;
      line.position.y = Math.sin(angle) * line.userData.radius * 0.72 + state.tunnelShiftY * 1.5;
      line.material.opacity = state.boosting ? 0.34 : 0.12;
      line.scale.z = state.boosting ? line.userData.length * 2.2 : line.userData.length;
      line.scale.x = 1 + Math.sin(index + elapsedTime * 2.2) * 0.14;
    });
  }

  function animateDust(delta, elapsedTime) {
    const positions = dust.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 2] += state.currentSpeed * delta * 0.05;
      if (positions[i + 2] > 6) {
        const radius = randomBetween(0.8, 7.4);
        const angle = Math.random() * Math.PI * 2;
        positions[i] = Math.cos(angle) * radius;
        positions[i + 1] = Math.sin(angle) * radius * 0.72;
        positions[i + 2] = -80 - Math.random() * 14;
      }
      positions[i] += Math.sin(elapsedTime * 0.45 + i) * delta * 0.02;
    }
    dust.geometry.attributes.position.needsUpdate = true;
    dust.rotation.z += delta * (state.boosting ? 0.28 : 0.13);
  }

  function animateSkyOpening(elapsedTime) {
    portalParts.portal.rotation.z = elapsedTime * 0.04;
    portalParts.outerGlow.scale.setScalar(1 + Math.sin(elapsedTime * 1.4) * 0.06);
    portalParts.skyCore.scale.setScalar(1 + Math.cos(elapsedTime * 2) * 0.05);
    portalParts.skyInner.scale.setScalar(1 + Math.sin(elapsedTime * 2.5) * 0.08);
    portalParts.mistRing.rotation.z = -elapsedTime * 0.22;
  }

  function animate() {
    const delta = Math.min(clock.getDelta(), 0.04);
    const elapsedTime = clock.elapsedTime;

    if (state.running) {
      const baseSpeed = 180;
      const boostSpeed = 360;
      state.currentSpeed = THREE.MathUtils.lerp(
        state.currentSpeed,
        state.boosting ? boostSpeed : baseSpeed,
        4.8 * delta
      );
      state.displaySpeed = state.currentSpeed;
      saveBestSpeed(state.displaySpeed);

      animateBird(delta, elapsedTime);
      animateTunnel(delta, elapsedTime);
      animateFrontClouds(delta, elapsedTime);
      animateSpeedLines(delta, elapsedTime);
      animateDust(delta, elapsedTime);
      animateSkyOpening(elapsedTime);
    }

    updateHud();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  }

  handleResize();
  updateHud();
  animate();
}

window.addEventListener("load", () => {
  try {
    initApp();
  } catch (error) {
    console.error(error);
    const fallback = document.createElement("div");
    fallback.style.cssText = "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:#edf4fa;color:#244055;font-size:18px;padding:24px;text-align:center;z-index:9999;";
    fallback.textContent = "哎呀，场景加载失败，请重启试试吧~";
    document.body.innerHTML = "";
    document.body.appendChild(fallback);
  }
});
