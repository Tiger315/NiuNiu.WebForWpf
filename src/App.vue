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
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin:0px;
  padding:0px;
}
.el-button--primary{
  background-color: #0d308c;
  border-color: #0d308c;
}
.el-pager li.active {
    color: #0d308c;
    cursor: default;
}
.el-pager li:hover {
    color: #0d308c;
}
</style>
