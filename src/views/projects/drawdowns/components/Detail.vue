<template>
  <div class="color_grey fs_2xs text-center py-3 text-uppercase uppercase" style="letter-spacing: 1px">Details</div>

  <div class="detail">
    <div class="title">Lending manager review<i class="iconfont mrl-2">&#xe774;</i></div>
    <div class="my-3">
      <div class="bold fs_xl">{{ detail?.name }}</div>
      <div class="color_grey fs_2xs">{{ detail?.note }}</div>
    </div>
    <!-- <div class="flex items-center"><i class="iconfont mr-2">&#xe774;</i><span class="weight_demiBold">Documents & photos</span></div>
      <p class="color_grey mt-1 mb-3">1 file had been provided: drawdown notice</p> -->
    <a-button type="brown" shape="round" size="small" @click="navigationTo('/projects/documents?uuid=' + uuid+'&annex_id='+detail?.annex_id)">{{ t('查看文件') }}</a-button>
    <div class="flex items-center box frist mt-5">
      <i class="iconfont left-icon mr-3">&#xe78d;</i>
      <div>
        <div class="flex">
          <template v-if="detail?.forecast">
            <vco-number color="#7dc1c1" :value="detail?.forecast.amount" :precision="2" :bold="true" size="fs_2xl"></vco-number>
            <span class="unit">nzd</span>
          </template>
          <template v-else>
            <p class="fs_2xl bold">without reference</p>
          </template>

          <a-dropdown class="Filter" trigger="click" v-model:open="visible">
            <i class="iconfont dropdown-icon">&#xe778;</i>
            <template #overlay>
              <a-spin :spinning="loading" size="large">
                <ul class="list">
                  <li class="list-item" v-for="item in forecastList" :key="item" @click="chooseforecast(item)">
                    <div>
                      {{ item.name }} <span class="ml-3">{{ tool.showDate(item.date) }}</span>
                    </div>

                    <vco-number color="#7dc1c1" :value="item.amount" :precision="2" :bold="true" size="fs_md"></vco-number>
                  </li>
                  <li class="list-item" @click="chooseforecast({id:0})">without reference</li>
                </ul>
              </a-spin>
            </template>
          </a-dropdown>
        </div>
        <template v-if="detail?.forecast">
          <p class="bold color_grey fs_2xs">Estimated amount, {{ tool.showDate(detail?.forecast.date) }}</p>
        </template>
        <template v-else>
          <p class="bold color_grey fs_2xs">No forecast for thls drawdown</p>
        </template>
      </div>
    </div>
    <div class="flex items-center box mt-2">
      <i class="iconfont left-icon mr-3">&#xe755;</i>
      <div>
        <div class="flex">
          <vco-number :value="detail?.amount" :precision="2" :bold="true" size="fs_2xl"></vco-number>
          <span class="unit">nzd</span>
          <DrawdownAmount :uuid="uuid" :detail="detail" @change="update"><i class="iconfont edit">&#xe8cf;</i></DrawdownAmount>
        </div>
        <p class="bold color_grey fs_2xs">Requested amount: {{ tool.formatMoney(detail?.amount) }}</p>
      </div>
    </div>
    <div class="flex justify-center mt-3">
      <a-button type="dark" class="big uppercase" :loading="accept_loading"> Accept documents </a-button>
    </div>
    <p class="text-center color_grey fs_xs my-3">You can decline the drawdown request by clicking the button below.</p>
    <div class="flex justify-center">
      <a-popconfirm title="Are you sure you want to decline the request?" okText="decline">
        <template #icon>
          <CheckCircleOutlined :style="{ color: '#a9ad57' }" />
        </template>
        <a-button type="danger" size="small" shape="round" :loading="decline_loading">decline request</a-button>
      </a-popconfirm>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import {navigationTo} from '@/utils/tool';
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import DrawdownAmount from './form/DrawdownAmount.vue';
import { forecastDarwdown, loanDsel } from '@/api/project/loan';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  uuid: {
    type: String
  },
  detail: {
    type: Object
  }
});
const loading = ref(false);
const accept_loading = ref(false);
const decline_loading = ref(false);
const visible = ref(false);
const forecastList = ref();

const loadData = () => {
  loading.value = true;
  forecastDarwdown({ uuid: props.uuid })
    .then((res) => {
      forecastList.value = res;
    })
    .finally((_) => {
      loading.value = false;
    });
};

// lm选择darwdown
const chooseforecast = (val) => {
  loanDsel({ uuid: props.uuid, id: props.detail?.id, forecast_id: val.id }).then((res) => {
    update();
    loadData();
  });
};

const update = () => {
  emits('update');
};

onMounted(() => {
  loadData();
});
watch(
  () => props.detail,
  (val) => {
    if (val) {
    }
  }
);
// 暴露方法给父组件
defineExpose({
  loadData
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.detail {
  border: 1px solid #e2e5e2;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);
  border-radius: 12px;
  padding: 30px;

  .title {
    background-color: #b4f1db;
    color: #272727;
    border-radius: 37.4px;
    display: inline-flex;
    font-size: 14px;
    font-weight: 500;
    gap: 6.8px;
    letter-spacing: 1px;
    padding: 10.2px 20.4px;
    text-transform: uppercase;
    white-space: nowrap;
    .iconfont {
      font-size: 14px;
      color: #272727;
    }
  }

  .box {
    .left-icon {
      font-size: 30px;
    }
    &.frist {
      color: #7dc1c1;
    }
    .unit {
      font-size: 20px;
      margin-left: 10px;
    }

    .edit {
      color: #d8b480;
      font-size: 16px;
      cursor: pointer;
      font-weight: bold;
      position: relative;
      right: -5px;
      top: 3px;
    }

    .dropdown-icon {
      cursor: pointer;
      font-size: 8px;
      position: relative;
      right: -6px;
      top: 10px;
    }
  }
}

.list {
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  background: #fff;
  padding: 20px 0;

  max-height: 380px;
  overflow-y: auto;
  padding-bottom: 8px;
  padding-top: 8px;
  .list-item {
    display: flex;
    line-height: 1.5;
    transition: background-color 0.1s cubic-bezier(0.215, 0.61, 0.355, 1);
    align-items: center;
    gap: 20px;
    justify-content: space-between;
    padding: 8px 20px;
    cursor: pointer;
    &:hover {
      background-color: rgba(227, 235, 235, 0.4);
    }
  }
}
</style>
