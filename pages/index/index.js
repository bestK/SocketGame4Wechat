//share.js
//分享页

var app = getApp()
Page({
  //前往游戏界面
  gotoGame: function () {
    var destination = app.globalData.socket.destination;
    app.globalData.socket.destination = destination + new Date().getTime();
    wx.navigateTo({
      url: '../game/game'
    })
  }

  
})

