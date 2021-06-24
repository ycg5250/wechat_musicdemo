// pages/index/index.js
import requset from "../../utils/requset";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    banners: [],
    recommendList: [],
    topList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    let result = await requset('/banner',{type:2})
    this.setData({
      banners:result.banners,
      recommendList:''
    })
    // console.log('结果数据：',result)
    //获取推荐歌单数据
    let recommendListData = await requset('/personalized',{limit:10})
    this.setData({
      recommendList:recommendListData.result
    })
    //获取排行榜数据
    let index = 0
    let playlistArr = [19723756,3779629,2884035]
    let resultArr = []
    for (let i = 0;i < playlistArr.length;i++){
      let topListData = await requset('/top/list',{id:playlistArr[i]})
      let topListItem = {name: topListData.playlist.name,tracks: topListData.playlist.tracks.slice(0,3)}
      resultArr.push(topListItem)
      this.setData({
        topList:resultArr
      })
    }
  },

  // 跳转到每日推荐页面
  toRecommendSong () {
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong'
    })
  },

  //跳转到other页面
  toOther () {
    wx.navigateTo({
      url: '/otherPackage/pages/other/other'
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
