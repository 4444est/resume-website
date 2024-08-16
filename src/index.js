import * as THREE from 'three';
import TWEEN from 'jsm/libs/tween.module.min.js';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { EffectComposer } from 'jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'jsm/loaders/FontLoader.js';
import { TextGeometry } from 'jsm/geometries/TextGeometry.js';
import { ColorGenerator } from './support.js';
import { GUI } from 'dat.gui';

// // GUI
const gui = new GUI();

// TOOLTIPS
let tooltipHovered = false;
const tooltipNames = [`<i class="fa-regular fa-file"></i> Resume`, 
                      `<i class="fa-brands fa-github"></i> Github`, 
                      `<i class="fa-brands fa-linkedin"></i> LinkedIn`, 
                      `<i class="fa-regular fa-envelope"></i> Email Me`];
const tooltipLinks = ["https://docs.google.com/document/d/1IHOdzdLQQfuAtyiyIgnkn--9ApZSdtnDXZfKimopYvE/edit?usp=sharing", 
                      "https://github.com/4444est", 
                      "https://www.linkedin.com/in/forrest-hartley-a87810172/", 
                      "mailto:forresth2000@gmail.com"];
const tooltips = [];

const createTooltips = () => {
  for (let i = 0; i < tooltipNames.length; i++) {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    tooltip.innerHTML = tooltipNames[i];
    // handle tooltip click events
    tooltip.addEventListener("click", function() {
      window.open(tooltipLinks[i], "_blank");
    });
    // handle tooltip hover events
    tooltip.addEventListener("mouseover", function() {
      tooltipHovered = true;
    });

    tooltip.addEventListener("mouseout", function() {
      tooltipHovered = false;
    });
    document.body.appendChild(tooltip);
    tooltips.push(tooltip);
  }
}

createTooltips();

// TEXT
const loader = new FontLoader();
loader.load('./fonts/Comfortaa_Regular', function(font) {
  const smileGeometry = new TextGeometry(')', {
    font: font,
    size: 14, // Adjust the size
    height: 0.8, // Depth of the text
  });
  const eyeGeometry = new TextGeometry('.', {
    font: font,
    size: 14, // Adjust the size
    height: 0.8, // Depth of the text
  });


  const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const textMaterial2 = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const smileMesh = new THREE.Mesh(smileGeometry, textMaterial);
  const eyeMesh = new THREE.Mesh(eyeGeometry, textMaterial2);

  // Set the position in 3D space
  smileMesh.position.set(5, -10.0, -0.5);
  eyeMesh.position.set(-2.2, -10, -0.5);

  // Add the text to the scene
  scene.add(smileMesh);
  scene.add(eyeMesh);
});


// SCENE
const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);

camera.position.z = 125;
const scene = new THREE.Scene();

// Initialize controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable damping (inertia)
controls.dampingFactor = 0.04; // Set damping factor if needed
controls.enableZoom = false; // disable zooming
controls.enablePan = false; // disable panning

const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.1, 0.4, 100);
bloomPass.threshold = 2;
bloomPass.strength = 1;
bloomPass.radius = 0;

const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);


// CORE OBJECT
const geometry = new THREE.IcosahedronGeometry(1, 2);
const material = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    flatShading: true,
    roughness: 0,
    shininess: 100,
});
const mainMesh = new THREE.Mesh(geometry, material);
scene.add(mainMesh);

// WIREFRAME
const wireGeometry = new THREE.IcosahedronGeometry(1.08, 2);
const wireMat = new THREE.MeshBasicMaterial({ 
  color: 0xffffff, 
  wireframe: true 
});
const wireMesh = new THREE.Mesh(wireGeometry, wireMat);
scene.add(wireMesh);

const pointGeometry = new THREE.SphereGeometry(0.04, 12, 12); 
const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const positionAttribute = wireGeometry.getAttribute('position');

const group = new THREE.Group();
let count = 0;
let tooltipCount = 0;
let meshIndex = 0; // index to track tooltips

// loop through each vertex of the icosahedron
for (let i = 0; i < positionAttribute.count; i++) {
  if (count % 80 === 0 && tooltipCount < tooltips.length) {
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(positionAttribute, i);

    const mesh = new THREE.Mesh(pointGeometry, pointMaterial);
    mesh.position.copy(vertex);
    group.add(mesh);

    // attach the corresponding tooltip to the mesh
    const tooltip = tooltips[meshIndex++];
    mesh.userData.tooltip = tooltip;
    tooltipCount++;
  }
  count++;
}

wireMesh.add(group);


// LIGHTING
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000);
// scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(dirLight);

// ANIMATION/GAME LOOP
function animate() {
  requestAnimationFrame(animate);

  // Update controls each frame
  controls.update(); 

  group.children.forEach((mesh) => {
    const tooltip = mesh.userData.tooltip;
    // console.log(tooltip);
    const position = new THREE.Vector3();

    // Get the world position of the mesh
    mesh.getWorldPosition(position);

    // Check if the mesh is behind the mainMesh
    const normal = new THREE.Vector3().subVectors(position, mainMesh.position).normalize();
    const cameraToPoint = new THREE.Vector3().subVectors(position, camera.position).normalize();
    const isBehind = normal.dot(cameraToPoint) > 0.42;

    // project the position to screen space
    position.project(camera);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const widthHalf = width / 2;
    const heightHalf = height / 2;

    position.x = position.x * widthHalf + widthHalf;
    position.y = -position.y * heightHalf + heightHalf;

    // show or hide the tooltip based on visibility
    if (tooltip instanceof HTMLElement) {
      if (isBehind || camera.position.z > 6) {
        tooltip.style.display = 'none';
      } else {
        tooltip.style.display = 'block';
        tooltip.style.top = `${position.y}px`;
        tooltip.style.left = `${position.x}px`;
      }
    } else {
      console.error('Tooltip is not a valid DOM element:', tooltip);
    }
  });

  mainMesh.rotation.x -= 0.001;
  mainMesh.rotation.y -= 0.001;
  wireMesh.rotation.x -= 0.001;
  wireMesh.rotation.y -= 0.001;
  TWEEN.update();
  composer.render(scene, camera);
}


animate();

// COLOR SELECTION
const colorPallete = ['#E47EDB', '#514B95', '#7D8CC4', '#A0D2DB', '#4EBD96', '#B52270', '#E9724A'];
const colorGenerator = new ColorGenerator(colorPallete);


function transitionColor(mesh, startColor, endColor, duration) {
  // Create a new color object for interpolation
  const initialColor = new THREE.Color(startColor);
  const finalColor = new THREE.Color(endColor);

  // Set up the tween
  const tween = new TWEEN.Tween(initialColor)
    .to(finalColor, duration)
    .onUpdate(() => {
        // Update the material color
        mesh.material.color.copy(initialColor);
    })
    .onComplete(() => {
        console.log('Color transition complete.');
    })
    .start(); // Start the tween
}

let isMouseDown = false;

const perspectiveTween = new TWEEN.Tween(camera.position)
  .to({ x: 0, y: 0, z: 3 }, 4000) 
  .easing(TWEEN.Easing.Quadratic.InOut);

const scaleUpTween = new TWEEN.Tween(mainMesh.scale)
  .to({ x: 1.15, y: 1.15, z: 1.15 }, 150)
  .easing(TWEEN.Easing.Quadratic.Out);

const scaleDownTween = new TWEEN.Tween(mainMesh.scale)
  .to({ x: 1, y: 1, z: 1 }, 300)
  .easing(TWEEN.Easing.Quadratic.Out);


const scaleUpWireTween = new TWEEN.Tween(wireMesh.scale)
  .to({ x: 1.2, y: 1.2, z: 1.2 }, 150)
  .easing(TWEEN.Easing.Quadratic.Out);

const scaleDownWireTween = new TWEEN.Tween(wireMesh.scale)
  .to({ x: 1, y: 1, z: 1 }, 300)
  .easing(TWEEN.Easing.Quadratic.Out);



function startEffect() {
  // stop the scale down tween if it's running
  scaleDownTween.stop();
  scaleDownWireTween.stop();
  // const randomColor = getRandomColorWithLightness(40);
  const randomColor = colorGenerator.getRandomColorFromPalette(colorPallete);
  console.log(randomColor);
  scaleUpTween.start();
  scaleUpWireTween.start();
  // mainMesh.material.color.set(randomColor);
  transitionColor(mainMesh, mainMesh.material.color.getHex(), randomColor, 150);
  bloomPass.strength = 0.8; // increase mesh glow
  bloomPass.radius = 1.5;
  bloomPass.threshold = 0.2;
}

function stopEffect() {
  // stop the scale up tween if it's running
  scaleUpTween.stop();
  scaleUpWireTween.stop();
  // mainMesh.material.color.set(0xffffff);
  // transitionColor(mainMesh, mainMesh.material.color.getHex(), 0xffffff, 300);
  scaleDownTween.start();
  scaleDownWireTween.start();
  bloomPass.strength = 0.1; // decrease mesh glow
}

// EVENT LISTENERS
document.addEventListener('mousedown', function (event) {
  isMouseDown = true;
  // only allow effects if the tooltip is not hovered
  if(!tooltipHovered) {
    startEffect();
  }
});

document.addEventListener('mouseup', function (event) {
  if (isMouseDown) {
    isMouseDown = false;
    stopEffect();
  }
});

// handle mouse leave to ensure the effect stops if the mouse is released outside the window
document.addEventListener('mouseleave', function (event) {
  if (isMouseDown) {
    isMouseDown = false;
    stopEffect();
  }
});

window.addEventListener('click', function (event) {
  if( camera.position.z > 120 ) {
    perspectiveTween.start();
  }
});


// Resize canvas on window resize
function handleWindowResize() {
  // recalculate aspect ratio
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix(); // is necessary after changing the aspect ratio
  // update renderer size
  renderer.setSize(width, height);
}
window.addEventListener('resize', handleWindowResize, false);

