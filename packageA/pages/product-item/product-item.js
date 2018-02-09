// packageA/pages/product-item/product-item.js
let app = getApp()
let api = require('../../../utils/api.js')
let id = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productInfo:{}
  },
  onLoad:function(options){
    id = options.id
  },
  onShow(){
    this.getComputedCategories()
  },
  getComputedCategories(){
    let computedCategories = app.globalData.computedCategories
    if(computedCategories.length>0){
      //已获取商品数据
      label:
      for(let i = 0;i < computedCategories.length;i++){
        let products = computedCategories[i].products
        for(let j = 0;j < products.length;j++){
          if(products[j].id === Number(id)){
            this.setData({
              productInfo:products[j]
            })
            break label
          }
        }
      }
    }else{
      //未获取商品数据
        app.fetch(api.host+'/products/'+id)
        .then(res=>{
          productInfo:res
        })
    }
  },
  addCart(event) {
    let product = this.data.productInfo
    // 追加product_id(商品id)属性
    product.product_id = product.id
    app.addCart(product)
      .then(res => {
        this.getComputedCategories()
      })
  },
  //减少商品数量
  subCart(event) {
    let product = this.data.productInfo
    // 追加product_id(商品id)属性
    product.product_id = product.id
    app.subCart(product)
      .then(res => {
        this.getComputedCategories()
      })
  },
})