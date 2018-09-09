import setupColladaMethods from './collada_methods';
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
  const colladaMethods = setupColladaMethods();
  const divMessage = document.getElementById('message');

  const loadFile = () => {
    currentIndex += 1;
    if (currentIndex >= numFiles) {
      colladaMethods.parse();
      return;
    }

    const file = fileList[currentIndex];
    fileName = file.name;
    fileType = file.type;
    divMessage.innerHTML = `loading ${fileName}`;

    if (fileType.indexOf('image') !== -1) {
      fileType = 'image';
      fileReader.readAsDataURL(file);
    } else if (pattern.test(fileName)) {
      fileType = 'xml';
      fileReader.readAsText(file);
    } else {
      loadFile();
    }
  };


  fileElem.onchange = (e) => {
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
    if (fileType === 'image') {
      cache.addTexture(fileName, fileReader.result);
    } else if (fileType === 'xml') {
      cache.addCollada(fileName, fileReader.result);
    }
    loadFile();
  }, false);
}
