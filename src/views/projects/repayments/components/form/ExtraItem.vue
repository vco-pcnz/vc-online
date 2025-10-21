<template>
  <div class="extra-item-container">
    <div class="w-full flex justify-between items-center">
      <div class="flex gap-2 items-center">
        <span class="item-title">{{ t('额外款项') }}</span>
        <a-switch v-if="!isDetails" v-model:checked="showExtraSwitch" size="small" @change="() => showExtraSwitchChange()"></a-switch>
      </div>
      <a-button v-if="showExtraSwitch && !isDetails" type="brown" shape="round" size="small" @click="addExtraItem"> {{ t('添加') }}</a-button>
    </div>

    <template v-if="showExtraSwitch">
      <div class="table-content sys-table-content no-top-line">
        <a-table
          :columns="extraColumns"
          :data-source="extraData"
          :pagination="false"
          table-layout="fixed"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'type'">
              <span v-if="isDetails">{{ record.type }}</span>
              <a-select v-else v-model:value="record.type" style="width: 100%" :options="typeData" @change="() => typeDataChange(record)"></a-select>
            </template>
            <template v-if="column.dataIndex === 'name'">
              <template v-if="isDetails">
                <span v-if="selectArr.includes(record.type)">{{ record.name_str }}</span>
                <a-tooltip v-else placement="top">
                  <template #title>
                    <span>{{ record.project_name }}</span>
                  </template>
                  <span>{{ record.project_name }}</span>
                </a-tooltip>
              </template>
              <template v-else>
                <a-select v-if="selectArr.includes(record.type)" v-model:value="record.name" style="width: 100%" :options="nameObjData[record.type]" @change="() => nameChange(record)"></a-select>
                <template v-else-if="!selectArr.includes(record.type) && record.type">
                  <a-select v-model:value="record.project_uuid" style="width: 100%" show-search :filter-option="filterOption" :options="projectData" @change="() => projectChange(record)"></a-select>
                </template>
                <template v-else>
                  <span>{{ t('请选择类型') }}</span>
                </template>
              </template>
            </template>
            <template v-if="column.dataIndex === 'amount'">
              <vco-number v-if="isDetails" :value="record.amount" size="fs_md" :precision="2"></vco-number>
              <a-input-number
                v-if="(record.name || record.project_uuid) && !isDetails"
                v-model:value="record.amount"
                :min="record.type === 'journal_type' ? -99999999999 : 0"
                :formatter="
                  (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                :controls="false"
              >
              </a-input-number>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <i class="iconfont remove-icon" @click="() => removeExtraItem(index)">&#xe8c1;</i>
            </template>
          </template>
        </a-table>
      </div>

      <div class="flex gap-2 justify-end items-center final-amount">
        <p>{{ t('最终还款金额') }}</p>
        <vco-number :bold="true" :value="finalRepaymentAmount" :precision="2" color="#31bd65" :end="true"></vco-number>
      </div>
    </template>
  </div>
</template>

<script scoped setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import { systemDictData } from '@/api/system';
import { selProject } from '@/api/process';
import tool from '@/utils/tool';

const { t } = useI18n();

const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  repaymentAmount: {
    type: [Number, String],
    default: 0
  },
  modelValue: {
    type: Object
  },
  isDetails: {
    type: Boolean,
    default: false
  }
})

const showExtraSwitch = ref(false)

const extraAmount = computed(() => {
  const data = extraData.value.filter((item) => item.amount)
  const amount = data.reduce((acc, item) => tool.plus(acc, Number(item.amount)), 0)
  return amount
})

const finalRepaymentAmount = computed(() => {
  const total = tool.plus(Number(props.repaymentAmount || 0), Number(extraAmount.value || 0))
  return total
})

const columnsData = [
  { title: t('类型'), dataIndex: 'type', width: 140, ellipsis: true },
  { title: t('款项名称'), dataIndex: 'name', width: 140, ellipsis: true },
  { title: t('金额'), dataIndex: 'amount', width: 140 },
  { title: t('操作'), dataIndex: 'operation', width: 50, fixed: 'right', align: 'center' }
]

const extraColumns = ref([])

const extraItemData = {
  type: '',
  name: '',
  name_str: '',
  project_name: '',
  project_uuid: '',
  amount: ''
}

const extraData = ref([])
const nameObjData = ref({})
const selectArr = ['final_drawdown', 'journal_type']

const addExtraItem = () => {
  const obj = cloneDeep(extraItemData)
  extraData.value.push(obj)
}

const removeExtraItem = (index) => {
  extraData.value.splice(index, 1)

  nextTick(() => {
    getSetData()
  })
}

const typeData = ref([])
const getTypeData = () => {
  systemDictData('extra_repayment_fee').then((res) => {
    const data = res.map((item) => {
      return {
        label: item.name,
        value: item.code
      };
    });
    typeData.value = data;
  });
}

const typeDataChange = (record) => {
  record.name = ''
  record.name_str = ''
  record.project_name = ''
  record.project_uuid = ''
  record.amount = ''

  if (selectArr.includes(record.type) && (!nameObjData.value[record.type] || !nameObjData.value[record.type].length)) {
    systemDictData(record.type).then((res) => {
      const data = res.map((item) => {
        return {
          label: item.name,
          value: item.code
        };
      });
      nameObjData.value[record.type] = data || []
    });
  }

  getSetData()
}

const nameChange = (record) => {
  const itemObj = nameObjData.value[record.type].find((item) => item.value === record.name)
  if (itemObj) {
    record.name_str = itemObj.label
  }

  getSetData()
}

const projectChange = (record) => {
  const itemObj = projectData.value.find((item) => item.value === record.project_uuid)
  if (itemObj) {
    record.project_name = itemObj.label
  }

  getSetData()
}

const projectData = ref([])
const getProjectData = () => {
  selProject({
    pageNum: 1,
    limit: 5000
  }).then((res) => {
    const resData = res.data || []
    const data = resData.map((item) => {
      return {
        label: item.project_name,
        value: item.uuid
      };
    });

    projectData.value = data
  });
}

const filterOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const getSetData = () => {
  const selData = cloneDeep(extraData.value)
  const data = selData.filter((item) => item.amount)

  const extraSetData = data.length ? {
    data,
    finalRepaymentAmount: finalRepaymentAmount.value,
    extraAmount: extraAmount.value
  } : null

  emits('update:modelValue', extraSetData)
}

const showExtraSwitchChange = () => {
  if (showExtraSwitch.value) {
    getSetData()
  } else {
    emits('update:modelValue', null)
  }
}

const recoveryGetNameData = async (data) => {
  for (let i = 0; i < data.length; i++) {
    const item = data[i]
    if (selectArr.includes(item.type) && (!nameObjData.value[item.type] || !nameObjData.value[item.type].length)) {
      await systemDictData(item.type).then((res) => {
        const data = res.map((item) => {
          return {
            label: item.name,
            value: item.code
          };
        });
        nameObjData.value[item.type] = data || []
      });
    }
  }
}

const setColumnsData = () => {
  const data = cloneDeep(columnsData)
  if (props.isDetails) {
    data.splice(3, 1)
    extraColumns.value = data
  } else {
    extraColumns.value = data
  }
}

watch(() => props.modelValue, async (val) => {
  if (val && val.recovery) {
    const setData = cloneDeep(val.data)
    await recoveryGetNameData(setData)
    showExtraSwitch.value = true
    extraData.value = setData
  }
}, { immediate: true })

watch(() => finalRepaymentAmount.value, () => {
  getSetData()
})

onMounted(() => {
  setColumnsData()

  if (!props.isDetails) {
    getTypeData()
    getProjectData()
  }
})
</script>

<style scoped lang="less">
.extra-item-container {
  margin-bottom: 15px;
}

.item-title {
  font-size: 12px;
  color: #888;
}

.table-content {
  padding: 10px;
  border: 1px solid #272727 !important;
  border-radius: 10px !important;
  margin-top: 8px;
  :deep(.ant-empty) {
    min-height: 50px !important;
    margin: 0 !important;
  }
  :deep(.remove-icon) {
    cursor: pointer;
    color: #ea3535 !important;
    &:hover {
      color: #f24f4f !important;
    }
  }
}

.final-amount {
  margin-top: 5px;
}
</style>