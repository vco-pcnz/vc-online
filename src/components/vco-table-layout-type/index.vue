<template>
  <div class="type-content">
    <div
      v-for="(item, index) in typeData"
      :key="index"
      class="item"
      :class="{'active': index === current}"
      @click="typeChange(index)"
    >
      <i class="iconfont" :class="item"></i>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue"

  const emits = defineEmits(['update:modelValue'])

  const props = defineProps({
    modelValue: {
      type: Number,
      default: 0
    }
  })

  const current = ref(0)
  const typeData = ['icon-liebiaoxianshi', 'icon-piliangcaozuo']

  const typeChange = (index) => {
    if (index !== current.value) {
      current.value = index
      emits('update:modelValue', index)
    }
  }

  onMounted(() => {
    current.value = props.modelValue
  })
</script>

<style lang="less" scoped>
  @import "@/styles/variables.less";

  .type-content {
    display: flex;
    align-items: center;
    gap: 15px;
    > .item {
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
      cursor: pointer;
      &.active {
        > i {
          color: @colorPrimary;
        }
      }
      > i {
        font-size: 20px;
        color: #666;
        transition: all 0.3s ease;
      }
    }
  }
</style>