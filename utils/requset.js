/*
封装发送ajax请求请求函数
 */

import './config'
import config from "./config";

export default (url,data={},method='GET') => {
  return new Promise((resolve,reject) => {
    // Promise的初始状态为pending
    wx.request({
      url: config.host + url,
      data,
      method,
      header: {
        cookie:wx.getStorageSync('cookies')?wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1):''
      },
      success: res => {
        // console.log('请求成功',res)
        if (data.isLogin) {
          wx.setStorage({
            key:'cookies',
            data: res.cookies
          })
        }
        // console.log(res)
        resolve(res.data)
      },
      fail: err => {
        // console.log('请求失败',err)
        reject(err)
      }
    })
  }).catch((err) => {
    console.log(err)
  })
}
