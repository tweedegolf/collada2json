'use strict';

let cache;

export default function getCache(){

  if(cache !== undefined){
    return cache;
  }

  let textures = new Map();
  let colladaModels = new Map();
  let jsonModels = new Map();


  cache = {
    addJsonModel: function(key, value){
      jsonModels.set(key, value);
    },
    addCollada: function(key, value){
      colladaModels.set(key, value);
    },
    addTexture: function(key, value){
      textures.set(key, value);
    },
    getColladas: function(){
      return colladaModels;
    },
    getJsonModels: function(){
      return colladaModels;
    },
    getColladaModel: function(id){
      return colladaModels.get(id);
    },
    getJsonModel: function(id){
      return jsonModels.get(id);
    },
    getTextures: function(){
      return textures;
    },
    clear: function(){
      textures.clear();
      jsonModels.clear();
      colladaModels.clear();
    }
  };

  return cache;
}