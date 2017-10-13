const THREE = require('three');
const _ = require('lodash');

const { TILE_RADIUS } = require('../params');

const createTileGlow = require('./tile-glow');
const { hexOuterPoints } = require('./coordinates');
const hexCoordinates = hexOuterPoints(TILE_RADIUS).map(([z, x]) => [x, 0, z]);

const GLOW_COORDINATES = [...hexCoordinates, hexCoordinates[0]];
const GLOW_COLOR = [0.6, 0.1, 0.1];

class GameCursor {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.glowEffect = createTileGlow(GLOW_COORDINATES, GLOW_COLOR);
    this.glowEffect.visible = false;
    this.scene.add(this.glowEffect);

    this.selectedTile = null;

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

  update() {
    if(!this.isActivated) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    this.selectedTile = null;
    if(intersects.length > 0) {
      for(let i = 0; i < intersects.length; i++) {
        const tile = findTileUp(intersects[i].object);

        if(tile) {
          this.selectedTile = tile;
          break;
        }
      }
    }

    if(this.selectedTile) {
      this.glowEffect.visible = true;
      this.glowEffect.position.copy(this.selectedTile.position);
    } else {
      this.glowEffect.visible = false;
    }
  }
}

module.exports = GameCursor;

function findTileUp(object3D) {
  if(object3D.isTile) return object3D;
  if(!object3D.parent) return null;
  return findTileUp(object3D.parent);
}
