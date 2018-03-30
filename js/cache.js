let cache;

export default function getCache() {
  if (cache !== undefined) {
    return cache;
  }

  const textures = new Map();
  const colladaModels = new Map();
  const jsonModels = new Map();

  cache = {
    addJsonModel(key, value) {
      jsonModels.set(key, value);
    },
    addCollada(key, value) {
      colladaModels.set(key, value);
    },
    addTexture(key, value) {
      textures.set(key, value);
    },
    getColladas() {
      return colladaModels;
    },
    getJsonModels() {
      return colladaModels;
    },
    getColladaModel(id) {
      return colladaModels.get(id);
    },
    getJsonModel(id) {
      return jsonModels.get(id);
    },
    getTextures() {
      return textures;
    },
    clear() {
      textures.clear();
      jsonModels.clear();
      colladaModels.clear();
    },
  };

  return cache;
}
