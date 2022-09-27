import { OrbitControls } from './modified/OrbitControls.js';
import { FirstPersonControls } from './modified/FirstPersonControls.js';
import { MTLLoader } from './modified/MTLLoader.js';
import { OBJLoader } from './modified/OBJLoader.js';

const gui = new dat.GUI();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );
//const controls = new FirstPersonControls( camera, renderer.domElement );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 50;

// GUI ColorHelper

class ColorGUIHelper {
    constructor(object, prop) {
      this.object = object;
      this.prop = prop;
    }
    get value() {
      return `#${this.object[this.prop].getHexString()}`;
    }
    set value(hexString) {
      this.object[this.prop].set(hexString);
    }
}


// LIGHT

{

	const light = new THREE.AmbientLight(0xFFFFFF, 0.5);
	scene.add(light);

	gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('ambient color');
	gui.add(light, 'intensity', 0, 2, 0.01);
	
}
{

	const light = new THREE.PointLight( 0xe6d277, 0.65, 1000, 0);
	light.position.set(0, 100, 0);
	light.castShadow = true;
	scene.add(light);

	gui.addColor(new ColorGUIHelper(light, 'color'), 'value').name('point color');
	gui.add(light, 'intensity', 0, 2, 0.01);
	gui.add(light, 'castShadow').onChange( function ( value ) {
	
		if (value) light.castShadow = true;
		else light.castShadow = false;
	
	});

}


// OBJ/MTL LOADER

	const mtlLoader = new MTLLoader();
	mtlLoader.load( './resources/plex2.mtl',
		(materials) => { materials.preload()
			materials.depthWrite = false;

			const objLoader = new OBJLoader()
			objLoader.setMaterials(materials)
			objLoader.load( './resources/plex2.obj',
				(object) => {

					var texture = new THREE.TextureLoader().load('./resources/plex2-RGBA.png')
					texture.minFilter = texture.magFilter = THREE.NearestFilter;

					object.traverse(function (child) {
						if (child instanceof THREE.Mesh) {
							child.material.map = texture;
						}
					});

					object.position.y = -100
					scene.add(object)
				},
				(xhr) => { console.log((xhr.loaded / xhr.total) * 100 + '% loaded') },
				(error) => { console.log('An error happened', error) }
			)

		},
		(xhr) => { console.log((xhr.loaded / xhr.total) * 100 + '% loaded') },
		(error) => { console.log('An error happened', error) }
	)


// gui.open();

window.addEventListener('resize', () => {
	renderer.setSize(window.innerWidth, window.innerHeight)
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
})

renderer.setAnimationLoop(() => {
	controls.update()
	renderer.render(scene, camera)
})