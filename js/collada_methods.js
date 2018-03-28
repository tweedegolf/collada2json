import THREE from 'three';
import './lib/collada_loader';
import getCache from './cache';
import saveAs from './util/save_as';
import threeConstants from './three_constants';

let jsonModels;
let colladaModels;
let textures;
let xmlParser;
let iterator;
let colladaLoader;
let cache;
let baseUrl;
let hasTextures;
let colladaImages;
let colladaTextures;

THREE.Cache.enabled = true;

export default function setupColladaMethods() {
  xmlParser = new DOMParser();
  return {
    parse: parseColladas,
  };
}

function parseColladas() {
  cache = getCache();
  jsonModels = cache.getJsonModels();
  colladaModels = cache.getColladas();
  textures = cache.getTextures();
  iterator = colladaModels.entries();
  parseCollada();
}


function parseCollada() {
  colladaImages = new Map();
  colladaTextures = new Map();

  const element = iterator.next();

  if (element.done) {
    document.dispatchEvent(new CustomEvent('converting', { detail: { type: 'done' } }));
    return;
  }

  const colladaName = element.value[0];
  const detail = {
    type: 'start',
    model: colladaName,
  };
  document.dispatchEvent(new CustomEvent('converting', { detail }));


  const collada = xmlParser.parseFromString(element.value[1], 'application/xml');
  const results = collada.evaluate(
    '//dae:library_images/dae:image/dae:init_from/text()',
    collada,
    () => 'http://www.collada.org/2005/11/COLLADASchema',
    XPathResult.ANY_TYPE, null
  );

  let node;
  const nodes = new Map();
  let imageName;

  while ((node = results.iterateNext()) !== null) {
    imageName = node.textContent;
    // if(imageName.indexOf('/') !== -1){
    //   imageName = imageName.substring(imageName.lastIndexOf('/') + 1);
    // }
    nodes.set(imageName, node);
  }

  nodes.forEach((node) => {
    if (colladaImages.has(imageName) === false) {
      const img = document.createElement('img');
      img.src = textures.get(imageName);
      img.url = imageName;
      img.uuid = THREE.Math.generateUUID();
      THREE.Cache.add(baseUrl + imageName, img); // for colladas
      THREE.Cache.add(imageName, img); // for json models
      colladaImages.set(imageName, img);
    }
  });

  // colladaLoader needs to be instantiated every time you load a model
  colladaLoader = new THREE.ColladaLoader();

  colladaLoader.parse(collada, (collada) => {
    const model = collada.scene;
    model.scale.set(1, 1, 1);
    // hasTextures = parseTextures(model);
    colladaModels.set(colladaName, model);
    // console.log(model);
    let json = model.toJSON();
    // if (hasTextures) {
    json = addTextures(json);
    // }
    addJsonModel(colladaName, json);
  });
}


function addTextures(json) {
  const materials = json.materials;
  materials.forEach((material) => {
    if (colladaTextures.has(material.uuid)) {
      material.map = colladaTextures.get(material.uuid).uuid;
    }
  });

  const images = [];
  colladaImages.forEach((image, name) => {
    // console.log(name, image);
    images.push({
      url: name,
      name,
      uuid: image.uuid,
    });
  });

  const textures = [];
  colladaTextures.forEach((texture, uuid) => {
    // console.log(uuid, texture);
    const obj = {
      uuid: texture.uuid,
      image: texture.image.uuid,
    };
    if (texture.repeat) {
      obj.repeat = [texture.repeat.x, texture.repeat.y];
    }
    if (texture.minFilter) {
      obj.minFilter = threeConstants[texture.minFilter];
    }
    if (texture.magFilter) {
      obj.magFilter = threeConstants[texture.magFilter];
    }
    if (texture.anisotropy) {
      obj.anisotropy = texture.anisotropy;
    }
    if (texture.wrapS) {
      obj.wrap = [threeConstants[texture.wrapS], threeConstants[texture.wrapT]];
    }
    textures.push(obj);
  });

  json.images = images;
  json.textures = textures;

  return json;
}


function parseTextures(model) {
  let hasTextures = false;
  model.traverse((child) => {
    if (child.material && child.material.map) {
      if (colladaTextures.has(child.material.uuid) === false) {
        colladaTextures.set(child.material.uuid, child.material.map);
      }
      // console.log(textures.get(child.material.map.image.url));
      child.material.emissive = new THREE.Color(0, 0, 0);
      // child.material.map.wrapS = THREE.ClampToEdgeWrapping;
      // child.material.map.wrapT = THREE.ClampToEdgeWrapping;
      // /child.material.map.minFilter = THREE.LinearFilter;
      child.material.needsUpdate = true;
      hasTextures = true;
    }
  });
  return hasTextures;
  // console.log(colladaTextures);
}


function addJsonModel(colladaName, json) {
  const loader = new THREE.ObjectLoader();
  const model = loader.parse(json);
  model.scale.set(1, 1, 1);
  cache.addJsonModel(colladaName, model);

  const detail = {
    type: 'ready',
    model: colladaName,
  };
  document.dispatchEvent(new CustomEvent('converting', { detail }));
  setTimeout(() => {
    saveAs(`${colladaName}.json`, JSON.stringify(json));
    // clear cache
    jsonModels.delete(colladaName);
    colladaModels.delete(colladaName);
    THREE.Cache.clear();
    colladaImages.forEach((image, imageName) => {
      textures.delete(imageName);
    });
    colladaImages.clear();
    colladaTextures.clear();
    console.log(jsonModels.size, colladaModels.size, textures.size);
    json = null;
    parseCollada();
  }, 10);
}
