import Vue from 'vue'
import Router from 'vue-router'
import IrregularitiesType from '@/components/information/yuqing/IrregularitiesType' // 舆情违规案例

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/yuqing/IrregularitiesType',
      name: 'IrregularitiesType',
      component: IrregularitiesType
    }
  ]
})
