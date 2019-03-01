import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { proxyApi } from '../../constants/api'
import { add, minus, asyncAdd } from '../../actions/counter'
import Item from '../../components/video_item/video_item'
import { AtNavBar } from 'taro-ui'

import './search.less'
import { any } from '_@types_prop-types@15.5.9@@types/prop-types';

// #region 书写注意
// 
// 目前 typescript 版本还无法在装饰器模式下将 Props 注入到 Taro.Component 中的 props 属性
// 需要显示声明 connect 的参数类型并通过 interface 的方式指定 Taro.Component 子类的 props
// 这样才能完成类型检查和 IDE 的自动提示
// 使用函数模式则无此限制
// ref: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20796
//
// #endregion

type PageStateProps = {
  counter: {
    num: number
  }
}

type PageDispatchProps = {
  add: () => void
  dec: () => void
  asyncAdd: () => any
}

type PageOwnProps = {}

type PageState = {}

type IProps = PageStateProps & PageDispatchProps & PageOwnProps

interface Index {
  props: IProps;
}

@connect(({ counter }) => ({
  counter
}), (dispatch) => ({
  add() {
    dispatch(add())
  },
  dec() {
    dispatch(minus())
  },
  asyncAdd() {
    dispatch(asyncAdd())
  }
}))
class Index extends Component {

  /**
 * 指定config的类型声明为: Taro.Config
 *
 * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
 * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
 * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
 */
  config: Config = {
    navigationBarTitleText: '搜索'
  }

  state = {
    list: []
  }

  constructor(props) {
    super(props)
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps)
  }

  componentWillMount() {
    this.getPageData()
  }

  async getPageData () {
    Taro.showLoading({
      'title': '加载中'
    })
    let res = await Taro.request({
      'url': proxyApi + 'http://m.360kan.com/search/index?kw=' + this.$router.params.kw
    })
    Taro.hideLoading()
    let htmlObj = $.parseHTML(res.data)
    let list: any = []
    for (let i = 0; i < $(htmlObj).find('.search-item').length; i++) {
      let item = $(htmlObj).find('.search-item').eq(i)
      let actor_label = $(item).find('.search-item-info .info-link p').eq(1).find('label').text().replace(/\s+/g, '')
      let actor = actor_label + $(item).find('.search-item-info .info-link p').eq(1).text().replace(actor_label, '').replace(/(^\s*)|(\s*$)/g, '')
      list.push({
        'cover': $(item).find('.img img').attr('src'),
        'url': $(item).find('.img').attr('href'),
        'name': $(item).find('.search-item-info h3 a').text().replace(/\s+/g, ''),
        'label': $(item).find('.search-item-info .info-link p').eq(0).text().replace(/\s+/g, ''),
        actor,
        'director': $(item).find('.search-item-info .info-link p').eq(2).text().replace(/\s+/g, ''),
      })
    }
    if (!list.length) {
      Taro.showToast({
        'icon': 'none',
        'title': '暂无数据~'
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
      return
    }
    this.setState({
      list
    })
  }

  componentWillUnmount() {
  }

  componentDidShow() { }

  componentDidHide() { }

  toDetail(url) {
    Taro.navigateTo({
      'url': `/pages/detail/detail?url=${encodeURIComponent('http://m.360kan.com' + url)}`
    })
  }

  back() {
    let app = Taro.getApp()
    console.log(app)
    app.globalData.back()
  }

  render() {
    let { list } = this.state
    return (
      <View className='search container'>
        <AtNavBar
          onClickLeftIcon={this.back.bind(this)}
          title='搜索'
          leftText='返回'
          leftIconType="chevron-left"
        />
        {
          list.map((item, index) => {
            return <View className='search-item'><Item info={item} showPlay={true} onItemClick={this.toDetail} key={index}/></View>
          })
        }
      </View>
    )
  }
}

// #region 导出注意
//
// 经过上面的声明后需要将导出的 Taro.Component 子类修改为子类本身的 props 属性
// 这样在使用这个子类时 Ts 才不会提示缺少 JSX 类型参数错误
//
// #endregion

export default Index as ComponentClass<PageOwnProps, PageState>
