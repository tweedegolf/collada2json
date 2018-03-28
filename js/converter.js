import THREE from 'three';
import './lib/collada_loader';
import getCache from './cache';
import saveAs from './util/save_as';

let colladaLoader;
let colladaModels;
let xmlParser;
let iterator;
let cache;
let baseUrl;
let divMessages;

THREE.Cache.enabled = true;
console.log(`Threejs r${THREE.REVISION}`);

// parse one single Collada
const parseCollada = (i) => {
  const index = i + 1;
  const element = iterator.next();

  if (element.done) {
    divMessages.innerHTML = `done converting<br>${divMessages.innerHTML}`;
    return;
  }
  const colladaName = element.value[0];
  divMessages.innerHTML = `#${index}: ${colladaName}<br> ${divMessages.innerHTML}`;

  // Parse the XML of the Collada and find all the images that are used in textures.
  const collada = xmlParser.parseFromString(element.value[1], 'application/xml');
  const results = collada.evaluate(
    '//dae:library_images/dae:image/dae:init_from/text()',
    collada,
    () => 'http://www.collada.org/2005/11/COLLADASchema',
    XPathResult.ANY_TYPE, null
  );

  // Store all images (more precisely: the names of the images).
  const imageNames = [];
  let loop = true;
  while (loop) {
    const node = results.iterateNext();
    if (node !== null) {
      imageNames.push(node.textContent);
    } else {
      loop = false;
    }
  }

  // For each found image we store an IMG element in the THREE.Cache to suppress error messages when
  // Three attempts to load the texture images that are not available.
  // Also we add an uuid to the texture image because we need to store it in the JSON file later on.
  const images = [];
  imageNames.forEach((imageName) => {
    const img = document.createElement('img');
    img.url = imageName;
    img.uuid = THREE.Math.generateUUID();
    THREE.Cache.add(baseUrl + imageName, img);
    images.push({
      url: imageName,
      name: imageName,
      uuid: img.uuid,
    });
  });

  // Parse the Collada into a Threejs model, then we traverse the model to find materials with textures; we
  // add a key 'map' to the material if that material uses a texture
  colladaLoader.parse(collada, (collada) => {
    // console.log(collada);
    const model = collada.scene;
    model.scale.set(1, 1, 1);
    colladaModels.set(colladaName, model);
    // console.log(model);

    setTimeout(() => {
      let json = model.toJSON();
      json.images = images;
      saveAs(`${colladaName}.json`, JSON.stringify(json));

      // clear the caches
      colladaModels.delete(colladaName);
      THREE.Cache.clear();
      // console.log(colladaModels.size);
      json = null;
      parseCollada(index);
    }, 0);
  });
};


// start parsing all loaded Colladas
const parseColladas = () => {
  cache = getCache();
  colladaModels = cache.getColladas();
  iterator = colladaModels.entries();
  parseCollada(0);
};


export default function setupConverter() {
  colladaLoader = new THREE.ColladaLoader();
  divMessages = document.getElementById('messages');
  xmlParser = new DOMParser();
  return {
    parse: parseColladas,
  };
}
