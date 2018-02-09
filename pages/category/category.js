let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //分类
    computedCategories: [],
    // 激活的大分类, 保存的是分类的下标
    activeCategory: 0,
    // 激活的子分类, 保存的是子分类的名称
    activeCid: '全部分类',
    // 激活的子分类的下标,默认为all为全部分类
    activeCidIndex: 'all',
    // 控制全部分类列表显示隐藏的
    allCategories: false, 
    // 综合排序的方式
    rankingList: ['综合排序', '价格最低', '价格最高'],
    // 激活的排序方式
    activeRanking: '综合排序',
    // 控制排序方式列表的显示隐藏
    ranking: false,
    // 激活的分类数据
    activeCategoryProducts: []
  },
  //监听页面加载
  onLoad:function(options){
    this.getComputedCategories()
  },
  //监听页面显示
  onShow(){
    this.getComputedCategories()
  },
  //获取商品列表
  getComputedCategories() {
    // 获取全局的商品数据
    let computedCategories = app.globalData.computedCategories
    if (computedCategories.length > 0) {
      this.setData({
        computedCategories: computedCategories
      })
      this.changeActiveCategoryProducts()
    } else {
      app.getComputedCategories(computedCategories => {
        this.setData({
          computedCategories: computedCategories
        })
        this.changeActiveCategoryProducts()
      })
    }
  },
  // 更改激活的分类//切换分类的下标
  changeCategories(event) {
    let index = event.currentTarget.dataset.index
    console.log(event)
    this.setData({
      activeCategory:index,
      activeCid:'全部分类',
      activeRanking:'综合排序',
      ranking:false,
      allCategories:false
    })
    this.changeActiveCategoryProducts()
  },
  // 切换全部分类列表的显示隐藏
  changeAllCategories() {
    let allCategories = this.data.allCategories
    //切换全部分类的显示隐藏,同时将综合排序隐藏
    this.setData({
      allCategories: !this.allCategories,
      ranking : false
    })
  },
  // 切换激活的子分类
  changeCid(event) {
    let cidname = event.currentTarget.dataset.cidname
    let index = event.currentTarget.dataset.index
    this.setData({
      activeCid : cidname,
      activeCidIndex : index
    })
    this.changeActiveCategoryProducts()
  },
  // 切换激活的排序方式
  changeActiveRanking(event) {
    let item =event.currentTarget.dataset.item
    this.setData({
      activeRanking : item
    })
    this.changeActiveCategoryProducts()
  },
  // 切换排序的显示隐藏
  changeRanking() {
    let ranking = this.data.ranking
    this.setData({
      ranking:!ranking,
      allCategories:false
    })
  },
  // 让灰色蒙版隐藏
  hideProductList() {
    this.setData({
      ranking:false,
      allCategories:false
    })
  },
  //更改激活分类数据
  changeActiveCategoryProducts(){
    //激活的分类下表
    let activeCategory = this.data.activeCategory
    //所以商品数据
    let computedCategories = this.data.computedCategories
    //激活分类下标对应商品数据
    let activeCategoryProducts = computedCategories[activeCategory].products
    //激活子分类下标
    let activeCidIndex = this.data.activeCidIndex
    if(activeCidIndex !== 'all'){
      activeCategoryProducts = activeCategoryProducts.filter(item=>item.cidsIndex===Number(activeCidIndex))
    }
    //激活排序方式
    let activeRanking = this.data.activeRanking
      // 克隆对象,防止对原数组对象造成影响
    let cloneActiveCategoryProducts = activeCategoryProducts.slice(0)
    if(activeRanking === '价格最低'){
      activeCategoryProducts = cloneActiveCategoryProducts.sort((a,b)=>a.price-b.price)
    } else if (activeRanking === '价格最高') {
      activeCategoryProducts = cloneActiveCategoryProducts.sort((a, b) => b.price - a.price)
    }
    this.setData({
      activeCategoryProducts : activeCategoryProducts
    })
  },
  // 添加商品到购物车
  addCart(event){
    let product = event.currentTarget.dataset.product
    //追加商品id
    product.product_id = product.id
    app.addCart(product)
    .then(computedCategories=>{
      //添加到购物车后更新本地购物车及商品的num属性
      this.setData({
        computedCategories:computedCategories
      })
      this.changeActiveCategoryProducts()
    })
  },
  //减少商品数量
  subCart(event){
    let product = event.currentTarget.dataset.product
    if (product.num > 0) {
      product.product_id = product.id
      app.subCart(product)
      .then(res=>{
        let computedCategories = app.globalData.computedCategories
        this.setData({
          computedCategories:computedCategories
        })
        this.changeActiveCategoryProducts()
      })
    }
  }
})
