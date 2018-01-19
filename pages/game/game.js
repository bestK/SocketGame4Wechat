"use strict";

// 引入 co 和 promisify 帮助我们进行异步处理
const co = require('../../lib/co.js');
const promisify = require('../../lib/promisify.js');

const Stomp = require('../../lib/stomp.js').Stomp;

// 生成随机用户 ID
const uuid = require('../../lib/uuid.js');

const MySocket = require("../../lib/mysocket.js")

// 小程序配置
const appConfig = require('../../config.js');

// 需要使用的微信 API，转成返回 Promise 的接口
const login = promisify(wx.login);
const getUserInfo = promisify(wx.getUserInfo);
const getSystemInfo = promisify(wx.getSystemInfo);

// 获得小程序实例
const app = getApp();

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
    client: null
  },

  // 页面显示后，进行登录和链接，完成后开始启动游戏服务
  onShow: co.wrap(function* () {
    const self = this
    self.login()
    var onSocketOpen = app.globalData.onSocketOpen
    self.setData({ onSocketOpen: onSocketOpen })

    if (onSocketOpen) {
      self.setData({
        gameInfo: "Socket joined",
        client: app.globalData.client,
        destination: app.globalData.destination
      });
    }

  }),

  // 微信登录后获得用户信息
  login: co.wrap(function* () {
    this.setData({ gameInfo: " Loading... " });
    const loginResult = yield login();
    const userInfo = yield getUserInfo();
    const { nickName, avatarUrl } = userInfo.userInfo;
    this.setData({ myName: nickName, myAvatar: avatarUrl })
  }),

  // 发送 socket 消息
  sendSocketMsg: function () {
    var socket = this.data
    socket.client.send(socket.destination, { priority: 9 }, 'Hello whoami !' + new Date().getTime());


    
  }

});
