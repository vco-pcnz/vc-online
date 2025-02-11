<template>
  <a-spin :spinning="loading" size="large">
    <ul class="step" style="max-height: 300px; overflow: auto; padding-right: 10px">
      <li class="step-item flex justify-between items-center" v-for="item in list" :key="item">
        <div class="content flex items-center">
          <i class="iconfont">&#xe725;</i>
          <span>{{ item.message }}</span>
        </div>
        <span class="date">{{ tool.showDate(item.create_time, 'DD/MM/YY') }}</span>
      </li>
    </ul>
  </a-spin>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { historyList } from '@/api/project/project';

const { t } = useI18n();

const props = defineProps(['currentId']);

const loading = ref(false);
const list = ref([]);
watch(
  () => props.currentId,
  (val) => {
    if (val) {
      loading.value = false;
      historyList({ uuid: props.currentId })
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

.step {
  .step-item {
    margin-bottom: 12px;
    gap: 6px;
    position: relative;
    .content {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 1px;
      line-height: 2;
      position: relative;
      text-transform: uppercase;
      gap: 6px;
      .iconfont {
        font-size: 12px;
        position: relative;
        z-index: 2;
        background: #f7f9f8;
      }
    }
    .date {
      color: hsla(0, 0%, 9%, 0.3);
      font-size: 10px;
    }
    &:not(:last-child):after {
      background-color: #181818;
      content: '';
      display: block;
      // height: 24px;
      bottom: -24px;
      left: 5.5px;
      position: absolute;
      top: 2px;
      width: 1px;
    }
  }
}
</style>
