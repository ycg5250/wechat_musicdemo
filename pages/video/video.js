// pages/video/video.js
import requset from "../../utils/requset";

let flag = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [],
    navId: '',
    videoList: [],
    indexCurrent:null,
    videoId:'',
    videoUpdateTime: [],
    isTriggered: false //标识下拉刷新是否被触发
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getVideoGroupListData()
  },

  //获取视频标签列表
  async getVideoGroupListData () {
    let videoGroupListData = await requset('/video/group/list')
    // console.log(videoGroupListData)
    this.setData({
      videoGroupList:videoGroupListData.data.slice(0,10),
      navId: videoGroupListData.data[0].id
    })
    wx.showLoading({
      title: '加载中'
    })
    this.getVideoList(this.data.navId)
  },

  //先获取视频标签分类下的视频vid，然后通过vid获取视频的url
  async getVideoList (navId) {
    let videoListData = await requset('/video/group',{id:navId})
    // console.log(videoListData)
    let videoList = videoListData.datas
    // console.log(videoList)
    for (let i = 0;i < videoList.length;i++) {
      let videoUrl = await requset('/video/url',{id:videoList[i].data.vid})
      videoList[i].data.url = videoUrl.urls[0].url
    }
    wx.hideLoading()
    // console.log(videoList)
    this.setData({
      videoList,
      isTriggered:false //关闭下拉刷新
    })
  },

  //控制多个视频只能同时播放一个的方法
  videoPlay(e) {
    let curIdx = e.currentTarget.id;
    // 没有播放时播放视频
    // console.log(curIdx)
    if (!this.data.indexCurrent) {
      this.setData({
        indexCurrent: curIdx
      })
      let videoContext = wx.createVideoContext(curIdx, this) //这里对应的视频id
      videoContext.play()
    } else { // 有播放时先将prev暂停，再播放当前点击的current
      /*this是在自定义组件下，当前组件实例的this，以操作组件内 video 组件（在自定义组件中药加上this，如果是普通页面即不需要加）*/
      let videoContextPrev = wx.createVideoContext(this.data.indexCurrent, this)
      if (this.data.indexCurrent != curIdx) {
        videoContextPrev.pause()
        this.setData({
          indexCurrent: curIdx
        })
        let videoContextCurrent = wx.createVideoContext(curIdx, this)
        videoContextCurrent.play()
      }
    }
  },

  //点击播放/继续播放的回调
  handlePlay (event) {
    let vid = event.currentTarget.id
    //关闭上一个播放的视频
    this.vid !== vid && this.videoContext && this.videoContext.stop()

    //创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid)
    //判断视频video是否相同。如果不相同再判断flag，flag为true说明没有视频正在播放
    if (this.vid !== vid && !flag) {
      this.videoContext.play()
    }else {
      // this.videoContext.pause()
      if (flag) {
        this.videoContext.play()
        flag = false
      }else {
        this.videoContext.pause()
        flag = true
      }
    }
    this.vid = vid
  },

  //点击图片播放视频的回调
  handlePlayImage (event) {
    let vid = event.currentTarget.id
    //关闭上一个播放的视频
    // this.videoId !== videoId && this.videoContext && this.videoContext.stop()
    // console.log(videoId)
    this.setData({
      videoId:vid
    })
    //创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid)
    const {videoUpdateTime} = this.data
    //查找当前播放的视频之前是否播放到某位置
    const videoItem = videoUpdateTime.find(item => item.vid === vid)
    if (videoItem) {
      this.videoContext.seek(videoItem.currentTime)
    }
    this.videoContext && this.videoContext.play()
    // this.videoContext.play()
    // this.videoId = videoId
  },

  //监测视频播放进度飞回调
  handleTimeUpdate (event) {
    let vid = event.currentTarget.id
    let currentTime = event.detail.currentTime
    let videoTimeObj = {vid,currentTime}
    const {videoUpdateTime} = this.data
    //查找当前视频之前是否已经存了vid和currentTime
    let videoItem = videoUpdateTime.find(item => item.vid === vid)
    if (videoItem) { //之前有
      videoItem.currentTime = currentTime
    }else { //之前没有
      videoUpdateTime.push(videoTimeObj)
    }
    this.setData({
      videoUpdateTime
    })
  },

  //视频播放结束回调
  handleEnd (event) {
    let vid = event.currentTarget.id
    const {videoUpdateTime} = this.data
    //播放结束根据vid查找删除指定下标的元素
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.vid === vid),1)
    this.setData({
      videoUpdateTime
    })
  },

  //自定义下拉刷新 scroll-view
  handleRefresher () {
    // console.log('handleRefresher()')
    this.getVideoList(this.data.navId)
  },

  //自定义上拉触发
  handleToLower (event) {
    // console.log('handleToLower()')
    let newVideoList = this.data.videoList[0]
    let videoList = this.data.videoList
    videoList.push(newVideoList)
    this.setData({
      videoList
    })
  },

  //点击切换导航的回调
  changeNav (event) {
    // let navId = event.currentTarget.id
    let navId = event.currentTarget.dataset.id
    this.setData({
      navId: navId*1,
      videoList: []
    })
    wx.showLoading({
      title: '正在加载'
    })
    this.getVideoList(this.data.navId)
  },

  // 跳转到搜索页面
  toSearch () {
    wx.navigateTo({
      url:'/pages/search/search'
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
    // console.log('页面下拉刷新')
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // console.log('页面上拉触底')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function ({from}) {
    console.log(from)
    if (from === 'button') {
      return {
        title: '来自button的转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvsheng.jpg'
      }
    }else {
      return {
        title: '来自menu的转发',
        page: '/pages/video/video',
        imageUrl: '/static/images/nvsheng.jpg'
      }
    }

  }
})
