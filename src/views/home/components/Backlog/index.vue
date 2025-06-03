<template>
  <div class="flex justify-between title items-center">
    <div class="bold fs_2xl">{{ t('待办事项1') }}(10)</div>
    <div class="cursor-pointer" @click="navigationTo('/tasks')">{{ t('更多') }}</div>
  </div>
  <div class="wrapper">
    <div class="item cursor-pointer" v-for="(item, index) in list" :key="index" @click="navigationTo('/tasks?type=' + item.type)">
      <!-- <i class="iconfont">&#xe679;</i> -->
      <img class="icon" :src="item.icon" alt="" />
      <div>
        <p class="num">10</p>
        <p :title="item.name" class="name">{{ item.name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { navigationTo } from '@/utils/tool';

const { t } = useI18n();
const list = ref([
  {
    name: t('放款'),
    type: 'drawdown',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: t('还款'),
    type: 'drawdown',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: t('解押'),
    type: 'discharge',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: t('罚息开始'),
    type: 'penalty-start',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: t('罚息开始'),
    type: 'penalty-start',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: t('罚息开始'),
    type: 'penalty-start',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: t('罚息开始'),
    type: 'penalty-start',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: t('罚息开始'),
    type: 'penalty-start',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  }
]);
</script>

<style lang="less" scoped>
.title {
  border-bottom: 1px solid #dbdbdb;
  padding: 8px 15px;
}
.wrapper {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 30px;
  gap: 35px;
  .item {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 55px;
    .iconfont {
      font-size: 40px;
    }
    .icon {
      display: inline-block;
      width: auto;
      height: 38px;
    }
    .name {
      white-space: nowrap; /* 禁止换行 */
      overflow: hidden; /* 隐藏超出部分 */
      text-overflow: ellipsis; /* 显示省略号 */
      width: 80px; /* 需要设置一个宽度 */
    }
  }
}
</style>
