import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { proxyApi } from '../../constants/api'
import { add, minus, asyncAdd } from '../../actions/counter'
import Item from '../../components/video_item/video_item'
import { getScrollHeight, getWindowHeight, getDocumentTop } from '../../tools/scroll.js'
import { AtNavBar } from 'taro-ui'
import './rank.less'
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
    navigationBarTitleText: '分类'
  }

  state = {
    page: 1,
    list: [],
    isPageShow: true
  }

  constructor(props) {
    super(props)
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps)
  }

  componentWillMount() {
    window.addEventListener('scroll', () => {
      if (!this.state.isPageShow) return
      if (getScrollHeight() === getWindowHeight() + getDocumentTop()) {
        this.getPageData()
      }
    })
    this.getPageData()
  }

  async getPageData() {
    Taro.showLoading({
      'title': '加载中'
    })
    let res = await Taro.request({
      'url': proxyApi + decodeURIComponent(this.$router.params.url) +'Data?pageno=' + this.state.page
    })
    Taro.hideLoading()
    if (res.data.data.have_more * 1 !== 1) return
    let htmlObj = $.parseHTML(res.data.data.list)
    // console.log(htmlObj)
    let list: any = this.state.page === 1 ? [] : JSON.parse(JSON.stringify(this.state.list))
    for (let i = 0; i < $(htmlObj).length; i+=2) {
      let item = $(htmlObj)[i]
      let actor_label = $(item).find('.info p').eq(1).find('label').text().replace(/\s+/g, '')
      let actor = actor_label + $(item).find('.info p').eq(1).text().replace(actor_label, '')
      list.push({
        'cover': $(item).find('.img img').attr('src'),
        'url': $(item).find('a').eq(0).attr('href'),
        'name': $(item).find('.info h3').text().replace(/\s+/g, ''),
        'label': $(item).find('.info p').eq(0).text().replace(/\s+/g, ''),
        actor,
        'director': $(item).find('.info p').eq(2).text().replace(/\s+/g, ''),
      })
    }
    this.setState({
      list,
      page: list.length > 0 ? this.state.page + 1 : this.state.page
    })
  }

  componentWillUnmount() {
  }

  componentDidShow() { 
    this.setState({
      isPageShow: true
    })
  }

  componentDidHide() {
    this.setState({
      isPageShow: false
    })
  }

  toDetail(url) {
    Taro.navigateTo({
      'url': `/pages/detail/detail?url=${encodeURIComponent('http://m.360kan.com' + url)}`
    })
  }

  back () {
    let app = Taro.getApp()
    console.log(app)
    app.globalData.back()
  }

  render() {
    let { list } = this.state
    return (
      <View className='index container'>
        <AtNavBar
          onClickLeftIcon={this.back.bind(this)}
          title='分类'
          leftText='返回'
          leftIconType="chevron-left"
        />
        {
          list.map((item, index) => {
            return <Item info={item} showPlay={true} onItemClick={this.toDetail} key={index} />
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
