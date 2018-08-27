import Vue from 'vue'
import Router from 'vue-router'
import SupervisionType from '@/components/info/yq/SupervisionType' // 舆情监管动态
import IrregularitiesType from '@/components/info/yq/IrregularitiesType' // 舆情违规案例
import Feedback from '@/components/info/yq/Feedback' // 舆情监管函件

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/yq/SupervisionType',
      name: ' SupervisionType',
      component: SupervisionType
    }, {
      path: '/yq/IrregularitiesType',
      name: ' IrregularitiesType',
      component: IrregularitiesType
    }, {
      path: '/yq/Feedback',
      name: ' Feedback',
      component: Feedback
    }
  ]
})
