let app = getApp()
let api = require('../../utils/api.js')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    //控制显示条的显示隐藏
  picHide:false,
  phone:''
  },
  changePhone(event){
    let phone = event.detail.value
    this.setData({
      phone:phone
    })
  },
  //手机号码输入框聚焦时隐藏图片
  picHideFocus(){
    this.setData({
      picHide:true
    })
  },
  //手机号码输入框失焦时显示图片
  picHideBlur(){
    setTimeout(()=>{
      this.setData({
        picHide:false
      })
    },1000)
  },
  //点击确定按钮登录
  loginFn(){
    let phone = this.data.phone
    let reg = /^1[34578]\d{9}$/g
    if(reg.test(phone)){
      //验证通过,发送请求验证在数据库是否存在
      app.fetch(api.host+'/users?phone='+phone)
      .then(res=>{
        //判断这个接口是否返回数据,如果返回就是存在,没返回就没有这个手机号
        if(res.length>0){
          wx.showToast({
            title: '登录成功',
          })
          //因为返回的res是数组
          res=res[0]
          //将用户信息提交到全局数据
          app.globalData.userinfo = res
          //写到缓存中
          wx.setStorage({
            key: 'userinfo',
            data: JSON.stringify(res)
          }) 
          //跳转到首页
            wx.switchTab({
              url: '/pages/index/index'
            })
        }else{
          //数据库没有这个用户,进行注册
          let userObj = {
            phone:phone,
            //初始所选地址
            select_site:{}
          }
          //发送注册请求
          app.fetch(api.host+'/users',"post",userObj)
          .then(res=>{
            //将用户信息提交到全局数据
            app.globalData.userinfo = res
            //注册成功的用户信息存储在本地缓存中
            return new Promise(function(resolve,reject){
                wx.setStorage({
                key: 'userinfo',
                data: JSON.stringify(res),
                success(){
                  return resolve()
                }
              })
            })  
          })
          .then(()=>{
            //显示注册成功并跳转到首页
            wx.showToast({
              title: '注册成功',
              icon:'success',
              duration:2000,
              mask:true,
              success(){
                wx.switchTab({
                  url:'/pages/index/index'
                })
              }
            })
          })
        }
      })
    }
  }
})