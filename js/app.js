import createScene3D from './scene3d';
import createLoader from './loader';
import getCache from './cache';

let sceneCollada;
let sceneJson;
let cache;

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  sceneCollada.resize(width / 2, height);
  sceneJson.resize(width / 2, height);
}

window.onload = () => {
  const divMessage = document.getElementById('message');

  sceneCollada = createScene3D();
  document.getElementById('canvas_collada').appendChild(sceneCollada.domElement);

  sceneJson = createScene3D();
  document.getElementById('canvas_json').appendChild(sceneJson.domElement);

  createLoader();

  document.addEventListener('converting', (e) => {
    const type = e.detail.type;
    switch (type) {
      case 'start':
        divMessage.innerHTML = `converting ${e.detail.model}`;
        break;
      case 'ready':
        divMessage.innerHTML = `${e.detail.model} converted`;
        cache = getCache();
        sceneJson.add(cache.getJsonModel(e.detail.model));
        sceneCollada.add(cache.getColladaModel(e.detail.model));
        break;
      case 'done':
        divMessage.innerHTML = 'done';
        // sceneJson.clear();
        // sceneCollada.clear();
        cache.clear();
        break;
    }
  });

  resize();
  window.onresize = resize;
};

