import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
document.body.appendChild(renderer.domElement);

// Increase directional light intensity and adjust its position
const light = new THREE.DirectionalLight(0xffffff, 2); // Increased intensity
light.position.set(50, 50, 50); // Changed position to be more distant
light.castShadow = true;
scene.add(light);

// Add a directional light helper to visualize the light's position and direction
const dirLightHelper = new THREE.DirectionalLightHelper(light, 5);
scene.add(dirLightHelper);

// Add a hemisphere light for soft ambient lighting
const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.6);
scene.add(hemisphereLight);

// Add point lights to cover more areas
const pointLight1 = new THREE.PointLight(0xffffff, 1, 100);
pointLight1.position.set(-10, 10, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 1, 100);
pointLight2.position.set(10, -10, -10);
scene.add(pointLight2);

// Add point light helpers to visualize their positions
const pointLightHelper1 = new THREE.PointLightHelper(pointLight1, 1);
scene.add(pointLightHelper1);

const pointLightHelper2 = new THREE.PointLightHelper(pointLight2, 1);
scene.add(pointLightHelper2);

// Use spotlights for focused lighting
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(15, 40, 35);
spotLight.angle = Math.PI / 6;
spotLight.castShadow = true;
scene.add(spotLight);

// Add a spotlight helper
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// Ambient light for overall illumination
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

// This function will update light helpers on each frame, if they're not updating automatically
function updateHelpers() {
  dirLightHelper.update();
  pointLightHelper1.update();
  pointLightHelper2.update();
  spotLightHelper.update();
}


camera.position.z = 5;

const reflectionVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vViewPosition = cameraPosition - worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const reflectionFragmentShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewPosition = normalize(vViewPosition);
    float angle = dot(viewPosition, normal);
    vec3 color = vec3(1.0); // base color

    // Blend colors based on the angle
    color = mix(color, vec3(1,1,0), step(0.0, angle)); // yellow
    color = mix(color, vec3(0,0,1), step(0.5, angle)); // blue
    color = mix(color, vec3(1,0,0), step(0.75, angle)); // red

    gl_FragColor = vec4(color, 1.0);
  }
`;


const cubeTextureLoader = new THREE.CubeTextureLoader();

const backgroundTexture = cubeTextureLoader.load([
  'cubeImgs/image_part_001.jpg', // posx
  'cubeImgs/image_part_001.jpg', // negx
  'cubeImgs/image_part_001.jpg', // posy
  'cubeImgs/image_part_001.jpg', // negy
  'cubeImgs/image_part_001.jpg', // posz
  'cubeImgs/image_part_001.jpg'  // negz
]);


scene.background = backgroundTexture;


// Reflective Material
const reflectiveMaterial = new THREE.ShaderMaterial({
  uniforms: {
    // Remove the envMap uniform if not using environment mapping
  },
  vertexShader: reflectionVertexShader,
  fragmentShader: reflectionFragmentShader,
  side: THREE.DoubleSide // Render both sides
});

const rotatingCubes = []; // Store cubes that should rotate
const normalsHelpers = []; // Store normal helpers for updating
const textureLoader = new THREE.TextureLoader();
const materials = [];

for (let i = 1; i <= 9; i++) {
  const texturePath = `cubeImgs/image_part_00${i}.jpg`;

  textureLoader.load(
    texturePath,
    function (texture) {
      // When texture is loaded
      const material = reflectiveMaterial; // Use the reflective material
      const cubeGeometry = new THREE.BoxGeometry(4, 4, 4); // Define the geometry
      const cube = new THREE.Mesh(cubeGeometry, material);
      const normalsHelper = new VertexNormalsHelper(cube, 2, 0x00ff00, 1);
      scene.add(normalsHelper);
      normalsHelpers.push(normalsHelper);
      
      // Position cubes in a line for simplicity
      cube.position.x = i * -5.5;
      scene.add(cube);

      // Make every second cube rotate
      if (i % 2 === 0) {
        rotatingCubes.push(cube); // Add to rotatingCubes array
      }
      
      if (materials.length === 9) {
        animate(); // Start animation loop when all textures are loaded
      }
    },
    undefined,
    function (err) {
      console.error('An error occurred while loading the texture:', err);
    }
  );
}

const phongMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
const standardMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });

// Add materials to the GUI
const gui = new GUI();

// GUI control for the light position
gui.add(light.position, 'x', -10, 10);
gui.add(light.position, 'y', -10, 10);
gui.add(light.position, 'z', -10, 10);

const materialFolder = gui.addFolder('Materials');
materialFolder.addColor(phongMaterial, 'color').name('Phong Color');
materialFolder.addColor(lambertMaterial, 'color').name('Lambert Color');
materialFolder.addColor(standardMaterial, 'color').name('Standard Color');
materialFolder.open();

// Add light controls to the GUI
const lightFolder = gui.addFolder('Lights');
lightFolder.add(light.position, 'x', -50, 50).name('Position X');
lightFolder.add(light.position, 'y', -50, 50).name('Position Y');
lightFolder.add(light.position, 'z', -50, 50).name('Position Z');
lightFolder.add(light, 'intensity', 0, 2).name('Intensity');
lightFolder.open();

function animate() {
  requestAnimationFrame(animate);

  rotatingCubes.forEach((cube, index) => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Update the normals helper for this cube
    normalsHelpers[index].update();
  });

  controls.update(); // Just one call needed per frame
  renderer.render(scene, camera); // Just one call needed per frame
  updateHelpers();

}

animate();