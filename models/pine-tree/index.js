const THREE = require('three');
const loader = new THREE.BufferGeometryLoader();

function getModel() {
  const group = new THREE.Group();

  loader.load('./models/pine-tree/trunk.json', (geometry) => {
    const material = new THREE.MeshBasicMaterial({ color: 0x8F4F1C });
    group.add(new THREE.Mesh(geometry, material));
  });
  loader.load('./models/pine-tree/leaves.json', (geometry) => {
    const material = new THREE.MeshBasicMaterial({ color: 0x7AE7AC });
    group.add(new THREE.Mesh(geometry, material));
  });

  return group;
}

module.exports = getModel;
