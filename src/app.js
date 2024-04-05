import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.gammaOutput = true;
renderer.gammaFactor = 2.2;
renderer.physicallyCorrectLights = true;
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();

light.intensity = 1.5; // Or any value greater than 1 to increase brightness
scene.add(light);

// Add additional lights if needed
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(100, 1000, 100);
spotLight.castShadow = true;
scene.add(spotLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(hemisphereLight);


camera.position.z = 5;

const cubeTextureLoader = new THREE.CubeTextureLoader();

const backgroundTexture = cubeTextureLoader.load([
  'cubeImgs/image_part_001.jpg', // posx
  'cubeImgs/image_part_002.jpg', // negx
  'cubeImgs/image_part_003.jpg', // posy
  'cubeImgs/image_part_004.jpg', // negy
  'cubeImgs/image_part_005.jpg', // posz
  'cubeImgs/image_part_006.jpg'  // negz
]);

scene.background = backgroundTexture;


const environmentMap = cubeTextureLoader.load([
  'cubeImgs/image_part_001.jpg', // posx
  'cubeImgs/image_part_002.jpg', // negx
  'cubeImgs/image_part_003.jpg', // posy
  'cubeImgs/image_part_004.jpg', // negy
  'cubeImgs/image_part_005.jpg', // posz
  'cubeImgs/image_part_006.jpg'  // negz
]);

// Vertex Shader
// Vertex Shader for Reflection
const reflectionVertexShader = `
  varying vec3 vReflect;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec3 worldNormal = normalize(mat3(modelMatrix) * normal);
    vec3 viewVector = normalize(cameraPosition - worldPosition.xyz);
    vReflect = reflect(viewVector, worldNormal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader for Reflection
const reflectionFragmentShader = `
  uniform samplerCube envMap;
  varying vec3 vReflect;
  void main() {
    vec3 reflectedColor = textureCube(envMap, vec3(-vReflect.x, vReflect.yz)).rgb; // Invert the x component for correct reflection
    gl_FragColor = vec4(reflectedColor, 1.0);
  }
`;

// Reflective Material
const reflectiveMaterial = new THREE.ShaderMaterial({
  uniforms: {
    envMap: { value: environmentMap }
  },
  vertexShader: reflectionVertexShader,
  fragmentShader: reflectionFragmentShader
});


const cube = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 4), reflectiveMaterial);
cube.position.x = -4;
scene.add(cube);

// Create a cylinder with a simple Lambert material
const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 5, 32);
const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red cylinder
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.x = 5; // Move the cylinder to the right
scene.add(cylinder);

const planeGeometry = new THREE.PlaneGeometry(10, 10);
const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const whitePlane = new THREE.Mesh(planeGeometry, whiteMaterial);
whitePlane.position.set(0, -5, 0); // Position it below the objects
whitePlane.rotateX(-Math.PI / 2); // Rotate to face up
scene.add(whitePlane);

// Create a plane with a texture material using one of your images
const textureLoader = new THREE.TextureLoader();
const imageTexture = textureLoader.load('cubeImgs/image_part_001.jpg');
const textureMaterial = new THREE.MeshBasicMaterial({ map: imageTexture });
const texturedPlane = new THREE.Mesh(planeGeometry, textureMaterial);
texturedPlane.position.set(0, 5, 0); // Position it above the objects
texturedPlane.rotateX(-Math.PI / 2); // Rotate to face down
scene.add(texturedPlane);

const gui = new GUI();

// GUI control for the light position
gui.add(light.position, 'x', -10, 10);
gui.add(light.position, 'y', -10, 10);
gui.add(light.position, 'z', -10, 10);

function animate() {
  requestAnimationFrame(animate);

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  cylinder.rotation.x += 0.01;
  cylinder.rotation.y += 0.01;

  controls.update(); // Just one call needed per frame
  renderer.render(scene, camera); // Just one call needed per frame
}

animate();