'use strict';

import scene3d from './scene3d.js';

let colladas;
let textures;
let xmlParser;
let iterator;
let divMessage;
let colladaLoader;


export default function setupColladaMethods(){
  scene3d.init();
  scene3d.load('./models/DAE/robotmaaier_004.dae', function(){});
  xmlParser = new DOMParser();
  divMessage = document.getElementById('loading');
  return {
    parse: parseColladas
  };
}

function parseColladas(_colladas, _textures){
  colladas = _colladas;
  textures = _textures;
  iterator = colladas.entries();
  parseCollada();
}


function parseCollada(){
  let element = iterator.next();

  if(element.done){
    divMessage.innerHTML = 'finished converting colladas';
    //scene3d.clear();
    return;
  }

  let collada = xmlParser.parseFromString(element.value[1], 'application/xml');
  let results = collada.evaluate('//dae:library_images/dae:image/dae:init_from/text()',
    collada,
    function(){
      return 'http://www.collada.org/2005/11/COLLADASchema';
    },
    XPathResult.ANY_TYPE, null
  );

  let node;
  let nodes = new Map();
  let imageName;

  while((node = results.iterateNext()) !== null){
    imageName = node.textContent;
    if(imageName.indexOf('/') !== -1){
      imageName = imageName.substring(imageName.lastIndexOf('/') + 1, imageName.indexOf('.'));
    }else{
      imageName = imageName.substring(0, imageName.indexOf('.'));
    }
    nodes.set(imageName, node);
  }

  nodes.forEach(function(node){
    node.textContent = textures.get(imageName);
    console.log(textures.get(imageName));
    textures.delete(imageName);
  });
  //console.log(collada);

  colladas.delete(element.value[0]);

  // colladaLoader needs to be instantiated every time you load a model
  colladaLoader = new THREE.ColladaLoader();

  colladaLoader.parse(collada, function(collada){
    divMessage.innerHTML = 'converting ' + element.value[0];
    let model = collada.scene;
    //console.log(model);
    scene3d.add(model);
    let json = JSON.stringify(model.toJSON());
    saveAs(element.value[0] + '.json', json);
    setTimeout(function(){
      parseCollada();
    }, 1);
  });
}


function saveAs(filename, data){
  let blob = new Blob([data], {type: 'text/plain'});
  let objectURL = URL.createObjectURL(blob);
  let link = document.createElement('a');

  link.href = objectURL;
  link.download = filename;
  link.target = '_blank';
  link.click();
}
