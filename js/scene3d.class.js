'use strict';

let THREE = window.THREE;
let console = window.console;

export default class scene3d{
  constructor(config){
    this.loader = config.loader;
    this.container = config.container;
    this.currentModel = null;

    this.renderer = new THREE.WebGLRenderer({autoClear:true, antialias:true, alpha:true });
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = true;
    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, 1, 1, 3000); // correct aspect of camera is set in resize method, see below
    this.camera.position.z = 500;
    this.camera.position.x = 0;
    this.camera.position.y = 200;
    this.camera.lookAt(new THREE.Vector3(0,0,0));

    let spot = new THREE.SpotLight(0xffffff, 1);
    spot.position.set(0, 500, 500);
    spot.target.position.set(0, 0, 0);
    spot.shadowCameraNear = 1;
    spot.shadowCameraFar = 1024;
    spot.castShadow = true;
    spot.shadowDarkness = 0.3;
    spot.shadowBias = 0.0001;
    spot.shadowMapWidth = 2048;
    spot.shadowMapHeight = 2048;
    this.scene.add(spot);

    this.world = new THREE.Mesh(new THREE.PlaneGeometry(200, 200, 20, 20), new THREE.MeshBasicMaterial({wireframe:true, color: 0x000000}));
    this.world.rotation.x -= Math.PI/2;
    this.world.position.z = 50;
    this.world.receiveShadow = true;
    this.scene.add(this.world);

    let light = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
    this.scene.add(light);

    this.controls = new THREE.OrbitControls(this.camera, this.container);
    this.controls.keys = {};
    this.controls.addEventListener('change', function(){
      this.render();
    });
  }

  render(){
    this.renderer.render(this.scene, this.camera);
  }

  resize(){
    let width = this.ontainer.offsetWidth;
    let height = this.ontainer.offsetHeight;
    //console.log(width,height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.render();
  }

  load(url, callback){
    console.time('loading ' + url + ' took');
    this.loader.load(url, function(data){
      if(this.currentModel){
          this.world.remove(this.currentModel);
      }
      this.currentModel = data.scene;
      this.currentScale = 1;

      this.world.add(this.currentModel);
      console.timeEnd('loading ' + url + ' took');
      callback(this.currentModel);
      this.render();
    });
  }

  add(model){
    if(this.currentModel){
        this.world.remove(this.currentModel);
    }
    this.currentModel = model;
    this.world.add(model);
    this.render();
  }

}