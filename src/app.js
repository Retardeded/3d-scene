import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-28.69442196379509, 10.708580002778586, 20.25770822384103);

// Set camera rotation
camera.rotation.set(-0.3549300144703124, -0.0025006635489656, -0.00008315161972465);


const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.update();
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

const light2 = new THREE.DirectionalLight(0xffffff, 2);
light2.position.set(-50, -50, -50); // Opposite direction
light2.castShadow = true;
scene.add(light2);

// Adding its helper
const dirLightHelper2 = new THREE.DirectionalLightHelper(light2, 5);
scene.add(dirLightHelper2);

camera.position.z = 5;

const reflectionVertexShader = `
  uniform vec3 directionalLightPosition2; // Position of the second light
  varying vec3 vLightDir2; // Direction to the second light

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec4 vWorldPosition;
  varying vec3 vLightDir; // Direction from the surface to the light
  uniform vec3 directionalLightPosition; // The position of a directional light in the scene

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition;
    vViewPosition = cameraPosition - worldPosition.xyz;
    
    // Calculate the vector from the vertex to the light source
    vLightDir = normalize(directionalLightPosition - worldPosition.xyz);

    // New line for the second light
    vLightDir2 = normalize(directionalLightPosition2 - worldPosition.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const reflectionFragmentShader = `

uniform vec3 customColor; // This will be controlled by the GUI
uniform vec3 directionalLightColor;
uniform float directionalLightIntensity;
uniform vec3 directionalLightColor2;
uniform float directionalLightIntensity2;
uniform vec3 ambientLightColor; // Ambient light color
uniform float ambientLightIntensity; // Ambient light intensity

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vLightDir;
varying vec3 vLightDir2;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDirNormalized = normalize(vLightDir);
    vec3 lightDir2Normalized = normalize(vLightDir2);

    // Diffuse reflection for the first light
    float diff = max(dot(lightDirNormalized, normal), 0.0);
    vec3 diffuse = directionalLightColor * directionalLightIntensity * diff;

    // Diffuse reflection for the second light
    float diff2 = max(dot(lightDir2Normalized, normal), 0.0);
    vec3 diffuse2 = directionalLightColor2 * directionalLightIntensity2 * diff2;

    // Ambient light component
    vec3 ambient = ambientLightColor * ambientLightIntensity;

    // Combine diffuse, ambient, and base color
    vec3 baseColor = customColor;
    vec3 finalColor = (diffuse + diffuse2 + ambient) * baseColor;

    gl_FragColor = vec4(finalColor, 1.0);
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
    customColor: { value: new THREE.Color(0xffffff) },
  },
  vertexShader: reflectionVertexShader,
  fragmentShader: reflectionFragmentShader,
  side: THREE.DoubleSide // Render both sides
});

reflectiveMaterial.uniforms.directionalLightPosition = { value: light.position };
reflectiveMaterial.uniforms.directionalLightColor = { value: light.color };
reflectiveMaterial.uniforms.directionalLightIntensity = { value: light.intensity };
reflectiveMaterial.uniforms['directionalLightPosition2'] = { value: light2.position };
reflectiveMaterial.uniforms['directionalLightColor2'] = { value: light2.color };
reflectiveMaterial.uniforms['directionalLightIntensity2'] = { value: light2.intensity };


const rotatingCubes = []; // Store cubes that should rotate
const diffrentCubes = [];
const staticCubes = []; // Store cubes that should rotate
const materialSettings = {
  shininess: 30,
  roughness: 0.5,
  metalness: 0.5
};

// Create initial materials with these settings
const sharedColor = { value: new THREE.Color(0xffffff) };

// Standard and Phong materials will use the shared color
const materials = {
  phong: new THREE.MeshPhongMaterial({ color: sharedColor.value }),
  lambert: new THREE.MeshLambertMaterial({ color: sharedColor.value }),
  standard: new THREE.MeshStandardMaterial({ color: sharedColor.value, roughness: materialSettings.roughness, metalness: materialSettings.metalness }),
};

for (let i = 1; i <= 9; i++) {
  let geometry;
  switch (i % 4) {
    case 0:
      geometry = new THREE.BoxGeometry(4, 4, 4); // Cube
      break;
    case 1:
      geometry = new THREE.CylinderGeometry(2, 2, 4, 32); // Cylinder
      break;
    case 2:
      geometry = new THREE.SphereGeometry(2, 32, 32); // Sphere
      break;
    case 3:
      geometry = new THREE.TorusGeometry(2, 0.5, 16, 100); // Torus
      break;
  }

  const material = reflectiveMaterial; // Using your custom shader material
  let mesh = null;
  if (i % 3 == 0) {
    mesh = new THREE.Mesh(geometry, materials['standard']);
  } else {
    mesh = new THREE.Mesh(geometry, material);
  }

  mesh.castShadow = true; // Enables the mesh to cast shadows
  mesh.receiveShadow = true; // Enables the mesh to receive shadows

  
  mesh.position.z = 15 + i * -5.5;
  scene.add(mesh);

  // Add to the appropriate array
  if (i % 3 === 0) {
    rotatingCubes.push(mesh); // These will rotate
  } else if (i % 2 == 0) {
    diffrentCubes.push(mesh); 
  } else {
    staticCubes.push(mesh); // These will stay static
  }
}

// Add materials to the GUI
const gui = new GUI();

gui.add(materialSettings, 'shininess', 0, 100).onChange(value => {
  materials.phong.shininess = value;
});
gui.add(materialSettings, 'roughness', 0, 1).onChange(value => {
  materials.standard.roughness = value;
});
gui.add(materialSettings, 'metalness', 0, 1).onChange(value => {
  materials.standard.metalness = value;
});

const colorControl = { customColor: "#ffffff" }; // Default white color
const guiColorControl = gui.addColor(colorControl, 'customColor').name('Custom Color');

// GUI change listener

guiColorControl.onChange(function(value) {
  // Update the shared color
  sharedColor.value.set(value);

  // Update the standard materials' color
  Object.keys(materials).forEach(key => {
    materials[key].color.set(value);
    materials[key].needsUpdate = true;
  });

  // Update custom shader material's uniform
  reflectiveMaterial.uniforms.customColor.value.set(value);
  reflectiveMaterial.needsUpdate = true;
});

const cubeMaterialController = gui.add({ material: 'standard' }, 'material', ['standard', 'lambert', 'phong']);
cubeMaterialController.onChange(function(value) {
  // Apply the selected material to the cubes
  rotatingCubes.forEach(cube => {
    cube.material = materials[value];
    cube.material.needsUpdate = true; // This might be needed to update the material
  });
  diffrentCubes.forEach(cube => {
    cube.material = materials[value];
    cube.material.needsUpdate = true; // This might be needed to update the material
  });
  // If you have other groups of cubes that need updating, repeat the process here.
});

// Add light controls to the GUI
const lightFolder = gui.addFolder('Lights');
lightFolder.add(light.position, 'x', -50, 50).name('Position X');
lightFolder.add(light.position, 'y', -50, 50).name('Position Y');
lightFolder.add(light.position, 'z', -50, 50).name('Position Z');
lightFolder.add(light, 'intensity', 0, 2).name('Intensity');
lightFolder.open();

const light2Folder = gui.addFolder('Second Light');
light2Folder.add(light2.position, 'x', -50, 50).name('Position X');
light2Folder.add(light2.position, 'y', -50, 50).name('Position Y');
light2Folder.add(light2.position, 'z', -50, 50).name('Position Z');
light2Folder.add(light2, 'intensity', 0, 2).name('Intensity');
light2Folder.open();

function animate() {
  requestAnimationFrame(animate);

  rotatingCubes.forEach((cube, index) => {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  });

  controls.update(); // Just one call needed per frame
  renderer.render(scene, camera); // Just one call needed per frame
}

animate();