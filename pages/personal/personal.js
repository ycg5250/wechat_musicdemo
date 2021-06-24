import requset from "../../utils/requset";

let startY = 0
let moveY = 0
let moveDistance = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: 'translateY(0)',
    coverTransition: '',
    userInfo: {},
    recentPlayList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //读取用户数据
    let userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
      this.getRecentPlayList(this.data.userInfo.userId)
    }
  },

  async getRecentPlayList (userId) {
    let recentPlayListData = await requset('/user/record',{uid:userId,type:0})
    let index = 0
    let recentPlayList = recentPlayListData.allData.splice(0,10).map(item => {
      item.id = index++
      return item
    })
    this.setData({
      recentPlayList
    })
  },

  toLogin () {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  handleTouchStart (event) {
    //获取手指的起始坐标
    startY = event.touches[0].clientY
    this.setData({
      coverTransition: ''
    })
  },

  handleTouchMove (event) {
    moveY = event.touches[0].clientY
    moveDistance = moveY - startY
    if (moveDistance <= 0) {
      return
    }
    if (moveDistance >= 80) {
      moveDistance = 80
    }
    this.setData({
      coverTransform:`translateY(${moveDistance}rpx)`
    })
  },

  handleTouchEnd () {
    this.setData({
      coverTransform:`translateY(0rpx)`,
      coverTransition: 'transform 1s linear'
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
