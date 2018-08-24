import Vue from 'vue'
import Router from 'vue-router'
import LawList from '@/components/law/LawList'
import LawListForWpf from '@/components/law/LawListForWpf'
import SupervisionType from '@/components/information/yuqing/SupervisionType' // 舆情监管动态
import IrregularitiesType from '@/components/information/yuqing/IrregularitiesType' // 舆情违规案例
import Feedback from '@/components/information/yuqing/Feedback' // 舆情监管函件

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/Law/LawList',
      name: 'LawList',
      component: LawList
    }, {
      path: '/Law/LawListForWpf',
      name: 'LawListForWpf',
      component: LawListForWpf
    },
    {
      path: '/yuqing/supervisionType',
      name: ' SupervisionType',
      component: SupervisionType
    }, {
      path: '/yuqing/IrregularitiesType',
      name: ' IrregularitiesType',
      component: IrregularitiesType
    },
    {
      path: '/yuqing/feedback',
      name: ' Feedback',
      component: Feedback
    }
  ]
})
