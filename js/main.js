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

    let dronesDestruidos = 0;

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

// Pegarlo a la cámara
camera.add(scorePlane);
scene.add(camera);

    renderer.setAnimationLoop(() => {
      drones.forEach((drone, i) => {
        drone.position.z += 0.05;
        if (drone.position.z > 2) {
          scene.remove(drone);
          drones.splice(i, 1);
        }

        [sword1, sword2].forEach((sword) => {
          const swordPos = new THREE.Vector3();
          sword.getWorldPosition(swordPos);
         if (drone.position.distanceTo(swordPos) < 0.4) {
  scene.remove(drone);
  drones.splice(i, 1);
  dronesDestruidos++;

  scoreCtx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
  scoreCtx.fillStyle = '#00ffff';
  scoreCtx.fillText(`Score: ${dronesDestruidos}`, 10, 40);
  scoreTexture.needsUpdate = true;
}

        });
      });

      if (Math.random() < 0.02) spawnDrone();
      renderer.render(scene, camera);
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  document.getElementById('iniciarBtn').addEventListener('click', () => {
  document.getElementById('hudInicio').style.display = 'none';
});
