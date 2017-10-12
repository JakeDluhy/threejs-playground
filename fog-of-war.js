const THREE = require('three');
const _ = require('lodash');

const { axialToTHREE, hexOuterPoints, sameCoordsTHREE, axialDistance } = require('./utils/coordinates');
const { TILE_RADIUS } = require('./params');
const { sqrt3 } = require('./utils/math');

// pass in uniforms. 
const vertexShader = `
  varying vec4 vColor;

  void main() {
    vec3 cRel = cameraPosition - position;

    float dx = (20.0 * cRel.x) / cRel.y;
    float dz = (20.0 * cRel.z) / cRel.y;

    gl_Position = projectionMatrix *
                  modelViewMatrix *
                  vec4(
                    position.x + dx,
                    position.y,
                    position.z + dz,
                    1.0
                  );

    if(color.x == 1.0 && color.y == 1.0 && color.z == 1.0) {
      vColor = vec4(0.0, 0.0, 0.0, 0.0);
    } else {
      vColor = vec4(color, 0.7);
    }
  }
`;

const fragmentShader = `
  varying vec4 vColor;

  float expGradient(float val, float max) {
    return max / pow(100.0, (max - val)) - (max / 100.0);
  }

  void main() {
    gl_FragColor = vec4(
      vColor.x,
      vColor.y,
      vColor.z,
      expGradient(vColor.w, 0.7)
    );
  }
`;

function createFogOfWar(tiles) {
  const tilesArray = _.values(tiles);

  const vertsStructure = [];
  const verts = [];
  const indices = [];
  const colors = [];


  for(let i = 0; i < tilesArray.length; i++) {
    const coords = axialToTHREE(tilesArray[i].coordinates);

    // Going to be some kind of coordinates lookup for passed in visible tiles
    const visible = axialDistance(tilesArray[i].coordinates, [0,0]) < 2 ? true : false;

    vertsStructure.push({ coords, visible, outer: true });
    const centerIndex = vertsStructure.length - 1;

    const outerIndices = hexOuterPoints(TILE_RADIUS).map((pt) => {
      const ptCoords = [coords[0] + pt[1], coords[1], coords[2] + pt[0]];

      let duplicateIndex;

      for(let j = vertsStructure.length - 1; j >= 0; j--) {
        if(sameCoordsTHREE(ptCoords, vertsStructure[j].coords)) {
          duplicateIndex = j;
          vertsStructure[j].visible = vertsStructure[j].visible && visible;
          vertsStructure[j].outer = false;
          break;
        }
      }

      if(_.isNumber(duplicateIndex)) {
        return duplicateIndex;
      } else {
        vertsStructure.push({ coords: ptCoords, visible });
        return vertsStructure.length - 1;
      }
    });

    for(let j = 0; j < outerIndices.length; j++) {
      indices.push(
        centerIndex,
        outerIndices[j],
        outerIndices[(j + 1) % 6]
      );
    }
  }

  vertsStructure.forEach(({ coords, visible }) => {
    verts.push(...coords);

    if(visible) colors.push(1.0, 1.0, 1.0);
    else colors.push(0.0, 0.0, 0.0);
  });

  const geo = new THREE.BufferGeometry();

  geo.addAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(new THREE.Uint16BufferAttribute(indices, 1));
  geo.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    vertexColors: THREE.VertexColors,
    transparent:  true,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 20;

  return mesh;
}

module.exports = createFogOfWar;
