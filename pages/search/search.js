// pages/search/search.js
import requset from "../../utils/requset";
let isSend = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '',
    hotList: [],
    searchContent: '',
    searchList: [],
    historyList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInitData()
    this.getHotList()
    // 读取本地搜索记录
    this.getSearchHotList()
  },

  // 读取本地搜索记录
  getSearchHotList () {
    let historyList = wx.getStorageSync('searchHistory')
    if (historyList) {
      this.setData({
        historyList
      })
    }
  },

  //获取初始化的数据
  async getInitData () {
    let placeholderData = await requset('/search/default')
    this.setData({
      placeholderContent: placeholderData.data.showKeyword
    })
  },

  // 获取热搜列表初始化数据
  async getHotList () {
    let hototListData = await requset('/search/hot/detail')
    this.setData({
      hotList: hototListData.data
    })
  },

  // 表单内容发生改变的回调
  handleInputChange (event) {
    this.setData({
      searchContent: event.detail.value.trim()
    })
    if (isSend) {
      return
    }
    isSend = true
    this.getSearchList()
    setTimeout(() => {
      isSend = false
    },300)
  },

  //获取搜索列表
  async getSearchList () {
    if (!this.data.searchContent) {
      this.setData({
        searchList: []
      })
      return
    }
    let {searchContent,historyList} = this.data
    let searchListData = await requset('/cloudsearch',{keywords:this.data.searchContent,limit:10})
    this.setData({
      searchList: searchListData.result.songs
    })
    if (historyList.indexOf(searchContent) !== -1) {
      historyList.splice(historyList.indexOf(searchContent),1)
    }
    historyList.unshift(searchContent)
    this.setData({
      historyList
    })
    // 保存搜索的关键字到本地
    wx.setStorageSync('searchHistory',historyList)
  },

  // 清空搜索内容
  clearSearchContent () {
    // console.log('clear')
    this.setData({
      searchContent: '',
      searchList: []
    })
  },

  // 删除搜索历史记录
  deleteSearchHistory () {
    // console.log('deleteSearchHistory()')
    wx.showModal({
      content: '确认删除吗?',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory')
          this.setData({
            historyList: []
          })
        }
      }
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
