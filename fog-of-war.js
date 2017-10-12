const THREE = require('three');
const _ = require('lodash');

const { axialToTHREE } = require('./utils/coordinates');

// pass in uniforms. 
const vertexShader = `
  varying vec4 vColor;

  void main() {
    vec3 cRel = cameraPosition - position;

    float dx = (20.0 * cRel.x) / cRel.y;
    float dz = (20.0 * cRel.z) / cRel.y;

    vec3 p = vec3(
      position.x + dx,
      position.y,
      position.z + dz
    );

    gl_Position = projectionMatrix *
                  modelViewMatrix *
                  vec4(p, 1.0);

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
    return max / pow(20.0, (max - val)) - (max / 20.0);
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
  // const tileIndices = tilesArray.map(({ coordinates: coords }, index) => ({ coords, index }));

  const verts = [];
  const normals = [];
  const indices = [];
  const colors = [];

  tilesArray.forEach(({ coordinates: coords }, idx) => {
    // Push verts
    verts.push(...axialToTHREE(coords));
    normals.push(0, 1, 0);

    // Push indices
    let rightUp;
    let rightDown;
    let down;

    for(let i = 0; i < tilesArray.length; i++) {
      const { coordinates: nextCoords } = tilesArray[i];

      if((coords[0] + 1) === nextCoords[0] && (coords[1] - 1) === nextCoords[1]) rightUp = i;
      else if((coords[0] + 1) === nextCoords[0] && coords[1] === nextCoords[1]) rightDown = i;
      else if(coords[0] === nextCoords[0] && (coords[1] + 1) === nextCoords[1]) down = i;
    }

    if(_.isNumber(rightDown) && _.isNumber(rightUp)) indices.push(rightDown, rightUp, idx);
    if(_.isNumber(down) && _.isNumber(rightDown)) indices.push(down, rightDown, idx);

    // Push colors
    if(idx < 20) colors.push(1.0, 1.0, 1.0);
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
  });
  console.log(geo);
  mat.transparent = true;

  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.y = 20;

  return mesh;
}

module.exports = createFogOfWar;
