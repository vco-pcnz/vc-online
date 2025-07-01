<template>
  <div>
    <vco-page-nav sup-path="/reconciliations" ref="pageNavRef">
      <template #action>
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
const { t } = useI18n();

const emits = defineEmits(['update']);

const loading = ref(false);
const deadline = ref();
const countdown = ref(false);

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
      deadline.value = Date.now() + res.time * 1000;
      countdown.value = true;

      if (res.time > 0) {
        localStorage.setItem('deadline', deadline.value);
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const onFinish = () => {
  countdown.value = false;
  emits('update');
};
// 暴露方法给父组件
defineExpose({
  setNum
});

onMounted(() => {
  if (localStorage.getItem('deadline') > Date.now()) {
    deadline.value = Number(localStorage.getItem('deadline'));
    countdown.value = true;
  }
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
