'use strict';

import getCache from './cache.js';
import threeConstants from './three_constants.js';

let colladaLoader;
let colladaModels;
let colladaImages;
let colladaTextures;
let xmlParser;
let iterator;
let cache;
let baseUrl;
let divMessages;


export default function setupConverter() {
  colladaLoader = new THREE.ColladaLoader();
  divMessages = document.getElementById('messages');
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
    divMessages.innerHTML = 'done converting<br>' + divMessages.innerHTML;
    return;
  }
  let colladaName = element.value[0];

  divMessages.innerHTML = `#${++i}: ${colladaName}<br> ${divMessages.innerHTML}`;

  // Parse the XML of the Collada and find all the images that are used in textures.
  let collada = xmlParser.parseFromString(element.value[1], 'application/xml');
  let results = collada.evaluate('//dae:library_images/dae:image/dae:init_from/text()',
    collada,
    function () {
      return 'http://www.collada.org/2005/11/COLLADASchema';
    },
    XPathResult.ANY_TYPE, null
  );

  // Store all images (more precisely: the names of the images).
  let node;
  let images = [];
  while ((node = results.iterateNext()) !== null) {
    // console.log(node, node.textContent);
    images.push(node.textContent);
  }

  // For each found image we store an IMG element in the THREE.Cache to suppress error messages when
  // Three attempts to load the texture images that are not available.
  // Also we add an uuid to the texture image because we need to store it in the JSON file later on.
  images.forEach(function (imageName) {
    if (colladaImages.has(imageName) === false) {
      let img = document.createElement('img');
      img.url = imageName;
      img.uuid = THREE.Math.generateUUID();
      THREE.Cache.add(baseUrl + imageName, img);
      // console.log(imageName, img);
      colladaImages.set(imageName, img);
    }
  });

  // Parse the Collada into a Threejs model, then we traverse the model to find materials with textures; we
  // add a key 'map' to the material if that material uses a texture
  colladaLoader.parse(collada, function (collada) {
    // console.log(collada);
    let model = collada.scene;
    model.scale.set(1, 1, 1);
    colladaModels.set(colladaName, model);
    let json = model.toJSON();
    console.log(json);
    if (hasTextures(model)) {
      json = addTextures(json);
    }
    saveAs(colladaName + '.json', JSON.stringify(json));
    setTimeout(function () {
      // clear the caches
      colladaModels.delete(colladaName);
      THREE.Cache.clear();
      colladaImages.clear();
      colladaTextures.clear();
      //console.log(colladaModels.size);
      json = null;
      parseCollada(i);
    }, 1);
  });
}

// Adds the keys 'images' and 'textures' to the JSON file
function addTextures(json) {
  let materials = json.materials;
  // console.log(colladaTextures);
  materials.forEach(function (material) {
    // console.log(material);
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
    console.log(uuid, texture);
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
    // console.log(child.material);
    if (child.material && child.material.map) {
      // We store every material that has a texture by its uuid so we can easily find it when we are
      // adding the textures to the JSON file.
      if (colladaTextures.has(child.material.uuid) === false) {
        colladaTextures.set(child.material.uuid, child.material.map);
      }
      t = true;
    } else if (child.material && child.material.materials) {
      child.material.materials.forEach(material => {
        if (material.map) {
          if (colladaTextures.has(material.uuid) === false) {
            colladaTextures.set(material.uuid, material.map);
          }
          t = true;
        }
      })
    }
  });
  return t;
}


function saveAs(filename, data) {
  let blob = new Blob([data], { type: 'text/plain' });
  let objectURL = URL.createObjectURL(blob);
  let link = document.createElement('a');

  link.href = objectURL;
  link.download = filename;
  link.target = '_blank';
  link.click();
}