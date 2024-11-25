<template>
  <div class="voc-mobile-input">
    <a-dropdown :trigger="['click']">
      <template #overlay>
        <a-menu>
          <div class="area-code-content">
            <a-input v-model:value="keywords" class="input-content" placeholder="请输入国家名称或区号" />
            <div class="code-scroll">
              <div v-for="item in areaCodeDataRef" :key="item.name" class="code-item">
                <p>{{ item.name }}</p>
                <p>{{ item.code }}</p>
              </div>
            </div>
          </div>
        </a-menu>
      </template>
      <a-button>
        Button
        <DownOutlined />
      </a-button>
    </a-dropdown>

    <a-input v-model:value="mobileValue" :placeholder="placeholderTxt" />
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from "vue"
  import { DownOutlined } from '@ant-design/icons-vue';
  import { cloneDeep } from "lodash"
  import { countries } from "./config"

  const props = defineProps({
    modelValue: {
      type: String,
      default: ''
    },
    areaCode: {
      type: [Number, String],
      default: 64
    }
  })

  const keywords = ref('')
  const areaCodeValue = ref('')
  const mobileValue = ref('')

  const countriesData = cloneDeep(countries)
  const areaCodeData = countriesData.map(item => {
    return {
      ...item,
      code: `+${item.dialCode}`
    }
  })

  const areaCodeDataRef = computed(() => {
    const data = countries.filter(item => {
      const key = keywords.value.toLowerCase()
      const name = item.name.toLowerCase()
      const dialCode = String(item.dialCode)
      if (isNaN(key)) {
        return name.indexOf(key) > -1
      } else {
        return dialCode === key
      }
    })

    console.log('data', data)

    return keywords.value ? data : areaCodeData
  })

  const placeholderTxt = computed(() => {
    let res = ''
    if (areaCodeValue.value) {
      console.timeLog('areaCodeValue.value', areaCodeValue.value)
      const obj = areaCodeData.find(item => item.code === areaCodeValue.value)
      if (obj) {
        res = obj.phoneFormat
      }
    }
    return res
  })

  const areaCodeChange = () => {

  }

  onMounted(() => {
    areaCodeValue.value = props.areaCode ? `+${props.areaCode}` : '+64'
    mobileValue.value = props.modelValue || ''
  })
</script>

<style lang="less" scoped>
  @import "@/styles/variables.less";

  .voc-mobile-input {
    display: flex;
    align-items: center;
    gap: 10px;
    :deep(.ant-select) {
      width: 100px;
      .ant-select-selection-item {
        text-align: center;
      }
    }
    :deep(.ant-input) {
      flex: 1;
    }
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
      height: 180px;
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
