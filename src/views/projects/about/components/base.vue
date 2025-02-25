<template>
  <a-image v-if="detail?.base.project_image" :src="detail?.base.project_image" height="313.67px" width="100%" />
  <div class="base-card">
    <p class="id_async">
      <span>ID {{ detail?.base.project_apply_sn }}</span>

      <a-statistic-countdown :value="deadline" @finish="onFinish" format="mm:ss" v-if="Boolean(countdown)">
        <template #prefix>
          <span>{{ t('处理') }} (</span>
        </template>
        <template #suffix>
          <span>)</span>
        </template>
      </a-statistic-countdown>
      <a-spin :spinning="loading" v-else>
        <a-popconfirm :title="t('您确定要与 Xero 同步项目交易吗？')" okText="confirm" @confirm="update">
          <template #icon>
            <CheckCircleOutlined :style="{ color: '#a9ad57' }" />
          </template>
          <img :width="58" :height="14" :src="xeroImg" alt="Xero" />
        </a-popconfirm>
      </a-spin>
    </p>
    <p class="text-2xl name">{{ detail?.base.project_name }}</p>
    <p class="purpose">
      {{ detail?.base.project_about }}
    </p>
    <p class="fs_xs">{{ detail?.base.project_city }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import xeroImg from '@/assets/images/xero.png';
import zw from '@/assets/images/zw.jpg';
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import { syncBankBill } from '@/api/reconciliations';
import { message } from 'ant-design-vue';

const { t } = useI18n();
const props = defineProps(['detail']);

const loading = ref(false);
const deadline = ref();
const countdown = ref(false);

const update = (e) => {
  loading.value = true;
  syncBankBill()
    .then((res) => {
      message.success('Xero sync started!');
      deadline.value = Date.now() + 1000 * 60 * 10;
      countdown.value = true;
      localStorage.setItem('deadline', deadline.value);
    })
    .finally(() => {
      loading.value = false;
    });
};

const onFinish = () => {
  countdown.value = false;
};

onMounted(() => {
  if (localStorage.getItem('deadline') > Date.now()) {
    deadline.value = Number(localStorage.getItem('deadline'));
    countdown.value = true;
  }
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.base-card {
  padding: 30px;
  font-size: 14px;
  color: @color_grey;

  .id_async {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    > span {
      font-weight: 600;
      font-size: 12px;
      line-height: 1.45;
      letter-spacing: 1px;
    }
  }

  .name {
    font-weight: 500;
    line-height: 1.2;
    margin-bottom: 12px;
    color: @clr_charcoal;
  }

  .purpose {
    margin-bottom: 6px;
  }
}

:deep(.ant-statistic-content) {
  color: #888;
  font-size: 12px;
}
</style>
