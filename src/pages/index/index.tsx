import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { proxyApi } from '../../constants/api'
import { add, minus, asyncAdd } from '../../actions/counter'
import { AtSearchBar } from 'taro-ui'

import './index.less'
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
  add () {
    dispatch(add())
  },
  dec () {
    dispatch(minus())
  },
  asyncAdd () {
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
    navigationBarTitleText: '首页'
  }

  state = {
    inputValue: '',
    swipers: [],
    hotList: {
      'title': '',
      'list': []
    },
    categoryList: []
  }

  constructor(props) {
    super(props)
  }

  componentWillReceiveProps (nextProps) {
    // console.log(this.props, nextProps)
  }

  componentWillMount () {
    this.getPageData()
  }

  componentWillUnmount () { 
    
  }

  async getPageData () {
    Taro.showLoading({
      'title': '加载中'
    })
    let res = await Taro.request({
      'url': proxyApi + 'http://m.360kan.com/'
    })
    Taro.hideLoading()
    let htmlObj = $.parseHTML(res.data)
    let swipers: any [] = []
    let swiperHTMlList = $(htmlObj).find('#js-swipe .swiper-slide')
    for (let i = 0; i < swiperHTMlList.length; i++) {
      let item = $(swiperHTMlList[i])
      let url = item.attr('href')
      let cover = item.find('img').attr('src')
      let text = item.find('span').text().replace(/\s+/g, '')
      swipers.push({
        url,
        cover,
        text
      })
    }
    let hotList: any = []
    let categoryList: any = []
    let hotcategoryHTMLList = $(htmlObj).find('.modbox')
    let rank_url = ''
    for (let i = 0; i < hotcategoryHTMLList.length; i++) {
      let item = $(hotcategoryHTMLList[i])
      let title = item.find('.mb-title span').text().replace(/\s+/g, '')
      let list: any = []
      rank_url = 'http://m.360kan.com' + item.find('.mb-title a').attr('href')
      for (let j = 0; j < item.find('.mb-list .mb-item').length; j++) {
        let citem = $(item.find('.mb-list .mb-item')[j])
        let cover = citem.find('.mb-img').css("backgroundImage").replace('url(', '').replace(')', '').split('"').join('')
        let title = citem.find('.title').text().replace(/\s+/g, '')
        let desc = citem.find('.desc').text().replace(/\s+/g, '')
        let url = citem.find('a').attr('href').replace(/\s+/g, '')
        let duration = citem.find('.duration').text().replace(/\s+/g, '') || citem.find('.year').text().replace(/\s+/g, '')
        list.push({
          url,
          cover,
          title,
          desc,
          duration
        })
      }
      if (i === 0) {
        hotList = {
          title,
          rank_url,
          list
        }
      } else {
        categoryList.push({
          title,
          rank_url,
          list
        })
      }
    }
    hotList.list = [] // 暂时不考虑
    this.setState({
      swipers,
      categoryList,
      hotList
    }, () => {
      // console.log(this.state.hotList)
      // console.log(this.state.categoryList)
    })
  }

  componentDidShow () { }

  componentDidHide () { }

  onChange = inputValue => {
    this.setState({ inputValue })
  }

  onActionClick = () => {
    console.log(this.state.inputValue)
    Taro.navigateTo({
      'url': '../search/search?kw=' + encodeURIComponent(this.state.inputValue)
    })
  }

  swiperItemClick = item => {
    if (typeof item.url === 'number') return
    Taro.navigateTo({
      'url': `/pages/detail/detail?url=${encodeURIComponent('http://m.360kan.com' + item.url)}`
    })
  }

  toDetail (url) {
    Taro.navigateTo({
      'url': `/pages/detail/detail?url=${encodeURIComponent('http://m.360kan.com' + url)}`
    })
  }

  toRank = rank_url => {
    // console.log('rank_url: ', rank_url)
    Taro.navigateTo({
      url: '../rank/rank?url=' + encodeURIComponent(rank_url)
    })
  }

  render () {
    let { inputValue, swipers, hotList, categoryList } = this.state
    // console.log(categoryList)
    return (
      <View className='index container'>
        <AtSearchBar
          className="at-search-bar"
          value={inputValue}
          onChange={this.onChange.bind(this)}
          onActionClick={this.onActionClick.bind(this)}
        />
        <Swiper
          className='swiper'
          autoplay
          >
          {
            swipers.map((item, index) => {
              return <SwiperItem key={index} className="swiper-item">
                <Image src={item.cover} className="cover" onClick={this.swiperItemClick.bind(this, item)} />
                <Text className="text" onClick={this.swiperItemClick.bind(this, item)}>{(index + 1 ) + '.' + item.text}</Text>
              </SwiperItem>
            })
          }
        </Swiper>
        <View className="hot-info index-list">
          {
            !!hotList.list.length && <View className="title">
              <Text>{hotList.title}</Text>
              {/* <Text className="more">更多></Text> */}
            </View>
          }
          <View className="list">
            {
              !!hotList.list.length && hotList.list.map((item, index) => {
                return <View className={['item', index % 2 === 0 ? 'even' : 'odd']} key={index} onClick={this.toDetail.bind(this, item.url)}>
                  <View className="cover-cont">
                    <Image className="cover" src={item.cover} />
                    <Text className="duration">{item.duration}</Text>
                  </View>
                  <View className="item-title nowrap">{item.title}</View>
                  <View className="item-desc nowrap">{item.desc}</View>
                </View>
              })
            }
          </View>
        </View>
        {
          categoryList.map((citem, cindex) => {
            return <View className="index-list category-item" key={cindex}>
              <View className="title">
                <Text>{citem.title}</Text>
                <Text className="more" onClick={this.toRank.bind(this, citem.rank_url)}>更多></Text>
              </View>
              <View className="list">
                {
                  citem.list.map((item, index) => {
                    return <View className={['item', (index + 1) % 3 === 0 && 'three-n']} key={index} onClick={this.toDetail.bind(this, item.url)}>
                      <View className="cover-cont">
                        <Image className="cover" src={item.cover} />
                        <Text className="duration">{item.duration}</Text>
                      </View>
                      <View className="item-title nowrap">{item.title}</View>
                      <View className="item-desc nowrap">{item.desc}</View>
                    </View>
                  })
                }
              </View>
            </View>
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
