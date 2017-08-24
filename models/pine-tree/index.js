const THREE = require('three');
const loader = new THREE.BufferGeometryLoader();

const { sample } = require('../../utils/array');

const TRUNK_KEY = 'pine-tree/trunk';
const LEAVES_KEY = 'pine-tree/leaves';
const BASE_BOUNDING_RADIUS = 1.8;
const LEAF_COLORS = [0x50BA81];

THREE.Cache.add(TRUNK_KEY, JSON.stringify(require('./trunk.json')));
THREE.Cache.add(LEAVES_KEY, JSON.stringify(require('./leaves.json')));

function pineTree({ zxScale }) {
  const group = new THREE.Group();

  loader.load(TRUNK_KEY, (geometry) => {
    const material = new THREE.MeshLambertMaterial({ color: 0x8F4F1C });
    group.add(new THREE.Mesh(geometry, material));
  });
  loader.load(LEAVES_KEY, (geometry) => {
    const material = new THREE.MeshLambertMaterial({ color: sample(LEAF_COLORS) });
    group.add(new THREE.Mesh(geometry, material));
  });

  group.scale.z = zxScale;
  group.scale.x = zxScale;
  group.scale.y = 1 + Math.random();
  group.rotation.y = Math.random() * Math.PI / 2;
  group.boundingRadius = getTreeBoundingRadius(zxScale);

  return group;
}

function getTreeBoundingRadius(zxScale) {
  return zxScale * BASE_BOUNDING_RADIUS;
}

exports.getTreeBoundingRadius = getTreeBoundingRadius;
exports.pineTree = pineTree;
