import Vue from 'vue'
import Router from 'vue-router'
import Feedback from '@/components/information/yuqing/feedback' // 舆情违规案例

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/yuqing/feedback',
      name: ' Feedback',
      component: Feedback
    }
  ]
})
