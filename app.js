let api = require('./utils/api.js')
App({

  /**
   * 当小程序初始化完成时，会触发 onLaunch（全局只触发一次）
   */
  onLaunch: function () {
    //读取保存在本地的用户信息
    let userinfo = wx.getStorageSync('userinfo')
    if (userinfo) {
      // 如果userinfo不等于空,那么就提取里面的值
      userinfo = JSON.parse(userinfo)
      // 获取改用户的购物车数据
      this.getCart(userinfo.id)
        .then(res => {
          this.globalData.carts = res
        })
      //添加用户信息到全局数据中
      this.globalData.userinfo = userinfo
      //直接跳转到选择地址页
      wx.redirectTo({
        //url: 'packageA/pages/select-site/select-site',
        url:'pages/index/index'
      })
    }else{
      wx.redirectTo({
       // url: 'packageA/pages/select-site/select-site',
        url: 'pages/index/index'
      })
    }
  },
  //获取用户对应的购物车数据
  getCart(id) {
    return new Promise((resolve,reject)=>{
      this.fetch(api.host+'/carts?userId='+id)
      .then(res=>{
        //将购物车数据添加到全局
        this.globalData.carts = res
        resolve(res)
      })
    })
  },
  //获取分类和商品数据
  getComputedCategories(cb){
    wx.showLoading({
      title: '加载商品数据中...',
      mask:true
    })
    let categories = []
    let products = []
    this.fetch(api.host+'/categories')
      .then(res=>{
        categories = res
        return this.fetch(api.host+'/products')
      })
        .then(res=>{
          products = res
          for(let i = 0;i < products.length;i++){
            for(let j = 0; j < categories.length;j++){
              //分类商品中商品相对应的分类
              if(categories[j].id === products[i].categoryId){
                categories[j].products.push(products[i])
              }
            }
          }
          this.globalData.computedCategories = categories
          wx.hideLoading()
          //获取购物车数据并同步
          return this.getCart(this.globalData.userinfo.id)
        })
        .then(data=>{
          let computedCategories = this.globalData.computedCategories
          for(let i = 0;i < computedCategories.length;i++){
            let products = computedCategories[i].products
            for(let j = 0; j < products.length;j++){
              for(let z = 0; z < data.length;z++){
                if(products[j].id === data[z].product_id){
                  products[j].num = data[z].num
                  break
                }
              }
            }
          }
          cb(computedCategories)
        })
  },
    //添加商品到购物车
    addCart(product){
      return new Promise((resolve,reject)=>{
        //首先验证商品在购物车是否存在
        let localCarts = this.globalData.carts
        let userinfo = this.globalData.userinfo
        //假设不存在,添加商品
        let addBol = true
        for(let i = 0; i < localCarts.length;i++){
          if(localCarts[i].product_id===product.product_id){
            addBol = false
            //更新数量
            localCarts[i].num++
            this.fetch(api.host+'/carts/'+localCarts[i].id,'PATCH',{
              num:localCarts[i].num
            })
            .then(res=>{
              if(res.id > 0){
                // wx.showToast({
                //   title: '更新成功',
                // })
                this.resetProductNum(res)
                .then(computedCategories=>{
                  resolve(computedCategories)
                })
              }
            })
            break
          }
        }
        if(addBol){
          let productToCartObj = {
            product_id:product.product_id,
            userId:userinfo.id,
            product_img:product.img,
            product_name:product.name,
            product_price:product.price,
            checked:true,
            num:1
          }
          this.fetch(api.host+'/carts','POST',productToCartObj)
            .then(res=>{
              if(res.id>0){
                localCarts.push(res)
                  .then(computedCategories=>{
                    resolve(computedCategories)
                  })
              }
            })
        }
      })
    },
    //减少商品数据
    subCart(product){
      return new Promise((resolve,reject)=>{
        let carts = this.globalData.carts
        //获取需要更改数量的购物对象
        let cartObj = {}
        //购物车对象的下标
        let index = 0
        for(let i = 0;i < carts.length;i++){
          if(product.product_id === carts[i].product_id){
            cartObj = carts[i]
            index = i 
          }
        }
        if(cartObj.num>0){
          cartObj.num--
          this.fetch(api.host+'/carts/'+cartObj.id,'PATCH',{
            num:cartObj.num
          })
          .then(res=>{
            if(res.id>0){
              // wx.showToast({
              //   title: '更新成功',
              // })
              this.globalData.carts = carts
              return this.resetProductNum(cartObj)
            }
          })
          .then(res=>{
            resolve()
          })
        }else{
          this.fetch(api.host+'/carts/'+cartObj.id,'DELETE')
            .then(res=>{
              wx.showToast({
                title: '删除成功',
              })
              cartObj.num--
              return this.resetProductNum(cartObj)
            })
            .then(res=>{
              carts.splice(index,1)
              resolve()
            })
        }
      }) 
    },
    //重置本地商品数量
    resetProductNum(product) {
      let computedCategories = this.globalData.computedCategories
      return new Promise((resolve, reject) => {
        label:
        for (let i = 0; i < computedCategories.length; i++) {
          let products = computedCategories[i].products
          for (let j = 0; j < products.length; j++) {
            if (products[j].id === product.product_id) {
              products[j].num = product.num
              break label
            }
          }
        }
        this.globalData.computedCategories = computedCategories
        resolve(computedCategories)
      })
    },
  //全局数据
  globalData:{
    //保存的是合并后的商品数据
    computedCategories:[],
    //购物车数据
    carts:[],
    //用户信息
    userinfo:{},
    //所选城市
    selectedCity:'深圳市',
    //所选的地址
    selectedSite:''
  },
  //封装请求方法
  fetch(url,method="GET",data={}){
    return new Promise((resolve,reject)=>{
      console.log(url)
      wx.request({
        url: url,
        data:data,
        method:method,
        success:res=>{
          resolve(res.data)
        },
        fail:res=>{
          reject('请求失败')
        }
      })
    })
  }
})
