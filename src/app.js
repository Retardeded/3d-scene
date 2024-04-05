import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const parametricFunction = (u, v, target) => {
  const x = u * Math.sin(v);
  const y = u * Math.cos(v);
  const z = v * Math.cos(u);
  target.set(x, y, z);
};

let geometry = new ParametricGeometry(parametricFunction, 100, 100);
const material = new THREE.MeshNormalMaterial();
const parametricSurface = new THREE.Mesh(geometry, material);
scene.add(parametricSurface);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1).normalize();
scene.add(light);

camera.position.z = 5;

const gui = new GUI();
const params = {
  u: 2 * Math.PI,
  v: 2 * Math.PI
};

gui.add(params, 'u', 0, 2 * Math.PI).onChange(updateSurface);
gui.add(params, 'v', 0, 2 * Math.PI).onChange(updateSurface);

function updateSurface() {
  scene.remove(parametricSurface);
  geometry = new ParametricGeometry((u, v, target) => {
    parametricFunction(u * params.u, v * params.v, target);
  }, 100, 100);
  parametricSurface.geometry.dispose();
  parametricSurface.geometry = geometry;
  scene.add(parametricSurface);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

animate();