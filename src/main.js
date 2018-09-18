// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import router from './router'
import axios from 'axios'
import '../static/common.js'
import $ from 'jquery'
Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.prototype.apiPath = 'http://api.niuniu.com/api/v1/'
// Vue.prototype.apiPath = 'http://192.168.0.120:3016/api/v1/'
Vue.prototype.$ajax = axios
Vue.prototype.$ = $
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
