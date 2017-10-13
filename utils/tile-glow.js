const THREE = require('three');
const _ = require('lodash');

const vertexShader = `
  varying vec4 vColor;
  attribute float alpha;

  void main() {
    vColor = vec4(color, alpha);

    gl_Position = projectionMatrix *
                  modelViewMatrix *
                  vec4(position, 1.0);
  }
`;

const fragmentShader = `
  varying vec4 vColor;

  void main() {
    gl_FragColor = vColor;
  }
`;

function createTileGlow(coordinates, color) {
  const verts = [];
  const indices = [];
  const colors = [];
  const alphas = [];

  for(let i = 0; i < coordinates.length; i++) {
    const current = coordinates[i];

    verts.push(...current);
    colors.push(...color);
    alphas.push(1);

    verts.push(current[0], current[1] + 4, current[2]);
    colors.push(...color);
    alphas.push(0);

    if(i !== coordinates.length - 1) {
      const thisIndex = (2 * i);
      const nextIndex = (2 * (i + 1));
      indices.push(thisIndex,     thisIndex + 1, nextIndex);
      indices.push(thisIndex + 1, nextIndex,     nextIndex + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.addAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(new THREE.Uint16BufferAttribute(indices, 1));
  geo.addAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.addAttribute('alpha', new THREE.Float32BufferAttribute(alphas, 1));

  const mat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    vertexColors: THREE.VertexColors,
    transparent:  true,
    side:         THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geo, mat);

  return mesh;
}

module.exports = createTileGlow;
