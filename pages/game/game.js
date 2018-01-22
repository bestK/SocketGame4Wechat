"use strict";

// 引入 co 和 promisify 帮助我们进行异步处理
const co = require('../../lib/co.js');
const regeneratorRuntime = global.regeneratorRuntime = require('../../lib/runtime')

const Promisify = require('../../lib/httpsPromisify.js');

const Stomp = require('../../lib/stomp.js').Stomp;

// 生成随机用户 ID
const uuid = require('../../lib/uuid.js');



// 小程序配置
const appConfig = require('../../config.js');

// 需要使用的微信 API，转成返回 Promise 的接口
const login = Promisify.httpsPromisify(wx.login);
const getUserInfo = Promisify.httpsPromisify(wx.getUserInfo);
const getSystemInfo = Promisify.httpsPromisify(wx.getSystemInfo);
// 获得小程序实例
const app = getApp();

const socket = app.globalData.socket

// 定义页面
Page({
  data: {
    // 是否已经和服务器连接并且完成 hello-hi 交流
    connected: false,

    // 游戏是否进行中
    playing: false,

    // 当前游戏状态
    gameState: "uninitialized",

    // 当前需要展示的游戏信息
    gameInfo: "",

    // 开始游戏按钮文本
    startButtonText: "开始",

    //「我」的信息，包括昵称、头像、分数、选择
    myName: "",
    myAvatar: null,
    myScore: 0,
    myStreak: 0,
    myChoice: Math.floor(Math.random() * 10000) % 3 + 1,

    //「你」的信息
    youHere: false,
    yourName: "",
    yourAvatar: null,
    yourScore: 0,
    yourStreak: 0,
    yourChoice: 1,
    yourMove: 0,

    // 取得胜利的是谁
    win: null,

    // websocket 状态
    onSocketOpen: false,

    // websocket 连接对象
    client: null,
    // 自己的性别
    mySex: null,
    // 根据性别展示颜色
    myColor: null,

    roomId: null,

    roomUserTotal: 0
  },

  onLoad: function (e) {
    var self = this
    var roomId = e.roomId
    var roomUserTotal = e.roomUserTotal
    // 邀请进来的 获得游戏房间
    if (undefined != roomId) {
      var destination = app.globalData.socket.destination + roomId
      app.globalData.socket.destination = destination
      self.setData({
        roomId: roomId,
        roomUserTotal: roomUserTotal++,
        youHere: true
      })

      var gameData = {}

      // 订阅游戏房间
      socket.client.subscribe(destination, function (body, headers) {
        console.log('From Socket:', body);
      });

      socket.client.send(destination, { priority: 9 }, JSON.stringify(gameData))
    }
  },

  // 页面显示后，进行登录和链接，完成后开始启动游戏服务
  onShow: co.wrap(function* () {
    const self = this
    self.login()
    var onSocketOpen = app.globalData.socket.onSocketOpen
    self.setData({ onSocketOpen: onSocketOpen, roomUserTotal: 1 })

    if (onSocketOpen) {
      self.setData({
        gameInfo: "房间创建成功",
        client: app.globalData.socket.client,
        destination: app.globalData.socket.destination
      });
    }

    self.openid()
  }),

  // 微信登录后获得用户信息
  login: co.wrap(function* () {
    this.setData({ gameInfo: " Loading... " });
    const loginResult = yield login();
    this.openid(loginResult.code)
    const userInfo = yield getUserInfo();
    const { nickName, avatarUrl, gender } = userInfo.userInfo;
    const myColor = gender == 1 ? 'lightskyblue' : 'lightpink'
    this.setData({ myName: nickName, myAvatar: avatarUrl, mySex: gender, myColor: myColor })
  }),

  // 获得 openid
  openid: co.wrap(function* (code) {
    if (undefined != code) {
      wx.request({
        url: 'https://vinohobby.com/wechat/getOpenId?loginCode=' + code + '&wId=' + 3,
        success: function (res) {
          app.globalData.openInfo = res.data
        },
        fail: function (res) {
          console.log(res)
        }
      })
    }
  }),

  // 发送 socket 消息
  sendSocketMsg: function () {
    socket.client.send(socket.destination, { priority: 9 }, 'Hello whoami !' + new Date().getTime());
  },

  // 选择出拳
  handChoice: function (e) {
    if (!this.data.playing) return;
    let myChoice = this.data.myChoice + 1;
    if (myChoice == 4) {
      myChoice = 1;
    }
    this.setData({ myChoice: myChoice });
    let gameData = new Object();
    gameData.choice = myChoice;
    socket.client.send(socket.destination, { priority: 9 }, JSON.stringify(gameData));
  },

  // 游戏回合结果
  roundResult: function () {

  },

  // 分享或邀请
  onShareAppMessage: function () {
    var self = this
    var roomId = 0;
    var destination = app.globalData.socket.destination
    var index = destination.lastIndexOf("\/");
    roomId = destination.substring(index + 1, destination.length);
    return {
      title: '剪刀石头布，可敢与我一战！',
      path: 'pages/game/game?roomId=' + roomId + '&roomUserTotal' + self.data.roomUserTotal,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }



});


const MySocket = require("../../lib/mysocket.js")