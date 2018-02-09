let api = require('../../utils/api.js')
let app = getApp()
let id = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannar:[],
    computedCategories:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let computedCategories = app.globalData.computedCategories
    if(computedCategories.length>0){
      this.setData({
        computedCategories:computedCategories
      })
    }else{
      app.getComputedCategories(computedCategories=>{
        this.setData({
          computedCategories:computedCategories
        })
      })
    }
    app.fetch(api.host+'/bannar')
      .then(res=>{
        this.setData({
          bannar:res
        })
      })
  },
  //添加商品到购物车
  addCart(event){
    let product = event.currentTarget.dataset.product
    product.product_id = product.id
    app.addCart(product)
  }
})