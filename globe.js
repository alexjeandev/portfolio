// globe.js — Earth + Starfield + Clean Shooting Meteors

(function () {
  const canvas = document.getElementById("globeCanvas");
  if (!canvas || !window.THREE) return;

  const container = canvas.parentElement;

  // ========== SCENE ==========
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

  // ========== LIGHTING ==========
  scene.add(new THREE.AmbientLight(0x404040, 1.5));
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(5, 3, 5);
  scene.add(dir);

  // ========== EARTH ==========
  const texture = new THREE.TextureLoader().load("assets/earth_night.jpg");
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

  // ========== STARFIELD (CLEAN) ==========
  const starsGeo = new THREE.BufferGeometry();
  const starCount = 1500;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount * 3; i++) {
    starPositions[i] = (Math.random() - 0.5) * 50; // large cube of stars
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

  // ========== SHOOTING METEORS (CLEAN STREAK LINES) ==========
  const meteors = [];

  function createMeteor() {
    const material = new THREE.LineBasicMaterial({
      color: 0xffddaa,
      transparent: true,
      opacity: 1,
      linewidth: 2,
    });

    const length = 0.8;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      0, 0, 0,  // tail
      length, 0, 0 // head
    ]);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const meteor = new THREE.Line(geometry, material);

    resetMeteor(meteor);
    scene.add(meteor);
    meteors.push(meteor);
  }

  function resetMeteor(meteor) {
    meteor.position.set(
      -8 + Math.random() * 3,  // x start
      4 + Math.random() * 2,   // y start
      -5 + Math.random() * 3   // z start
    );

    meteor.userData.velocity = new THREE.Vector3(
      0.18 + Math.random() * 0.05, // speed x
      -0.22 - Math.random() * 0.03, // speed y
      0.05 + Math.random() * 0.03 // depth
    );

    meteor.material.opacity = 1;
  }

  // create 3 elegant meteors
  for (let i = 0; i < 3; i++) createMeteor();

  function updateMeteors() {
    meteors.forEach((meteor) => {
      meteor.position.add(meteor.userData.velocity);
      meteor.material.opacity -= 0.015; // fade out

      if (
        meteor.position.y < -5 ||
        meteor.material.opacity <= 0
      ) {
        resetMeteor(meteor);
      }
    });
  }

  // ========== ORBIT CONTROLS ==========
  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.3;

  // ========== ANIMATION LOOP ==========
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