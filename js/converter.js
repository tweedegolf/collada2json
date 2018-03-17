import fs from 'fs';
import xpath from 'xpath';
import { DOMParser } from 'xmldom';
import getCache from './cache';
import threeConstants from './three_constants';
import ColladaLoader from './collada_loader';


let colladaLoader;
let colladaModels;
let colladaImages;
let colladaTextures;
let xmlParser;
let iterator;
let cache;
let baseUrl;


export default function setupConverter() {
  colladaLoader = new ColladaLoader();
  xmlParser = new DOMParser();
  return {
    parse: parseColladas
  };
}


// start parsing all loaded Colladas
function parseColladas() {
  cache = getCache();
  colladaModels = cache.getColladas();
  iterator = colladaModels.entries();
  parseCollada(0);
}


// parse one single Collada
function parseCollada(i) {

  colladaImages = new Map(); // stores all images used by textures in this Collada
  colladaTextures = new Map(); // stores all textures used by this Collada

  let element = iterator.next();

  if (element.done) {
    console.log('done converting<br>');
    return;
  }
  let colladaName = element.value[0];

  console.log(`#${++i}: ${colladaName}`);
  // console.log(element.value[1]);

  const nsResolver = {
    lookupNamespaceURI: () => 'http://www.collada.org/2005/11/COLLADASchema',
  }

  // Parse the XML of the Collada and find all the images that are used in textures.
  // let collada = xmlParser.parseFromString(element.value[1], 'application/xml');
  let collada = element.value[1];

  // Parse the Collada into a Threejs model, then we traverse the model to find materials with textures; we
  // add a key 'map' to the material if that material uses a texture
  colladaLoader.parse(collada, function (collada) {
    // console.log(collada);
    let model = collada.scene;
    model.scale.set(1, 1, 1);
    colladaModels.set(colladaName, model);
    // console.log(model);
    let json = model.toJSON();
    if (hasTextures(model)) {
      json = addTextures(json);
    }
    fs.writeFileSync(colladaName + '.json', JSON.stringify(json));
    setTimeout(function () {
      // clear the caches
      colladaModels.delete(colladaName);
      THREE.Cache.clear();
      colladaImages.clear();
      colladaTextures.clear();
      // console.log(colladaModels.size);
      json = null;
      parseCollada(i);
    }, 1);
  });
}

// Adds the keys 'images' and 'textures' to the JSON file
function addTextures(json) {
  let materials = json.materials;
  materials.forEach(function (material) {
    if (colladaTextures.has(material.uuid)) {
      material.map = colladaTextures.get(material.uuid).uuid;
    }
  });

  let images = [];
  colladaImages.forEach(function (image, name) {
    //console.log(name, image);
    images.push({
      url: name,
      name: name,
      uuid: image.uuid
    });
  });

  let textures = [];
  colladaTextures.forEach(function (texture, uuid) {
    //console.log(uuid, texture);
    let obj = {
      uuid: texture.uuid,
      image: texture.image.uuid
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


function hasTextures(model) {
  let t = false;
  model.traverse(function (child) {
    if (child.material && child.material.map) {
      // We store every material that has a texture by its uuid so we can easily find it when we are
      // adding the textures to the JSON file.
      if (colladaTextures.has(child.material.uuid) === false) {
        colladaTextures.set(child.material.uuid, child.material.map);
      }
      t = true;
    }
  });
  return t;
}
