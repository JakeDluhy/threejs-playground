const THREE = require('three');
const _ = require('lodash');

class Raycaster {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.isActivated = false;

    this.onMouseMove = _.throttle((event) => {
      this.isActivated = true;
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }, 16);

    window.addEventListener('mousemove', this.onMouseMove);
  }

  teardown() {
    window.removeEventListener('mousemove', this.onMouseMove);
  }

  findTile(scene, camera) {
    if(this.isActivated) {
      this.raycaster.setFromCamera(this.mouse, camera);

      const intersects = this.raycaster.intersectObjects(scene.children, true);
      for(let i = 0; i < intersects.length; i++) {
        const tile = findTileUp(intersects[i].object);

        if(tile) return tile;
      }

      return null;
    }
  }
}

module.exports = Raycaster;

function findTileUp(object3D) {
  if(object3D.isTile) return object3D;
  if(!object3D.parent) return null;
  return findTileUp(object3D.parent);
}
