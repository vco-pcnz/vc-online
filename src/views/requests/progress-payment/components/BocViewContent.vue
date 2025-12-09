<template>
  <div>
    <a-modal :open="itemVisible" :title="t('进度付款阶段')" :width="540" :footer="null" :keyboard="false" :maskClosable="false" @cancel="setDialogCancel">
      <a-row :gutter="24" class="mt-10">
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('总额度') }}</p>
            <vco-number :value="currentItemInfo.amount" size="fs_md" :precision="2"></vco-number>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('已用额度') }}</p>
            <vco-number :value="currentItemInfo.use_amount" color="#ea3535" size="fs_md" :precision="2"></vco-number>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('可用额度1') }}</p>
            <vco-number :value="currentItemInfo.can_amount" color="#31bd65" size="fs_md" :precision="2"></vco-number>
          </div>
        </a-col>
        <a-col :span="16">
          <div class="info-content sys-form-content">
            <p class="name mb-2">{{ t('可用额度') }}</p>
            <a-input-number
              v-model:value="currentItemInfo.set_amount"
              :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="value => value.replace(/\$\s?|(,*)/g, '')"
              @input="() => currentItemInput(true)"
              @keyup.enter="selectSureHandle" 
            />
            <template v-if="currentItemInfo.showError">
              <p class="input-error">{{ t('取值范围: {0} - {1}', ['$0.00', `$${numberStrFormat(currentItemInfo.can_amount)}`]) }}</p>
            </template>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-content sys-form-content">
            <p class="name mb-2">{{ t('可用额度比例') }}</p>
            <a-input v-model:value="currentItemInfo.set_amount_per" suffix="%" @input="() => currentItemInput(false)" @keyup.enter="selectSureHandle" />
            <template v-if="currentItemInfo.showError">
              <p class="input-error">{{ `0.00% - ${numberStrFormat(currentItemInfo.can_amount_per)}%`}}</p>
            </template>
          </div>
        </a-col>
      </a-row>
      <div class="mt-5 flex justify-center">
        <a-button type="dark" class="big shadow bold uppercase"
          @click="selectSureHandle"
        >{{ t('确定') }}</a-button>
      </div>
    </a-modal>

    <a-spin :spinning="pageLoading" size="large">
      <div class="drawdown-content">
        <div v-for="(group, groupIndex) in bocSplitData" :key="`${groupIndex}-${group[0]?.term || 'group'}`" class="term-group-content">
          <div class="flex items-center justify-between header">
            <h2 class="font-bold">{{ `No.${group[0]?.term}` }}</h2>
            <div class="flex justify-between items-center gap-4">
              <div class="flex items-center gap-2">
                <p class="text-xs text-gray-700">{{ t('总额度') }}</p>
                <vco-number :value="group.reduce((total, item) => {
                  return Number(tool.plus(total, Number(item.amount)))
                }, 0)" size="fs_xs" :precision="2" :end="true" :bold="true"></vco-number>
              </div>
              <div class="flex items-center gap-2">
                <p class="text-xs text-gray-700">{{ t('已用额度') }}</p>
                <vco-number :value="group.reduce((total, item) => {
                  return Number(tool.plus(total, Number(item.use_amount)))
                }, 0)" size="fs_xs" :precision="2" :end="true" color="#eb4b6d" :bold="true"></vco-number>
              </div>
              <div class="flex items-center gap-2">
                <p class="text-xs text-gray-700">{{ t('可用额度1') }}</p>
                <vco-number :value="group.reduce((total, item) => {
                  return Number(tool.plus(total, Number(item.amount - item.use_amount)))
                }, 0)" size="fs_xs" :precision="2" :end="true" color="#31bd65" :bold="true"></vco-number>
              </div>

              <a-button v-if="Number(group.reduce((total, item) => {
                return Number(tool.plus(total, Number(item.amount - item.use_amount)))
              }, 0)) !== 0 && isSelect" type="primary" size="small" class="bold uppercase"
                @click="fullDrawdownHandle(group, true)"
              >
                {{ t('全额放款') }}
              </a-button>
              <a-button v-if="Number(group.reduce((total, item) => {
                return Number(tool.plus(total, Number(item.amount - item.use_amount)))
              }, 0)) !== 0 && showFullCancelButton(group) && isSelect" type="dark" size="small" class="bold uppercase"
                @click="fullDrawdownHandle(group, false)"
              >
                {{ t('清除') }}
              </a-button>
            </div>
          </div>
          <div class="item-content">
            <div
              v-for="item in group" :key="`${item.term}-${item.type_name}`"
              class="item-content-item"
              :class="{'hover': isSelect, 'done': Number(item.amount) === Number(item.use_amount)}"
              @click="itemClickHandle(item)"
            >
              <i v-if="Number(item.amount) === Number(item.use_amount)" class="done-icon iconfont icon-duigou"></i>
              <div v-if="Number(item.amount) !== Number(item.use_amount) && Number(item.set_amount)" class="selected-amount">
                {{  `$${numberStrFormat(Number(item.set_amount))}` }}
              </div>

              <div class="title" :title="item.type_name">{{ item.type_name }}</div>
              <div class="mt-1">
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-700">{{ t('总额度') }}</p>
                  <div class="item-amount-content">
                    <vco-number :value="Number(item.amount)" size="fs_xs" :precision="2" :end="true"></vco-number>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-700">{{ t('已用额度') }}</p>
                  <div class="item-amount-content">
                    <vco-number :value="Number(item.use_amount)" size="fs_xs" :precision="2" :end="true" color="#eb4b6d"></vco-number>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <p class="text-xs text-gray-700">{{ t('可用额度1') }}</p>
                  <div class="item-amount-content">
                    <vco-number :value="Number(tool.minus(Number(item.amount), Number(item.use_amount)))" size="fs_xs" :precision="2" :end="true" color="#31bd65"></vco-number>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-between items-center mt-5">
        <div>
          <p class="font-bold">Total</p>
          <vco-number :value="selectTotalAmount" size="fs_xl" :precision="2" :end="true" color="#eb4b6d" :bold="true"></vco-number>
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
import tool, { numberStrFormat } from "@/utils/tool"

const props = defineProps({
  logDate: {
    type: String,
    default: ''
  },
  selectedData: {
    type: Array,
    default: () => []
  },
  isSelect: {
    type: Boolean,
    default: false
  }
})

const emits = defineEmits(['selectDone'])

const { t } = useI18n();
const route = useRoute();

const uuid = ref('')
const isRequests = ref(false)
const pageLoading = ref(false)

const bocSplitData = ref([])

const selectedData = computed(() => {
  const result = []
  bocSplitData.value.forEach(group => {
    if (!Array.isArray(group)) {
      return
    }
    group.forEach(item => {
      if (item && Number(item.set_amount)) {
        result.push(cloneDeep(item))
      }
    })
  })
  return result
})

const selectTotalAmount = computed(() => {
  return selectedData.value.reduce((total, item) => {
    return Number(tool.plus(total, Number(item.set_amount || 0)))
  }, 0)
})

const showFullCancelButton = computed(() => {
  return (group) => {
    return group.some(item => item.set_amount)
  }
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
      const selectedItemArr = cloneDeep(props.selectedData || [])

      const progress = cloneDeep(res.progress || {})
      const arr = []
      for (const key in progress) {
        const item = progress[key]
        const bocObj = item.find(_item => _item.source)
        const selectedItem = selectedItemArr.find(item => item.progress_id === bocObj.id)
        if (selectedItem) {
          bocObj.set_amount = selectedItem.amount
        } else {
          bocObj.set_amount = 0
        }
        arr.push(bocObj)
      }

      const data = arr.sort((a, b) => {
      const termA = Number(a?.term ?? 0)
        const termB = Number(b?.term ?? 0)
        return termA - termB
      })
      const grouped = []
      const termMap = new Map()
      data.forEach(item => {
        if (!item) return
        const termKey = item.term ?? '__EMPTY_TERM__'
        if (!termMap.has(termKey)) {
          termMap.set(termKey, [])
          grouped.push(termMap.get(termKey))
        }
        termMap.get(termKey).push(item)
      })

      bocSplitData.value = grouped
      pageLoading.value = false
    })
  } catch (err) {
    pageLoading.value = false
  }
}

const fullDrawdownHandle = (group, flag = false) => {
  group.forEach(item => {
    item.set_amount = flag ? item.amount : 0
  })
}

const itemVisible = ref(false)
const currentItemInfo = ref({})

const currentItemInput = (flag) => {
  if (flag) {
    const per = Number(currentItemInfo.value.can_amount) ? tool.div(currentItemInfo.value.set_amount, currentItemInfo.value.can_amount) : 0
    currentItemInfo.value.set_amount_per = Number(tool.times(per, 100)).toFixed(2)
  } else {
    if (!isNaN(currentItemInfo.value.set_amount_per)){
      const per = tool.div(currentItemInfo.value.set_amount_per, 100)
      currentItemInfo.value.set_amount = Number(tool.times(per, currentItemInfo.value.can_amount)).toFixed(2)
    }
  }
}

const signleItemSelected = () => {
  const currentId = currentItemInfo.value?.id
  if (!currentId) {
    return
  }

  for (const group of bocSplitData.value) {
    if (!Array.isArray(group)) {
      continue
    }
    const targetItem = group.find(item => item?.id === currentId)
    if (targetItem) {
      targetItem.set_amount = currentItemInfo.value.set_amount
      break
    }
  }

  itemVisible.value = false
  currentItemInfo.value = {}
}

const selectSureHandle = () => {
  if (!currentItemInfo.value) {
    return false
  }
  if (Number(currentItemInfo.value.set_amount) > Number(currentItemInfo.value.can_amount) || Number(currentItemInfo.value.set_amount) < 0) {
    currentItemInfo.value.showError = true
    return false
  }
  signleItemSelected()
}

const itemClickHandle = (item) => {
  const data = cloneDeep(item)
  if (props.isSelect && Number(data.amount) !== Number(data.use_amount)) {
    const num = tool.minus(Number(data.amount), Number(data.use_amount))
    if (data.set_amount && !data.set_amount_per) {
      const per = Number(num) ? tool.div(data.set_amount, num) : 0
      data.set_amount_per = Number(tool.times(per, 100)).toFixed(2)
    }
    data.can_amount = num
    data.can_amount_per = Number(data.amount) ? tool.times(tool.div(Number(num), Number(data.amount)), 100) : 0
    data.showError = false

    currentItemInfo.value = cloneDeep(data)
    itemVisible.value = true
  }
}

const setDialogCancel = () => {
  itemVisible.value = false
  currentItemInfo.value = {}
}

const doneHandle = () => {
  const data = selectedData.value.map(item => {
    const obj = {
      progress_id: item.id,
      amount: item.set_amount
    }
    return obj
  })
  const selectInfo = {
    progress__data: data,
    total: selectTotalAmount.value
  }

  emits('selectDone', selectInfo)
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
    margin-top: 20px;
    overflow: hidden;
    > .term-group-content {
      margin-bottom: 25px;
      border-radius: 8px;
      padding: 10px 15px;
      background-color: #f0f0f0;
      border: 1px solid #ccc;
      > .header {
        border-bottom: 1px dashed #aaa;
        padding-bottom: 5px;
        margin-bottom: 10px;
      }
      > .item-content {
        overflow: hidden;
        > .item-content-item {
          float: left;
          width: 23.5%;
          height: 110px;
          padding: 10px;
          padding-top: 15px;
          border-radius: 8px;
          border: 1px solid #282828;
          margin-left: 2%;
          margin-top: 15px;
          overflow: hidden;
          position: relative;
          background-color: #fff;
          &:nth-child(4n + 1) {
            margin-left: 0;
          }
          &:nth-child(-n + 4) {
            margin-top: 0;
          }
          > .title {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 13px;
            color: #333;
            border-bottom: 1px dashed #666;
            padding-bottom: 5px;
          }
          &.hover {
            cursor: pointer;
            transition: all 0.2s ease;
            &:hover {
              background-color: rgba(241, 153, 21, .2)
            }
          }
          &.done {
            background-color: #fff !important;
            cursor: default;
            &:hover {
              background-color: #fff !important;
            }
            &::after {
              content: '';
              position: absolute;
              top: -25px;
              right: -25px;
              width: 50px;
              height: 50px;
              background-color: #31bd65;
              z-index: 1;
              transform: rotate(-45deg);
            }
            .done-icon {
              opacity: 1;
            }
          }
          .done-icon {
            color: #fff;
            position: absolute;
            top: 2px;
            right: 2px;
            z-index: 2;
            font-size: 14px;
            opacity: 0;
          }
          .item-amount-content {
            height: 18px;
            display: flex;
            align-items: center;
          }
          .selected-amount {
            background-color: #31bd65;
            position: absolute;
            top: 0;
            right: 0;
            padding: 0 5px;
            height: 18px;
            font-size: 12px;
          }
        }
      }
    }
  }

  .info-content {
    margin-bottom: 22px;
    .name {
      font-size: 12px;
      color: #666;
    }
  }

  .input-error {
    width: 100%;
    font-size: 12px;
    color: #eb4b6d;
    text-align: left;
    margin-top: 2px;
  }
</style>