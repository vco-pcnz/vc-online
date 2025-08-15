<template>
  <div class="base-info-content">
    <div v-if="detail?.base?.substitution && detail?.base?.substitution.length" class="refinance">{{ t('再融资') }}</div>
    <div class="refinance" v-if="detail?.base?.is_substitution" style="background-color: #d5d5d5">{{ t('被再融资') }}</div>

    <a-image v-if="detail?.base.project_image" :src="detail?.base.project_image" height="313.67px" width="100%" />
    <div class="base-card">
      <p class="id_async">
        <span style="color: #181818;">ID {{ detail?.base.project_apply_sn }}</span>
        <template v-if="!variations && !detail?.base?.ptRole">
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
              <img :width="58" :height="14" class="cursor-pointer" :src="xeroImg" alt="Xero" />
            </a-popconfirm>
          </a-spin>
        </template>
      </p>
      <p class="mt-3">{{ t('借款人') }}</p>
      <p style="color: #181818;">{{ detail?.base.borrower_user_name }}</p>
      
      <template v-if="variations && !hideTime">
        <p class="mt-3">{{ t('借款周期') }}</p>
        <p style="color: #181818;">{{ tool.showDate(detail?.date?.start_date) + ' - ' + tool.showDate(detail?.date?.end_date) }}</p>
      </template>

      <p class="text-2xl name mt-5">{{ detail?.base.project_name || detail?.base.borrower_user_name }}</p>
      <template v-if="detail?.base?.project_address_other">
        <template v-for="(item, index) in detail?.base?.project_address_other" :key="index">
          <p class="fs_xs mt-2" v-if="moreAddr ? true : index < 1">{{ item.project_city }}</p>
        </template>
        <a-button type="grey" style="transform: scale(0.8); margin-left: -13px" size="small" v-if="detail?.base?.project_address_other.length > 1" @click="moreAddr = !moreAddr">
          {{ moreAddr ? t('收起') : t('更多地址') }}
        </a-button>
      </template>
      <template v-else>
        <p class="fs_xs mt-2">{{ detail?.base?.project_city }}</p>
      </template>

      <p class="purpose mt-3">
        <template v-if="detail && detail?.base.project_about.length > 100 && !isExpand"> {{ detail?.base.project_about.substring(0, 100) }}... </template>
        <template v-else>
          {{ detail?.base.project_about }}
        </template>
        <template v-if="detail && detail?.base.project_about.length > 100">
          <a-button type="grey" style="transform: scale(0.8)" size="small" v-if="!isExpand" @click="isExpand = !isExpand">{{ t('展开') }}</a-button>
          <a-button type="grey" style="transform: scale(0.8)" size="small" v-if="isExpand" @click="isExpand = !isExpand">{{ t('收起') }}</a-button>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import xeroImg from '@/assets/images/xero.png';
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import { syncProjectBill } from '@/api/project/project';
import { message } from 'ant-design-vue';
import { systemConfigData } from '@/api/system';
import tool from '@/utils/tool';

const { t } = useI18n();

const props = defineProps({
  detail: {
    type: Object,
    default: () => {}
  },
  variations: {
    type: Boolean,
    default: false
  },
  currentId: {
    type: String
  },
  hideTime: {
    type: Boolean,
    default: false
  }
});

const moreAddr = ref(false);
const isExpand = ref(false);
const loading = ref(false);
const deadline = ref();
const countdown = ref(false);
const xero_update_time = ref(0);

const update = (e) => {
  loading.value = true;
  syncProjectBill({ uuid: props.currentId })
    .then((res) => {
      message.success('Xero sync started!');
      deadline.value = Date.now() + xero_update_time.value * 1000;
      countdown.value = true;
      if (xero_update_time.value > 0) {
        localStorage.setItem(
          'aboutDeadline',
          JSON.stringify({
            uuid: props.currentId,
            time: deadline.value
          })
        );
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

const onFinish = () => {
  countdown.value = false;
};

watch(
  () => props.currentId,
  (val) => {
    if (val && !props.variations) {
      let aboutDeadline = localStorage.getItem('aboutDeadline') ? JSON.parse(localStorage.getItem('aboutDeadline')) : null;
      if (aboutDeadline && aboutDeadline.uuid == props.currentId && aboutDeadline.time > Date.now()) {
        deadline.value = Number(aboutDeadline.time);
        countdown.value = true;
      }
      systemConfigData({ pcode: 'project_config', code: 'xero_update' }).then((res) => {
        if (res.xero_update) {
          xero_update_time.value = res.xero_update;
        }
      });
    }
  },
  { immediate: true, deep: true }
);
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
}

:deep(.ant-statistic-content) {
  color: #888;
  font-size: 12px;
}

.base-info-content {
  position: relative;
  overflow: hidden;
  > .refinance {
    position: absolute;
    z-index: 99;
    background-color: @colorPrimary;
    width: 100%;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: rotate(-45deg);
    left: -38%;
    top: 4%;
  }
}
</style>
