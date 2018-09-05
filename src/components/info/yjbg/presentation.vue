<template>
  <div class="Presentation">
    <!-- 搜索条件开始 -->
    <el-container style="margin-bottom:10px;padding:0 20% 0 0;">
      <el-input placeholder="包含所有关键词(以空格区分)" v-model="searchParam.titleMust" size="small" clearable class="ml20 noMl"></el-input>
      <el-input placeholder="包含任意关键词(以空格区分)" v-model="searchParam.titleCan" size="small" clearable class="ml20"></el-input>
      <el-input placeholder="不包含任意关键词(以空格区分)" v-model="searchParam.titleNot" size="small" clearable class="ml20"></el-input>
    </el-container>
    <el-container style="margin-bottom:10px;padding:0 20% 0 0;">
      <el-select multiple collapse-tags clearable size="small" v-model="searchParam.stock_code" placeholder="公司代码、简称、拼音" filterable class="ml20 noMl">
        <el-option :label="item.Name+'('+item.Code+')'" :key="item.Name+'('+item.Code+')'" v-for='item in topData.companyCode' :value="item.Code"></el-option>
      </el-select>
      <el-select collapse-tags clearable size="small" placeholder="研究机构" v-model="searchParam.yjjg" filterable class="ml20">
        <el-option v-for='item in topData.yjjg' :key="item" :label="item" :value="item"></el-option>
      </el-select>
      <el-input placeholder="研报作者" v-model="searchParam.author" size="small" clearable class="ml20"></el-input>
    </el-container>
    <el-container style="margin-bottom:10px;padding:0 20% 0 0;">
      <el-date-picker v-model="searchParam.processDateStart" type="date" placeholder="开始日期" class="ml20 noMl"></el-date-picker>
            <el-date-picker v-model="searchParam.processDateEnd" type="date" placeholder="结束日期" class="ml20"></el-date-picker>
      <el-select collapse-tags clearable size="small" v-model="searchParam.rate" placeholder="所有评级" filterable class="ml20">
        <el-option v-for='item in topData.rate' :key="item" :label="item" :value="item"></el-option>
      </el-select>
    </el-container>
    <el-container style="margin-bottom:10px;padding:0 20% 0 0;">
      <div class="ml20 noMl">
        <el-button type="primary" icon="el-icon-search" size="small" @click="getList">搜索</el-button>
        <el-button type="warning" size="small" @click="clearParam">清空搜索</el-button>
      </div>
    </el-container>
    <!-- 搜索条件结束 -->

    <!-- 表格数据开始 -->
    <el-table v-loading.loading="loadingData.loading" element-loading-text="拼命加载中" :height="dataHeight" :data="tableData" stripe style="width: 100%;" empty-text=" " row-key="id">
      <el-table-column type="index" fixed="left" label="序号" width="70" :index="typeIndex">序号</el-table-column>
      <el-table-column fixed="left" prop="Title" label="研报标题" min-width="200" fit show-overflow-tooltip>
        <template slot-scope="scope">
          <span style="color: #0d308c; cursor: pointer; font" @click='showPDF(scope.row.FileUrl)'>{{scope.row.StockName ? ("【 "+scope.row.StockName+" 】" + scope.row.Title) : scope.row.Title}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="Rate" label="股票评级" min-width="60" fit>
        <template slot-scope="scope">
          <div>{{scope.row.Rate == "" ? "--" : scope.row.Rate}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="Org" label="研究机构" width="160"></el-table-column>
      <el-table-column prop="Author" label="研报作者" width="150">
        <template slot-scope="scope">
          <div>{{scope.row.Author == "" ? "--" : scope.row.Author}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="ReportTime" label="发布日期" width="150"></el-table-column>
    </el-table>
    <!-- 表格数据结束 -->

    <!-- 分页开始 -->
    <div style="margin-top: 10px;height: 32px; line-height: 32px; text-align: center;">
      <span style="float: left; text-align: right; color: #606266; font-size: 14px; padding-top: 3px;">共 {{ zPager.total }} 条</span>
      <el-pagination layout="prev, pager, next" :page-size="zPager.size" :pager-count="zPager.count" :current-page.sync="zPager.currentPage" :total="zPager.total" @current-change="pagerChange">
      </el-pagination>
    </div>
    <!-- 分页结束 -->

    <!-- dialog开始 -->
    <el-dialog :visible.sync="dialog" fullscreen :before-close="beforeClose">
      <div class="dialog-box" v-loading.loading="loadingData.diaLoading" style="margin:0 auto;">
        <iframe v-if="urlData.showWordUrl" :src="urlData.showWordUrl" width="80%" :height="dataHeight" frameborder="0" style="margin-left:10%;"></iframe>
        <iframe v-if="urlData.pdfUrl" :src="urlData.pdfUrl" frameborder="0" :height="dataHeight" style="width:80%;margin-top:10px;margin-left:10%;"></iframe>
      </div>
    </el-dialog>
    <!-- dialog结束 -->
  </div>
</template>
<script>
export default {
  name: 'Presentation',
  data () {
    return {
      dataHeight: document.documentElement.clientHeight - 177,
      loadingData: {
        loading: false
      },
      dialog: false,
      searchParam: {
        time: '',
        titleMust: '', // 必含关键词
        titleCan: '', // 可含关键词
        titleNot: '', // 不含关键词
        stock_code: [], // 公司代码
        spliteStockCode: '',
        yjjg: '', // 研究机构
        author: '', // 研报作者
        rate: '',
        processDateStart: '', // 起始时间
        processDateEnd: '' // 结束时间
      },
      urlData: {
        'pdfUrl': '',
        'showWordUrl': ''
      },
      topData: {
        yjjg: [
          '渣打银行',
          '国信证券',
          '长城证券',
          '联合国开发计划署',
          '浙商证券',
          '工银亚洲',
          '中邮证券',
          '恒泰证券',
          '中银国际证券',
          '安信证券',
          '中航证券',
          '弘则弥道',
          '华宝证券',
          '上海证券之星北京分公司',
          '富盛投顾',
          '华融证券',
          '中债登公司',
          '麦肯锡咨询',
          '高德',
          '广州证券',
          '大同证券',
          '国信证券(香港)',
          '财通国际',
          '复星恒利',
          '隆众石化网',
          '信达证券',
          '银河期货',
          '南京证券',
          '中大期货',
          '信达期货',
          '华西证券',
          '新时代证券',
          '广发证券(香港)',
          '中信期货',
          '大通证券',
          '平安信托',
          '博星证券',
          '华安证券',
          '中山证券',
          '华创证券',
          '兴业研究',
          '中国证券报',
          '华林证券',
          '罗兰贝格',
          '百分点科技',
          '天风证券',
          '东亚证券',
          '国融证券',
          '交银施罗德基金',
          '广发期货',
          '华泰期货',
          '中泰国际证券',
          '渤海证券',
          '腾讯科技',
          '南华金融',
          '平安证券',
          '招商证券(香港)',
          '申万宏源',
          '途虎研究',
          '东兴证券',
          '兴证国际证券',
          '广证恒生',
          '兴业投资',
          '越秀证券',
          '广发证券',
          '国元证券',
          '深圳市万德隆投资',
          '京东商城',
          '中投证券(香港)',
          '万联证券',
          '光大银行',
          '中冶建信投资基金管理',
          '大唐金融',
          '国泰君安(香港)',
          '申万宏源研究(香港)',
          '智信道',
          '宜人智库',
          '信诚证券',
          '中投期货',
          '汇业证券',
          '艾瑞市场咨询',
          '投中信息',
          '太平洋',
          '南京银行',
          '北汽经研所',
          '元大证券(香港)',
          '财通证券',
          '东吴证券',
          '招商证券',
          '中国银行',
          '万和证券',
          '世纪证券',
          '致富证券',
          '建设银行',
          '宏信证券',
          '日盛投顾',
          '中国银河',
          '设计与人工智能实验室',
          '金元证券',
          '海通国际',
          '乌镇智库',
          '中国民生银行',
          '富邦证券',
          '联储证券',
          '诺亚控股',
          '财富证券',
          '长城国瑞证券',
          '德勤',
          '高华证券',
          '网信证券',
          '交银国际证券',
          '安邦咨询',
          '国联证券',
          '第一上海证券',
          '山西证券',
          '国都证券',
          '工银瑞信基金',
          '联讯证券',
          '首创证券',
          '天天基金网',
          '德意志银行',
          '民族证券',
          '信达国际控股',
          '天星资本',
          '英大证券',
          '中债资信',
          '西南证券',
          '交通银行',
          '华泰证券',
          '国元证券(香港)',
          '东莞证券',
          '华南证券投资顾问',
          '宏源证券',
          '华金证券',
          '中国信通院',
          '五矿证券',
          '开源证券',
          '艾媒咨询',
          '中原证券',
          '前海钜阵资管',
          '兴业证券',
          '普华永道咨询(深圳)',
          '招银国际',
          '西证国际证券',
          '辉立证券',
          '安邦证券',
          '湘财证券',
          '中国银河国际证券',
          '申银万国期货',
          '西部证券',
          '瑞银证券',
          '化工在线',
          '第一创业',
          '国海证券',
          '安信国际证券',
          '爱建证券',
          '申万研究',
          '华泰金融控股',
          '胜利证券',
          '国开证券',
          '中财橡胶网',
          '财达证券',
          '德邦证券',
          '上海证券报',
          '和讯网',
          '莫尼塔投资',
          '兴业银行',
          '华泰联合证券',
          '川财证券',
          '中天证券',
          '江海证券',
          '神华期货',
          '东海证券',
          '易观国际',
          '新三板智库',
          '赛迪研究院',
          '东方证券',
          '龙柏信息',
          '中投证券',
          '东方财富证券',
          '国金证券',
          '上海证券',
          '中泰证券',
          '东北证券',
          '农银国际证券',
          '国盛证券',
          '极光数据',
          '光大证券',
          '中信建投期货',
          '华龙证券',
          '新意互动',
          '华福证券',
          '元大投资顾问',
          '浙商期货',
          '阿里研究院',
          'LinkedIn公司',
          '民生证券',
          '红塔证券',
          '永丰证券',
          '汇丰银行',
          '群益证券',
          '北京微星优财'
        ],
        companyCode: [],
        rate: ['增持', '买入', '卖出', '持有']
      },
      tableData: [],
      zPager: {
        total: 0,
        size: 30,
        count: 11,
        currentPage: 1
      }
    }
  },
  methods: {
    typeIndex (index) {
      return index + (this.zPager.currentPage - 1) * this.zPager.size + 1
    },
    clearParam () {
      this.zPager.currentPage = 1
      for (let key in this.searchParam) {
        this.searchParam[key] = ''
      }
      this.searchParam.stock_code = []
      this.getList()
    },
    showPDF (urls) { // 展示pdf
      this.urlData.pdfUrl = urls
      var Idx = urls.indexOf('pdf')
      if (Idx === -1) { // 判断如果不是pdf文件，调用word
        this.showWord(urls)
      }
      this.dialog = true
    },
    showWord (urls) { // 展示word
      this.urlData.showWordUrl = 'https://view.officeapps.live.com/op/view.aspx?src=' + urls
      this.dialog = true
    },
    beforeClose () { // 弹窗关闭之前清除数据
      this.urlData.pdfUrl = ''
      this.urlData.showWordUrl = ''
      this.dialog = false
    },
    getList () {
      if (this.searchParam.processDateStart || this.searchParam.processDateEnd) {
        if (!this.searchParam.processDateStart) {
          this.$message.error('请选择开始日期！')
          return
        }
        if (!this.searchParam.processDateEnd) {
          this.$message.error('请选择结束日期！')
          return
        }
      }
      this.loadingData.loading = true
      let that = this
      that.getSearchParam()
      let apiPath = ''
      // apiPath = that.apiPath + 'Regulatory_Letters/Pager/' + (this.searchParam.titleMust || '[]') + '/' + (this.searchParam.titleCan || '[]') + '/' + (this.searchParam.titleNot || '[]') + '/' + (this.searchParam.spliteStockCode || '[]') + '/' + (this.searchParam.send_unit || '[]') + '/' + (this.searchParam.reply_status || 0) + '/' + (this.searchParam.template || '[]') + '/' + (this.searchParam.processDateStart || '[]') + '/' + (this.searchParam.processDateEnd || '[]') + '/' + this.zPager.currentPage + '/' + this.zPager.size
      let titleMust = (this.searchParam.titleMust && encodeURI(this.searchParam.titleMust)) || '[]'// 包含所有关键字
      let titleCan = (this.searchParam.titleCan && encodeURI(this.searchParam.titleCan)) || '[]'// 可以包含关键字
      let titleNot = (this.searchParam.titleNot && encodeURI(this.searchParam.titleNot)) || '[]' // 不包含任意关键字
      let stockCode = this.searchParam.spliteStockCode || '[]' // 公司代码
      let yjjg = (this.searchParam.yjjg && encodeURI(this.searchParam.yjjg)) || '[]' // 研究机构
      let author = (this.searchParam.author && encodeURI(this.searchParam.author)) || '[]' // 研报作者
      let rate = (this.searchParam.rate && encodeURI(this.searchParam.rate)) || '[]' // 研报作者
      apiPath = that.apiPath + 'Yjbg/' + titleMust + '/' + titleCan + '/' + titleNot + '/' + stockCode + '/' + yjjg + '/' + author + '/' + (this.searchParam.processDateStart || '[]') + '/' + (this.searchParam.processDateEnd || '[]') + '/' + rate + '/' + this.zPager.currentPage + '/' + this.zPager.size
      that.$ajax.get(apiPath)
        .then(function (response) {
          that.loadingData.loading = false
          let data = response.data.Result
          that.tableData = data.Data
          that.zPager.total = data.Total
        })
    },
    getSearchParam () {
      // 获取查询的参数
      // 处理开始结束时间
      this.searchParam.processDateStart = this.searchParam.processDateStart && this.dealDate(this.searchParam.processDateStart) // 开始时间
      this.searchParam.processDateEnd = this.searchParam.processDateEnd && this.dealDate(this.searchParam.processDateEnd) // 结束时间
      // 处理公司代码
      if (this.searchParam && this.searchParam.stock_code) {
        this.searchParam.stock_code.length > 1 ? this.searchParam.spliteStockCode = this.searchParam.stock_code.join(',') : this.searchParam.spliteStockCode = this.searchParam.stock_code[0]
      } else {
        this.searchParam.spliteStockCode = ''
      }
    },
    getTopData () {
      let that = this
      that.$ajax.get(that.apiPath + 'StockPlate')
        .then(function (response) {
          let data = response.data.Result.Data
          that.topData.bankuai = data
        })

      that.$ajax.get(that.apiPath + 'StockInfo')
        .then(function (response) {
          let data = response.data.Result.Data
          that.topData.companyCode = data
        })
    },
    pagerChange () {
      this.getList()
    }
  },
  created () {
    this.getTopData()
    this.getList()
  },
  mounted () {
    let that = this
    window.onresize = () => {
      return (() => {
        that.dataHeight = document.documentElement.clientHeight - 177
      })()
    }
  }

}
</script>
<style>
.dialog-box .el-loadingData.loading-mask {
  width: 40% !important;
  margin-left: 30%;
  background-color: rgba(0, 0, 0, 0);
  z-index: 99999;
}
.noMl.ml20 {
  margin-left: 0px;
}
.ml20 {
  margin-left: 20px;
  width: 33.3% !important;
}
.Presentation .el-dialog {
  background-color: rgba(0, 0, 0, 0.3);
}
.Presentation .el-dialog__header {
  position: fixed;
  right: 10px;
}
.Presentation .el-dialog__headerbtn .el-dialog__close {
  color: #fff !important;
  font-size: 18px;
}
.el-input__inner {
  height: 32px;
  line-height: 32px;
}
.el-input__icon {
  line-height: 32px;
}
.el-aside.left {
  border-right: 1px solid #f2f4f7;
  box-sizing: border-box;
}
.Presentation .el-range__icon.el-icon-date {
  line-height: 0px;
}
.Presentation .el-range-separator {
  line-height: 25px !important;
}
</style>

<style scoped>
.downLoad {
  position: fixed;
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: block;
  left: 10px;
  top: 10px;
  text-decoration: none;
}
.downLoad > p {
  margin: 0px;
  font-size: 12px;
}
.showPDF {
  justify-content: center !important;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  margin-left: 8px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  line-height: 36px;
  font-weight: 700;
}
.el-container {
  justify-content: left;
}
</style>
