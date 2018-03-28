let cache;

export default function getCache() {
  if (cache !== undefined) {
    return cache;
  }

  const colladaModels = new Map();

  cache = {
    addCollada(key, value) {
      colladaModels.set(key, value);
    },
    getColladas() {
      return colladaModels;
    },
    getColladaModel(id) {
      return colladaModels.get(id);
    },
    clear() {
      colladaModels.clear();
    },
  };

  return cache;
}
