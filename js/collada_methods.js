import THREE from 'three';
import './lib/collada_loader';
import getCache from './cache';
import saveAs from './util/save_as';

const baseUrl = 'undefined'; // intentionally undefined
let textures;
let jsonModels;
let colladaModels;
let xmlParser;
let iterator;
let colladaLoader;
let cache;

THREE.Cache.enabled = true;

const parseCollada = () => {
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

  // For each found image we store an IMG element in the THREE.Cache to suppress error messages when
  // Three attempts to load the texture images that are not available. Also we add an uuid to the
  // texture image because we need to store it in the JSON file later on.
  let loop = true;
  while (loop) {
    const node = results.iterateNext();
    if (node !== null) {
      const imageName = node.textContent;
      const img = document.createElement('img');
      img.uuid = THREE.Math.generateUUID();
      // set the source to the data uri!
      img.src = textures.get(imageName);
      THREE.Cache.add(baseUrl + imageName, img);
    } else {
      loop = false;
    }
  }

  // colladaLoader needs to be instantiated every time you load a model
  colladaLoader = new THREE.ColladaLoader();

  colladaLoader.parse(collada, (c) => {
    setTimeout(() => {
      const colladaModel = c.scene;
      colladaModel.scale.set(1, 1, 1);
      colladaModels.set(colladaName, colladaModel);

      const loader = new THREE.ObjectLoader();
      const json = colladaModel.toJSON();
      const jsonModel = loader.parse(json);
      jsonModel.scale.set(1, 1, 1);
      cache.addJsonModel(colladaName, jsonModel);
      console.log(jsonModel);

      document.dispatchEvent(new CustomEvent('converting', {
        detail: {
          type: 'ready',
          model: colladaName,
          fileName: `${colladaName}.json`,
          data: JSON.stringify(json),
        },
      }));

      // saveAs(`${colladaName}.json`, JSON.stringify(json));
      // clear cache
      jsonModels.delete(colladaName);
      colladaModels.delete(colladaName);
      // THREE.Cache.clear();
      parseCollada();
    }, 1000);
  });
};

function parseColladas() {
  cache = getCache();
  textures = cache.getTextures();
  jsonModels = cache.getJsonModels();
  colladaModels = cache.getColladas();
  iterator = colladaModels.entries();
  parseCollada();
}

export default function setupColladaMethods() {
  xmlParser = new DOMParser();
  return {
    parse: parseColladas,
  };
}
