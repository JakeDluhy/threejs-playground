const THREE = require('three');

const { sumN } = require('./math');

function createHexagonGeometry(rings, radius, yFunc = () => 0, faceFunc = () => {}) {
  const ringRad = radius / rings;
  const verts = [];
  const faces = [];

  verts.push(new THREE.Vector3(0, yFunc(0), 0));
  for(let i = 1; i <= 6; i++) {
    const angle = (i - 1) * (Math.PI / 3);

    verts.push(new THREE.Vector3(
      ringRad * Math.sin(angle),
      yFunc(i),
      ringRad * Math.cos(angle)
    ));

    pushFace(
      i,
      (i % 6) + 1,
      0
    );

    if(rings !== 1) {
      pushFace(
        i,
        6 + (2 * i),
        (i % 6) + 1
      );
    }
  }

  for(let i = 2; i <= rings; i++) {
    const numTotalPoints = sumN(i) * 6;
    const numPrevTotalPoints = sumN(i - 1) * 6;
    const numRingPoints = numTotalPoints - numPrevTotalPoints;
    let cornerCount = 0;

    for(let j = 1; j <= numRingPoints; j++) {
      let z, x;
      let sideIdx = (j - 1) % i;
      if(sideIdx === 0) {
        const angle = (j - 1) * (2*Math.PI / numRingPoints);

        z = (ringRad * i) * Math.cos(angle);
        x = (ringRad * i) * Math.sin(angle);
      } else {
        const prevAngle = Math.floor((j - 1) / i) * (Math.PI / 3);
        const nextAngle = Math.ceil((j - 1) / i) * (Math.PI / 3);

        z = (ringRad * i) * (((Math.cos(nextAngle) - Math.cos(prevAngle)) * sideIdx / i) + Math.cos(prevAngle));
        x = (ringRad * i) * (((Math.sin(nextAngle) - Math.sin(prevAngle)) * sideIdx / i) + Math.sin(prevAngle));
      }

      verts.push(new THREE.Vector3(x, yFunc(numPrevTotalPoints + j), z));

      let thirdVert = ((sumN(i - 2) * 6) + j - cornerCount);
      thirdVert = (thirdVert > numPrevTotalPoints) ? (sumN(i - 2) * 6) + 1 : thirdVert;

      pushFace(
        numPrevTotalPoints + j,
        numPrevTotalPoints + ((j % numRingPoints) + 1),
        thirdVert
      );

      if(i !== rings) {
        pushFace(
          numPrevTotalPoints + j,
          numTotalPoints + j + 1 + cornerCount,
          numPrevTotalPoints + ((j % numRingPoints) + 1)
        );
      }

      if(j % i === 0) cornerCount++;
    }
  }

  const geo = new THREE.Geometry();
  geo.vertices = verts;
  geo.faces = faces;
  geo.computeFaceNormals();
  
  return geo;

  function pushFace(a, b, c) {
    const face = new THREE.Face3(a, b, c);
    faceFunc(face);
    faces.push(face);
  }
}

exports.createHexagonGeometry = createHexagonGeometry;
