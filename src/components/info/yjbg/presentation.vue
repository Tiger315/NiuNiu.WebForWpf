<template>
  <div class="Presentation">
    <!-- 搜索条件开始 -->
    <el-container style="margin-bottom:10px; padding:0 10% 0 0;">
      <el-input placeholder="包含所有关键词(以空格区分)" v-model="searchParam.titleMust" size="small" clearable class="ml20 noMl"></el-input>
      <el-input placeholder="包含任意关键词(以空格区分)" v-model="searchParam.titleCan" size="small" clearable class="ml20"></el-input>
      <el-input placeholder="不包含任意关键词(以空格区分)" v-model="searchParam.titleNot" size="small" clearable class="ml20"></el-input>
      <el-select multiple collapse-tags clearable size="small" v-model="searchParam.stock_code" placeholder="公司代码、简称" filterable class="ml20">
        <el-option :label="item.Name+'('+item.Code+')'" :key="item.Name+'('+item.Code+')'" v-for='item in topData.companyCode' :value="item.Code"></el-option>
      </el-select>
    </el-container>
    <el-container style="margin-bottom:10px; padding:0 10% 0 0;">
      <el-select collapse-tags clearable size="small" placeholder="研究机构" v-model="searchParam.yjjg" filterable class="ml20 noMl">
        <el-option v-for='item in topData.yjjg' :key="item" :label="item" :value="item"></el-option>
      </el-select>
      <el-select collapse-tags clearable size="small" v-model="searchParam.rate" placeholder="所有评级" filterable class="ml20">
        <el-option v-for='item in topData.rate' :key="item" :label="item" :value="item"></el-option>
      </el-select>
      <el-date-picker v-model="searchParam.processDateStart" type="date" placeholder="开始日期" class="ml20"></el-date-picker>
      <el-date-picker v-model="searchParam.processDateEnd" type="date" placeholder="结束日期" class="ml20"></el-date-picker>
    </el-container>
    <el-container style="margin-bottom:10px; padding:0 10% 0 0;">
      <el-input placeholder="研报作者" v-model="searchParam.author" size="small" clearable class="ml20 noMl"></el-input>
      <el-button type="primary" icon="el-icon-search" size="small" style="margin-left: 20px;" @click="getList">搜索</el-button>
      <el-button type="warning" size="small" style="margin-left: 20px;" @click="clearParam">清空搜索</el-button>
    </el-container>
    <!-- 搜索条件结束 -->

    <!-- 表格数据开始 -->
    <el-table v-loading.loading="loadingData.loading" element-loading-text="拼命加载中" :height="dataHeight" :data="tableData" stripe style="width: 100%;" empty-text=" " row-key="id">
      <el-table-column type="index" fixed="left" label="序号" width="70" :index="typeIndex">序号</el-table-column>
      <el-table-column fixed="left" prop="Title" label="研报标题" min-width="350" fit show-overflow-tooltip>
        <template slot-scope="scope">
          <span style="color: #0d308c; cursor: pointer; font" @click='showPDF(scope.row.Atturl)'>{{scope.row.CodeName ? ("【 "+ scope.row.CodeName +" 】" + scope.row.Title) : scope.row.Title}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="Type" label="类型" width="120"></el-table-column>
      <el-table-column prop="Rate" label="股票评级" min-width="70">
        <template slot-scope="scope">
          <div>{{scope.row.Rate == "" ? "--" : scope.row.Rate}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="Org" label="研究机构" width="160"></el-table-column>
      <el-table-column prop="Auth" label="研报作者" width="160" show-overflow-tooltip>
        <template slot-scope="scope">
          <div>{{scope.row.Auth == "" ? "--" : scope.row.Auth}}</div>
        </template>
      </el-table-column>
      <el-table-column prop="ReportDate" label="发布日期" width="150"></el-table-column>
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
        titleMust: '',
        titleCan: '',
        titleNot: '',
        stock_code: [],
        spliteStockCode: ''
        // yjjg: '', // 研究机构
        // author: '', // 研报作者
        // rate: '',
        // processDateStart: '', // 起始时间
        // processDateEnd: '' // 结束时间
      },
      urlData: {
        'pdfUrl': '',
        'showWordUrl': ''
      },
      topData: {
        yjjg: [
          '360营销研究院',
          '36氪',
          'AdMaster',
          'AETOS',
          'App Annie',
          'Bain & Company',
          'Brand Finance',
          'CRIC',
          'CUSHMAN & WAKEFIELD',
          'DCCI',
          'FreeWheel',
          'Greenwoods',
          'HY MARKETS',
          'IBM商业价值研究院',
          'ICI',
          'JLL',
          'JP摩根资产管理公司亚洲',
          'KPCB风投',
          'LinkedIn公司',
          'Smaato',
          'TokenClub 研究院',
          'Trustdata',
          'T研究',
          '阿里研究院',
          '埃森哲',
          '艾媒数聚',
          '艾媒咨询',
          '艾瑞股份',
          '爱建证券',
          '安邦证券',
          '安邦咨询',
          '安吉斯',
          '安信国际',
          '安信国际证券',
          '安信期货',
          '安信证券',
          '安永',
          '安卓生态研究',
          '奥维云网',
          '百度网讯',
          '百分点科技',
          '包商银行',
          '宝城期货',
          '宝钢股份',
          '宝盈基金',
          '保利投顾研究院',
          '北大光华管理学院',
          '北京大学经济研究所',
          '北京股商',
          '北京微星优财网络科技',
          '北京中北联信用评估',
          '北汽经研所',
          '北森云',
          '贝恩公司',
          '贝莱德',
          '倍特期货',
          '毕马威',
          '标准普尔',
          '标准院',
          '波士顿咨询',
          '博鳌亚洲论坛',
          '博时基金',
          '博闻集团',
          '博星证券',
          '博众投资',
          '渤海期货',
          '渤海证券',
          '财达证券',
          '财富证券',
          '财科院',
          '财通国际',
          '财通证券',
          '参照系',
          '长城国瑞证券',
          '长城基金',
          '长城证券',
          '长江期货',
          '长盛基金',
          '长雄证券',
          '晨星资讯(深圳)',
          '城市总体规划编制办公室',
          '川财证券',
          '创元期货',
          '达信',
          '大成基金',
          '大地期货',
          '大和证券',
          '大华继显',
          '大华期货',
          '大华银行',
          '大盛证券',
          '大唐金融',
          '大通证券',
          '大同证券',
          '大有期货',
          '大众证券',
          '德邦基金',
          '德邦证券',
          '德勤',
          '德圣基金研究中心',
          '德意志银行',
          '德裕金号证券',
          '滴滴媒体',
          '第一财经',
          '第一财经商业数据中心',
          '第一创业',
          '第一创业期货',
          '第一上海证券',
          '第一太平戴维斯',
          '点成资产',
          '东北证券',
          '东方财富证券',
          '东方基金',
          '东方金诚',
          '东方证券',
          '东方证券(香港)',
          '东海期货',
          '东海证券',
          '东湖大数据',
          '东华期货',
          '东软管理咨询',
          '东胜旅游',
          '东莞银行',
          '东莞证券',
          '东吴基金',
          '东吴期货',
          '东吴证券',
          '东兴期货',
          '东兴证券',
          '东亚银行',
          '东亚证券',
          '东证期货',
          '二更',
          '法国巴黎银行',
          '法国兴业证券(香港)',
          '法兴',
          '方正期货',
          '福能期货',
          '复星恒利',
          '富安达基金',
          '富邦银行(香港)',
          '富邦证券',
          '富昌证券',
          '富达投资',
          '富国基金',
          '富启时代',
          '富盛投顾',
          '高德',
          '高华证券',
          '高盛',
          '高盛高华证券',
          '高信证券',
          '格林期货',
          '工商银行',
          '工信部',
          '工信部信息中心',
          '工业互联网产业联盟',
          '工银国际',
          '工银瑞信基金',
          '工银亚洲',
          '冠通期货',
          '光大保德信基金',
          '光大期货',
          '光大新鸿基',
          '光大银行',
          '光大证券',
          '光大证券(香港)',
          '光谱资本',
          '广发基金',
          '广发期货',
          '广发银行',
          '广发证券',
          '广发证券(香港)',
          '广证恒生',
          '广州奥美',
          '广州期货',
          '广州证券',
          '国都期货',
          '国都证券',
          '国都证券(香港)',
          '国富期货',
          '国海富兰克林基金',
          '国海固定收益证券',
          '国海良时期货',
          '国海证券',
          '国际航空电讯',
          '国际货币基金组织',
          '国际数据',
          '国家信息中心',
          '国家知识产权局知识产权',
          '国家制造强国建设战略咨委会',
          '国金基金',
          '国金期货',
          '国金证券',
          '国金证券(香港)',
          '国开证券',
          '国联期货',
          '国联证券',
          '国融证券',
          '国盛证券',
          '国双科技',
          '国泰基金',
          '国泰君安(香港)',
          '国泰君安资产管理',
          '国泰期货',
          '国投瑞银基金',
          '国务院发展研究中心',
          '国信期货',
          '国信证券',
          '国信证券(香港)',
          '国研网',
          '国元国际控股',
          '国元期货',
          '国元证券',
          '海富通基金',
          '海通国际',
          '海通期货',
          '海银财富管理',
          '海证期货',
          '韩华证券',
          '好当家',
          '和聚投资',
          '和融期货',
          '和信证券投资顾问',
          '和讯网',
          '荷兰皇家飞利浦公司',
          '恒大研究院',
          '恒泰期货',
          '恒泰证券',
          '弘业期货',
          '弘则弥道',
          '红塔证券',
          '宏信证券',
          '宏源期货',
          '宏源证券',
          '泓福证券',
          '湖南金证',
          '花旗环球金融',
          '花旗银行(中国)',
          '华安基金',
          '华安证券',
          '华宝基金',
          '华宝证券',
          '华创证券',
          '华福证券',
          '华富基金',
          '华金证券',
          '华联期货',
          '华林证券',
          '华龙证券',
          '华南金融控股',
          '华南证券投资顾问',
          '华融证券',
          '华商基金',
          '华泰金融控股',
          '华泰联合证券',
          '华泰期货',
          '华泰证券',
          '华通明略',
          '华为',
          '华闻期货',
          '华西证券',
          '华夏基金',
          '华夏证券',
          '华鑫期货',
          '华信期货',
          '华信资管',
          '华讯投资',
          '华扬数字',
          '华元期货',
          '化工在线',
          '黄金之星研究部',
          '辉立证券',
          '徽商银行',
          '汇丰晋信基金',
          '汇丰银行',
          '汇添富基金',
          '汇业财经',
          '汇业证券',
          '慧辰资讯',
          '慧动创想',
          '混沌天成',
          '基业常青经济研究院',
          '极光数据',
          '集奥聚合',
          '嘉实基金',
          '建融投资研究',
          '建设银行',
          '建信基金',
          '建银国际证券',
          '江海证券',
          '将至网络',
          '交通银行',
          '交银国际证券',
          '交银施罗德基金',
          '捷孚凯市场咨询',
          '金斧子',
          '金谷地投资',
          '金利丰',
          '金瑞期货',
          '金石期货',
          '金信期货',
          '金雅福',
          '金鹰基金',
          '金元期货',
          '金元证券',
          '锦泰期货',
          '京东商城',
          '京华山一',
          '鲸准研究院',
          '景林投资',
          '景顺长城基金',
          '九州证券',
          '聚孚金融',
          '均衡博弈',
          '开源证券',
          '凯度',
          '凯基证券',
          '凯基证券亚洲',
          '凯盛投资咨询',
          '康和投资顾问',
          '康宏环球',
          '匡恩网络',
          '昆仑海比',
          '理柏',
          '理成资产',
          '利可投资',
          '联昌证券',
          '联储证券',
          '联合国开发计划署',
          '联合信用评级公司',
          '联合资信',
          '联讯证券',
          '炼金术',
          '零壹投资咨询',
          '龙柏信息',
          '隆众石化网',
          '鲁证期货',
          '绿色和平组织',
          '罗兰贝格',
          '迈科期货',
          '麦格理资本',
          '麦肯锡咨询',
          '美尔雅期货',
          '美国汇盛',
          '民生加银基金',
          '民生证券',
          '民信证券',
          '民族证券',
          '明富金融',
          '明思力',
          '摩拜单车',
          '摩根大通证券',
          '摩根士丹利',
          '摩根士丹利华鑫基金',
          '摩根资产',
          '莫尼塔投资',
          '穆迪服务',
          '南方基金',
          '南方证券',
          '南华金融',
          '南华期货',
          '南华证券',
          '南京银行',
          '南京证券',
          '南证期货',
          '尼尔森',
          '宁波海顺',
          '农业银行',
          '农银国际证券',
          '农银汇理基金',
          '诺安基金',
          '诺德基金',
          '诺亚控股',
          '诺亚投资',
          '彭博',
          '鹏华基金',
          '平安期货',
          '平安信托',
          '平安证券',
          '平安证券(香港)',
          '浦发银行',
          '普华永道',
          '普华永道中天会计师事务所',
          '普华永道咨询(深圳)',
          '企鹅智酷',
          '启富证券投资顾问',
          '前海钜阵资管',
          '钱坤投资',
          '青岛大摩证券投资',
          '青石投资',
          '清华大学中国经济社会数据研究中心',
          '清华同衡',
          '清科研究中心',
          '全国信息安全标准化技术委员会',
          '群邑智库',
          '群益投顾',
          '群益证券',
          '人大劳动人事学院',
          '人民网',
          '日发证券',
          '日盛金融控股',
          '日盛投顾',
          '容维证券',
          '融通基金',
          '融通商贸',
          '融智评级',
          '瑞达期货',
          '瑞银集团',
          '瑞银证券',
          '赛德思',
          '赛迪研究院',
          '三星经济研究院',
          '山西证券',
          '商霖华通',
          '商务部流通业发展司',
          '上海钢联',
          '上海交大',
          '上海新兰德',
          '上海证券',
          '上海证券之星北京分公司',
          '上投摩根基金',
          '尚乘财富',
          '尚普信息咨询',
          '少数派',
          '设计与人工智能实验室',
          '社科院',
          '申万宏源',
          '申万宏源(香港)',
          '申万宏源研究(香港)',
          '申万研究',
          '申银万国期货',
          '深交所',
          '深圳市万德隆投资',
          '深圳展博投资',
          '深圳证券信息公司',
          '神光咨询',
          '胜利证券',
          '胜三(北京)',
          '盛初咨询',
          '石化工业规划院',
          '时富金融服务集团',
          '时富证券',
          '食品饮料创新论坛',
          '世诚投资',
          '世纪证券',
          '世界银行',
          '世联行',
          '首创期货',
          '首创证券',
          '数据中心联盟',
          '数说故事',
          '顺安证券',
          '顺德产业服务创新中心',
          '顺德农商行',
          '顺网科技',
          '私募排排网',
          '太平洋',
          '太平证券(香港)',
          '泰信黄金',
          '泰信基金',
          '汤森路透',
          '腾祺基金管理',
          '腾讯科技',
          '腾讯控股',
          '腾讯研究院',
          '腾云天下',
          '天风期货',
          '天风证券',
          '天富期货',
          '天津证券投资咨询',
          '天天基金',
          '天星资本',
          '同渡资本',
          '统一投顾',
          '头条指数',
          '投中集团',
          '投中信息',
          '投资者报',
          '途虎研究',
          '万和证券',
          '万家基金',
          '万联证券',
          '网信证券',
          '网易',
          '微梦创科',
          '维京研究院',
          '维赛特资讯',
          '伟德福思',
          '伟禄美林证券',
          '未来工场',
          '乌镇智库',
          '五矿经易期货',
          '五矿证券',
          '西部证券',
          '西南财大中国家庭金融调查与研究中心',
          '西南期货',
          '西南证券',
          '西证(香港)证券',
          '西证国际',
          '西证国际证券',
          '湘财证券',
          '小饭桌',
          '小米新金融研究中心',
          '新宝集',
          '新材料在线',
          '新鸿基金融集团',
          '新湖期货',
          '新华汇富金融',
          '新华基金',
          '新疆证券',
          '新金融研究院',
          '新三板在线',
          '新三板智库',
          '新晟期货',
          '新时代证券',
          '新世纪期货',
          '新世纪资信评估',
          '新意互动',
          '信诚证券',
          '信达澳银基金',
          '信达国际控股',
          '信达期货',
          '信达证券',
          '信和研究院',
          '兴全基金',
          '兴业金号',
          '兴业期货',
          '兴业投资',
          '兴业研究',
          '兴业银行',
          '兴业资本(英国)',
          '兴证创新资本',
          '兴证国际证券',
          '兴证期货',
          '星石投资',
          '星图数据',
          '炫一下科技',
          '亚东证券',
          '亚行',
          '燕曦投顾',
          '央视市场研究',
          '药渡经纬',
          '耀才证券',
          '野村证券(香港)',
          '一创摩根',
          '一德期货',
          '壹咨顾问',
          '宜人智库',
          '宜信财富',
          '亿欧网盟',
          '艺恩数据',
          '易车研究院',
          '易方达基金',
          '易粉科技',
          '易观国际',
          '易凯资本',
          '易铭投资',
          '益民基金',
          '益普索市场咨询',
          '银河基金',
          '银河期货',
          '银华基金',
          '银泰证券',
          '英策咨询',
          '英大证券',
          '英皇国际',
          '英皇证券',
          '英皇证券(香港)',
          '英敏特',
          '永安期货',
          '永丰贵金属',
          '永丰金证券',
          '永丰期货',
          '永丰外汇',
          '永丰证券',
          '用益金融',
          '友盟+',
          '禹唐体育',
          '元大投资顾问',
          '元大证券(香港)',
          '元富期货',
          '元富证券',
          '元富证券(香港)',
          '远东证券',
          '越声理财',
          '越秀证券',
          '云房数据',
          '云栖智库',
          '渣打银行',
          '渣打银行香港',
          '招金期货',
          '招商基金',
          '招商期货',
          '招商银行',
          '招商证券',
          '招商证券(香港)',
          '招银国际',
          '浙商基金',
          '浙商期货',
          '浙商银行',
          '浙商证券',
          '正晖资本管理',
          '证金贵金属',
          '证券通信',
          '知萌咨询',
          '指南针',
          '致富证券',
          '智信道',
          '中财期货',
          '中财橡胶网',
          '中诚信国际',
          '中大期货',
          '中德证券',
          '中方信富',
          '中关村证券',
          '中国保险业协会',
          '中国地质大学',
          '中国电商研究中心',
          '中国电子信息产业发展研究院',
          '中国泛海证券',
          '中国房地产TOP10研究',
          '中国光大控股',
          '中国国际电子商务中心',
          '中国国际期货',
          '中国互联网络信息中心',
          '中国经济信息网',
          '中国旅游研究院',
          '中国民生银行',
          '中国农村发展研究院农村电商研究中心',
          '中国人民大学金融科技与互联网安全研究中心',
          '中国人民银行',
          '中国信通院',
          '中国信托证券',
          '中国信息通信研究院',
          '中国银河',
          '中国银河国际证券',
          '中国银行',
          '中国银行(香港)',
          '中国证券报',
          '中国证券市场研究设计中心',
          '中国指数研究院',
          '中海基金',
          '中航证券',
          '中和鑫品',
          '中科院',
          '中科院科技战略咨询研究院',
          '中粮期货',
          '中欧国际',
          '中欧基金',
          '中期期货',
          '中融基金',
          '中睿合银',
          '中山证券',
          '中商产业研究院',
          '中泰国际证券',
          '中泰证券',
          '中天证券',
          '中投期货',
          '中投证券',
          '中投证券(香港)',
          '中信保诚基金',
          '中信基金',
          '中信建投(国际)',
          '中信建投期货',
          '中信期货',
          '中冶建信投资基金管理',
          '中怡康时代',
          '中银国际期货',
          '中银国际证券',
          '中银基金',
          '中银建投',
          '中邮证券',
          '中原集团',
          '中原期货',
          '中原证券',
          '中债登公司',
          '中债资信',
          '中证协',
          '中证指数公司',
          '重庆东金投资',
          '卓创咨询',
          '卓尔控股',
          '紫金矿业'
        ],
        companyCode: [],
        rate: ['持有', '回避', '减持', '买入', '卖出', '增持', '中性']
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
    dealDateFormate (row) {
      let date = row.ReportTime
      let dates = date.split(' ')[0]
      return dates
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
      // if (this.searchParam.processDateStart && this.searchParam.processDateEnd) {
      //   if (this.searchParam.processDateStart > this.searchParam.processDateEnd) {
      //     this.$message.error('开始时间不能大于结束时间！')
      //     return
      //   }
      // }

      let that = this
      that.loadingData.loading = true
      that.getSearchParam()

      // 包含所有关键字
      let titleMust = (that.searchParam.titleMust && encodeURI(that.searchParam.titleMust)) || '[]'

      // 可以包含关键字
      let titleCan = (that.searchParam.titleCan && encodeURI(that.searchParam.titleCan)) || '[]'

      // 不包含任意关键字
      let titleNot = (that.searchParam.titleNot && encodeURI(that.searchParam.titleNot)) || '[]'

      // 公司代码
      let stockCode = this.searchParam.spliteStockCode || '[]'
      var apiPath = that.apiPath + 'Yjbg/' + titleMust + '/' + titleCan + '/' + titleNot + '/' + stockCode + '/' + this.zPager.currentPage + '/' + this.zPager.size

      // let stockCode = this.searchParam.spliteStockCode || '[]' // 公司代码
      // let yjjg = (this.searchParam.yjjg && encodeURI(this.searchParam.yjjg)) || '[]' // 研究机构
      // let author = (this.searchParam.author && encodeURI(this.searchParam.author)) || '[]' // 研报作者
      // let rate = (this.searchParam.rate && encodeURI(this.searchParam.rate)) || '[]' // 研报作者
      // apiPath = that.apiPath + 'Yjbg/' + titleMust + '/' + titleCan + '/' + titleNot + '/' + stockCode + '/' + yjjg + '/' + author + '/' + (this.searchParam.processDateStart || '[]') + '/' + (this.searchParam.processDateEnd || '[]') + '/' + rate + '/' + this.zPager.currentPage + '/' + this.zPager.size
      that.$ajax.get(apiPath)
        .then(res => {
          var r = res.data
          if (r.Code === 1000) {
            that.tableData = r.Result.Data
            that.zPager.total = r.Result.Total
          }
          that.loadingData.loading = false
        })
    },
    getSearchParam () {
      // 开始时间
      this.searchParam.processDateStart = this.searchParam.processDateStart && this.dealDate(this.searchParam.processDateStart)

      // 结束时间
      this.searchParam.processDateEnd = this.searchParam.processDateEnd && this.dealDate(this.searchParam.processDateEnd)
      // 处理公司代码
      if (this.searchParam && this.searchParam.stock_code) {
        if (this.searchParam.stock_code.length > 1) {
          this.searchParam.spliteStockCode = "'" + this.searchParam.stock_code.join("','") + "'"
        } else {
          this.searchParam.spliteStockCode = "'" + this.searchParam.stock_code[0] + "'"
        }
      } else {
        this.searchParam.spliteStockCode = ''
      }
    },
    getTopData () {
      let that = this
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
  width: 24% !important;
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
