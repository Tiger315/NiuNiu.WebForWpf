<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html,
body {
  padding: 0;
  margin: 0;
  height: 100%;
}
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100%;
}
.el-button--primary{
  background-color: #0d308c !important;
  border-color: #0d308c !important;
}
.el-pager li.active {
    color: #0d308c !important;
    cursor: default !important;
}
.el-pager li:hover {
    color: #0d308c !important;
}
</style>
