<template>
  <div class="tab flex items-center justify-between">
    <ul class="flex">
      <li
        class="tab-item flex items-center"
        v-for="(item, index) in data"
        :key="index"
        :class="{ active: activeIndex === index, disabled: item.status == 0 }"
        @click="setIndex(index)"
      >
        <img class="icon" :src="item.icon" alt="" />
        <img class="icon icon2" :src="item.icon2" alt="" />
        {{ item.name }}
      </li>
    </ul>
    <div class="tab-item search" :class="{ active: showSearch }" @click="updateSearch">
      <i class="iconfont">&#xe731;</i>
      <span>{{ t('搜索') }}</span>
    </div>
  </div>

  <div class="search-box" v-if="showSearch">
    <div class="search-title">Search</div>
    <a-input class="search-input" v-model:value="keywords" v-focus="true" placeholder="Search across the folder..." />
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emits = defineEmits(['update:active','update:showSearch']);

const props = defineProps({
  showSearch: {
    type: Boolean,
    default:false
  },
  active: {
    type: Number
  },
  data: {
    type: Array
  }
});

const activeIndex = ref(0);
const keywords = ref('');

const setIndex = (index) => {
  if (!props.data[index].status) return;
  activeIndex.value = index;
  emits('update:active', index);
  emits('update:showSearch',false);
};

const updateSearch = () => {
  emits('update:active', '');
  emits('update:showSearch',true);
};

watch(
  () => props.active,
  (val) => {
    activeIndex.value = props.active;
  }
);
</script>
<style lang="less">
@import '@/styles/variables.less';
.tab {
  &-item {
    gap: 8px;
    border-radius: 24px;
    font-weight: 600;
    height: 36px;
    padding-left: 12px;
    padding-right: 12px;
    transition: all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
    cursor: pointer;
    margin-bottom: 20px;
    .icon {
      width: 20px;
      height: 20px;
      &.icon2 {
        display: none;
      }
    }
    &.active {
      background-color: @color_variation;
    }
    &:hover {
      color: @color_brown;
      .icon {
        display: none;
        &.icon2 {
          display: block;
        }
      }
    }

    &.disabled {
      color: #181818;
      opacity: 0.3;
      .icon {
        display: block;
        &.icon2 {
          display: none;
        }
      }
    }

    &.search {
      display: flex;
      align-items: center;
      transition: all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
      .iconfont {
        font-size: 16px;
      }
      span {
        overflow: hidden;
        transition: 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
        transition-property: width, opacity;
        width: 0;
      }
      &.active span {
        opacity: 1;
        width: 53px;
      }
    }
  }
}

.search-box {
  min-height: auto;
  display: flex;
  align-items: center;
  border: 1px solid #e2e5e2;
  padding: 42px 34px;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);

  .search-title {
    font-size: 24px;
    line-height: 1.2;
    font-weight: 500;
    margin-right: 15px;
  }

  .search-input {
    &.ant-input {
      padding: 13.7px 11px;
      background-color: #f7f9f8;
      border: 1px solid transparent;
      &:focus {
        border-color: #e6d0ac;
        border-right-width: 1px;
        box-shadow: 0 0 0 2px hsla(35, 53%, 67%, 0.2);
        outline: 0;
      }
    }
  }
}
</style>
