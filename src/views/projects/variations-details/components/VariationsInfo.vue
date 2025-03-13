<template>
  <div class="info-content">
    <!-- 编辑弹窗 -->
    <AddVariations
      ref="editVariationsRef"
      :currentId="uuid"
      :project-detail="detail"
      :detailData="variationsInfo"
      @update="updateHandle"
    ></AddVariations>

    <div class="title-content">
      <div class="title">
        <i class="iconfont">&#xe73a;</i>
        <span>{{ t('变更请求详情') }}</span>
      </div>
      <a-button
        v-if="(variationsInfo.is_me && ['PENDING APPLY'].includes(variationsInfo.status_name)) || (variationsInfo.has_permission && ['PENDING SUBMIT'].includes(variationsInfo.status_name))"
        type="primary" size="small" shape="round" class="uppercase mb-2"
        @click="openEdit"
      >{{ t('编辑') }}</a-button>
    </div>

    <a-alert
      v-if="variationsInfo?.cancel_reason"
      :message="t('退回原因')"
      :description="variationsInfo?.cancel_reason"
      type="error"
      class="cancel-reason"
    />

    <a-row v-if="Object.keys(variationsInfo).length" :gutter="24" class="mt-5">
      <a-col :span="24" class="item-txt">
        <p class="name">{{ t('变更类型') }}</p>
        <p class="txt">{{ variationsInfo.type_name }}</p>
      </a-col>
      <a-col :span="6" class="item-txt">
        <p class="name">{{ t('变更开始日期') }}</p>
        <p class="txt">{{ variationsInfo.start_date ? tool.showDate(variationsInfo.start_date) : '--' }}</p>
      </a-col>
      <a-col :span="6" class="item-txt">
        <p class="name">{{ t('变更后结束日期') }}</p>
        <p v-if="variationsInfo.end_date" class="txt">{{ tool.showDate(variationsInfo.end_date) }}</p>
        <p v-else class="txt">{{ tool.showDate(detail?.date?.end_date) }}</p>
      </a-col>
      <a-col :span="6" class="item-txt">
        <p class="name">{{ t('变更金额') }}</p>
        <div v-if="Number(variationsInfo.amount)" class="txt-box">
          <i class="iconfont" v-if="[1,4].includes(Number(variationsInfo.type))" style="color: #eb4b6d;">&#xe712;</i>
          <i class="iconfont" v-else style="color: #31bd65;">&#xe711;</i>
          <vco-number
            :value="variationsInfo.amount"
            :color="numberColor"
            :precision="2"></vco-number>
        </div>
        <p v-else>--</p>
      </a-col>
      <a-col :span="6" class="item-txt">
        <p class="name">{{ t('变更后首次放款') }}</p>
        <vco-number :value="variationsInfo.initial_amount" :precision="2"></vco-number>
      </a-col>
      <template v-if="creditItemsData.length">
        <a-col v-for="item in creditItemsData" :span="6" class="item-txt">
          <p class="name">{{ item.credit_name }}</p>
          <p v-if="item.is_ratio" class="txt">{{ variationsInfo.credit[item.credit_table] }}%</p>
          <vco-number v-else :value=" variationsInfo.credit[item.credit_table]" :precision="2"></vco-number>
        </a-col>
      </template>
      <a-col :span="24" class="item-txt">
        <p class="name">{{ t('说明') }}</p>
        <p class="txt">{{ variationsInfo.note || '--' }}</p>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useI18n } from 'vue-i18n';
  import tool from '@/utils/tool';
  import AddVariations from '@/views/projects/variations/components/form/AddVariations.vue';

  const { t } = useI18n();

  const props = defineProps({
    uuid: {
      type: [String, Number],
      default: ''
    },
    id: {
      type: [String, Number],
      default: ''
    },
    detail: {
      type: Object,
      default: () => {}
    },
    creditItemsData: {
      type: Array,
      default: () => []
    }
  })

  const emits = defineEmits(['update'])

  const variationsInfo = computed(() => {
    return props.detail?.variationInfo || {}
  })

  const numberColor = computed(() => {
    let color = '282828'
    if (Number(variationsInfo.value.amount)) {
      if ([1,4].includes(Number(variationsInfo.value.type))) {
      color = '#eb4b6d'
      } else {
        color = '#31bd65'
      }
    }
    return color
  })

  const editVariationsRef = ref()
  const openEdit = () => {
    editVariationsRef.value.init()
  }

  const updateHandle = () => {
    emits('update')
  }
</script>

<style lang="less" scoped>
  .info-content {
    background-color: #fbfbfb;
    border: 1px solid #fbfbfb;
    border-radius: 10px;
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, .1);
    padding: 30px;
    > .title-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      > .title {
        display: flex;
        align-items: center;
        gap: 8px;
        > span {
          font-weight: 500;
          font-size: 14px;
        }
      }
    }
  }

  .item-txt {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
    > p {
      font-size: 13px;
      &.name {
        color: #999;
        margin-bottom: 3px;
      }
      &.txt {
        font-size: 18px;
        font-weight: 500;
        color: #181818;
      }
    }
    .txt-box {
      display: flex;
      align-items: center;
      gap: 2px;
    }
    :deep(.ant-statistic-content) {
      font-size: 18px !important;
      font-weight: 500 !important;
    }
  }

  .cancel-reason {
    padding: 10px !important;
    margin-bottom: 10px;
    margin-top: 10px;
    :deep(.ant-alert-description) {
      font-size: 12px !important;
    }
  }
</style>
