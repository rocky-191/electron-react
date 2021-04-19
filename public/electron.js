const {app, BrowserWindow, ipcMain} = require('electron')
const isDev = require('electron-is-dev')
const path = require('path')
const url = require('url')

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
// 保持window对象的全局引用,避免JavaScript对象被垃圾回收时,窗口被自动关闭.
let mainWindow = null
let demoWindow = null;

function createWindow () {
  //创建浏览器窗口,宽高自定义具体大小你开心就好
  mainWindow = new BrowserWindow({
    title:'打印',
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webviewTag:true
    }
  })

  /* 
   * 加载应用-----  electron-quick-start中默认的加载入口
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))
  */
  // 加载应用----适用于 react 项目
  // mainWindow.loadURL('http://localhost:3000/');
  if(isDev){
    mainWindow.loadURL('http://localhost:3000/');
  }else{
    mainWindow.loadFile(path.join(__dirname, '/../build/index.html'))
  }
  
  // 打开开发者工具，默认不打开
  // mainWindow.webContents.openDevTools()

  // 关闭window时触发下列事件.
  mainWindow.on('closed', function () {
    demoWindow.close()
    mainWindow = null
  })
}

function createPrintWindow() {
  const windowOptions = {
    width: 100,
    height: 100,
    title: '打印页',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webviewTag:true
    }
  }
  demoWindow = new BrowserWindow(windowOptions);
  // demoWindow.loadURL(url.format({
  //   pathname: path.join('file://', __dirname, './public/print/print1.html'),
  //   protocol: 'file:',
  //   slashes: true
  // }))
  demoWindow.loadURL(path.join('file://', __dirname, './print/print1.html'));

  initPrintEvent();
}

function initPrintEvent() {
  ipcMain.on('print-start', (event, {deviceName,html}) => {
    console.log('print-start',deviceName);
    demoWindow.webContents.send('print-edit',{deviceName,html});
  })

  //获得打印机列表
  ipcMain.on('allPrint', () => {
    console.log('received getPrinters msg');
    const printers = demoWindow.webContents.getPrinters();
    mainWindow.send('printName', printers)
  })

  ipcMain.on('do', (event, deviceName) => {
    const printers = demoWindow.webContents.getPrinters();
    console.log('printers',deviceName)
    printers.forEach(element => {
      console.log('hello',element)
      if (element.name === deviceName && element.status != 0) {
        mainWindow.send('print-error', deviceName + '打印机异常');
        demoWindow.webContents.print({
          silent: false,
          printBackground: false,
          deviceName: ''
        },
          (data) => {
            console.log("回调", data);
          });
      } else if (element.name === deviceName && !element.status) {
        console.log(element.status + '-' + deviceName)
        demoWindow.webContents.print({
          silent: true,
          printBackground: false,
          deviceName: element.name
        }, (success, failureReason) => {
          if (success) {
            console.log('print success')
          }
          if (failureReason === 'cancelled') {
            console.log('print cancelled');
          }
          if (failureReason === 'failed') {
            console.log('print failed');
          }
        });
      }
    });
  })
}

app.allowRendererProcessReuse = true;
// 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
app.on('ready',()=>{
  createWindow();
  createPrintWindow();
})

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
   // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindow()
  }
})

// 你可以在这个脚本中续写或者使用require引入独立的js文件.