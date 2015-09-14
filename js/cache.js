'use strict';

let cache;

export default function getCache(){

  if(cache !== undefined){
    return cache;
  }

  let colladaModels = new Map();

  cache = {
    addCollada: function(key, value){
      colladaModels.set(key, value);
    },
    getColladas: function(){
      return colladaModels;
    },
    getColladaModel: function(id){
      return colladaModels.get(id);
    },
    clear: function(){
      colladaModels.clear();
    }
  };

  return cache;
}