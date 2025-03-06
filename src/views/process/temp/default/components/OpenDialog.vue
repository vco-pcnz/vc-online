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
            <a-date-picker v-model:value="openDate" :format="selectDateFormat()" :disabledDate="disabledDate" placeholder="" @change="openDateChange" />
          </div>
        </a-col>
        <a-col :span="10" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('借款起止日期') }}</p>
            <p class="txt">{{ tool.showDate(startDate) + ' - ' + tool.showDate(endDate) }}</p>
          </div>
        </a-col>
        <a-col :span="8" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('借款周期') }}</p>
            <p class="txt">{{ showTerm }}</p>
          </div>
        </a-col>
        <a-col :span="6" class="mt-2">
          <div class="info-content">
            <p class="name">{{ t('总天数') }}</p>
            <p class="txt">{{ showTotalDay }}</p>
          </div>
        </a-col>
        <a-col v-if="fonfirmTable.length" :span="24" class="mt-4">
          <p style="font-size: 12px; color: #666;" class="mb-2">{{ t('请确认以下信息') }}</p>
          <div class="confirm-content">
            <div v-for="item in fonfirmTable" :key="item.credit_table" class="item">
              <div>
                <p>{{ item.credit_name }}</p>
                <p v-if="item.is_ratio">{{ item.showVal }}{{ item.credit_unit }}</p>
                <p v-else>{{ item.credit_unit }}{{ item.showVal }}</p>
              </div>
              <a-checkbox v-model:checked="confirmForm[item.credit_table]">{{ t('正确') }}</a-checkbox>
            </div>
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
        :disabled="subDisabled"
        @click="submitHandle"
      >{{ t('确定') }}</a-button>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import tool, { selectDateFormat } from "@/utils/tool"
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
    lendingInfo: {
      type: Object,
      default: () => {}
    },
    openConfig: {
      type: Object,
      default: () => {}
    },
    blockInfo: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: ''
    }
  });

  const { t } = useI18n();

  const changeLoading = (flag) => {
    subLoading.value = flag
  }

  const subDisabled = computed(() => {
    if (fonfirmTable.value.length) {
      return !Boolean(Object.values(confirmForm.value).every(item => item)) || !openDate.value
    } else {
      return !openDate.value
    }
  })

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const openDate = ref('')
  const startDate = ref('')
  const endDate = ref('')

  const subLoading = ref(false)
  const submitRquest = () => {
    const params = {
      uuid: props.uuid,
      do__mark: props.type
    }

    projectAuditSaveStep(params).then((res) => {
      changeLoading(false)
      
      emits('done')
    }).catch(() => {
      changeLoading(false)
    })
  }
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

      const isRefinancial = props.lendingInfo?.data?.substitution_ids && props.lendingInfo?.data?.substitution_ids.length

      if (props.infoData.start_date !== startDate.value || Boolean(isRefinancial)) {
        await projectAuditSaveMode(loadParams).then(() => {
          submitRquest()
        }).catch(() => {
          changeLoading(false)
        })
      } else {
        submitRquest()
      }
    }
  }

  const disabledDate = (currentDate) => {
    return currentDate && currentDate.valueOf() > Date.now();
  };
  

  const openDateChange = (date) => {
    if (date) {
      const {start_date, end_date} = props.infoData
      const calcDay = tool.calculateDurationPrecise(start_date, end_date)
      const gapDay = calcDay.gapDay

      if (gapDay) {
        let statrDate = dayjs(date)
        const endDateStr = tool.calculateEndDateByDays(statrDate, gapDay)
        
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

  const showTotalDay = computed(() => {
    const data = tool.calculateDurationPrecise(startDate.value, endDate.value)
    return data.gapDay || 0
  })

  const confirmForm = ref({})
  const fonfirmTable = ref([])

  const configInit = () => {
    const fees = props.openConfig.fee || []
    const {data, table} = props.lendingInfo
    if (fees && fees.length) {
      for (let i = 0; i < fees.length; i++) {
        confirmForm.value[fees[i]] = false

        const obj = table.find(item => item.credit_table === fees[i])
        if (obj) {
          obj.showVal = data[fees[i]]
        }
        fonfirmTable.value.push(obj)
      }
    }
  }

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        subLoading.value = false;
        openDate.value = ''
        confirmForm.value = {}
        fonfirmTable.value = []
      } else {
        // openDate.value = dayjs(props.infoData.start_date)

        startDate.value = props.infoData.start_date
        endDate.value = props.infoData.end_date

        configInit()
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

  .confirm-content {
    border: 1px solid #272727 !important;
    border-radius: 10px !important;
    background-color: #f7f9f8;
    padding: 10px 15px;
    > .item {
      border-bottom: 1px dashed #ddd;
      padding: 5px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      &:last-child {
        border-bottom: none;
      }
      > div {
        > p {
          color: #666;
          font-size: 12px;
          &:last-child {
            font-size: 13px;
            font-weight: 500;
            color: #272727;
          }
        }
      }
      
    }
  }
</style>