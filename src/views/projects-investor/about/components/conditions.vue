<template>
  <a-spin :spinning="loading" size="large">
    <ul class="Conditions">
      <li class="Conditions-item flex items-center" v-for="item in list" :key="item">
        <a-checkbox :checked="item.checked"></a-checkbox>
        <div class="CalendarDate">
          <p class="CalendarDate-Label">Dec</p>
          <p class="CalendarDate-Value">16</p>
          <p class="CalendarDate-Label">Mon</p>
        </div>
        <div class="VerticalDivider"></div>
        <div class="flex-1">
          <p class="Text Text_cross Box" style="margin-bottom: 6px">111</p>
          <div class="flex items-center">
            <vco-avatar src="" :radius="true" :round="true" :size="18" />
            <span class="name">Created by lm</span>
          </div>
          <div class="flex items-center mt-1">
            <vco-avatar src="" :radius="true" :round="true" :size="18" />
            <span class="name black"> Borrower's</span>
          </div>
        </div>
      </li>
    </ul>
  </a-spin>
  <a-button type="brown" shape="round" size="small" class="mt-5">add condition</a-button>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectDetailConditionList } from '@/api/process';

const { t } = useI18n();

const props = defineProps(['currentId']);

const loading = ref(false);
const list = ref([]);
watch(
  () => props.currentId,
  (val) => {
    if (val) {
      loading.value = false;
      projectDetailConditionList({ uuid: props.currentId })
        .then((res) => {
          list.value = res;
        })
        .finally((_) => {
          loading.value = false;
        });
    }
  },
  {
    immediate: true
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.VerticalDivider {
  align-self: stretch;
  background-color: #e2e5e2;
  flex-shrink: 0;
  width: 1px;
  margin-left: 16px;
  margin-right: 16px;
}
.Conditions {
  &-item {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
    .CalendarDate {
      flex-shrink: 0;
      text-align: center;
      width: 30px;
      margin-left: 12px;
      &-Label {
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      &-Value {
        font-size: 20px;
        font-weight: 500;
      }
      &-Label:last-of-type {
        color: @color_grey;
      }
    }
    .Text_cross {
      text-decoration: line-through;
      text-decoration-thickness: 1.5px;
    }

    .name {
      color: @color_grey;
      font-weight: 500;
      font-size: 10px;
      line-height: 1.45;
      margin-left: 6px;
    }
    .black {
      color: #000;
    }
  }
}
</style>
