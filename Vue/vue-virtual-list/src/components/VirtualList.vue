<template>
  <div class="container" ref="container" @scroll="handleScroll">
    <!-- 模拟滚动条，撑起内容总高度 -->
    <div class="scroll-bar" ref="scrollBar"></div>
    <!-- 真实可见内容区域 -->
    <div class="scroll-list" ref="scrollList">
      <div class="scroll-list-item" v-for="(item, index) in visibleData" :key="item.id || index"  :vid="item.id">
        <!-- 使用作用域插槽代替父组件的内容并传参 -->
        <slot :item="item"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    itemHeight: Number, // item 高度
    visibleSize: Number, // 可见个数
    list: {
      type: Array,
      default: () => []
    }, // 总数据
  },
  data() {
    return {
      startIndex: 0, // 截取开始索引
    }
  },
  computed: {
    // 可见数据
    visibleData() {
      return this.list.slice(this.startIndex, this.startIndex + this.visibleSize);
    }
  },
  mounted() {
    // 设置容器高度
    this.$refs.container.style.height = this.itemHeight * this.visibleSize + "px";
    // 设置滚动内容高度 (模拟总内容高度)
    this.$refs.scrollBar.style.height = this.itemHeight * this.list.length + "px";
  },
  methods: {
    handleScroll() {
      // 滚动条高度(页面滚动的距离)
      const scrollTop = this.$refs.container.scrollTop;
      // 计算截取索引(滚动过去了多少个向下取整)
      this.startIndex = Math.floor(scrollTop / this.itemHeight);
      // console.log('handleScroll', scrollTop, this.startIndex);

      // 页面由于absolute定位还是显示在了最顶部，需要计算偏移量平移到可视窗口
      const offset = this.startIndex * this.itemHeight;
      // 让可视区域调整偏移 (让当前渲染内容在当前视图内)
      this.$refs.scrollList.style.transform = `translateY(${offset}px)`;
    }
  }
}
</script>
<style scoped>
.container {
  overflow-y: auto;
  position: relative;
}
.scroll-list {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
</style>