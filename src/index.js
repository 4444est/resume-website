import * as THREE from 'three';
import TWEEN from 'jsm/libs/tween.module.min.js';
import { OrbitControls } from 'jsm/controls/OrbitControls.js';
import { EffectComposer } from 'jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'jsm/postprocessing/UnrealBloomPass.js';
import { FontLoader } from 'jsm/loaders/FontLoader.js';
import { TextGeometry } from 'jsm/geometries/TextGeometry.js';
import { ColorGenerator } from './support.js';


// TOOLTIPS
let tooltipHovered = false;

// GESTURE INDICATOR
let userHasInteracted = false;
let gestureShown = false;
let gestureIndicator;
const tooltipNames = [`<i class="fa-regular fa-file"></i> Resume`, 
                      `<i class="fa-brands fa-github"></i> Github`, 
                      `<i class="fa-brands fa-linkedin"></i> LinkedIn`, 
                      `<i class="fa-regular fa-envelope"></i> Email Me`,
                      `orpheus.org`,
                      `lyrictype.com`,
                      `Codagotchi`];

const tooltipLinks = ["https://drive.google.com/file/d/1k0B7-JGCkjwUE8SbJPb6DupwF1zOMkev/view?usp=drive_link", 
                      "https://github.com/4444est", 
                      "https://www.linkedin.com/in/forrest-hartley-a87810172/", 
                      "mailto:forresth2000@gmail.com",
                      "https://mediumaquamarine-tarsier-833648.hostingersite.com/",
                      "https://lyrictype.com",
                      "https://github.com/pixl-garden/codagotchi"];

// Project categories - define which tooltips are projects and their types
const tooltipCategories = [
  null, // Resume - regular tooltip
  null, // Github - regular tooltip  
  null, // LinkedIn - regular tooltip
  null, // Email - regular tooltip
  'orpheus-website', // Orpheus Website
  'lyrictype-webapp',  // LyricType Web-app
  'codagotchi-extension' // Codagotchi VSCode Extension
];

const tooltips = [];

const backButton = `<div id="back-btn><i class="fa-solid fa-arrow-down"></i></div>`;

const createTooltips = () => {
  for (let i = 0; i < tooltipNames.length; i++) {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    
    // Add project category class if this tooltip is a project
    if (tooltipCategories[i]) {
      tooltip.classList.add(tooltipCategories[i]);
    }
    
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

// GESTURE INDICATOR FUNCTIONS
function initializeGestureIndicator() {
  gestureIndicator = document.getElementById('gestureIndicator');
  console.log('Gesture indicator element:', gestureIndicator);
  
  if (!gestureIndicator) {
    console.error('Gesture indicator element not found!');
    return false;
  }
  return true;
}

function showGestureIndicator() {
  console.log('showGestureIndicator called', { userHasInteracted, gestureShown });
  
  if (!gestureIndicator && !initializeGestureIndicator()) {
    return;
  }
  
  if (!userHasInteracted && !gestureShown) {
    console.log('Adding show class to gesture indicator');
    gestureIndicator.classList.add('show');
    gestureShown = true;
    
    console.log('Gesture indicator classes:', gestureIndicator.className);
    console.log('Gesture indicator styles:', getComputedStyle(gestureIndicator).visibility, getComputedStyle(gestureIndicator).opacity);
    
  }
}

function hideGestureIndicator() {
  if (!gestureIndicator) return;
  
  console.log('Hiding gesture indicator');
  gestureIndicator.classList.remove('show');
  gestureShown = false;
}

function markUserInteraction() {
  if (!userHasInteracted) {
    console.log('User interaction detected');
    userHasInteracted = true;
    hideGestureIndicator();
  }
}

// TEXT
const loader = new FontLoader();
loader.load('./Comfortaa_Regular.json', function(font) {
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

const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(bloomPass);


// CORE OBJECT
const coreGeometry = new THREE.IcosahedronGeometry(0.75, 5);
const coreMaterial = new THREE.MeshBasicMaterial({
  color: 0xFFFFFF,
  // emissive: 0x771818,
});
const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(coreMesh);


const geometry = new THREE.IcosahedronGeometry(1, 2);
const material = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    flatShading: true,
    roughness: 0.5,
    metalness: 0.2, 
    opacity: 0.85,
    transparent: true,
    side: THREE.DoubleSide,
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


// ZOOMING ANIMATION
let isZoomed = false;

const perspectiveTween = new TWEEN.Tween(camera.position)
  .to({ x: 0, y: 0, z: 3 }, 3000) 
  .easing(TWEEN.Easing.Quadratic.InOut)
  .onComplete(() => {
    // Show gesture indicator 5 seconds after zoom completes
    setTimeout(() => {
      console.log("Showing gesture indicator");
      showGestureIndicator();
    }, 5000);
  });
  
  // TIMER
  const timer = new THREE.Clock();


// LIGHTING
// const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000);
// scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
scene.add(dirLight);


// ANIMATION/GAME LOOP
function animate() {
  requestAnimationFrame(animate);

  let elapsedTime = timer.getElapsedTime();

  // Trigger event after 3 seconds
  if (elapsedTime > 3 && !isZoomed) {
      console.log("Event triggered after 3 seconds within the animation loop");
      isZoomed = true;
      perspectiveTween.start();
  }

  // Update controls each frame
  controls.update(); 

  group.children.forEach((mesh) => {
    const tooltip = mesh.userData.tooltip;
    // console.log(tooltip);
    const position = new THREE.Vector3();

    // Get the world position of the mesh
    mesh.getWorldPosition(position);

    // check if the point mesh is behind the mainMesh
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
      if (isBehind || camera.position.z > 4) {
        tooltip.style.display = 'none';
      } else {
        // Check if position is within viewport bounds
        const isInViewport = position.x >= 0 && position.x <= window.innerWidth && 
                            position.y >= 0 && position.y <= window.innerHeight;
        
        if (isInViewport) {
          // Use flex for lyrictype-webapp tooltip, block for others
          if (tooltip.classList.contains('lyrictype-webapp')) {
            tooltip.style.display = 'flex';
          } else {
            tooltip.style.display = 'block';
          }
          tooltip.style.top = `${position.y}px`;
          tooltip.style.left = `${position.x}px`;
        } else {
          tooltip.style.display = 'none';
        }
      }
    } else {
      console.error('Tooltip is not a valid DOM element:', tooltip);
    }
  });

  mainMesh.rotation.x -= 0.0003;
  mainMesh.rotation.y -= 0.0003;
  wireMesh.rotation.x -= 0.0003;
  wireMesh.rotation.y -= 0.0003;
  TWEEN.update();
  composer.render(scene, camera);
}


animate();

// COLOR SELECTION
// const purple = '#514B95';
const maroon = '#B52270';
const red = '#D81E5B';
const lightRed = '#F0544F';
// const pink = '#E47EDB';
const orange = '#FF9100';
const yellow = '#FFCC55';
const lightGreen = '#86EB6F';
const green = '#4EBD96';
const teal = '#0EB5DF';
const blue = '#167CF0';
const purple = '#623CEA'; 
const lightPurple = '#9A18F0'; 
const colorPallete2 = [maroon, red, lightRed, orange, yellow, lightGreen, green, teal, blue, purple, lightPurple];
const colorGenerator = new ColorGenerator(colorPallete2);

mainMesh.material.color.set(colorGenerator.getCurrentColor());
coreMesh.material.color.set(colorGenerator.getCurrentColor());

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

const scaleUpTween = new TWEEN.Tween(mainMesh.scale)
  .to({ x: 1.18, y: 1.18, z: 1.18 }, 150)
  .easing(TWEEN.Easing.Quadratic.Out);

const scaleDownTween = new TWEEN.Tween(mainMesh.scale)
  .to({ x: 1, y: 1, z: 1 }, 200)
  .easing(TWEEN.Easing.Quadratic.Out);


const scaleUpWireTween = new TWEEN.Tween(wireMesh.scale)
  .to({ x: 1.25, y: 1.25, z: 1.25 }, 150)
  .easing(TWEEN.Easing.Quadratic.Out);

const scaleDownWireTween = new TWEEN.Tween(wireMesh.scale)
  .to({ x: 1, y: 1, z: 1 }, 200)
  .easing(TWEEN.Easing.Quadratic.Out);


const scaleUpCoreTween = new TWEEN.Tween(coreMesh.scale)
  .to({ x: 1.15, y: 1.15, z: 1.15 }, 200)
  .easing(TWEEN.Easing.Quadratic.Out);

const scaleDownCoreTween = new TWEEN.Tween(coreMesh.scale)
  .to({ x: 1, y: 1, z: 1 }, 150)
  .easing(TWEEN.Easing.Quadratic.Out);



function startEffect() {
  // stop the scale down tweens if they are running
  scaleDownTween.stop();
  scaleDownWireTween.stop();
  scaleDownCoreTween.stop();
  // const randomColor = getRandomColorWithLightness(40);
  const nextColor = colorGenerator.getNextColorFromPalette();
  // const nextColor = colorGenerator.getRandomColorFromPalette();
  scaleUpTween.start();
  scaleUpWireTween.start();
  scaleUpCoreTween.start();
  // mainMesh.material.color.set(randomColor);
  transitionColor(mainMesh, mainMesh.material.color.getHex(), nextColor, 150);
  transitionColor(coreMesh, mainMesh.material.color.getHex(), nextColor, 150);
  bloomPass.strength = 0.8; // increase mesh glow
  bloomPass.radius = 1;
  bloomPass.threshold = 0.2;
}

function stopEffect() {
  // stop the scale up tweens if they are running
  scaleUpTween.stop();
  scaleUpWireTween.stop();
  scaleUpCoreTween.stop();
  // mainMesh.material.color.set(0xffffff);
  // transitionColor(mainMesh, mainMesh.material.color.getHex(), 0xffffff, 300);
  scaleDownTween.start();
  scaleDownWireTween.start();
  scaleDownCoreTween.start();
  bloomPass.strength = 0.1; // decrease mesh glow
}

// EVENT LISTENERS

// Mousedown and touchstart
function handleStart(event) {
  // Prevent default behavior (like scrolling) when touch event occurs
  event.preventDefault();
  
  // Mark user interaction to hide gesture
  markUserInteraction();
  
  // only allow effects if the tooltip is not hovered
  if(!tooltipHovered && isZoomed) {
    isMouseDown = true;
    startEffect();
  }
}

document.addEventListener('mousedown', handleStart);
document.addEventListener('touchstart', handleStart);

// Mouseup and touchend
function handleEnd(event) {
  // Prevent default behavior when touch event occurs
  event.preventDefault();

  if (isMouseDown && isZoomed) {
    isMouseDown = false;
    stopEffect();
  }
}

document.addEventListener('mouseup', handleEnd);
document.addEventListener('touchend', handleEnd);

// Mouseleave and touchleave (use touchcancel to cover touchleave equivalent)
function handleLeave(event) {
  // Prevent default behavior when touch event occurs
  event.preventDefault();

  if (isMouseDown) {
    isMouseDown = false;
    stopEffect();
  }
}

document.addEventListener('mouseleave', handleLeave);
document.addEventListener('touchcancel', handleLeave);

// Click and tap
function handleClick(event) {
  // Prevent default behavior when touch event occurs
  event.preventDefault();

  if( camera.position.z > 120 ) {
    isZoomed = true;
    perspectiveTween.start();
  }
}

window.addEventListener('click', handleClick);
window.addEventListener('touchend', handleClick);




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


