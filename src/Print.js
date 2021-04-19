import React, { useState,useEffect } from 'react'
import { Button, Select,message } from 'antd'

const { Option } = Select;
const { ipcRenderer } = window.require('electron'); // 参考https://blog.csdn.net/qq_38333496/article/details/102474532

const TagPrint = (props) => {
  const [state, setState] = useState({
    printMsg: '这是我要打印的测试内容: TAG_PRINT',
    dataItem: [],
    currentPrinter: ''
  })

  useEffect(() => {
    const webview = document.getElementById("printWebview");
    console.log('webview',webview);
    if (webview) {
      console.log('ipc-message')
      webview.addEventListener('ipc-message', (event) => {
        console.log('进入webview打印',event);
        if (event.channel === 'webview-print-do') {
          webview.print(
            {
              silent: false,
              printBackground: true,
              deviceName: state.currentPrinter
            },
            (data) => {
              console.log('打印结果：', data);
            },
          )
        }
      })
    }
  })

  const startPrintWebview = () => {
    const webview = document.getElementById("printWebview");
    if(state.currentPrinter){
      console.log('打印',webview)
      webview.send('webview-print-render', {
        html: state.printMsg,
        deviceName: state.currentPrinter
      })
    }else{
      message.info('请选择打印机')
    }
  }

  const changeLoginInfo = (type: string, value: any) => {
    setState({ ...state, [type]: value })
  }

  const handleChange = (value) => {
    console.log(`selected ${value}`);
    changeLoginInfo('currentPrinter', value)
  }

  const getPrint = () => {
    console.log('发送获取打印机列表消息');
    console.log(ipcRenderer)
    if (!ipcRenderer) return;
    ipcRenderer.send('allPrint');
    ipcRenderer.on('printName', (event, data: []) => {
      console.log(data); // data就是返回的打印机数据列表
      changeLoginInfo('dataItem', data)
    });
    ipcRenderer.on('print-error', (event, err) => {
      message.error(err);
    })
  }
  const startPrint = () => {
    if (!ipcRenderer) return;
    if(state.currentPrinter){
      ipcRenderer.send('print-start', {
          html: state.printMsg,
          deviceName: state.currentPrinter
      });
    }else{
      message.info('请选择打印机')
    }
  }
  return (
    <div>
      <div>{state.printMsg}</div>
      <Button type='primary' onClick={getPrint}>
        获取打印机列表
      </Button>
      <Button type='primary' style={{margin:'0 20px'}} onClick={startPrint}>
        webcontents打印
      </Button>
      <Button type='primary' onClick={startPrintWebview}>
        webview打印
      </Button>
      <h5>打印机选择</h5>
      <Select defaultValue="" style={{ width: 120 }} onChange={handleChange}>
        {state.dataItem.map((item) => {
          // eslint-disable-next-line react/jsx-key
          return (<Option key={item.name} value={item.name}>{item.name}</Option>);
        })}
      </Select>
      {/* <webview is='true' nodeintegration='true' width="100%" height="100%" src="./print/print2.html" id="printWebview" preload='./print/print2.js' /> */}
    </div>
  )
}

export default TagPrint;