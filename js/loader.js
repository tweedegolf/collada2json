import setupConverter from './converter';
import getCache from './cache';

export default function createLoader() {
  const cache = getCache();
  const fileSelect = document.getElementById('fileSelect');
  const fileElem = document.getElementById('fileElem');
  const fileReader = new FileReader();
  const pattern = /\.dae$/i;
  let fileList;
  let numFiles;
  let currentIndex;
  let fileType;
  let fileName;
  let numModels = 0;
  const converter = setupConverter();
  const divMessages = document.getElementById('messages');


  fileElem.onchange = function (e) {
    cache.clear();
    fileList = e.target.files;
    numFiles = fileList.length;
    currentIndex = -1;
    loadFile();
  };


  fileSelect.addEventListener('click', (e) => {
    if (fileElem) {
      fileElem.click();
    }
    e.preventDefault(); // prevent navigation to '#'
  }, false);


  fileReader.addEventListener('load', () => {
    if (fileType === 'xml') {
      cache.addCollada(fileName, fileReader.result);
    }
    loadFile();
  }, false);


  function loadFile() {
    let file;

    if (++currentIndex >= numFiles) {
      if (numModels === 0) {
        divMessages.innerHTML = 'no models to convert';
        return;
      } else if (numModels === 1) {
        divMessages.innerHTML = `start converting ${numModels} model`;
      } else if (numModels > 1) {
        divMessages.innerHTML = `start converting ${numModels} models`;
      }
      converter.parse();
      return;
    }

    file = fileList[currentIndex];
    fileName = file.name;
    fileType = file.type;

    divMessages.innerHTML = `loading ${fileName} (${currentIndex + 1} of ${numFiles})`;

    if (pattern.test(fileName)) {
      numModels++;
      fileType = 'xml';
      fileReader.readAsText(file);
    } else {
      loadFile();
    }
  }
}
