/**
 * 字体图标, 统一使用SVG Sprite矢量图标(http://www.iconfont.cn/）
 */
import Vue from 'vue'
import IconSvg from '@/components/icon-svg'

Vue.component('IconSvg', IconSvg)

const svgFiles = require.context('./svg', true, /\.svg$/)
const iconList = svgFiles.keys().map(item => svgFiles(item))

export default {
  // 获取图标icon-(*).svg名称列表
  getNameList () {
    return iconList.map(item => item.default.id.split('-')[1])
  }
}
