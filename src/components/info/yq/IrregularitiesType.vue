<template>
  <div class="IrregularitiesType">
    <el-container :height="leftHeight">
      <el-aside width="20%" :height="leftHeight" class="left">
        <div :class="titleActive==true?'title active':'title'" @click="searchList(-1)">违规类型</div>
        <div  style="display: -ms-flexbox;display: flex;-ms-flex-direction: row;flex-direction: row;-ms-flex: 1;flex: 1;-ms-flex-preferred-size: auto;flex-basis: auto;box-sizing: border-box;min-width: 0;">
          <el-tree v-loading="loadingData.leftDataLoading" :expand-on-click-node="zhankai" :data="treeData"  @node-click="searchList"></el-tree>
        </div>
      </el-aside>
      <el-container>
        <!-- 搜索条件开始 -->
        <el-header height="240">
          <el-container style="margin-top: 10px;">
            <el-input placeholder="必含关键词（以空格区分）" v-model="searchParam.titleMust" size="small" clearable></el-input>
            <el-input placeholder="可含关键词（以空格区分）" v-model="searchParam.titleCan" size="small" clearable></el-input>
            <el-input placeholder="不含关键词（以空格区分）" v-model="searchParam.titleNot" size="small" clearable></el-input>
          </el-container>
          <el-container style="margin-top: 10px;">
            <el-date-picker v-model="searchParam.processDateStart" type="date" placeholder="开始日期"></el-date-picker>
            <el-date-picker v-model="searchParam.processDateEnd" type="date" placeholder="结束日期"></el-date-picker>
            <el-select multiple collapse-tags clearable size="small" v-model="searchParam.companyCode" placeholder="请输入公司代码、简称" filterable>
              <el-option :label="item.Name+'('+item.Code+')'" :key="item.Name+'('+item.Code+')'" v-for='item in topData.StockInfo' :value="item.Code"></el-option>
            </el-select>

          </el-container>
          <el-container style="margin-top: 10px;">
             <el-select collapse-tags clearable size="small" placeholder="所属板块" v-model="searchParam.companyMarketId" filterable>
              <el-option :value="item" :key="item" v-for='item in topData.area'></el-option>
            </el-select>
            <el-select collapse-tags clearable size="small" placeholder="所属行业" v-model="searchParam.industryInfo" filterable>
              <el-option :value="item.name" :key="item.id" v-for='item in topData.industry'></el-option>
            </el-select>
            <el-select collapse-tags clearable size="small" placeholder="所属地区" v-model="searchParam.companyArea" filterable>
              <el-option :value="item" :key="item" v-for='item in topData.procvince'></el-option>
            </el-select>
          </el-container>
          <el-container style="margin-top: 10px; margin-bottom: 10px;justify-content:left;">
            <el-select collapse-tags multiple clearable size="small" v-model="searchParam.involveObjectId" placeholder="处罚对象" filterable>
              <el-option :value="item" :key="item" v-for='item in topData.chufaRole'></el-option>
            </el-select>
            <el-select collapse-tags clearable size="small" placeholder="处罚机构" v-model="searchParam.supervisionOrganId" filterable>
              <el-option :value="item.name" :key="item.id" v-for='item in topData.jys'></el-option>
            </el-select>
            <div>
              <el-button type="primary" icon="el-icon-search" size="small" @click="searchList">搜索</el-button>
              <el-button type="warning" size="small" @click="clearParam">清空搜索</el-button>
            </div>
          </el-container>
        </el-header>
        <!-- 搜索条件结束 -->

        <!--表格开始-->
        <el-main>
          <el-table v-loading="loadingData.loading" element-loading-text="拼命加载中" :height="tableHeight" :data="detailData.violationCaseData" stripe style="width: 100%;" row-key="id">
            <el-table-column type="index" fixed="left" width="70" label="序号" :index="typeIndex"></el-table-column>
            <el-table-column fixed="left" prop="title" label="标题" min-width="280" fit show-overflow-tooltip>
              <template slot-scope="scope">
                <span style="color: #0d308c; cursor: pointer; font" @click="showDetail(scope.row.xa_id)">{{scope.row.title}}</span>
              </template>
            </el-table-column>
            <el-table-column label="公司" width="200">
              <template slot-scope="scope">
                {{scope.row.companyName}}{{scope.row.companyCode?"("+scope.row.companyCode+")":""}}
              </template>
            </el-table-column>
            <el-table-column prop="violationTypeName" width="200" label="违规类型" show-overflow-tooltip></el-table-column>
            <el-table-column prop="supervisionOrganName" width="150" label="监管机构"></el-table-column>
            <el-table-column :formatter="processDate" width="150" label="更新时间"></el-table-column>
          </el-table>
        </el-main>
        <!--表格结束-->

        <!--分页开始-->
        <el-footer height="45">
          <div style="text-align: center;width:100%; margin-top: 10px; ">
            <span style="float: left; text-align: right; color: #606266; font-size: 14px; padding-top: 3px;">共 {{ searchParam.total }} 条</span>
            <el-pagination layout="prev, pager, next" :page-size="searchParam.size" :pager-count="searchParam.count" :current-page.sync="searchParam.currentPage" :total="searchParam.total" @current-change="pagerChange">
            </el-pagination>
          </div>
        </el-footer>
        <!--分页结束-->
      </el-container>
    </el-container>
    <el-dialog :visible.sync="dialog" style="font-weight: bold;margin:0px;" fullscreen :before-close="beforeClose">
      <div class="dialog-box">
        <el-container :height="leftModelHeight">
          <el-aside width="33.3%">
            <div>
              <div class="detail-card">
                <div class="card-head">基本信息</div>
                <div class="card-body" v-loading="loadingData.baseInfoLoading">
                  <p>证券代码：{{detailData.baseInfoData.companyCode}}</p>
                  <p>证券简称：{{detailData.baseInfoData.companyName}}</p>
                  <p>所属板块：{{detailData.baseInfoData.companyMarketName}}</p>
                  <p>所属地区：{{detailData.baseInfoData.companyArea}}</p>
                  <p>所属行业：{{detailData.baseInfoData.companyIndustry}}</p>
                  <p>申辩情况：{{detailData.baseInfoData.avermentName}}</p>
                </div>
              </div>
            </div>
            <div>
              <div class="detail-card">
                <div class="card-head">违规信息</div>
                <div class="card-body" v-loading="loadingData.baseInfoLoading">
                  <p>监管机构：{{detailData.baseInfoData.supervisionOrganName}}</p>
                  <p>文号：{{detailData.baseInfoData.lssuedNumber}}</p>
                  <p>监管类型：{{detailData.baseInfoData.supervisionTypeName}}</p>
                  <p>违规类型：{{detailData.baseInfoData.violationTypeName}}</p>
                  <p>处理日期：{{detailData.baseInfoData.processDate}}</p>
                </div>
              </div>
            </div>
            <div>
              <div class="detail-card">
                <div class="card-head">相关案例</div>
                <div class="card-body" v-loading="loadingData.relaCaseLoading">
                  <p v-for="val in detailData.relationCaseData" class="caseDetail" :key="val.id" @click="getDetail (val.relationXgal_id)">
                    <span class="splot"></span>{{val.title}}</p>
                </div>
              </div>
            </div>
            <div>
              <!-- <div class="detail-card" :v-if="detailData.xgfgLawData">
                <div class="card-head">相关法规</div>
                <div class="card-body" v-loading="loadingData.xgfgLawLoading">
                  <p v-for="val in detailData.xgfgLawData" :key="val.id" @click="getDetail (val.relationXgfg_id)">{{val.title}}</p>
                </div>
              </div> -->
            </div>
          </el-aside>
          <el-container>
            <el-header class="showPdf" height="300" style="padding:0 10px;">
              <div class="dialog-box dialog-box1" v-loading="loadingData.detLoading">
                <div v-if="detailData.baseInfoData.docUrl=='' || detailData.baseInfoData.docUrl==null " class="pdfTitle" v-html="detailData.baseInfoData.docContent"></div>
                <iframe :src="pdfUrl" v-if="detailData.baseInfoData.docUrl!='' && detailData.baseInfoData.docUrl!=null" frameborder="0" :height="640" style="width:100%;margin-top:0px;"></iframe>
              </div>
            </el-header>
            <el-main class="table2">
              <el-table align="center" header-align="center" :data="loadingData.tableData" border style="width: 100%" v-loading="loadingData.violatioLoading">
                <el-table-column fixed prop="involveObjectName" label="涉及当事人" width="350"> </el-table-column>
                <el-table-column fixed prop="objectPositionName" label="涉及对象"></el-table-column>
                <el-table-column fixed prop="supervisionTypeName" label="监管类型"></el-table-column>
                <el-table-column fixed prop="violationTypeName" label="违规类型"></el-table-column>
              </el-table>
            </el-main>
          </el-container>
        </el-container>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  name: 'IrregularitiesType',
  data () {
    return {
      leftHeight: document.documentElement.clientHeight - 35,
      leftModelHeight: document.documentElement.clientHeight - 30 + '',
      tableHeight: document.documentElement.clientHeight - 232,
      zhankai: false,
      dialog: false,
      tableData: [],
      treeData: [],
      msgId: '',
      numPages: undefined,
      titleActive: true, // 左侧标题是否为选中状态
      searchParam: {
        treeCode: '',
        titleMust: '', // 必含关键词
        titleCan: '', // 可含关键词
        titleNot: '', // 不含关键词
        companyCode: '', // 公司代码简称
        involveObjectId: '', // 处罚对象身份
        avermentId: '', // 申辩情况
        processDateStart: '', // 起始时间
        processDateEnd: '', // 结束时间
        companyMarketId: '', // 所属板块
        industryInfo: '', // 所属行业
        companyArea: '', // 所属地区
        supervisionOrganId: '', // 处罚机构
        total: 0,
        size: 30,
        count: 11,
        sortType: 'desc',
        currentPage: 1,
        time: '',
        spliteStockCode: ''
      },
      searchId: '',
      topData: {
        industry: [],
        jys: [],
        StockInfo: [],
        procvince: ['上海', '云南', '内蒙古', '北京', '吉林', '四川', '天津', '宁夏', '安徽', '山东', '山西', '广东', '广西', '新疆',
          '江苏', '江西', '河北', '河南', '浙江', '海南', '湖北', '湖南', '甘肃', '福建', '西藏', '贵州', '辽宁', '重庆', '陕西', '青海', '黑龙江'],
        shenbian: ['申辩', '听证', '全部采纳', '部分采纳', '全未采纳'],
        area: ['沪市主板', '深市主板', '深市中小板', '深市创业板', '新三板', '其他'],
        chufaRole: ['上市公司', '上市公司实际控制人、控股股东', '上市公司5%以上股东', '上市公司其他股东', '上市公司董事', '上市公司监事', '上市公司高级管理人员', '上市公司子公司', '中介机构', '其他']
      },
      detailData: {
        baseInfoData: {}, // 基本信息
        relationCaseData: [], // 相关案例
        // xgfgLawData: [], // 相关法规
        violationCaseData: [], // 违规案例
        tableData: []
      },
      loadingData: {
        loading: true,
        detLoading: false,
        leftDataLoading: false,
        baseInfoLoading: false, // 基本信息loading
        relaCaseLoading: false, // 相关案例loading
        xgfgLawLoading: false, // 相关法规loading
        violatioLoading: false// 违规案例loading
      }
    }
  },
  methods: {
    typeIndex (index) {
      return index + (this.searchParam.currentPage - 1) * this.searchParam.size + 1
    },
    clearParam () { // 清除搜索条件
      for (var key in this.searchParam) {
        this.searchParam[key] = ''
      }
      this.searchParam.total = 0
      this.searchParam.size = 30
      this.searchParam.count = 11
      this.searchParam.sortType = 'desc'
      this.searchParam.currentPage = 1
      this.titleActive = true
      this.searchList(-1)
    },
    showDetail (id) {
      this.dialog = true
      this.searchId = id
      this.getDetail(this.searchId)
    },
    searchList (flag) { // flag标记是否是点击左侧的tree加载表格
      if (flag !== 1) {
        this.searchParam.currentPage = 1
      }
      if (flag && flag !== -1) {
        this.treeCode = flag.Code
        this.titleActive = false
      } else if (flag === -1) { // 点击的是左侧tree的标题，样式为选中状态并且重新加载表格
        this.titleActive = true
        this.treeCode = ''
      } else {
        this.titleActive = false
      }
      if (this.searchParam.processDateStart && this.searchParam.processDateEnd) {
        if (this.searchParam.processDateStart > this.searchParam.processDateEnd) {
          this.$message.error('开始时间不能大于结束时间！')
          return
        }
      }
      this.loadingData.loading = true
      var that = this
      that.getSearchParam()
      that.trimStr(this.searchParam) // 遍历去掉搜索条件的首尾空格
      var treeCode = this.treeCode || encodeURI('[]')
      var titleMust = (that.searchParam.titleMust && encodeURI(that.searchParam.titleMust)) || encodeURI('[]')
      var titleCan = (that.searchParam.titleCan && encodeURI(that.searchParam.titleCan)) || encodeURI('[]')
      var titleNot = (that.searchParam.titleCan && encodeURI(that.searchParam.titleNot)) || encodeURI('[]')
      var companyMarketId = (that.searchParam.companyMarketId && encodeURI(that.searchParam.companyMarketId)) || encodeURI('[]')
      var industryInfo = (that.searchParam.industryInfo && encodeURI(that.searchParam.industryInfo)) || encodeURI('[]')
      var companyArea = (that.searchParam.companyArea && encodeURI(that.searchParam.companyArea)) || encodeURI('[]')
      var involveObjectId = (that.searchParam.involveObjectId && encodeURI(that.searchParam.involveObjectId)) || encodeURI('[]')
      var supervisionOrganId = (that.searchParam.supervisionOrganId && encodeURI(that.searchParam.supervisionOrganId)) || encodeURI('[]')
      var searchParams = that.apiPath + 'XA_Wgal/' + titleMust + '/' + titleCan + '/' + titleNot + '/' +
      (that.searchParam.processDateStart || encodeURI('[]')) + '/' + (that.searchParam.processDateEnd || encodeURI('[]')) + '/' +
      (that.searchParam.spliteStockCode || encodeURI('[]')) + '/' + companyMarketId +
      '/' + industryInfo + '/' + companyArea + '/' + involveObjectId + '/' + supervisionOrganId + '/' + treeCode + '/' + that.searchParam.currentPage + '/30'
      that.$ajax.get(searchParams)
        .then(function (response) {
          that.loadingData.loading = false
          that.detailData.violationCaseData = response.data.Result.Data
          that.searchParam.total = response.data.Result.Total
          if (flag === 1) {
            const selectWrap = that.$('.el-table__body-wrapper')
            selectWrap.scrollTop(0)
          }
        })
        .catch(res => {
          that.$message.error('搜索异常, 请联系Admin')
          that.loadingData.loading = false
        })
    },
    processDate (row) {
      var date = this.dealDate(row.processDate - 0)
      return date
    },
    pagerChange () {
      this.searchList(1)
    },
    getSearchParam () {
      // 获取查询的参数
      // 处   理开始结束时间
      this.searchParam.processDateStart = this.searchParam.processDateStart && this.dealDate(this.searchParam.processDateStart) // 开始时间
      this.searchParam.processDateEnd = this.searchParam.processDateEnd && this.dealDate(this.searchParam.processDateEnd) // 结束时间
      // 处理公司代码
      if (this.searchParam && this.searchParam.companyCode) {
        this.searchParam.companyCode.length > 1 ? this.searchParam.spliteStockCode = this.searchParam.companyCode.join(',') : this.searchParam.spliteStockCode = this.searchParam.companyCode[0]
      } else {
        this.searchParam.spliteStockCode = ''
      }
    },
    loadLeftMenu () { // 侧边栏
      var that = this
      that.loadingData.leftDataLoading = true
      that.$ajax.get(that.apiPath + 'ViolationType')
        .then(function (response) {
          var datas = response.data
          var treeData = datas.Result.Data
          if (datas.Code === 1000) {
            var str = JSON.stringify(treeData).replace(/Name/g, 'label')
            str = str.replace(/Child/g, 'children')
            that.treeData = JSON.parse(str)
            that.loadingData.leftDataLoading = false
          }
        })
        .catch(function (response) {
          console.log(response)
        })
    },
    loadTopMenu () { // 顶部搜索条件
      var that = this
      that.$ajax.get(that.apiPath + 'Industry')
        .then(function (response) {
          var data = response.data.Result.Data
          that.topData.industry = data
        })

      that.$ajax.get(that.apiPath + 'Jys')
        .then(function (response) {
          var data = response.data.Result.Data
          that.topData.jys = data
        })
      that.$ajax.get(that.apiPath + 'StockInfo')
        .then(function (response) {
          var data = response.data.Result.Data
          that.topData.StockInfo = data
        })
    },
    getDetail (row) {
      var that = this
      for (var key in that.loadingData) {
        if (key !== 'leftDataLoading') {
          that.loadingData[key] = true
        }
      }
      that.$ajax
        .get(that.apiPath + '/XA_Wgal?xa_id=' + row)
        .then(function (response) {
          that.loadingData.baseInfoLoading = false
          that.loadingData.loading = false
          that.loadingData.detLoading = false
          var data = ''
          if (response.data.Result.Data.length > 0) {
            data = response.data.Result.Data[0]
            data['processDate'] = that.dealDate(data['processDate'] - 0)
          } else {
            data = []
            that.detailData.baseInfoData.docUrl = ''
          }
          that.detailData.baseInfoData = data
          if (that.detailData.baseInfoData.docUrl) { // 展示PDF
            that.pdfUrl = that.detailData.baseInfoData.docUrl
          }
        })
      // 相关案例
      that.$ajax
        .get(that.apiPath + '/XA_Wgal_RelationXgal?xa_id=' + row)
        .then(function (response) {
          that.detailData.relationCaseData = response.data.Result.Data
          that.loadingData.relaCaseLoading = false
        })
      // 相关法规
      that.$ajax
        .get(that.apiPath + '/XA_Wgal_RelationXgfg?xa_id=' + row)
        .then(function (response) {
          // that.detailData.xgfgLawData = response.data.Result.Data
          that.loadingData.xgfgLawLoading = false
        })
      // 涉及当事人
      that.$ajax
        .get(that.apiPath + '/XA_Wgal_RelationProcess?xa_id=' + row)
        .then(function (response) {
          that.tableData = response.data.Result.Data
          that.loadingData.violatioLoading = false
        })
    },
    pdfLoaded () { // pdf加载完后清除loading
      this.loadingData.detLoading = false
    },
    beforeClose () { // 弹窗关闭之前清除数据
      this.pdfUrl = ''
      this.dialog = false
      this.detailData.baseInfoData = {}// 清除基本信息
      this.detailData.relationCaseData = []// 清除相关案例
      // this.detailData.xgfgLawData = []// 清除相关法规
      this.detailData.tableData = []
    }
  },
  created () {
    this.loadTopMenu()
    this.loadLeftMenu()
    this.searchList()
  },
  mounted () {
    const that = this
    window.onresize = () => {
      return (() => {
        that.tableHeight = document.documentElement.clientHeight - 232
        that.leftHeight = document.documentElement.clientHeight - 35
      })()
    }
  }
}
</script>
<style>
.ml20 {
  margin-left: 20px;
  width: 33.3% !important;
}
.el-tree__empty-block{
width:180px;
}
.annotationLayer {
  transform: scale(1) !important;
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
.IrregularitiesType .el-range__icon.el-icon-date {
  line-height: 0px;
}
.IrregularitiesType .el-range-separator {
  line-height: 25px !important;
}

.SupervisionType .el-tree-node > .el-tree-node__children {
  overflow: initial;
}
.docTitle p {
  text-indent: 2em;
  font-size: 14px;
  line-height: 2em;
  color: rgba(0, 0, 0, 0.65);
  font-weight: 300;
}
.table2 .el-table--border {
  border: 1px solid #d4dbe3 !important;
}
.table2 .el-table th {
  background-color: #f3f4f8 !important;
  border: none;
  border-right: 1px solid #d4dbe3 !important;
  border-bottom: 1px solid #d4dbe3 !important;
}
.table2 .el-table td {
  color: rgba(0, 0, 0, 0.65);
  font-weight: 300;
}
.table2 .el-table th,
.table2 .el-table td {
  text-align: center;
}
.SupervisionType .el-dialog__body {
  padding-top: 0px;
}
.SupervisionType .el-dialog__headerbtn {
  top: 0px;
}
.dialog-box1 .el-loading-mask {
  background-color: rgba(0, 0, 0, 0);
  width: 40% !important;
  margin-left: 30%;
  max-height: 650px;
}
</style>

<style scoped>
.splot{
  display: inline-block;
  width:4px;
  height:4px;
  border-radius:4px;
  margin-right:5px;
  vertical-align:middle;
  background-color: rgba(0, 0, 0, 0.55);
}
.caseDetail:hover{
  background-color: #f6f6f6;
}
.SupervisionType {
  width: 100%;
  padding: 0px;
  margin: 0px;
  overflow-x: hidden;
}
.IrregularitiesType,
.IrregularitiesType > section {
  height: 100%;
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
  justify-content: center;
}
.el-container > div {
  width: 33.3%;
  margin: 0 15px;
  box-sizing: border-box;
}
.el-main {
  padding: 0px 10px;
  margin-top: 10px;
}
a.detail_title {
  font-size: 16px;
  color: #0d308c;
  cursor: pointer;
  text-decoration: none;
}
span.detail_date {
  font-size: 14px;
  color: #999;
}
.detail_msg {
  margin-top: 13px;
}
.detail_content,
.detail_msg {
  line-height: 16px;
  margin-top: 10px;
  font-size: 14px;
  color: #999;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.showData {
  border-bottom: 1px solid #f2f4f7;
}
.detail-card {
  border: 1px solid #d4dbe3;
  font-size: 16px;
  margin-bottom: 10px;
}

.card-head {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  color: #333;
  background: #f3f4f8;
  border-bottom: 1px solid #d4dbe3;
}
.card-body {
  padding: 12px 20px 8px;
  background: #fff;
  font-size: 14px;
  line-height: 1.8em;
}
.card-body p {
  margin: 0px;
  padding: 3px 0;
  text-indent: 2em;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  font-weight: 300;
  cursor: pointer;
}
.IrregularitiesType .title:hover,.IrregularitiesType .title.active{
  background-color: #f5f7fa;
}
</style>
