import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'

import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import { connect } from '@tarojs/redux'
import { proxyApi } from '../../constants/api'
import { add, minus, asyncAdd } from '../../actions/counter'
import { AtActionSheet, AtActionSheetItem, AtButton, AtNavBar } from 'taro-ui'
import VideoInfo from '../../components/video_item/video_item'

import './detail.less'
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
    navigationBarTitleText: '详情'
  }

  state = {
    info: null,
    sourceIndex: 0,
    dsseriesIndex: 0,
    isOpenSource: false,
    isOpenDsseries: false,
    playIndex: -1
  }

  constructor(props) {
    super(props)
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps)
  }

  componentWillMount() {
    this.setState({
      // isOpenSource: false,
      // isOpenDsseries: false
    })
    this.getPageData()
  }

  componentWillUnmount() {

  }

  async getPageData() {
    let detail = decodeURIComponent(this.$router.params.url)
    Taro.showLoading({
      'title': '加载中'
    })
    let res = await Taro.request({
      'url': proxyApi + detail
    })
    Taro.hideLoading()
    let htmlObj = $.parseHTML(res.data)
    let cover = $(htmlObj).find('.cp-info .img img').attr('src').replace(/\s+/g, '')
    let namei = $(htmlObj).find('.cp-info-main h3 i').text()
    let name = $(htmlObj).find('.cp-info-main h3').text().replace(namei, '').replace(/\s+/g, '')
    let isComplete = $(htmlObj).find('.cp-info-main .js-info-upinfo .e').text().replace(/\s+/g, '') || ''
    let count = $(htmlObj).find('.cp-info-main .js-info-upinfo .js-info-up').text().replace(/\s+/g, '')
    let label = $(htmlObj).find('.cp-info-main p').eq(0).text().replace(/\s+/g, '')
    let year = $(htmlObj).find('.cp-info-main p').eq(1).text().replace(/\s+/g, '')
    let director = $(htmlObj).find('.cp-info-main p').eq(2).text().replace(/\s+/g, '')
    let actor_label = $(htmlObj).find('.cp-info-main p').eq(3).find('label').text().replace(/\s+/g, '')
    let actor_value = actor_label + $(htmlObj).find('.cp-info-main p').eq(3).text().replace(actor_label, '').replace(/(^\s*)|(\s*$)/g, '')
    // let category = $(htmlObj).find('.cp-info-main p').eq(4).text()
    let sourceList: any = []
    let serStr = !!$(htmlObj).find('.cp-dsseries').length ? 'cp-dsseries' : 'cp-zyseries'
    for (let i = 0; i < $(htmlObj).find('.cp-sitebar-main select option').length; i++) {
      let item = $(htmlObj).find('.cp-sitebar-main select option')[i]
      sourceList.push({
        'site': $(item).attr('data-site').replace(/\s+/g, ''),
        'name': $(item).text().replace(/\s+/g, '')
      })
    }
    let dsseries : any = []
    for (let i = 0; i < $(htmlObj).find(`.${serStr} .sel select option`).length; i++) {
      let item = $(htmlObj).find(`.${serStr} .sel select option`)[i]
      dsseries.push($(item).text().replace(/\s+/g, ''))
    }
    let playList: any = []
    if (!!$(htmlObj).find(`.${serStr} .items .item`).length) {
      for (let i = 0; i < $(htmlObj).find(`.${serStr} .items .item`).length; i++) {
        let item = $(htmlObj).find(`.${serStr} .items .item`)[i]
        let list: any = []
        for (let j = 0; j < $(item).find('ul li').length; j++) {
          let obj = $(item).find('ul li')[j]
          list.push({
            'name': $(obj).find('a').text().replace(/\s+/g, ''),
            'url': $(obj).find('a').attr('href')
          })
        }
        playList.push(list)
      }
    } else if (!!$(htmlObj).find('.p-dianying-wrap a').length) {
      let list: any = []
      for (let i = 0; i < $(htmlObj).find('.p-dianying-wrap a').length; i++) {
        let item = $(htmlObj).find('.p-dianying-wrap a')[i]
        list.push({
          'name': $(item).text(),
          'url': $(item).attr('href')
        })        
      }
      playList.push(list)
    } if (!!$(htmlObj).find(`.${serStr} .sel .hide`).length) {
      for (let i = 0; i < $(htmlObj).find(`.${serStr} .sel .hide`).length; i++) {
        let item = $(htmlObj).find(`.${serStr} .sel .hide`)[i]
        let list: any = []
        for (let j = 0; j < $(item).find('a').length; j++) {
          let obj = $(item).find('a')[j]
          list.push({
            'name': $(obj).text().replace(/\s+/g, ''),
            'url': $(obj).attr('href')
          })
        }
        playList.push(list)
      }
    }
    let intro = $(htmlObj).find('.cp-describe p').text().replace(/\s+/g, '')
    let info = {
      cover,
      name,
      isComplete,
      count,
      label,
      year,
      director,
      actor: actor_value,
      sourceList,
      dsseries,
      playList,
      intro
    }
    this.setState({
      info
    }, () => {
      // console.log(this.state)
    })
  }

  componentDidShow() { }

  componentDidHide() { }

  showSourceAction = () => {
    if (!this.state.info.sourceList.length) return
    this.setState({
      'isOpenSource': true
    })
  }

  showDsseriesAction = () => {
    this.setState({
      'isOpenDsseries': true
    })
  }

  switchSource = (index, event) => {
    this.setState({
      'sourceIndex': index,
      'dsseriesIndex': 0,
      'playIndex': -1
    })
    this.hideSourceAction(null)
    event.stopPropagation()
  }

  switchDsseries = (index, event) => {
    this.setState({
      'dsseriesIndex': index,
      playIndex: -1
    })
    this.hideDsseriesAction(null)
    event && event.stopPropagation()
  }

  hideSourceAction = event => {
    this.setState({
      'isOpenSource': false
    })
    event && event.stopPropagation()
  }

  hideDsseriesAction = event => {
    this.setState({
      'isOpenDsseries': false
    })
    // console.log(event)
    event && event.stopPropagation()
  }

  toPlay = index => {
    this.setState({
      'playIndex': index
    })
    window.location.href = 'https://api.azzc.cn/?url=' + this.state.info.playList[this.state.dsseriesIndex][index].url
  }

  back() {
    let app = Taro.getApp()
    console.log(app)
    app.globalData.back()
  }

  render() {
    let { info, sourceIndex, isOpenSource, dsseriesIndex, isOpenDsseries, playIndex } = this.state
    return (
      <View className='index container'>
        <AtNavBar
          onClickLeftIcon={this.back.bind(this)}
          title='详情'
          leftText='返回'
          leftIconType="chevron-left"
        />
        {
          info !== null && <View>
            <VideoInfo info={info} />
            <View className="source-list">
              <Text>剧集</Text>
              <View className="switch" onClick={this.showSourceAction.bind(this)}>
                <Text>{!!info.sourceList[sourceIndex] && info.sourceList[sourceIndex].name }</Text> 
                {
                  !!info.sourceList.length && <View className='at-icon at-icon-chevron-down'></View>
                }
              </View>
            </View>
            <View className="white-bg">
              {!!info.dsseries.length && <AtButton type='secondary' onClick={this.showDsseriesAction.bind(this)} className="dsseries-btn">{info.dsseries[dsseriesIndex]}</AtButton>}
            </View>
            <View className="play-list">
              {
                !!info.playList[dsseriesIndex] && info.playList[dsseriesIndex].map((item, index) => {
                  return <View className='item' onClick={this.toPlay.bind(this, index)}><AtButton key={index} type={index === playIndex ? 'primary' : 'secondary'} size='normal'>{item.name}</AtButton></View>
                })
              }
            </View>

            <View className="intro">
              <View className="title">简介</View>
              <Text className="intro-val">{info.intro}</Text>
            </View>
            {/* {
              <AtActionSheet className={['action-list']} isOpened={isOpenSource} cancelText='取消' title='切换视频源' onClose={this.hideSourceAction.bind(this)} onCancel={this.hideSourceAction.bind(this)}>
                <View className="action-sheet-cont">
                  {
                    info.sourceList.map((item, index) => {
                      return <AtActionSheetItem key={index} className={[index === sourceIndex && 'active']} onClick={this.switchSource.bind(this, index)}>
                        {item.name}
                      </AtActionSheetItem>
                    })
                  }
                </View>
              </AtActionSheet>
            } */}
            {
              isOpenSource && <View className="k-action-list" onClick={this.hideSourceAction}>
                <View className="list">
                  {
                    info.sourceList.map((item, index) => {
                      return <View className={[index === sourceIndex && 'active', 'item']} onClick={this.switchSource.bind(this, index)}>
                        {item.name}
                      </View>
                    })
                  }
                </View>
              </View>
            }
            {/* {
              <AtActionSheet className={['action-list']} isOpened={isOpenDsseries} cancelText='取消' title='切换剧集' onClose={this.hideDsseriesAction.bind(this)} onCancel={this.hideDsseriesAction.bind(this)}>
                <View className="action-sheet-cont">
                  {
                    info.dsseries.map((item, index) => {
                      return <AtActionSheetItem key={index} className={[index === dsseriesIndex && 'active']} onClick={this.switchDsseries.bind(this, index)}>
                        {item}
                      </AtActionSheetItem>
                    })
                  }
                </View>
              </AtActionSheet>
            } */}
            { 
              isOpenDsseries && <View className="k-action-list" onClick={this.hideDsseriesAction}>
                <View className="list">
                  {
                    info.dsseries.map((item, index) => {
                      return <View className={[index === sourceIndex && 'active', 'item']} onClick={this.switchDsseries.bind(this, index)}>
                        {item}
                      </View>
                    })
                  }
                </View>
              </View>
            }
          </View>
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
