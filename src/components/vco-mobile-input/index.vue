<template>
  <div class="voc-mobile-input">
    <a-form-item-rest>
      <a-dropdown v-model:open="openSelect" :trigger="['click']" :disabled="disabled" >
        <template #overlay>
          <a-menu>
            <div class="area-code-content">
              <div class="search-content">
                <a-input v-model:value="keywords" class="input-content" :placeholder="t('请输入国家名称或区号')" />
              </div>
              <div class="code-scroll">
                <div v-for="item in areaCodeDataRef" :key="item.name" class="code-item" @click="itemHandle(item)">
                  <p>{{ item.name }}</p>
                  <p>{{ item.showCode }}</p>
                </div>
              </div>
            </div>
          </a-menu>
        </template>
        <a-button class="area-code-btn">
          {{ areaCodeValue }}
          <DownOutlined />
        </a-button>
      </a-dropdown>

      <a-input v-model:value="mobileValue" :placeholder="t('请输入')" @input="inputHandle" :disabled="disabled" @blur="blurHandle" />
    </a-form-item-rest>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, watch } from "vue"
  import { DownOutlined } from '@ant-design/icons-vue';
  import { cloneDeep } from "lodash"
  import { countries } from "./config"
  import { useI18n } from "vue-i18n"

  const { t } = useI18n()

  const emits = defineEmits(['update:value', 'update:areaCode']);

  const props = defineProps({
    value: {
      type: String,
      default: ''
    },
    areaCode: {
      type: [Number, String],
      default: 64
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

  const openSelect = ref(false)
  const keywords = ref('')
  const areaCodeValue = ref('')
  const mobileValue = ref('')

  const countriesData = cloneDeep(countries)
  const areaCodeData = countriesData.map(item => {
    return {
      ...item,
      showCode: `+${item.dialCode}`
    }
  })

  const areaCodeDataRef = computed(() => {
    const data = areaCodeData.filter(item => {
      const key = keywords.value.toLowerCase()
      const name = item.name.toLowerCase()
      const dialCode = String(item.dialCode)
      if (isNaN(key)) {
        return name.indexOf(key) > -1
      } else {
        return dialCode === key
      }
    })

    return keywords.value ? data : areaCodeData
  })

  const itemHandle = (data) => {
    areaCodeValue.value = data.showCode
    emits('update:areaCode', String(data.dialCode))
    openSelect.value = false
  }

  const inputHandle = () => {
    emits('update:value', mobileValue.value)
  }

  const blurHandle = () => {
    if (props.formRef && props.validateField) {
      props.formRef.validateFields(props.validateField);
    }
  }

  const placeholderTxt = computed(() => {
    let res = ''
    if (areaCodeValue.value) {
      const obj = areaCodeData.find(item => item.showCode === areaCodeValue.value)
      if (obj) {
        res = obj.phoneFormat
      }
    }
    return res
  })

  const dataInit = () => {
    areaCodeValue.value = props.areaCode ? `+${props.areaCode}` : '+64'
    mobileValue.value = props.value || ''

    const areaCode = props.areaCode || '64'
    emits('update:areaCode', areaCode)
  }

  watch(
    () => props.value,
    (val) => {
      if (val) {
        dataInit()
      }
    },
    {
      immediate: true
    }
  )
  
  onMounted(() => {
    dataInit()
  })
</script>

<style lang="less" scoped>
  @import "@/styles/variables.less";

  .voc-mobile-input {
    display: flex;
    align-items: center;
    gap: 10px;
    .area-code-btn {
      width: 90px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    :deep(.ant-input) {
      flex: 1;
    }
  }
  .search-content {
    padding: 0 15px;
    padding-top: 15px;
  }
  .area-code-content {
    width: 290px;
    height: 240px;
    .input-content {
      margin-bottom: 15px;
      border-color: rgba(39, 39, 39, 1) !important;
      &:focus {
        border-color: @colorPrimary !important;
      }
    }
    .code-scroll {
      height: 170px;
      overflow-x: hidden;
      overflow-y: scroll;
    }
    .code-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 34px;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 5px 15px;
      gap: 5px;
      &:hover {
        background-color: rgba(0, 0, 0, .07);
      }
      > p {
        font-size: 13px;
        word-break: break-all;
        &:first-child {
          flex: 1;
        }
      }
    }
  }
</style>
