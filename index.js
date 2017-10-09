const THREE = require('three');
const OrbitControls = require('./helpers/orbit-controls')(THREE);
THREE.Cache.enabled = true;

const setupLights = require('./helpers/setup-lights');
const buildAxes = require('./helpers/build-axes');

const { TILE_RADIUS } = require('./tiles/generic');
const forestTile = require('./tiles/forest');
const mountainTile = require('./tiles/mountain');
const riverTile = require('./tiles/river');
const plainsTile = require('./tiles/plains');
const oceanTile = require('./tiles/ocean');
const lakeTile = require('./tiles/lake');

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

const l1 = lakeTile(1);

const r1 = riverTile(4, 0, false);
r1.position.x = -TILE_RADIUS * Math.sqrt(3)/2;
r1.position.z = -TILE_RADIUS * 1.5;

const r2 = riverTile(3, 2, true);
r2.position.x = -TILE_RADIUS * Math.sqrt(3)/2 * 3;
r2.position.z = -TILE_RADIUS * 1.5;

const r3 = riverTile(5, 1, true);
r3.position.x = -TILE_RADIUS * Math.sqrt(3)/2 * 2;
r3.position.z = -TILE_RADIUS * 3;

const m1 = mountainTile();
m1.position.x = TILE_RADIUS * Math.sqrt(3)/2;
m1.position.z = TILE_RADIUS * 1.5;

const m2 = mountainTile();
m2.position.x = -TILE_RADIUS * Math.sqrt(3)/2;
m2.position.z = TILE_RADIUS * 1.5;

const m3 = mountainTile();
m3.position.x = -TILE_RADIUS * Math.sqrt(3);

const p1 = plainsTile();
p1.position.z = -TILE_RADIUS * 3;

const p2 = plainsTile();
p2.position.x = TILE_RADIUS * Math.sqrt(3)/2 * 2;
p2.position.z = -TILE_RADIUS * 3;

const p3 = plainsTile();
p3.position.x = TILE_RADIUS * Math.sqrt(3)/2;
p3.position.z = -TILE_RADIUS * 1.5;

const f1 = forestTile();
f1.position.x = TILE_RADIUS * Math.sqrt(3);

const f2 = forestTile();
f2.position.x = TILE_RADIUS * Math.sqrt(3)/2 * 3;
f2.position.z = -TILE_RADIUS * 1.5;

const f3 = forestTile();
f3.position.x = TILE_RADIUS * Math.sqrt(3)/2 * 3;
f3.position.z = TILE_RADIUS * 1.5;

scene.add(l1);
scene.add(r1);
scene.add(r2);
scene.add(r3);
scene.add(m1);
scene.add(m2);
scene.add(m3);
scene.add(p1);
scene.add(p2);
scene.add(p3);
scene.add(f1);
scene.add(f2);
scene.add(f3);

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

