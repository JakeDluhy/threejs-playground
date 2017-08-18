const THREE = require('three');

function setupLights(scene) {
	const ambientLight = new THREE.AmbientLight(0x404040);

	const lights = [];
	lights[ 0 ] = new THREE.PointLight( 0xffffff, 0.6, 0 );
	lights[ 1 ] = new THREE.PointLight( 0xffffff, 0.6, 0 );
	lights[ 2 ] = new THREE.PointLight( 0xffffff, 0.6, 0 );

	lights[ 0 ].position.set( 0, 200, 0 );
	lights[ 1 ].position.set( 100, 200, 100 );
	lights[ 2 ].position.set( - 100, - 200, - 100 );

	scene.add( lights[ 0 ] );
	scene.add( lights[ 1 ] );
	scene.add( lights[ 2 ] );

	scene.add(ambientLight);
}

module.exports = setupLights;