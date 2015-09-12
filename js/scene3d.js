/*
  Creates a 3D scene and sets the right renderer and controls dependent on the device.
*/

'use strict';

let THREE = window.THREE;
let console = window.console;

let divContainer, body;
let camera, scene, element;
let renderer, controls;
let world, spot;
let loader, currentModel, currentScale;


function init() {
  loader = new THREE.ColladaLoader();
  loader.useBufferGeometry = true;

  body = document.body;
  divContainer = document.getElementById('canvas3d');

  renderer = new THREE.WebGLRenderer({autoClear:true, antialias:true, alpha:true });
  renderer.setClearColor(0xffffff, 1);
  renderer.shadowMapEnabled = true;
  renderer.shadowMapSoft = true;
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  element = renderer.domElement;
  divContainer.appendChild(element);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, 1, 1, 3000); // correct aspect of camera is set in resize method, see below
  camera.position.z = 500;
  camera.position.x = 0;
  camera.position.y = 200;
  camera.lookAt(new THREE.Vector3(0,0,0));

  spot = new THREE.SpotLight(0xffffff, 1);
  spot.position.set(0, 500, 500);
  spot.target.position.set(0, 0, 0);
  spot.shadowCameraNear = 1;
  spot.shadowCameraFar = 1024;
  spot.castShadow = true;
  spot.shadowDarkness = 0.3;
  spot.shadowBias = 0.0001;
  spot.shadowMapWidth = 2048;
  spot.shadowMapHeight = 2048;
  scene.add(spot);

  world = new THREE.Mesh(new THREE.PlaneBufferGeometry(200, 200, 20, 20), new THREE.MeshBasicMaterial({wireframe:true, color: 0x000000}));
  world.rotation.x -= Math.PI/2;
  world.position.z = 50;
  world.receiveShadow = true;
  scene.add(world);

  let light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
  scene.add(light);

  window.addEventListener('resize', resize, false);

  controls = new THREE.OrbitControls(camera, divContainer);
  controls.keys = {};
  controls.addEventListener('change', function(){
    render();
  });
  resize();
}


function resize() {
  let width = divContainer.offsetWidth;
  let height = divContainer.offsetHeight;
  //console.log(width,height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  render();
}


function render(){
  renderer.render(scene, camera);
}


function clear(){
  while(world.children.length > 0){
    world.remove(world.children[0]);
  }
  render();
}


function load(url, callback){
  console.time('loading ' + url + ' took');
  //callback('loading', 'loading ' + url);
  loader.load(url, function(data){
    if(currentModel !== undefined){
        world.remove(currentModel);
    }
    currentModel = data.scene;
    currentScale = 1;
    maximizeScale();

    world.add(currentModel);
    console.log(world.children);
    console.timeEnd('loading ' + url + ' took');
    callback(currentModel);
    setTexture(function(){});
    render();
  });
}

function setTexture(callback){
  // currentTexture = textures[fileName];

  // if(currentTexture){
    currentModel.traverse(function(child){
      if(child.material && child.material.map) {
        console.log(child.material.map);
        // var img = document.createElement('img');
        // img.src = currentTexture;
        // child.material.map.image = img;
        // child.material.emissive = new THREE.Color(0,0,0);
        // child.material.map.wrapS = THREE.ClampToEdgeWrapping;
        // child.material.map.wrapT = THREE.ClampToEdgeWrapping;
        // child.material.map.minFilter = THREE.LinearFilter;
        // child.material.needsUpdate = true;
      }
    });
//  }

  callback();
}




function maximizeScale() {
  let
    bbox = new THREE.Box3().setFromObject(currentModel.children[0]),
    modelWidth = bbox.max.x - bbox.min.x,
    modelHeight = bbox.max.z - bbox.min.z, // z and y are inverted!
    modelDepth = bbox.max.y - bbox.min.y,
    distance = camera.position.y - 5,
    vFOV = THREE.Math.degToRad(camera.fov),  // convert vertical fov to radians
    visibleHeight = 2 * Math.tan(vFOV / 2 ) * distance,
    visibleWidth = visibleHeight * camera.aspect,
    scaleY = visibleHeight/modelHeight,
    scaleX = visibleWidth/modelWidth,
    scaleZ = visibleWidth/modelDepth,
    scale = Math.min(scaleX, scaleY, scaleZ);

  currentScale = scale;
  currentModel.scale.x = currentScale;
  currentModel.scale.y = currentScale;
  currentModel.scale.z = currentScale;
/*
  if/*(debug === true){
    // adjust the visible boundingbox
    cube.position.y = (modelHeight * scale)/2;
    cube.geometry = new THREE.BoxGeometry(modelWidth * scale, modelHeight * scale, modelDepth * scale);
  }
*/
  //console.log('h', visibleHeight, 'h', modelHeight, 'w', modelWidth, 'd', modelDepth, 'sx', scaleX, 'sy', scaleY, 'sz', scaleZ, 's', scale);
}

export default {
  init:init,
  clear: clear,
  load: load,
  add: function(model){
    if(currentModel){
      world.remove(currentModel);
    }
    currentModel = model;
    //maximizeScale();
    currentModel.scale.x = 1;
    currentModel.scale.y = 1;
    currentModel.scale.z = 1;
    world.add(model);
    render();
  }
};