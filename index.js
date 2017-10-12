const THREE = require('three');
const OrbitControls = require('./helpers/orbit-controls')(THREE);
const _ = require('lodash');
THREE.Cache.enabled = true;

const setupLights = require('./helpers/setup-lights');
const buildAxes = require('./helpers/build-axes');
const Raycaster = require('./utils/raycaster');

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
camera.position.x = -250;
camera.position.y = 250;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0x000000);

// Set up controls and add the renderer to the dom
const controls = new OrbitControls(camera, renderer.domElement, { maxPolarAngle: Math.PI / 2.5 });

document.body.appendChild(renderer.domElement);

// Add objects to the scene
scene.add(buildAxes(50));
setupLights(scene);


/** Add scene from data */
const { typeMap } = require('./tiles');
const { axialToTHREE } = require('./utils/coordinates');
const map = require('./map');

_.values(map.tiles).forEach((tileData) => {
  const tile = typeMap[tileData.type](tileData.params);

  tile.position.set(...axialToTHREE(tileData.coordinates));
  tile.coordinates = tileData.coordinates;
  tile.isTile = true;

  scene.add(tile);
});
/** End add scene from data */

scene.add(require('./fog-of-war')(map.tiles));


/** Add raycaster */
const raycaster = new Raycaster();

// Start
animate();
function animate() {
  const tile = raycaster.findTile(scene, camera);

  controls.update();
  if(controls.object.position.y < 25) controls.object.position.y = 25;

  renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}, false);
