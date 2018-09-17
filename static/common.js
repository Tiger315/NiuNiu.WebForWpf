import Vue from 'vue'
Vue.prototype.dealDate = function (date) { // 处理时间的公共函数
  var d = new Date(date)
  var m = ''
  var day = ''
  d.getMonth() + 1 < 10 ? m = '0' + (d.getMonth() + 1) : m = d.getMonth() + 1
  d.getDate() < 10 ? day = '0' + d.getDate() : day = d.getDate()
  var datetime = d.getFullYear() + '-' + m + '-' + day
  return datetime
}

Vue.prototype.trimStr = function (obj) { // 处理字符串首尾空格的公共函数
  for (var key in obj) {
    if (obj[key] && typeof obj[key] === 'string' && obj[key].length > 0) {
      obj[key] = obj[key].trim()
    }
  }
}
