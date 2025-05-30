import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.136.0/examples/jsm/webxr/VRButton.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.136.0/build/three.module.js';

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x111122, 0.1);
const loader = new THREE.TextureLoader();
loader.load('./img/958b134f-51b7-4d13-84d1-00460ba8c901.png', function (texture) {
  scene.background = texture;
});


document.getElementById('iniciarBtn').addEventListener('click', () => {
  const hud = document.getElementById('hudInicio');
  const nombre = document.getElementById('nombreJugador').value.trim();

  if (nombre.length === 0) {
    alert('Por favor, escribe tu nombre.');
    return;
  }

  hud.style.display = 'none'; // Oculta HUD
  localStorage.setItem('jugador', nombre); // (opcional) Guarda el nombre
});

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

const light = new THREE.PointLight(0x00ffff, 3);
light.position.set(0, 4, 4);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // luz suave azulada
scene.add(ambientLight);

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
  emissiveIntensity: 2,
  metalness: 1,
  roughness: 0.1
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

function mostrarGameOver() {
  document.getElementById('hudGameOver').style.display = 'block';
  renderer.setAnimationLoop(null); // Detiene la animación
}


renderer.setAnimationLoop(() => {
  // Crear una copia del arreglo para evitar errores al modificarlo
  for (let i = drones.length - 1; i >= 0; i--) {
    const drone = drones[i];
    drone.position.z += 0.05;

    // Verificar colisión con la cámara (jugador)
const distanciaACamara = drone.position.distanceTo(camera.position);
if (distanciaACamara < 0.5) {
  mostrarGameOver();
  return;
}


    // Eliminar si se pasa de la cámara
    if (drone.position.z > 2) {
      scene.remove(drone);
      drones.splice(i, 1);
      continue;
    }

    // Verificar colisión con espadas
    const swordPos1 = new THREE.Vector3();
    sword1.getWorldPosition(swordPos1);

    const swordPos2 = new THREE.Vector3();
    sword2.getWorldPosition(swordPos2);

    if (
      drone.position.distanceTo(swordPos1) < 0.4 ||
      drone.position.distanceTo(swordPos2) < 0.4
    ) {
      scene.remove(drone);
      drones.splice(i, 1);
    }
   

  }
  

  // Spawn aleatorio de drones
  if (Math.random() < 0.02) spawnDrone();

  renderer.render(scene, camera);
});



window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
document.getElementById('reiniciarBtn').addEventListener('click', () => {
  location.reload(); // Recarga la página completamente
});
