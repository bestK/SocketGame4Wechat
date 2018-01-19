// app 实例

var app = new getApp()

var socketOpen = false
var socketMsgQueue = []
function sendSocketMessage(msg) {
  console.log('send msg:')
  console.log(msg);
  if (socketOpen) {
    wx.sendSocketMessage({
      data: msg
    })
  } else {
    socketMsgQueue.push(msg)
  }
}

/////////////////////////////////////////////////////
var ws = {
  send: sendSocketMessage,
  onopen: null,
  onmessage: null
}

wx.connectSocket({
  url: 'ws://127.0.0.1/notification/websocket'
})
wx.onSocketOpen(function (res) {
  console.log('WebSocket连接已打开！')
  socketOpen = true
  
  // websocket 状态全局标识
  app.globalData.socket.onSocketOpen = socketOpen
  // 全局保存 websocket client

  app.globalData.socket.client = client

  for (var i = 0; i < socketMsgQueue.length; i++) {
    sendSocketMessage(socketMsgQueue[i])
  }
  socketMsgQueue = []

  ws.onopen && ws.onopen()
})

wx.onSocketMessage(function (res) {
  console.log('收到onmessage事件:', res)
  ws.onmessage && ws.onmessage(res)
})

var Stomp = require('./stomp.js').Stomp;
Stomp.setInterval = function () { }
Stomp.clearInterval = function () { }
var client = Stomp.over(ws);
var destination = app.globalData.destination;
client.connect('user', 'pass', function (sessionId) {
  console.log('sessionId', sessionId)

  client.subscribe(destination, function (body, headers) {
    console.log('From Socket:', body);
  });

  client.send(destination, { priority: 9 }, 'Hello whoami !');
})


