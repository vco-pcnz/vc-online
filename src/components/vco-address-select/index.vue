<template>
  <div class="address-select-content">
    <a-form-item-rest>
      <div class="item">
        <a-select
          v-model:value="province"
          show-search
          :options="provinceData"
          :filter-option="customFilter"
          :field-names="{ label: 'name', value: 'id' }"
          :placeholder="t('省/州/邦')"
          @change="(val) => handleChange(1, val)"
        ></a-select>
      </div>
      <div v-if="cityData.length" class="item">
        <a-select
          v-model:value="city"
          show-search
          :options="cityData"
          :filter-option="customFilter"
          :field-names="{ label: 'name', value: 'id' }"
          :placeholder="t('市')"
          @change="(val) => handleChange(2, val)"
        ></a-select>
      </div>
      <div v-if="regionData.length" class="item">
        <a-select
          v-model:value="region"
          show-search
          :options="regionData"
          :filter-option="customFilter"
          :field-names="{ label: 'name', value: 'id' }"
          :placeholder="t('区/县')"
          @change="() => handleChange(0)"
        ></a-select>
      </div>
    </a-form-item-rest>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from "vue"
  import { useI18n } from "vue-i18n";
  import { systemCity } from "@/api/system"

  const emits = defineEmits(['update:value']);

  const props = defineProps({
    value: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    formRef: {
      type: Object,
      default: undefined
    },
    validateField: {
      type: String,
      default: ''
    }
  })

  const { t } = useI18n();

  const province = ref(undefined)
  const city = ref(undefined)
  const region = ref(undefined)

  const provinceData = ref([])
  const cityData = ref([])
  const regionData = ref([])

  const customFilter = (input, option) => {
    // 根据自定义字段名 'name' 进行筛选
    return option.name.toLowerCase().includes(input.toLowerCase())
  }

  const handleChange = (type, value) => {
    if (Boolean(type)) {
      if (type === 1) {
        city.value = undefined
        region.value = undefined
        cityData.value = []
        regionData.value = []
      }
      if (type === 2) {
        region.value = undefined
      }
      getData(type, value)
    }

    const data = [province.value, city.value, region.value]
    const res = data.filter(item => item).join(',')

    emits('update:value', res)

    if (props.formRef && props.validateField) {
      props.formRef.validateFields(props.validateField);
    }
  }

  const getData = (type = 0, pid = 0) => {
    const params = pid ? {pid: pid} : {}
    systemCity(params).then(res => {
      if (type === 0) {
        provinceData.value = res
      }
      if (type === 1) {
        cityData.value = res
      }
      if (type === 2) {
        regionData.value = res
      }
    })
  }

  const notInit = ref(true)

  const pageInit = () => {
    const arr = props.value.split(',')
    province.value = Number(arr[0])
    getData(1, Number(arr[0]))
    if (arr[1]) {
      getData(2, arr[1])
    }

    city.value = arr[1] ? Number(arr[1]) : undefined
    region.value = arr[2] ? Number(arr[2]) : undefined
  }

  watch(
    () => props.value,
    (val) => {
      if (val && notInit.value) {
        notInit.value = false
        pageInit()
      }
    },
    {
      immediate: true
    }
  )

  onMounted(() => {
    getData()
    if (props.value) {
      pageInit()
    }
  })
</script>

<style lang="less" scoped>
  .address-select-content {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    > .item {
      flex: 1;
    }
  }
</style>