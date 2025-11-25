<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div class="drawdown-content">
        <div class="drawdown-item" v-for="item in showDrowndownData" :key="item.type_name">
          <div class="info">
            <p class="font-bold">{{ `No.${item.term}` }}</p>
            <vco-number :value="Number(item.amount || 0)" size="fs_xl" :precision="2" :end="true" color="#eb4b6d" :bold="true"></vco-number>
          </div>
          <div class="name">{{ item.type_name }}</div>
        </div>
      </div>
      <div class="flex justify-between items-center mt-5">
        <div>
          <p class="font-bold">Total</p>
          <vco-number :value="totalNumber" size="fs_xl" :precision="2" :end="true" color="#eb4b6d" :bold="true"></vco-number>
        </div>
        <a-button type="dark" class="big shadow bold uppercase"
          @click="doneHandle"
        >{{ t('确定') }}</a-button>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router"
import { projectGetBuild, projectLoanGetBuild } from "@/api/process"
import { cloneDeep } from "lodash"
import tool from "@/utils/tool"

const props = defineProps({
  stepNumber: {
    type: Number,
    default: 0
  },
  logDate: {
    type: String,
    default: ''
  }
})

const emits = defineEmits(['done'])

const { t } = useI18n();
const route = useRoute();

const uuid = ref('')
const isRequests = ref(false)
const pageLoading = ref(false)

const bocSplitData = ref([])

const showDrowndownData = computed(() => {
  const data = cloneDeep(bocSplitData.value)
  return data.filter(item => item.term === props.stepNumber)
})

const totalNumber = computed(() => {
  return showDrowndownData.value.reduce((total, item) => {
    return Number(tool.plus(total, Number(item.amount)))
  }, 0);
})

const getSetedData = () => {
  pageLoading.value = true
  const params = {
    uuid: uuid.value
  }

  try {
    if (props.logDate) {
      params.log__time = props.logDate
    }

    const ajaxFn = isRequests.value ? projectGetBuild : projectLoanGetBuild
    ajaxFn(params).then(res => {
      const progress = cloneDeep(res.progress || {})
      const arr = []
      for (const key in progress) {
        const item = progress[key]
        const bocObj = item.find(_item => _item.source)
        arr.push(bocObj)
      }
      bocSplitData.value = arr
      pageLoading.value = false
    })
  } catch (err) {
    pageLoading.value = false
  }
}

const doneHandle = () => {
  emits('done')
}

onMounted(() => {
  const { query, path } = route
  if (['/requests/progress-payment'].includes(path) || path.indexOf('/process') > -1) {
    isRequests.value = true
  } else {
    isRequests.value = false
  }
  uuid.value = query.uuid
  if (uuid.value) {
    getSetedData()
  }
})
</script>

<style lang="less" scoped>
  .drawdown-content {
    min-height: 300px;
    overflow: hidden;
    > .drawdown-item {
      float: left;
      width: 47.5%;
      height: 100px;
      background-color: #f7f9f8;
      margin-top: 25px;
      padding: 10px;
      border-radius: 8px;
      border: 1px solid #282828;
      &:nth-child(odd) {
        margin-right: 5%;
      }
      > .info {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      > .name {
        margin-top: 10px;
        border-top: 1px dashed #282828;
        padding-top: 10px;
        font-size: 13px;
      }
    }
  }
</style>