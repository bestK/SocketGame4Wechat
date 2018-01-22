// app.js
App({
  onShow: function () {

  },
  globalData: {
    userInfo: null,
    openInfo: {},
    windowHeight: 507,
    socket:{
      onSocketOpen: false,
      client: null,
      destination: '/jdstb/room/',
    }
  }
})