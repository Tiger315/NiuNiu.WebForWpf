<template>
  <div class="LawListForWpf-box" v-cloak>
    <!--搜索开始-->
    <el-container style="margin-bottom: 10px;">
      <el-cascader placeholder="请选择业务类别" :options="sBox.zLawTypeData" v-model="sBox.zLawTypeVal" @change="sBox.lawTypeChange" size="small" style="width: 350px;" :props="sBox.zLawTypeProps" filterable clearable></el-cascader>
      <el-cascader placeholder="请选择法律位阶" :options="sBox.zLawWjData" v-model="sBox.zLawWjVal" @change="sBox.lawWjChange" size="small" style="width: 350px; margin-left: 20px;" :props="sBox.zLawWjProps" filterable clearable></el-cascader>
      <el-select v-model="sBox.zLawScopeVal" multiple collapse-tags size="small" style="width: 350px; margin-left: 20px;" placeholder="请选择适用范围" filterable>
        <el-option v-for="item in sBox.zLawScopeData" :key="item.id" :label="item.name" :value="item.name"></el-option>
      </el-select>
      <el-select v-model="sBox.zLawSourceVal" multiple collapse-tags size="small" style="width: 350px; margin-left: 20px;" placeholder="请选择发文单位" filterable>
        <el-option v-for="item in sBox.zLawSourceData" :key="item.id" :label="item.name" :value="item.name"></el-option>
      </el-select>
    </el-container>
    <el-container style="margin-bottom: 10px;">
      <el-input placeholder="请输入标题, 包含以下全部关键词（以空格区分）" v-model="sBox.zLawT1Val" size="small" style="width: 350px;" clearable></el-input>
      <el-input placeholder="请输入标题, 包含以下任意关键词（以空格区分）" v-model="sBox.zLawT2Val" size="small" style="width: 350px; margin-left: 20px;" clearable></el-input>
      <el-input placeholder="请输入标题, 不包含以下关键词（以空格区分）" v-model="sBox.zLawT3Val" size="small" style="width: 350px; margin-left: 20px;" clearable></el-input>
      <el-button type="primary" icon="el-icon-search" size="small" style="margin-left: 20px;" @click="getLaw">搜索</el-button>
    </el-container>
    <!--搜索开始-->

    <!--表格开始-->
    <el-table v-loading="zLoading" element-loading-text="拼命加载中" :data="zLawData" :height="tHeight" stripe style="width: 100%;" empty-text=" " row-key="id">
      <el-table-column type="index" fixed="left" label="序号" width="70" :index="typeIndex"></el-table-column>
      <el-table-column fixed="left" prop="title" label="标题" min-width="350" fit show-overflow-tooltip>
        <template slot-scope="scope">
          <span style="color: #0d308c; cursor: pointer; font" @click="seeLawDialog(scope.row)">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="law_wj_name" label="法律位阶" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="law_scope_name" label="适用范围" width="220" show-overflow-tooltip></el-table-column>
      <el-table-column prop="source_place" label="发文单位" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column label="重要性" width="150">
        <template slot-scope="scope">
          <el-rate v-model="scope.row.grade" disabled :show-score="false"></el-rate>
        </template>
      </el-table-column>
      <el-table-column prop="valid_flag" label="生效状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.valid_flag === 1 ? 'primary' : 'danger'" close-transition>{{scope.row.valid_flag === 1 ? '现行有效' : '已失效'}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="publish_date" label="发布日期" width="110"></el-table-column>
    </el-table>
    <!--表格结束-->

    <!--分页开始-->
    <div style="margin-top: 10px; height: 32px; line-height: 32px; text-align: center;">
      <span style="float: left; text-align: right; color: #606266; font-size: 14px; padding-top: 3px;">共 {{ zPager.total }} 条</span>
      <el-pagination layout="prev, pager, next" :page-size="zPager.size" :pager-count="zPager.count" :current-page.sync="zPager.currentPage" :total="zPager.total" @current-change="pagerChange">
      </el-pagination>
    </div>
    <!--分页结束-->

    <!--dialog开始-->
    <el-dialog :title="zCurLaw.title" :visible.sync="zDialog" style="font-weight: bold;" fullscreen="true">
      <div class="dialog-box" v-loading="zLoading">
        <el-row style="font-size: 14px; color: #717171;">
          <el-col :span="16">
            <div class="grid-content" style="text-align: left;">
              <span class="ssp">{{zCurLaw.law_wj_name}}</span>
              <span class="ssp">{{zCurLaw.law_scope_name}}</span>
              <span class="ssp">{{zCurLaw.source_place}}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="grid-content" style="text-align: right;">
              <span class="ssp">{{zCurLaw.publish_date}} 发布</span>
              <span class="ssp">{{zCurLaw.valid_flag === 1 ? '现行有效' : '已失效'}}</span>
              <span class="ssp">{{zCurLaw.sign}}</span>
            </div>
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px;">
          <el-col :span="4">
            <el-menu collapse="true" style="width: 100%; height: 595px; max-height: 595px; overflow: auto;">
              <template v-for="nZ in zCurLaw.navigation">
                <el-submenu :index="nZ.id" :key="nZ.id">
                  <template slot="title">
                    <a :href="'#' + nZ.id" class="el-menu-a">
                      <i>{{ nZ.name }}</i>
                    </a>
                    <span>{{ nZ.name }}</span>
                  </template>
                  <template v-if="nZ.j !== undefined">
                    <template v-for="nJ in nZ.j">
                      <el-menu-item-group :key="nJ.id">
                        <template slot="title">{{ nJ.name }}</template>
                        <template v-for="nT in nJ.t">
                          <el-menu-item :index="nT.id" :key="nT.id">
                            <a :href="'#' + nT.id" class="el-menu-a">{{ nT.name }}</a>
                          </el-menu-item>
                        </template>
                      </el-menu-item-group>
                    </template>
                  </template>
                  <template v-else>
                    <el-menu-item-group v-for="nT in nZ.t" :key="nT.id">
                      <el-menu-item :index="nT.id">
                        <a :href="'#' + nT.id" class="el-menu-a">{{ nT.name }}</a>
                      </el-menu-item>
                    </el-menu-item-group>
                  </template>
                </el-submenu>
              </template>
            </el-menu>
          </el-col>
          <el-col :span="20" style="height: 595px; max-height: 595px; overflow: auto;">
            <div v-html="zCurLaw.content" style="margin-left: 10px;" class="nOnly"></div>
          </el-col>
        </el-row>
        <el-row style="margin-top: 20px; background: #FAFAFA; border: 1px solid #DBDBDB;">
          <el-col :span="24">
            <div style="font-weight: bold; font-size: 13px; color: #303133; margin: 5px; border-bottom: 1px solid #DBDBDB;">
              <i class="el-icon-document" style="margin-right: 5px;"></i>附件
              <span class="nsm">({{ zCurLaw.attchementTotal }} 个)</span>
            </div>
            <div style="margin: 5px 5px 0px 5px; height: 60px; max-height: 60px; overflow: auto;">
              <el-row>
                <el-col :span="8" v-for="att in zCurLaw.attachementData" :key="att.id">
                  <el-row>
                    <el-col style="text-align: left;">
                      <a :href="'http://sign.niuniu.com:8814/' + att.att_url" style="color: #0d308c; font-size: 13px;" :title="att.old_name" target="_balnk">{{att.name}}</a>
                      <span class="nsm" style="margin-left: 3px;">({{att.size}})</span>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button-group>
          <el-popover placement="bottom" popper-class="shareLawList" trigger="click">
            <div class="bdsharebuttonbox">
              <a href="#" class="bds_weixin" data-cmd="weixin" title="分享到微信" :data-id="zCurLaw.id"></a>
              <a href="#" class="bds_tsina" data-cmd="tsina" title="分享到新浪微博" :data-id="zCurLaw.id"></a>
            </div>
            <el-button slot="reference" type="primary" size="small" icon="el-icon-share">分 享</el-button>
            <el-button slot="reference" type="primary" size="small" icon="el-icon-download" @click="exportToWord">导 出 (Only Word)</el-button>
          </el-popover>
        </el-button-group>
      </span>
    </el-dialog>
    <!--dialog结束-->
  </div>
</template>

<script>
export default {
  name: 'LawListForWpf',
  data () {
    return {
      tHeight: document.documentElement.clientHeight - 135,
      isDefOrSearch: 0,
      zLoading: true,
      sBox: {
        zLawTypeData: [],
        zLawTypeProps: {
          value: 'Name',
          label: 'Name',
          children: 'Child'
        },
        zLawTypeVal: '',
        zLawWjData: [],
        zLawWjProps: {
          value: 'Name',
          label: 'Name',
          children: 'Child'
        },
        zLawWjVal: '',
        zLawScopeData: [],
        zLawScopeVal: '',
        zLawSourceData: [],
        zLawSourceVal: '',
        zLawT1Val: '',
        zLawT2Val: '',
        zLawT3Val: ''
      },
      zLawData: [],
      zPager: {
        total: 0,
        size: 30,
        count: 11,
        currentPage: 1
      },
      zCurLaw: {
        id: '',
        title: '法律法规详情',
        publish_date: '1900-00-00',
        valid_flag: 1,
        law_wj_name: [],
        law_scope_name: '',
        source_place: '',
        sign: '',
        grade: 5,
        content: '',
        navigation: [],
        attchementTotal: 0,
        attachementData: []
      },
      zDialog: false
    }
  },
  methods: {
    typeIndex (index) {
      return index + (this.zPager.currentPage - 1) * this.zPager.size + 1
    },
    getLawType () {
      const that = this
      let apiPath = that.apiPath + 'LawType'

      that.$ajax
        .get(apiPath)
        .then(function (response) {
          let res = response.data
          that.sBox.zLawTypeData = res.Result.Data
        })
        .catch(function (response) {
          console.log(response)
        })
    },
    lawTypeChange (value) {
      this.sBox.zLawTypeVal = value
    },
    getLawWj () {
      const that = this
      let apiPath = that.apiPath + 'LawWj'

      that.$ajax
        .get(apiPath)
        .then(function (response) {
          let res = response.data
          that.sBox.zLawWjData = res.Result.Data
        })
        .catch(function (response) {
          console.log(response)
        })
    },
    lawWjChange (value) {
      this.sBox.zLawWjVal = value
    },
    getLawScope () {
      const that = this
      let apiPath = that.apiPath + 'LawScope'

      that.$ajax
        .get(apiPath)
        .then(function (response) {
          let res = response.data
          that.sBox.zLawScopeData = res.Result.Data
        })
        .catch(function (response) {
          console.log(response)
        })
    },
    getLawSource () {
      const that = this
      let apiPath = that.apiPath + 'LawSource'

      that.$ajax
        .get(apiPath)
        .then(function (response) {
          let res = response.data
          that.sBox.zLawSourceData = res.Result.Data
        })
        .catch(function (response) {
          console.log(response)
        })
    },
    getLaw () {
      const that = this
      that.zLoading = true
      var t1 = that.sBox.zLawT1Val.trim() === '' ? '[]' : that.sBox.zLawT1Val
      var t2 = that.sBox.zLawT2Val.trim() === '' ? '[]' : that.sBox.zLawT2Val
      var t3 = that.sBox.zLawT3Val.trim() === '' ? '[]' : that.sBox.zLawT3Val
      var t4 =
        that.sBox.zLawWjVal[1] === undefined
          ? '[]'
          : that.sBox.zLawWjVal[0] + '|' + that.sBox.zLawWjVal[1]
      var t5 =
        that.sBox.zLawTypeVal[1] === undefined
          ? '[]'
          : that.sBox.zLawTypeVal[1]
      var t6 =
        that.sBox.zLawScopeVal.length === 0 ? '[]' : that.sBox.zLawScopeVal
      var t7 =
        that.sBox.zLawSourceVal.length === 0 ? '[]' : that.sBox.zLawSourceVal

      let pageNum = that.zPager.currentPage
      let pageSize = that.zPager.size
      let apiPath =
        that.apiPath +
        'Law/Pager/' +
        t1 +
        '/' +
        t2 +
        '/' +
        t3 +
        '/' +
        t4 +
        '/' +
        t5 +
        '/' +
        t6 +
        '/' +
        t7 +
        '/' +
        pageNum +
        '/' +
        pageSize

      that.$ajax
        .get(apiPath)
        .then(function (response) {
          let res = response.data
          if (res.Code === 1000) {
            that.zLawData = res.Result.Data
            that.zPager.total = res.Result.Total
          }
          that.zLoading = false
        })
        .catch(function (response) {
          console.log(response)
        })
    },
    pagerChange (val) {
      this.getLaw()
    },
    seeLawDialog (row) {
      this.zLoading = true
      if (row) {
        this.zCurLaw.title = row.title
        this.zCurLaw.id = row.id
        this.zCurLaw.title = row.title
        this.zCurLaw.publish_date = row.publish_date
        this.zCurLaw.sign = row.sign
        this.zCurLaw.law_scope_name = row.law_scope_name
        this.zCurLaw.source_place = row.source_place
        this.zCurLaw.valid_flag = row.valid_flag
        this.zCurLaw.law_wj_name = row.law_wj_name.split('|')[1]
        this.getLawDetail(row.id)
        this.getLawAttachement(row.id)
      }
      this.zLoading = false
      this.zDialog = true
    },
    getLawDetail (id) {
      const that = this
      let apiPath = that.apiPath + 'Law/Det/' + id

      that.$ajax
        .get(apiPath)
        .then(function (response) {
          let res = response.data
          let newCss =
            '<style>.nZ{font-size:18px;font-weight:bold}.nJ{font-size:16px;font-weight:bold;text-indent:20px;padding:10px 5px 5px 5px}.nT{font-weight:bold}.nT-content{font-weight:normal}.nt-box{text-indent:40px;padding:5px 5px 5px 5px}.nt-box:hover{cursor:pointer;background-color:#e7eaf4}table.gt {font-family:verdana,arial,sans-serif;font-size:11px;color:#333333;border-width:1px;border-color:#666666;border-collapse:collapse;} table.gt th {border-width:1px;padding:8px;border-style:solid;border-color:#666666;background-color:#dedede;} table.gt td {border-width:1px;padding:8px;border-style:solid;border-color:#666666;background-color:#ffffff;}</style>'
          that.zCurLaw.content = newCss + res.Result.Data[0].content
          that.zCurLaw.navigation = JSON.parse(res.Result.Data[0].navigation)
        })
        .catch(function (response) {
          console.log(response)
        })
    },
    getLawAttachement (id) {
      const that = this
      let apiPath = that.apiPath + 'LawAttachement/' + id

      that.$ajax
        .get(apiPath)
        .then(function (response) {
          let res = response.data
          that.zCurLaw.attchementTotal = res.Result.Total
          that.zCurLaw.attachementData = res.Result.Data
        })
        .catch(function (response) {
          console.log(response)
        })
    }
    // exportToWord () {
    //   Host.alert('This is a tesing..')
    // }
  },
  created () {
    this.getLawType()
    this.getLawWj()
    this.getLawScope()
    this.getLawSource()
    this.getLaw()
  },
  mounted () {
    const that = this
    window.onresize = () => {
      return (() => {
        that.tHeight = document.documentElement.clientHeight - 135
      })()
    }
    that.$nextTick(() => {
      // 全局变量，动态的文章ID
      var fgid = ''
      $(function () {
        $('.bdsharebuttonbox a').mouseover(function () {
          fgid = $(this).attr('data-id')
        })
      })
      function SetShareUrl (cmd, config) {
        if (fgid) {
          config.bdUrl =
            'http://h5.niuniu.com:8088/static/pages/law/law_list_det.html?id=' +
            fgid
        }
        return config
      }
      window._bd_share_config = {
        common: {
          onBeforeClick: SetShareUrl
        },
        share: { bdSize: '24' }
      }

      const s = document.createElement('script')
      s.type = 'text/javascript'
      s.src =
        'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion=' +
        ~(-new Date() / 36e5)
      document.body.appendChild(s)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
[v-cloak] {
  display: none;
}
html,
body {
  padding: 0;
  margin: 0;
  font-size: 14px;
}
.ssp {
  padding: 0 5px;
  border-right: 1px solid #717171;
  font-weight: bold;
}
.ssp:last-child {
  border: none;
}
a {
  text-decoration: none;
}

a:link {
  text-decoration: none;
}

a:visited {
  text-decoration: none;
}

a:hover {
  text-decoration: none;
}

a:active {
  text-decoration: none;
}
.el-menu-item {
  height: 18px;
  line-height: 18px;
  color: #606266;
}
.el-submenu__title {
  height: 32px;
  line-height: 32px;
  color: #606266;
}
.el-submenu__title i {
  color: #606266;
  font-style: normal;
}
.el-menu-a {
  color: #0d308c;
  font-size: 13px;
}
</style>
