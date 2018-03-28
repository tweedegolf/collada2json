import THREE from 'three';
import OrbitControls from './lib/orbit_controls';

export default function init() {

  let camera, scene;
  let renderer, controls;
  let world, spot;

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ autoClear: true, antialias: true, alpha: true });
  renderer.setClearColor(0xffffff, 1);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  camera = new THREE.PerspectiveCamera(50, 1, 1, 3000); // correct aspect of camera is set in resize method, see below
  camera.position.z = 500;
  camera.position.x = 0;
  camera.position.y = 300;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  spot = new THREE.SpotLight(0xffffff, 1);
  spot.position.set(300, 300, 300);
  spot.target.position.set(0, 0, 0);
  spot.shadowCameraNear = 1;
  spot.shadowCameraFar = 1024;
  spot.castShadow = true;
  spot.shadowDarkness = 0.3;
  spot.shadowBias = 0.0001;
  spot.shadowMapWidth = 2048;
  spot.shadowMapHeight = 2048;
  scene.add(spot);

  world = new THREE.Mesh(new THREE.PlaneBufferGeometry(200, 200, 10, 10), new THREE.MeshBasicMaterial({ opacity: 0.5, color: 0x003300 }));
  world.rotation.x -= Math.PI / 2;
  world.position.y = -50;
  world.position.z = 50;
  world.receiveShadow = true;
  scene.add(world);

  let light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
  scene.add(light);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.keys = {};
  controls.addEventListener('change', function () {
    render();
  });


  function resize(width, height) {
    //console.log(width,height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  }


  function render() {
    renderer.render(scene, camera);
  }


  function clear() {
    while (world.children.length > 0) {
      world.remove(world.children[0]);
    }
    render();
  }


  return {
    clear: clear,
    render: render,
    resize: resize,
    domElement: renderer.domElement,
    add: function (model) {
      clear();
      world.add(model);
      render();
    }
  };
}
