const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
THREE.Cache.enabled = true;

const setupLights = require('./helpers/setup-lights');
const buildAxes = require('./helpers/build-axes');

const { TILE_RADIUS } = require('./tiles/generic');
const forestTile = require('./tiles/forest');

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
const controls = new OrbitControls(camera, renderer.domElement);

document.body.appendChild(renderer.domElement);

// Add objects to the scene
scene.add(buildAxes(50));
setupLights(scene);

const f1 = forestTile();

scene.add(f1);

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

