<template>
  <!-- 业务组件 -->
  <div class="item">
    {{ item.title }}
  </div>
</template>

<script>
export default {
  name: 'ListItem',
  props: {
    item: Object
  }
}
</script>

<style scoped>
.item {
  height: 50px;
  line-height: 50px;
  border-bottom: 1px solid #eee;
}
</style>