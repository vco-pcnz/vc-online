<template>
  <div class="vco-avatar" :class="{'radius': radius, 'round': round}" :style="{width: size + 'px', height: size + 'px', fontSize: size * 0.4 + 'px'}">
    <div class="vco-avatar-content" :class="{'loaded': loaded}">
      <img v-if="isSuc" :src="src" :class="{'height-fixed': heightFixed}">
      <div v-else-if="nameInitial" class="vco-avatar-initial" :style="initialStyle">{{ nameInitial }}</div>
      <img v-else src="./../../assets/images/user.svg" alt="">
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed } from 'vue'
  
  const props = defineProps({
    src: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    round: {
      type: Boolean,
      default: true
    },
    radius: {
      type: Boolean,
      default: false
    },
    size: {
      type: Number,
      default: 50
    }
  })

  // 计算 name 的首字母
  const nameInitial = computed(() => {
    if (props.name && props.name.trim()) {
      return props.name.trim().charAt(0).toUpperCase()
    }
    return ''
  })

  const loaded = ref(false)
  const isSuc = ref(false)
  const heightFixed = ref(false)

  // 首字母显示时使用稍大的字号
  const initialStyle = computed(() => ({
    fontSize: `${Math.round(props.size * 0.6)}px`
  }))

  const setImageSize = () => {
    if (props.src) {
      const img = new Image();
      img.src = props.src

      // 等待图片加载完成后获取宽高
      img.onload = () => {
        heightFixed.value = img.width > img.height
        isSuc.value = true
        loaded.value = true
      };

      img.error = () => {
        loaded.value = true
      };

    } else {
      isSuc.value = false
      loaded.value = true
    }
  }

  // 监听 isSuc 的变化
  watch(() => props.src, (newVal, oldVal) => {
    setImageSize()
  }, {
    immediate: true
  });
</script>

<style lang="less" scoped>
  .vco-avatar {
    overflow: hidden;
    background-color: #ccc;
    &.radius {
      border-radius: 6px;
    }
    &.round {
      border-radius: 50% !important;
    }
    > .vco-avatar-content {
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: 0.3s;
      &.loaded {
        opacity: 1;
      }
      > img {
        max-width: 1000px;
        width: 100%;
        height: auto;
        &.height-fixed {
          height: 100% !important;
          width: auto !important;
        }
      }
      > .vco-avatar-initial {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #e5e5e5;
        color: #666;
        font-weight: 600;
        user-select: none;
      }
    }
  }
</style>