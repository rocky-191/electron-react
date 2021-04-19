// const { ipcRenderer } = require('electron')

console.log('webview print')
if ( window.require('electron') ) {
  let ipcRenderer = window.require('electron').ipcRenderer;
  ipcRenderer.on('webview-print-render', (event,{deviceName,html}) => {
    console.log('收到');
    //执行渲染
    let html = '';
    for (let index = 0; index < 5; index++) {
      html+=`<div class="div1"><p id="time">${deviceName}hahahah</p> </div>`
    }
    document.getElementById('bd').innerHTML = html;
    ipcRenderer.sendToHost('webview-print-do')
  })
}

// ipcRenderer.on('webview-print-render', (event,{deviceName,html}) => {
//   console.log('收到');
//   //执行渲染
//   let html = '';
//   for (let index = 0; index < 5; index++) {
//     html+=`<div class="div1"><p id="time">${deviceName}hahahah</p> </div>`
//   }
//   document.getElementById('bd').innerHTML = html;
//   ipcRenderer.sendToHost('webview-print-do')
// })
