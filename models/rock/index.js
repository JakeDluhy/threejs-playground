const THREE = require('three');
const loader = new THREE.BufferGeometryLoader();

const { sample } = require('../../utils/array');

const ROCK1_KEY = 'rock/rock1';
const ROCK2_KEY = 'rock/rock2';
const ROCK3_KEY = 'rock/rock3';

const BASE_BOUNDING_RADIUS = 0.5;
const ROCK_COLORS = [0x455A64];

THREE.Cache.add(ROCK1_KEY, JSON.stringify(require('./rock1.json')));
THREE.Cache.add(ROCK2_KEY, JSON.stringify(require('./rock2.json')));
THREE.Cache.add(ROCK3_KEY, JSON.stringify(require('./rock3.json')));

const rockPromises = [
  new Promise((resolve, reject) => loader.load(ROCK1_KEY, resolve, null, reject)),
  new Promise((resolve, reject) => loader.load(ROCK2_KEY, resolve, null, reject)),
  new Promise((resolve, reject) => loader.load(ROCK3_KEY, resolve, null, reject)),
];

function rock({ zxScale }) {
  const mesh = new THREE.Mesh(new THREE.Geometry());

  sample(rockPromises).then((geo) => {
    mesh.geometry = geo;
    mesh.material = new THREE.MeshLambertMaterial({ color: sample(ROCK_COLORS), side: THREE.BackSide });
  });

  mesh.scale.z = zxScale;
  mesh.scale.x = zxScale;
  // mesh.scale.y = 1 + Math.random();
  mesh.rotation.y = Math.random() * Math.PI / 2;

  return mesh;
}

function getRockBoundingRadius(zxScale) {
  return zxScale * BASE_BOUNDING_RADIUS;
}

exports.getRockBoundingRadius = getRockBoundingRadius;
exports.rock = rock;
