<template>
  <div>
    <a-modal :open="itemVisible" :title="isSetting ? t('进度付款阶段') : t('BOC放款')" :width="540" :footer="null" :keyboard="false" :maskClosable="false" @cancel="setDialogCancel">
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
        <div v-if="bocSplitData.length" class="term-group-content">
          <div class="flex items-center justify-between header">
            <h2 v-if="isSetting" class="font-bold">{{ t('BOC第{0}期放款', [step]) }}</h2>
            <h2 v-else class="font-bold">{{ t('放款选择') }}</h2>
            <div v-if="isSelect && !isAdvanceSet" class="mt-2 mb-2 flex justify-end gap-4">
              <a-button v-if="selectDataHasNum" type="cyan" class="bold uppercase" @click="selectCancelAll">{{ t('取消所有设置') }}</a-button>
              <a-button type="primary" class="bold uppercase" @click="batchSelectHandle">{{ batchSelect ? t('取消批量模式') : t('批量选择') }}</a-button>
              <a-button v-if="batchSelectData.length" type="grey" class="bold uppercase" @click="batchSelectCancel">{{ t('取消已选择')}}</a-button>
              <a-button v-if="batchSelect" type="dark" :disabled="!batchSelectData.length" class="bold uppercase" @click="batchSelectSet">{{ t('批量设置1') }} ({{ batchSelectData.length }})</a-button>
            </div>
          </div>
          <div class="item-content">
            <div
              v-for="item in bocSplitData" :key="`${item.term}-${item.type_name}`"
              class="item-content-item"
              :class="{
                'hover': isSelect,
                'done': (Number(item.amount) === Number(item.use_amount) && isSelect),
                'advance': (isAdvanceSet && isSetting),
                'current-advance': (isAdvanceSet && isSetting) && Number(item.set_amount)
              }"
              @click="itemClickHandle(item)"
            >
              <i v-if="Number(item.amount) === Number(item.use_amount) && isSelect" class="done-icon iconfont icon-duigou"></i>
              <div v-if="Number(item.set_amount)" class="selected-amount">
                {{  `$${numberStrFormat(Number(item.set_amount))}` }}
              </div>

              <template v-if="item.selected">
                <div class="selected-bg"></div>
                <i class="iconfont selected-icon">&#xe601;</i>
              </template>

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
        <a-empty v-if="!bocSplitData.length && !pageLoading" />
      </div>
      <div class="flex justify-between items-center mt-5">
        <div v-if="bocSplitData.length">
          <p class="font-bold">Total</p>
          <vco-number :value="selectTotalAmount" size="fs_xl" :precision="2" :end="true" color="#eb4b6d" :bold="true"></vco-number>
        </div>
        <p v-else></p>
        <a-button type="dark" class="big shadow bold uppercase"
          :loading="selectSureLoading"
          @click="doneHandle"
        >{{ t('确定') }}</a-button>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router"
import { projectGetBuild, projectLoanGetBuild, getProgressInfo } from "@/api/process"
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
  },
  isSetting: {
    type: Boolean,
    default: false
  },
  step: {
    type: Number,
    default: 0
  },
  isSupplement: { // 不是补充信息
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

const setSelectedData = computed(() => {
  const result = []
  bocSplitData.value.forEach(item => {
    if (item && Number(item.set_amount)) {
      result.push(cloneDeep(item))
    }
  })
  return result
})

const selectTotalAmount = computed(() => {
  return setSelectedData.value.reduce((total, item) => {
    return Number(tool.plus(total, Number(item.set_amount || 0)))
  }, 0)
})

const selectDataHasNum = computed(() => {
  return setSelectedData.value.filter(item => Number(item.set_amount)).length
})

const selectCancelAll = () => {
  bocSplitData.value.forEach(item => {
    item.set_amount = ''
    item.checked = false
  })
}

const advanceKey = ref('Initial advance to fund deposit')
const isAdvanceSet = ref(false)

const getSetedData = async () => {
  pageLoading.value = true
  const params = {
    uuid: uuid.value
  }

  try {
    if (props.logDate) {
      params.log__time = props.logDate
    }

    const ajaxFn = isRequests.value ? projectGetBuild : projectLoanGetBuild
    await ajaxFn(params).then(res => {
      const progress = cloneDeep(res.progress || {})

      if (progress[advanceKey.value] && !props.isSupplement) {
         // 是否为启动资金首次放款已设置
        if (props.selectedData.length === 1 && props.selectedData[0].progress_id === progress[advanceKey.value][0]?.id) {
          isAdvanceSet.value = true
        } else {
          isAdvanceSet.value = false
          progress[advanceKey.value][0].use_amount = progress[advanceKey.value][0].amount || 0
        }
      }

      const arr = []
      for (const key in progress) {
        const item = progress[key]
        for (let i = 0; i < item.length; i++) {
          const selectedItem = props.selectedData.find(_item => _item.progress_id === item[i].id)
          if (selectedItem) {
            item[i].set_amount = selectedItem.amount || 0
            if (item[i].logs && item[i].logs.length && props.isSelect) {
              const logsArr = item[i].logs.filter(_item => _item.apply_id === selectedItem.apply_id)
              const setLogsAmount = logsArr.reduce((total, _item) => {
                return Number(tool.plus(total, Number(_item.amount || 0)))
              }, 0)
              item[i].use_amount = Number(tool.minus(Number(item[i].use_amount), Number(setLogsAmount)))
            }
          }
          item[i].selected = false
          arr.push(cloneDeep(item[i]))
        }
      }

      bocSplitData.value = arr
      pageLoading.value = false
    })
  } catch (err) {
    pageLoading.value = false
  }
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

  const targetItem = bocSplitData.value.find(item => item?.id === currentId)
  if (targetItem) {
    targetItem.set_amount = currentItemInfo.value.set_amount
  }

  itemVisible.value = false
  currentItemInfo.value = {}
}

const batchSelectSureHandle = () => {
  const setPercent = tool.div(Number(currentItemInfo.value.set_amount_per), 100)
  currentItemInfo.value.showError = false

  // 批量设置的使用额度
  const setTotalAmount = currentItemInfo.value.set_amount

  // 计算每个项目的基础金额
  const baseAmounts = batchSelectData.value.map(item => {
    const canAmount = Number(tool.minus(Number(item.amount), Number(item.use_amount))).toFixed(2)
    return {
      id: item.id,
      canAmount: Number(canAmount),
      baseAmount: Number(tool.times(Number(canAmount), Number(setPercent))).toFixed(2)
    }
  })

  // 计算基础金额总和
  const baseTotal = baseAmounts.reduce((sum, item) => Number(tool.plus(sum, Number(item.baseAmount))), 0)

  // 计算差额
  const diff = Number(tool.minus(setTotalAmount, baseTotal))

  // 设置每个项目的金额，最后一个项目补偿差额
  batchSelectData.value.forEach((item, index) => {
    let setAmount = baseAmounts[index].baseAmount
    
    // 对最后一个项目进行补偿
    if (index === batchSelectData.value.length - 1) {
      setAmount = Number(tool.plus(Number(setAmount), diff)).toFixed(2)
    }

    item.set_amount = setAmount
    item.selected = false

    const obj = bocSplitData.value.find(_item => _item.id === item.id)
    if (obj) {
      obj.set_amount = item.set_amount
      obj.set_amount_per = ''
    }

    const amount = Number(item.amount || 0)
    const use_amount = Number(item.use_amount || 0)
    const total_amount = Number(tool.plus(setAmount, use_amount))
    if (total_amount > amount) {
      const excess_amount = Number(tool.minus(Number(total_amount), amount))
      item.excess_amount = excess_amount
    } else {
      item.excess_amount = 0
    }
  })
  itemVisible.value = false
  batchSelect.value = false
  batchSelectData.value = []
}

const selectSureHandle = () => {
  if (!currentItemInfo.value) {
    return false
  }
  if (Number(currentItemInfo.value.set_amount) > Number(currentItemInfo.value.can_amount) || Number(currentItemInfo.value.set_amount) < 0) {
    currentItemInfo.value.showError = true
    return false
  }
  if (batchSelect.value) {
    batchSelectSureHandle()
  } else {
    signleItemSelected()
  }
}

const itemClickHandle = (item) => {
  const data = cloneDeep(item)
  if (props.isSelect && Number(data.amount) !== Number(data.use_amount)) {
    if (batchSelect.value) {
      item.selected = !item.selected
      const id = item.id
      const index = batchSelectData.value.findIndex(_item => _item.id === id)
      if (item.selected) {
        if (index === -1) {
          batchSelectData.value.push(item)
        }
      } else {
        if (index > -1) {
          batchSelectData.value.splice(index, 1)
        }
      }
    } else {
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
}

const setDialogCancel = () => {
  itemVisible.value = false
  currentItemInfo.value = {}
}

const batchSelect = ref(false)
const batchSelectData = ref([])

const batchSelectCancel = () => {
  batchSelectData.value.forEach(item => {
    item.selected = false
  })
  batchSelectData.value = []
}

const batchSelectHandle = () => {
  batchSelect.value = !batchSelect.value
  if (!batchSelect.value) {
    batchSelectCancel()
  }
}

const batchSelectSet = () => {
  const amountArr = batchSelectData.value.map(item => Number(item.amount || 0))
  const totalAmount = amountArr.reduce((total, num) => {
    return Number(tool.plus(total, num))
  }, 0);

  const useAmountArr = batchSelectData.value.map(item => Number(item.use_amount || 0))
  const useTotalAmount = useAmountArr.reduce((total, num) => {
    return Number(tool.plus(total, num))
  }, 0);

  const setAmountArr = batchSelectData.value.map(item => Number(item.set_amount || 0))
  const setTotalAmount = setAmountArr.reduce((total, num) => {
    return Number(tool.plus(total, num))
  }, 0);

  const num = tool.minus(totalAmount, useTotalAmount)

  const data = {
    amount: totalAmount,
    use_amount: useTotalAmount,
    can_amount: num,
    set_amount: setTotalAmount,
    set_amount_per: Number(num) ? Number(tool.times(tool.div(setTotalAmount, Number(num)), 100)).toFixed(2) : 0,
    can_amount_per: Number(totalAmount) ? Number(tool.times(tool.div(Number(num), Number(totalAmount)), 100)).toFixed(2) : 0,
    showError: false
  }

  currentItemInfo.value = data
  itemVisible.value = true
}

const selectSureLoading = ref(false)
const doneHandle = () => {
  if (props.isSetting) {
    selectSureLoading.value = true
  }
  
  const data = setSelectedData.value.map(item => {
    const obj = {
      progress_id: item.id,
      amount: item.set_amount
    }
    return obj
  })
  const selectInfo = {
    progress__data: data,
    total: selectTotalAmount.value,
    passSave: isAdvanceSet.value
  }

  emits('selectDone', selectInfo)
}

const getProgressInfoHandle = () => { 
  getProgressInfo({
    uuid: uuid.value
  }).then(res => {
    if (tool.getObjType(res) === 'object' && Object.keys(res).length) {
      const hasSetData = cloneDeep(res)
      const hasSetArr = []
      if (hasSetData[`${props.step}`]) {
        delete hasSetData[`${props.step}`]
      }
      for (const key in hasSetData) {
        hasSetArr.push(...hasSetData[key])
      }

      // 汇总每个 progress_id 的已占用额度
      const progressUseAmountMap = hasSetArr.reduce((acc, cur) => {
        if (!cur || cur.progress_id === undefined) return acc
        const progressId = cur.progress_id
        const amount = Number(cur.amount || 0)
        acc[progressId] = Number(tool.plus(acc[progressId] || 0, amount))
        return acc
      }, {})

      // 将汇总后的额度累加到当前列表的 use_amount
      bocSplitData.value = bocSplitData.value.map(item => {
        const addedAmount = progressUseAmountMap[item.id] || 0
        const originUseAmount = Number(item.use_amount || 0)
        return {
          ...item,
          use_amount: Number(tool.plus(originUseAmount, addedAmount))
        }
      })
    }
  })
}

onMounted(async () => {
  const { query, path } = route
  if (['/requests/progress-payment'].includes(path) || path.indexOf('/process') > -1) {
    isRequests.value = true
  } else {
    isRequests.value = false
  }
  uuid.value = query.uuid
  if (uuid.value) {
    await getSetedData()

    if (props.isSetting) {
      getProgressInfoHandle()
    }
  }
})

onUnmounted(() => {
  selectSureLoading.value = false
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
            background-color: #ccc !important;
            cursor: default;
            &:hover {
              background-color: #ccc !important;
            }
            &::after {
              content: '';
              position: absolute;
              top: -25px;
              right: -25px;
              width: 50px;
              height: 50px;
              background-color: #666;
              z-index: 1;
              transform: rotate(-45deg);
            }
            .done-icon {
              opacity: 1;
            }
          }
          &.advance {
            pointer-events: none;
            background-color: #ccc;
          }
          &.current-advance {
            background-color: #ffffff !important;
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
          .selected-bg {
            position: absolute;
            background-color: rgba(49, 189, 101, 1);
            width: 40px;
            height: 40px;
            right: -20px;
            bottom: -20px;
            transform: rotate(-45deg);
            z-index: 1;
          }
          .selected-icon {
            position: absolute;
            right: 2px;
            bottom: 2px;
            color: #fff;
            font-size: 11px;
            z-index: 2;
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