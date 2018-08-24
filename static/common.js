import Vue from 'vue'
Vue.prototype.dealDate = function (date) {
  var d = new Date(date)
  var m = ''
  var day = ''
  d.getMonth() + 1 < 10 ? m = '0' + (d.getMonth() + 1) : m = d.getMonth() + 1
  d.getDate() < 10 ? day = '0' + d.getDate() : day = d.getDate()
  var datetime = d.getFullYear() + '-' + m + '-' + day
  return datetime
}
