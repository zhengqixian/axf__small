// packageA/pages/site/site.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
      sites:[]
  },
  addSite(){
    wx.navigateTo({
      url: '/packageA/pages/add-site/add-site',
    })
  }
})