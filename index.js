const THREE = require('three');
const OrbitControls = require('./helpers/orbit-controls')(THREE);
THREE.Cache.enabled = true;

const setupLights = require('./helpers/setup-lights');
const buildAxes = require('./helpers/build-axes');

const { TILE_RADIUS } = require('./tiles/generic');
const forestTile = require('./tiles/forest');
const mountainTile = require('./tiles/mountain');

require('./css/normalize.css');

// Set height, width, and default camera position
const width = window.innerWidth;
const height = window.innerHeight;

const VIEW_ANGLE = 45;
const ASPECT = width / height;
const NEAR = 1;
const FAR  = 10000;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
camera.position.x = -50;
camera.position.y = 50;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0x616161);

// Set up controls and add the renderer to the dom
const controls = new OrbitControls(camera, renderer.domElement, { maxPolarAngle: Math.PI / 2 });

document.body.appendChild(renderer.domElement);

// Add objects to the scene
scene.add(buildAxes(50));
setupLights(scene);

const f1 = forestTile();

const f2 = forestTile();
f2.position.x = TILE_RADIUS * Math.sqrt(3);

const f3 = forestTile();
f3.position.x = -TILE_RADIUS * Math.sqrt(3);

const f4 = forestTile();
f4.position.x = TILE_RADIUS * Math.sqrt(3)/2;
f4.position.z = 1.5 * TILE_RADIUS;

const f5 = forestTile();
f5.position.x = -TILE_RADIUS * Math.sqrt(3)/2;
f5.position.z = 1.5 * TILE_RADIUS;

const f6 = forestTile();
f6.position.x = TILE_RADIUS * Math.sqrt(3)/2;
f6.position.z = -1.5 * TILE_RADIUS;

const f7 = forestTile();
f7.position.x = -TILE_RADIUS * Math.sqrt(3)/2;
f7.position.z = -1.5 * TILE_RADIUS;

const m1 = mountainTile();

scene.add(m1);
// scene.add(f2);
// scene.add(f3);
// scene.add(f4);
// scene.add(f5);
// scene.add(f6);
// scene.add(f7);

// Start
animate();
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}, false);

