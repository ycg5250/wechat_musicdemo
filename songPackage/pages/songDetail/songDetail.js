import PubSub from 'pubsub-js'
import moment from 'moment'
import requset from "../../../utils/requset";

const appInstance = getApp()
//  创建音乐控制的实例
const BackgroundAudioManager =  wx.getBackgroundAudioManager()
let tokenId;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false,
    song: {},
    musicId: '',  //音乐id
    musicLink: '',
    currentTime: '00:00',
    durationTime: '00:00',
    currentWidth: 0,
    lyric: [],
    lyricTime: 0,//歌词对应的时间
    lyricIndex: 0,  //当前歌词对象索引
    lyricY: 0  //平移高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //  options  用于接收路由跳转的query参数
    //  原生小程序中路由传参，对接收的参数长度有限制，如果参数过长会自动截取掉
    // console.log(options.musicId)

    // 监听背景音乐的播放进度
    BackgroundAudioManager.onTimeUpdate(() => {
      // console.log('总时长',this.BackgroundAudioManager.duration)
      // console.log('当前时长',this.BackgroundAudioManager.currentTime)
      let lyricTime = Math.ceil(BackgroundAudioManager.currentTime);
      let currentTime = moment(BackgroundAudioManager.currentTime * 1000).format('mm:ss')
      // 切换下一首的时候 currentWidth 为 null，所以如果为null就取 currentWidth = 0
      let currentWidth = 450 * BackgroundAudioManager.currentTime / BackgroundAudioManager.duration || 0
      appInstance.globalData.crrentWidth = currentWidth
      // console.log('宽度：',currentWidth)
      this.setData({
        currentTime,
        currentWidth,
        lyricTime
      })
      this.getCurrentLyric()
    })
    //  判断当前音乐界面是否在播放
    if (appInstance.globalData.isPlayMusic && appInstance.globalData.musicId === options.musicId) {
      this.setData({
        isPlay: true,
        currentWidth: appInstance.globalData.currentWidth
      })
    }else {
      // 停掉上一首播放的音乐
      BackgroundAudioManager.stop()
    }

    this.setData({
      musicId: options.musicId,
      isPlay: true
    })
    let {isPlay,musicId,musicLink} = this.data
    // 获取歌曲详情
    this.getSongDetail(musicId)
    // 获取歌曲歌词
    this.getMusicLyric(musicId)
    //歌曲自动播放
    this.musicControl(isPlay,musicId,musicLink)

    //  监听正在播放
    BackgroundAudioManager.onPlay(() => {
      this.changePlayState(true)
      //  修改全局播放音乐状态的id
      appInstance.globalData.musicId = options.musicId
    })
    //  监听暂停播放
    BackgroundAudioManager.onPause(() => {
      this.changePlayState(false)
    })
    //  监听停止播放
    BackgroundAudioManager.onStop(() => {
      this.changePlayState(false)
    })
    //  监听停止播放
    BackgroundAudioManager.onWaiting(() => {
      console.log('歌曲加载数据不足')
    })
    //  监听背景音乐可以播放播放
    BackgroundAudioManager.onCanplay(() => {
      if(tokenId) {
        clearTimeout(tokenId)
      }
    })
    //  监听背景音频自然播放结束事件
    BackgroundAudioManager.onEnded(() => {
      this.publishSubscribe('next')
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    })
  },

  // 获取歌曲歌词
  async getMusicLyric (musicId) {
    let musicLyricData = await requset('/lyric',{id:musicId})
    let lyric = this.formatLyric(musicLyricData.lrc.lyric);
    // console.log(lyric)
  },

  //传入初始歌词文本text
  formatLyric(text) {
    let result = [];
    let arr = text.split("\n"); //原歌词文本已经换好行了方便很多，我们直接通过换行符“\n”进行切割
    let row = arr.length; //获取歌词行数
    for (let i = 0; i < row; i++) {
      let temp_row = arr[i]; //现在每一行格式大概就是这样"[00:04.302][02:10.00]hello world";
      let temp_arr = temp_row.split("]");//我们可以通过“]”对时间和文本进行分离
      let text = temp_arr.pop(); //把歌词文本从数组中剔除出来，获取到歌词文本了！
      //再对剩下的歌词时间进行处理
      temp_arr.forEach((element,index) => {
        let obj = {};
        let time_arr = element.substr(1, element.length - 1).split(":");//先把多余的“[”去掉，再分离出分、秒
        let s = parseInt(time_arr[0]) * 60 + Math.ceil(time_arr[1]); //把时间转换成与currentTime相同的类型，方便待会实现滚动效果
        obj.time = s;
        obj.text = text;
        obj.id = index
        if (obj.text) { //每个时间有歌词才存到lyric里
          result.push(obj); //每一行歌词对象存到组件的lyric歌词属性里
        }
      });
    }

    result.sort(this.sortRule) //由于不同时间的相同歌词我们给排到一起了，所以这里要以时间顺序重新排列一下
    this.setData({
      lyric: result
    })
    // return result
  },

  sortRule(a, b) { //设置一下排序规则
    return a.time - b.time;
  },

  // 控制歌词播放
  getCurrentLyric () {
    let i
    let lyricH = 40
    let {lyric,lyricTime,currentLyric,lyricY} = this.data
    for (i = 0;i < lyric.length;i++) {
      if (lyricTime === lyric[i].time*1) {
        // currentLyric = lyric[i].text
        this.setData({
          // currentLyric
          lyricY: -lyricH*i + lyricH,
          lyricIndex: i
        })
      }
    }
  },

  //修改播放状态的功能函数
  changePlayState (isPlay) {
    this.setData({
      isPlay
    })
    //  修改全局播放音乐状态
    appInstance.globalData.isPlayMusic = isPlay
  },

  //  点击切歌的回调
  handleSwitch (event) {
    let type = event.currentTarget.id
    // console.log(type)
    // 停掉上一首播放的音乐
    BackgroundAudioManager.stop()
    this.publishSubscribe(type)
  },

  //  获取音乐详情
  async getSongDetail (musicId) {
    let songData = await requset('/song/detail',{ids:musicId})
    // console.log(songDetailData)
    let durationTime = moment(songData.songs[0].dt).format("mm:ss")
    this.setData({
      song: songData.songs[0],
      durationTime,
    })
    wx.setNavigationBarTitle({
      title: this.data.song.name
    })
  },

  //点击播放或者暂停的回调
  handleMusicPlay () {
    let isPlay  = !this.data.isPlay
    let {musicId,musicLink} = this.data
    this.musicControl(isPlay,musicId,musicLink)
  },

  //  控制音乐播放的功能函数
  async musicControl (isPlay,musicId,musicLink) {
    // console.log('musicControl：',isPlay,musicId,musicLink)
    appInstance.globalData.isPlayMusic = isPlay
    if (isPlay) { //播放
      if (!musicLink) {
        let musicLinkData = await requset('/song/url',{id:musicId})
        musicLink = musicLinkData.data[0].url
        this.setData({
          musicLink,
          isPlay
        })
      }
      if (musicId !== appInstance.globalData.musicId) {
        // tokenId = setTimeout(() => {
          BackgroundAudioManager.src = musicLink
          BackgroundAudioManager.title = this.data.song.name
        // },100)
      }else {
        BackgroundAudioManager.play()
      }
    }else {  //暂停
      BackgroundAudioManager.pause()
    }
  },

  // 封装PubSub发布订阅,按钮切换下一首和自动切换下一首
  publishSubscribe (type) {
    // 订阅来自recommendSong页面发布的musicId消息
    PubSub.subscribe('musicId',(msg,musicId) => {
      // console.log('handleSwitch：',musicId)
      // 获取音乐详情
      this.getSongDetail(musicId)
      // 获取歌曲歌词
      this.getMusicLyric(musicId)
      // 播放当前音乐
      this.musicControl(true,musicId)
      //取消订阅
      PubSub.unsubscribe('musicId')
    })
    // 发布消息数据给recommendSong页面
    PubSub.publish('switchType',type)
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // let {isPlay,musicId,musicLink} = this.data
    // 歌曲自动播放
    // this.musicControl(isPlay,musicId,musicLink)
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
