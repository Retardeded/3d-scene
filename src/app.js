import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

camera.position.z = 5;

const vertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal); // Transform the normal to camera space
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader
const fragmentShader = `
  varying vec3 vNormal;
  void main() {
    float intensity = pow(0.5 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * intensity; // Simple effect to simulate refraction
  }
`;

const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
});

// Create a sphere with the shader material
const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
const sphere = new THREE.Mesh(sphereGeometry, shaderMaterial);
scene.add(sphere);

const cubeGeometry = new THREE.BoxGeometry(3, 3, 3);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 }); // Green cube
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.x = -5; // Move the cube to the left
scene.add(cube);

// Create a cylinder with a simple Lambert material
const cylinderGeometry = new THREE.CylinderGeometry(2, 2, 5, 32);
const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); // Red cylinder
const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
cylinder.position.x = 5; // Move the cylinder to the right
scene.add(cylinder);

const gui = new GUI();

gui.addColor({ color: cubeMaterial.color.getHex() }, 'color').onChange((value) => {
  cubeMaterial.color.set(value);
});

// GUI control for the light position
gui.add(light.position, 'x', -10, 10);
gui.add(light.position, 'y', -10, 10);
gui.add(light.position, 'z', -10, 10);

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  cylinder.rotation.x += 0.01;
  cylinder.rotation.y += 0.01;

  controls.update();
  renderer.render(scene, camera);

  renderer.render(scene, camera);
}

animate();