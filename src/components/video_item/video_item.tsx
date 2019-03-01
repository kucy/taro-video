import { ComponentClass } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtButton } from 'taro-ui'

import './video_item.less'
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

class Index extends Component {

  /**
 * 指定config的类型声明为: Taro.Config
 *
 * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
 * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
 * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
 */

  constructor(props) {
    super(props)
  }

  static defaultProps = {
    onItemClick: () => {},
    showPlay: false
  }

  componentWillReceiveProps(nextProps) {
    // console.log(this.props, nextProps)
  }

  componentWillMount() {
    
  }

  componentWillUnmount() {

  }

  componentDidShow() { }

  componentDidHide() { }

  onClick = url => {
    this.props.onItemClick(url)
  }

  render() {
    let { info, showPlay } = this.props
    return (
      <View className='index container'>
        {
          info !== null && <View onClick={this.onClick.bind(this, info.url)}>
            <View className="base">
              <Image className="cover" src={info.cover} />
              <View className="info">
                <View className="item nowrap name">{info.name}</View>
                {
                  (info.isComplete || info.count) && <View className="item nowrap">
                    <Text className="progress">{info.isComplete}</Text>
                    <Text>{info.count}</Text>
                  </View>
                }
                {
                  info.label && <View className="item nowrap">{info.label}</View>
                }
                {
                  info.year && <View className="item nowrap">{info.year}</View>
                }
                {/* {
                  info.director && <View className="item nowrap">{info.director}</View>
                } */}
                {
                  info.actor && <View className="item nowrap">{info.actor}</View>
                }
                {/* {
                  info.category && <View className="item nowrap">{info.category}</View>
                } */}
                {
                  showPlay && <AtButton type='primary' size='small'>播放</AtButton>
                }
              </View>
            </View>
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
