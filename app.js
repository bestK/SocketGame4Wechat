// app.js


App({
  onShow: function () {

  },
  globalData: {
    userInfo: null,
    windowHeight: 507,
    socket:{
      onSocketOpen: false,
      client: null,
      destination: '/router/game/jdstb',
    }
  }
})