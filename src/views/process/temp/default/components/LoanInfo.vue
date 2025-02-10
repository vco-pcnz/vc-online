<template>
  <div>
    <a-row :gutter="24">
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('借款金额') }}</p>
          <p class="txt">
            <vco-number :value="data.loan_money" :precision="2" :end="true"></vco-number>
          </p>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('借款目的') }}</p>
          <p class="txt">{{ data.loan_type_name }}</p>
        </div>
      </a-col>
      <a-col :span="12">
        <div class="info-content">
          <p class="name">{{ t('借款起止日期') }}</p>
          <p class="txt">{{ tool.showDate(data.start_date) + ' - ' + tool.showDate(data.end_date) }}</p>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="info-content">
          <p class="name">{{ t('借款周期') }}</p>
          <p class="txt">{{ showTerm }}</p>
        </div>
      </a-col>
      <a-col :span="6">
        <div class="info-content">
          <p class="name">{{ t('总天数') }}</p>
          <p class="txt">{{ totalDay }}</p>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
  import { computed } from "vue";
  import { useI18n } from "vue-i18n";
  import tool from "@/utils/tool"

  const props = defineProps({
    data: {
      type: Object,
      default: () => {}
    }
  })

  const { t } = useI18n();

  const showTerm = computed(() => {
    const data = tool.calculateDurationPrecise(props.data.start_date, props.data.end_date)
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

  const totalDay = computed(() => {
    const data = tool.calculateDurationPrecise(props.data.start_date, props.data.end_date)
    const days = data.gapDay || 0
    return `${days} ${t('天')}`
  })
</script>

<style lang="less" scoped>
  @import './style.less';
</style>