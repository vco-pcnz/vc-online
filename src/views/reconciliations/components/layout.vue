<template>
  <div>
    <vco-page-nav sup-path="/reconciliations" ref="pageNavRef">
      <template #action>
        <div v-if="res_xero_update_time">{{ t('数据更新时间') }}：{{ tool.showTime(res_xero_update_time) }}</div>
        <img :width="58" :height="14" :src="xeroImg" alt="Xero" />
        <a-statistic-countdown :value="deadline" @finish="onFinish" format="mm:ss" v-if="Boolean(countdown)">
          <template #prefix>
            <span>{{ t('处理') }} (</span>
          </template>
          <template #suffix>
            <span>)</span>
          </template>
        </a-statistic-countdown>
        <a-spin :spinning="loading">
          <a-popconfirm :title="t('您确定要与 Xero 同步项目交易吗？')" okText="confirm" v-if="Boolean(!countdown)" @confirm="update">
            <template #icon>
              <CheckCircleOutlined :style="{ color: '#a9ad57' }" />
            </template>
            <a-button class="sync-btn">
              <template #icon>
                <i class="iconfont">&#xe749;</i>
              </template>
            </a-button>
          </a-popconfirm>
        </a-spin>
      </template>
    </vco-page-nav>
    <div class="page-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref, onMounted } from 'vue';
import xeroImg from '@/assets/images/services-xero.png';
import { syncBankBill } from '@/api/reconciliations';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import { systemConfigData } from '@/api/system';
import tool from '@/utils/tool';
import dayjs from 'dayjs';
const { t } = useI18n();

const emits = defineEmits(['update']);

const loading = ref(false);
const deadline = ref();
const countdown = ref(false);
const xero_update_time = ref(0);
const res_xero_update_time = ref(null);

const pageNavRef = ref();

const setNum = (num) => {
  nextTick((_) => {
    pageNavRef.value.setNum(num);
  });
};

const update = (e) => {
  loading.value = true;
  syncBankBill()
    .then((res) => {
      message.success('Xero sync started!');
      deadline.value = Date.now() + xero_update_time.value * 1000;
      countdown.value = true;

      if (xero_update_time.value > 0) {
        localStorage.setItem('deadline', deadline.value);
      }
      localStorage.setItem('res_xero_update_time', dayjs().format('YYYY-MM-DD HH:mm:ss'));
      updateResTime();
    })
    .finally(() => {
      loading.value = false;
    });
};

const onFinish = () => {
  countdown.value = false;
  emits('update');
};

const updateResTime = () => {
  res_xero_update_time.value = localStorage.getItem('res_xero_update_time') || null;
};

// 暴露方法给父组件
defineExpose({
  setNum,
  updateResTime
});

onMounted(() => {
  if (localStorage.getItem('deadline') > Date.now()) {
    deadline.value = Number(localStorage.getItem('deadline'));
    countdown.value = true;
  }

  updateResTime();
  systemConfigData({ pcode: 'web_config', code: 'xero_update' }).then((res) => {
    if (res.xero_update) {
      xero_update_time.value = res.xero_update;
    }
  });
});
</script>

<style scoped lang="less">
.sync-btn {
  border: none;
  background-color: transparent;
}

.page-content {
  margin-top: 36px;
  min-height: 100%;
  padding: 24px 28px;
  background-color: #f0f0f0;
  border: 1px solid #e2e5e2;
  border-radius: 12px;
}

:deep(.ant-statistic-content) {
  color: #888;
  font-size: 12px;
}
</style>
