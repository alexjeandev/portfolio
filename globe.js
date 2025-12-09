// globe.js — Earth + Starfield + Meteors (Fixed paths)
(function () {
  const canvas = document.getElementById("globeCanvas");
  if (!canvas || !window.THREE) return;

  const container = canvas.parentElement;

  // ===== Scene =====
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);

  function resizeRenderer() {
    const width = container.clientWidth;
    const height = container.clientHeight || width;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }
  resizeRenderer();

  // ===== Lighting =====
  scene.add(new THREE.AmbientLight(0x404040, 1.5));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(5, 3, 5);
  scene.add(dir);

  // ===== Earth =====
  const texture = new THREE.TextureLoader().load("./assets/earth_night.jpg");

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(1, 64, 64),
    new THREE.MeshPhongMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: new THREE.Color(0x2858ff),
      emissiveIntensity: 0.75,
      shininess: 20,
    })
  );
  scene.add(earth);

  // ===== Stars =====
  const starsGeo = new THREE.BufferGeometry();
  const starCount = 1500;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 50;
  }

  starsGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

  const starsMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.05,
    transparent: true,
    opacity: 0.9,
  });

  const starField = new THREE.Points(starsGeo, starsMat);
  scene.add(starField);

  // ===== Meteors =====
  const meteors = [];

  function createMeteor() {
    const material = new THREE.LineBasicMaterial({
      color: 0xffddaa,
      transparent: true,
      opacity: 1,
    });

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      0, 0, 0,
      0.8, 0, 0
    ]);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const meteor = new THREE.Line(geometry, material);
    resetMeteor(meteor);
    scene.add(meteor);
    meteors.push(meteor);
  }

  function resetMeteor(meteor) {
    meteor.position.set(
      -8 + Math.random() * 3,
      4 + Math.random() * 2,
      -5 + Math.random() * 3
    );

    meteor.userData.velocity = new THREE.Vector3(
      0.18 + Math.random() * 0.05,
      -0.22 - Math.random() * 0.03,
      0.05 + Math.random() * 0.03
    );

    meteor.material.opacity = 1;
  }

  for (let i = 0; i < 3; i++) createMeteor();

  function updateMeteors() {
    meteors.forEach((meteor) => {
      meteor.position.add(meteor.userData.velocity);
      meteor.material.opacity -= 0.015;

      if (meteor.position.y < -5 || meteor.material.opacity <= 0) {
        resetMeteor(meteor);
      }
    });
  }

  // ===== Orbit Controls =====
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.3;

  // ===== Animate =====
  function animate() {
    requestAnimationFrame(animate);

    starField.rotation.y += 0.0004;
    updateMeteors();
    controls.update();

    renderer.render(scene, camera);
  }

  animate();
  window.addEventListener("resize", resizeRenderer);
})();
