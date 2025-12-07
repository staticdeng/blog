<template>
  <div id="app">
    <VirtualList :itemHeight="50" :visibleSize="10" :list="listData">
      <!-- 使用作用域插槽：在父组件中接收slot传参，传给子组件 -->
      <!-- <ListItem slot-scope="{ item }" :item="item"></ListItem> -->
      <div slot-scope="{ item }" class="item">
        {{ item.title }}
      </div>
    </VirtualList>
  </div>
</template>

<script>
import VirtualList from './components/VirtualList'
// import ListItem from './components/Item.vue'

export default {
  name: 'App',
  components: {
    VirtualList,
    // ListItem
  },
  data() {
    return {
      listData: Array.from({ length: 10000 }, (item, i) => ({ id: i, title: `title ${i + 1}` }))
    }
  }
}
</script>

<style>
* {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  box-sizing: border-box; /* 不计算border高度 */
}
.item {
  height: 50px;
  line-height: 50px;
  border-bottom: 1px solid #eee;
}
</style>
