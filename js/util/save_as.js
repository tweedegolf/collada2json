const saveAs = (filename, data) => {
  // let blob = new Blob([data], { type: 'text/plain' });
  // let objectURL = URL.createObjectURL(blob);
  // let link = document.createElement('a');

  // link.href = objectURL;
  // link.download = filename;
  // link.target = '_blank';
  // link.click();

  // from: https://code.sololearn.com/Wde1it1cKxXk/#html
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';

  // const json = JSON.stringify(data);
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};


export default saveAs;
