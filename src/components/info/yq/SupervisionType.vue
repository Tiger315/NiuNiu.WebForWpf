<template>
  <div class="SupervisionType">
        <!-- 搜索条件开始 -->
      <el-container style="margin-bottom: 10px;">
        <el-input placeholder="包含所有关键词(以空格区分)" v-model="searchParam.titleMust"  size="small"  clearable class="ml20 noMl"></el-input>
        <el-input placeholder="包含任意关键词(以空格区分)" v-model="searchParam.titleCan"  size="small" clearable class="ml20"></el-input>
        <el-input placeholder="不包含任意关键词(以空格区分)" v-model="searchParam.titleNot"  size="small"  clearable class="ml20"></el-input>
        <el-select multiple collapse-tags clearable size="small" placeholder="来源" v-model="searchParam.companyMarketId" filterable class="ml20">
            <el-option  v-for='item in resourceArr' :value="item.Source_ID" :label="item.Source_Name" :key="item.Source_ID"></el-option>
        </el-select>
      </el-container>
      <el-container style="margin-bottom: 10px;">
        <el-date-picker type="daterange" v-model="searchParam.time" range-separator="至" start-placeholder="起始日期" end-placeholder="结束日期" class="ml20 noMl"></el-date-picker>
        <div class="ml20">
          <el-button type="primary" icon="el-icon-search" size="small"  @click="loadTableDetail(1)">搜索</el-button>
         <el-button type="warning"  size="small"  @click="clearParam" >清空搜索</el-button>
        </div>
      </el-container>
      <!-- 搜索条件结束 -->
      <!--表格开始-->
     <el-table v-loading="zLoading" :height="dataHeight"  element-loading-text="拼命加载中" :data="violationCase"  stripe style="width: 100%;" empty-text=" " row-key="id">
              <el-table-column type="index" label="序号" fixed="left" width="70" :index="typeIndex"></el-table-column>
              <el-table-column fixed="left" prop="News_Title" label="标题"  min-width="250"  fit show-overflow-tooltip>
                <template slot-scope="scope">
                  <span><a :href="scope.row.News_Url" target="_blank" style="color: #0d308c; cursor: pointer; text-decoration:none;">{{ scope.row.News_Title }}</a></span>
                </template>
              </el-table-column>
              <el-table-column  fixed="left" prop="Source_Name" label="来源" width="200"></el-table-column>
              <el-table-column fixed="left" label="发布日期" prop="News_Date" width="150"></el-table-column>
      </el-table>
          <!--表格结束-->
       <!--分页开始-->
      <div style="margin-top: 10px;height: 32px; line-height: 32px; text-align: center;">
        <span style="float: left; text-align: right; color: #606266; font-size: 14px; padding-top: 3px;">共 {{ zPager.total }} 条</span>
        <el-pagination layout="prev, pager, next" :page-size="zPager.size" :pager-count="zPager.count" :current-page.sync="zPager.currentPage" :total="zPager.total" @current-change="pagerChange">
        </el-pagination>
      </div>
        <!--分页结束-->
  </div>
</template>
<script>
export default {
  name: 'SupervisionType',
  data () {
    return {
      dataHeight: document.documentElement.clientHeight - 135,
      zDialog: true,
      zLoading: true,
      searchParam: {
        titleMust: '', // 必含关键词
        titleCan: '', // 可含关键词
        titleNot: '', // 不含关键词
        companyMarketId: '', // 来源
        time: '',
        processDateStart: '', // 起始时间
        processDateEnd: '' // 结束时间
      },
      searchSourceNu: '',
      zPager: {
        total: 0,
        size: 30,
        count: 11,
        currentPage: 1
      },
      violationCase: [],
      resourceArr: []
    }
  },
  methods: {
    typeIndex (index) {
      return index + (this.zPager.currentPage - 1) * this.zPager.size + 1
    },
    clearParam () {
      for (var key in this.searchParam) {
        this.searchParam[key] = ''
      }
      this.searchParam.companyMarketId = []
      this.loadTableDetail(1)
    },
    loadSources () {
      var that = this
      var api = that.apiPath + 'DynamicNews_Source'
      that.$ajax
        .get(api)
        .then(function (response) {
          that.resourceArr = response.data.Result.Data
        })
    },
    loadTableDetail (param) {
      var that = this
      var api = that.apiPath + 'DynamicNews/Pager'
      if (param) {
        this.getSearchParam()
        api = api + '/' + (this.searchParam.titleMust || '[]') + '/' + (this.searchParam.titleCan || '[]') + '/' + (this.searchParam.titleNot || '[]') + '/' + (this.searchParam.processDateStart || '[]') + '/' + (this.searchParam.processDateEnd || '[]') + '/' + (this.searchSourceNu || '[]') + '/' + this.zPager.currentPage + '/' + this.zPager.size
      } else {
        api = api + '/' + this.zPager.currentPage + '/' + this.zPager.size
      }
      that.$ajax
        .get(api)
        .then(function (response) {
          that.zLoading = false
          that.violationCase = response.data.Result.Data
          that.zPager.total = response.data.Result.Total
        })
        .catch(function () {
          that.zLoading = false
        })
    },
    getSearchParam () {
      // 获取查询的参数
      this.searchParam.processDateStart = this.searchParam.time && this.dealDate(this.searchParam.time[0]) // 开始时间
      this.searchParam.processDateEnd = this.searchParam.time && this.dealDate(this.searchParam.time[1]) // 结束时间
      //
      if (this.searchParam && this.searchParam.companyMarketId) {
        this.searchParam.companyMarketId.length > 1 ? this.searchSourceNu = this.searchParam.companyMarketId.join(',') : this.searchSourceNu = this.searchParam.companyMarketId[0]
      }
    },
    pagerChange () {
      this.loadTableDetail(1)
    }
  },
  created () {
    this.loadSources()
    this.loadTableDetail()
  },
  mounted () {
    const that = this
    window.onresize = () => {
      return (() => {
        that.dataHeight = document.documentElement.clientHeight - 135
      })()
    }
  }

}
</script>
<style>
.el-input__inner{
  height: 32px;
  line-height:32px;
}
.el-input__icon{
    line-height:32px;
}
.el-aside.left{
    border-right: 1px solid #f2f4f7;
    box-sizing: border-box
}
.SupervisionType .el-range__icon.el-icon-date{
    line-height: 0px ;
}
.SupervisionType .el-range-separator{
  line-height:25px !important;
}
</style>

<style scoped>
.noMl.ml20{
 margin-left:0px;
}
.ml20{
  margin-left:20px;
  width:350px;
}

.title{
    margin-left:8px;
    cursor: pointer;
    white-space: nowrap;
    font-size: 14px;
    line-height: 36px;
    font-weight: 700;
}
.el-main{
  padding:0px 20px;
  margin-top:20px;
}
a.detail_title{
    font-size: 16px;
    color: #0d308c;
    cursor: pointer;
    text-decoration: none;
}
span.detail_date {
    font-size: 14px;
    color: #999;
}
.detail_msg{
    margin-top: 13px;
}
.detail_content,.detail_msg{
    line-height: 16px;
    margin-top: 10px;
    font-size: 14px;
    color: #999;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
}
.showData{
  border-bottom:1px solid #f2f4f7;
}
ul#detail_list{
  margin:0px;
  padding:0px;
  width:99%;
}
#detail_list li {
    padding: 16px 16px;
    border-bottom: 1px solid #d4dbe1;
}
#detail_list li:last-child{
  border-bottom:none;
}
</style>
