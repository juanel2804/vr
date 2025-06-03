import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.136.0/examples/jsm/webxr/VRButton.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111122);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));
renderer.xr.addEventListener('sessionstart', () => {
  document.getElementById('hudInicio').style.display = 'none';
  document.getElementById('hudGameOver').style.display = 'none';
});

renderer.xr.addEventListener('sessionend', () => {
  document.getElementById('hudInicio').style.display = 'block';
});


const light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 4, 4);
scene.add(light);

const drones = [];
const droneGeo = new THREE.SphereGeometry(0.2, 16, 16);
const droneMat = new THREE.MeshStandardMaterial({ color: 0xff3333 });

function spawnDrone() {
  const drone = new THREE.Mesh(droneGeo, droneMat);
  drone.position.set(Math.random() * 4 - 2, Math.random() * 2, -5);
  scene.add(drone);
  drones.push(drone);
}

// Espadas
const swordGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 32);
const swordMat = new THREE.MeshStandardMaterial({
  color: 0x00ffff,
  emissive: 0x00ffff,
  emissiveIntensity: 1,
  metalness: 0.8,
  roughness: 0.2
});


const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);

const sword1 = new THREE.Mesh(swordGeo, swordMat);
sword1.position.y = 0.35;
controller1.add(sword1);

const sword2 = new THREE.Mesh(swordGeo, swordMat);
sword2.position.y = 0.35;
controller2.add(sword2);

scene.add(controller1);
scene.add(controller2);

const raycaster = new THREE.Raycaster();
const tempMatrix = new THREE.Matrix4();

function setupClickController(controller) {
  controller.addEventListener('selectstart', () => {
    if (!juegoIniciado) {
      tempMatrix.identity().extractRotation(controller.matrixWorld);
      raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
      raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

      const intersects = raycaster.intersectObject(inicioPanel);
      if (intersects.length > 0) {
        inicioPanel.visible = false;
        juegoIniciado = true;
      }
    }
  });
}

setupClickController(controller1);
setupClickController(controller2);


let dronesDestruidos = 0;
let droneSpeed = 0.05;
let droneSpawnRate = 0.02; // frecuencia inicial (2% de probabilidad por frame)

function aumentarDificultad() {
  if (dronesDestruidos % 5 === 0 && droneSpeed < 0.2) {
    droneSpeed += 0.01;
  }
}
function ajustarFrecuencia() {
  if (dronesDestruidos % 5 === 0 && droneSpawnRate < 0.08) {
    droneSpawnRate += 0.005;
  }
}



// Crear canvas para mostrar texto en textura
const scoreCanvas = document.createElement('canvas');
scoreCanvas.width = 256;
scoreCanvas.height = 64;
const scoreCtx = scoreCanvas.getContext('2d');
scoreCtx.font = '28px Arial';
scoreCtx.fillStyle = '#00ffff';
scoreCtx.fillText('Score: 0', 10, 40);

// Crear textura y plano
const scoreTexture = new THREE.CanvasTexture(scoreCanvas);
const scoreMaterial = new THREE.MeshBasicMaterial({ map: scoreTexture, transparent: true });
const scorePlane = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.15), scoreMaterial);

// Posicionar el score arriba a la derecha del visor VR
scorePlane.position.set(0.6, 0.5, -1.5);

// HUD 3D de Game Over
const gameOverCanvas = document.createElement('canvas');
gameOverCanvas.width = 512;
gameOverCanvas.height = 128;
const gameOverCtx = gameOverCanvas.getContext('2d');
gameOverCtx.font = 'bold 48px Arial';
gameOverCtx.fillStyle = '#ff0044';
gameOverCtx.fillText('¡GAME OVER!', 80, 80);

const gameOverTexture = new THREE.CanvasTexture(gameOverCanvas);
const gameOverMaterial = new THREE.MeshBasicMaterial({ map: gameOverTexture, transparent: true });
const gameOverPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.4), gameOverMaterial);
gameOverPlane.position.set(0, 0, -2); // Frente a la vista
gameOverPlane.visible = false; // Oculto al inicio

camera.add(gameOverPlane); // Se mueve con la cámara
let juegoIniciado = false;

// Panel 3D de inicio
const inicioCanvas = document.createElement('canvas');
inicioCanvas.width = 512;
inicioCanvas.height = 256;
const inicioCtx = inicioCanvas.getContext('2d');

// Fondo del panel
inicioCtx.fillStyle = 'black';
inicioCtx.fillRect(0, 0, 512, 256);

// Texto título
inicioCtx.fillStyle = '#00ffff';
inicioCtx.font = 'bold 32px Arial';
inicioCtx.fillText('Espadas vs Drones VR', 70, 60);

// Instrucción
inicioCtx.font = '24px Arial';
inicioCtx.fillText('Pulsa el botón para comenzar', 90, 120);

// Botón visual
inicioCtx.fillStyle = '#00cccc';
inicioCtx.fillRect(180, 160, 150, 50);
inicioCtx.fillStyle = 'black';
inicioCtx.fillText('INICIAR', 210, 195);

const inicioTexture = new THREE.CanvasTexture(inicioCanvas);
const inicioMaterial = new THREE.MeshBasicMaterial({ map: inicioTexture, transparent: true });
const inicioPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.9), inicioMaterial);
inicioPanel.position.set(0, 0, -2);
camera.add(inicioPanel); // Pegado a cámara


// Pegarlo a la cámara
camera.add(scorePlane);
scene.add(camera);

renderer.setAnimationLoop(() => {
  drones.forEach((drone, i) => {
    drone.position.z += droneSpeed;

   const camPos = new THREE.Vector3();
camera.getWorldPosition(camPos);

if (drone.position.distanceTo(camPos) < 0.3) {
  scene.remove(drone);
  drones.splice(i, 1);

  // Mostrar HUD de Game Over con score
  gameOverCtx.clearRect(0, 0, gameOverCanvas.width, gameOverCanvas.height);
  gameOverCtx.font = 'bold 48px Arial';
  gameOverCtx.fillStyle = '#ff0044';
  gameOverCtx.fillText('¡GAME OVER!', 80, 70);
  gameOverCtx.font = '24px Arial';
  gameOverCtx.fillStyle = '#ffffff';
  gameOverCtx.fillText(`Puntaje: ${dronesDestruidos}`, 150, 110);
  gameOverTexture.needsUpdate = true;

  gameOverPlane.visible = true;
  setTimeout(() => window.location.reload(), 3000);
  renderer.setAnimationLoop(null);
}



    [sword1, sword2].forEach((sword) => {
      const swordPos = new THREE.Vector3();
      sword.getWorldPosition(swordPos);
      if (drone.position.distanceTo(swordPos) < 0.4) {
        scene.remove(drone);
        drones.splice(i, 1);
        dronesDestruidos++;
        aumentarDificultad();
        ajustarFrecuencia();


        scoreCtx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
        scoreCtx.fillStyle = '#00ffff';
        scoreCtx.fillText(`Score: ${dronesDestruidos}`, 10, 40);
        scoreTexture.needsUpdate = true;
      }


    });
  });

  if (juegoIniciado && Math.random() < droneSpawnRate) spawnDrone();


  renderer.render(scene, camera);
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
