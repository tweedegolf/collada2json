import * as THREE from 'three';
import './lib/orbit_controls';

export default function init() {
  const scene = new THREE.Scene();

  // correct aspect of camera is set in resize method, see below
  const camera = new THREE.PerspectiveCamera(50, 1, 1, 3000);
  camera.position.z = 500;
  camera.position.x = 0;
  camera.position.y = 300;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const renderer = new THREE.WebGLRenderer({ autoClear: true, antialias: true, alpha: true });
  renderer.setClearColor(0xffffff, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.soft = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  function render() {
    renderer.render(scene, camera);
  }

  const spot = new THREE.SpotLight(0xffffff, 1);
  spot.position.set(300, 300, 300);
  spot.target.position.set(0, 0, 0);
  spot.shadow.camera.near = 1;
  spot.shadow.camera.far = 1024;
  spot.castShadow = true;
  spot.shadow.bias = 0.0001;
  spot.shadow.mapSize.width = 2048;
  spot.shadow.mapSize.height = 2048;
  scene.add(spot);

  const world = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(200, 200, 10, 10),
    new THREE.MeshBasicMaterial({ opacity: 0.5, color: 0x003300 })
  );
  world.rotation.x -= Math.PI / 2;
  world.position.y = -50;
  world.position.z = 50;
  world.receiveShadow = true;
  scene.add(world);

  const light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
  scene.add(light);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.keys = {};
  controls.addEventListener('change', () => {
    render();
  });


  function resize(width, height) {
    // console.log(width,height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  }


  function clear() {
    while (world.children.length > 0) {
      world.remove(world.children[0]);
    }
    render();
  }


  return {
    clear,
    render,
    resize,
    domElement: renderer.domElement,
    add: (model) => {
      clear();
      world.add(model);
      setTimeout(() => {
        render();
      }, 0);
    },
  };
}
