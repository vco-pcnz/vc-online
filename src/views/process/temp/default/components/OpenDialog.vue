<template>
  <a-modal
    :open="visible"
    :title="t('项目Open')"
    :width="460"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <div class="sys-form-content mt-5">
      <a-row :gutter="24">
        <a-col :span="24">
          <div class="info-content">
            <p class="name mb-2">{{ t('开放日期') }}</p>
            <a-date-picker v-model:value="openDate" :disabledDate="disabledDate" placeholder="" @change="openDateChange" />
          </div>
        </a-col>
        <a-col :span="12" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('借款起止日期') }}</p>
            <p class="txt">{{ tool.showDate(startDate) + ' - ' + tool.showDate(endDate) }}</p>
          </div>
        </a-col>
        <a-col :span="12" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('借款周期') }}</p>
            <p class="txt">{{ showTerm }}</p>
          </div>
        </a-col>
      </a-row>
    </div>

    <div class="mt-5 flex justify-between gap-5">
      <a-button
        type="grey" class="big shadow bold uppercase w-full mb-5 mt-5"
        @click="updateVisible(false)"
      >{{ t('取消') }}</a-button>

      <a-button
        type="dark" class="big shadow bold uppercase w-full mb-5 mt-5"
        :loading="subLoading"
        @click="submitHandle"
      >{{ t('确定') }}</a-button>
      
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import tool from "@/utils/tool"
  import dayjs from "dayjs";
  import { message } from 'ant-design-vue';
  import {
    projectAuditSaveMode,
    projectAuditSaveStep
  } from "@/api/process";

  const emits = defineEmits(['update:visible', 'done'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    uuid: {
      type: String,
      default: ''
    },
    infoData: {
      type: Object,
      default: () => {}
    },
    blockInfo: {
      type: Object,
      default: () => {}
    }
  });

  const { t } = useI18n();

  const changeLoading = (flag) => {
    subLoading.value = flag
  }

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const openDate = ref('')
  const startDate = ref('')
  const endDate = ref('')

  const subLoading = ref(false)
  const submitHandle = async () => {
    if (!openDate.value) {
      message.error(t('请选择') + t('开放日期'))
    } else {
      changeLoading(true)

      const loadParams = {
        start_date: startDate.value,
        end_date: endDate.value,
        uuid: props.uuid,
        code: props.blockInfo.loan.code,
        do__open: 1
      }

      await projectAuditSaveMode(loadParams).then(() => {
        const params = {
          uuid: props.uuid
        }

        projectAuditSaveStep(params).then((res) => {
          changeLoading(false)
          
          emits('done')
        }).catch(() => {
          changeLoading(false)
        })
      }).catch(() => {
        changeLoading(false)
      })
    }
  }

  const disabledDate = (currentDate) => {
    return currentDate && currentDate.valueOf() > Date.now();
  };
  

  const openDateChange = (date) => {
    if (date) {
      const {start_date, end_date} = props.infoData
      const calcDay = tool.calculateDurationPrecise(start_date, end_date)

      const months = calcDay.months
      const days = calcDay.days

      if (months || days) {
        let statrDate = dayjs(date)
        const endDateStr = tool.calculateEndDate(statrDate, months, days)
        
        startDate.value = dayjs(date).format('YYYY-MM-DD')
        endDate.value = endDateStr
      }
    }
  }
  
  const showTerm = computed(() => {
    const data = tool.calculateDurationPrecise(startDate.value, endDate.value)
    if (data.months && data.days) {
      return `${data.months} ${t('月')} ${data.days} ${t('天')}`
    }

    if (data.months && !data.days) {
      return `${data.months} ${t('月')}`
    }

    if (!data.months && data.days) {
      return `${data.days} ${t('天')}`
    }
    
    return '--'
  })

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        subLoading.value = false;
        openDate.value = ''
      } else {
        startDate.value = props.infoData.start_date
        endDate.value = props.infoData.end_date
      }
    }
  )
</script>

<style lang="less" scoped>
  .info-content {
    margin-top: 10px;
    .name {
      font-size: 12px;
      color: #666;
    }
    .txt {
      font-size: 13px;
      font-weight: 500;
      :deep(.ant-statistic-content) {
        font-size: 16px !important;
      }
    }
  }
</style>