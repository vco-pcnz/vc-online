<template>
  <div class="flex justify-between title">
    <div class="bold fs_2xl">{{ t('快捷入口') }}</div>
    <div class="flex gap-1 items-center cursor-pointer" @click="open = true"><i class="iconfont">&#xe604;</i>{{ t('设置1') }}</div>
  </div>
  <div class="wrapper">
    <div class="item" v-for="(item, index) in list" :key="index" @click="navigationTo(item.path)">
      <img class="icon" :src="item.icon" alt="" />
      <p>{{ item.name }}</p>
    </div>
  </div>
  <a-modal :width="600" v-if="open" :open="open" :title="t('快捷入口')" @cancel="open = false" class="QuickAccessModal">
    <div class="bold">{{ t('已添加') }}</div>
    <div class="wrapper">
      <div class="item" v-for="(item, index) in list" :key="index">
        <img class="icon" :src="item.icon" alt="" />
        <p>{{ item.name }}</p>
        <i class="iconfont add reduce">&#xe620;</i>
      </div>
    </div>
    <div class="bold">{{ t('列表') }}</div>
    <div class="wrapper">
      <div class="item" v-for="(item, index) in list" :key="index">
        <img class="icon" :src="item.icon" alt="" />
        <p>{{ item.name }}</p>
        <i class="iconfont add">&#xe621;</i>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { navigationTo } from '@/utils/tool';
const { t } = useI18n();

const open = ref(false);

const list = ref([
  {
    name: 'users',
    path: '/users/list',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: 'users',
    path: '/users/list',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: 'users',
    path: '/users/list',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: 'users',
    path: '/users/list',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: 'users',
    path: '/users/list',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: 'users',
    path: '/users/list',
    icon: 'http://vco.com/uploads/images/annex/20250119/5cd812ff979a3bb1357.png'
  },
  {
    name: 'users',
    path: '/users/list',
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
  padding: 10px 15px;
  gap: 25px;
  .item {
    width: 65px;
    height: 65px;
    text-align: center;
    cursor: pointer;
    border: 1px solid transparent;
    &:hover {
      border: 1px solid #dbdbdb;
    }
    .icon {
      display: inline-block;
      width: auto;
      height: 20px;
      margin: 15px 0 5px;
    }
    p {
      line-height: 1;
    }
  }
}
.QuickAccessModal {
  .wrapper {
    .item {
      border: 1px solid #dbdbdb;
      width: 65px;
      height: 65px;
      position: relative;
      .add {
        position: absolute;
        color: #f19915;
        font-size: 18px;
        top: -13px;
        right: -10px;
        &.reduce {
          color: #adadad;
        }
      }
    }
  }
}
</style>
