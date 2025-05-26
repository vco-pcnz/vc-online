<template>
  <div class="inline" @click="init"><slot></slot></div>
  <!-- 错误弹窗 -->
  <vco-confirm-alert :confirm-txt="errorTxt" :show-close="true" v-model:visible="errorVisible"></vco-confirm-alert>

  <!-- 确认弹窗 -->
  <vco-confirm-alert ref="sureAlertRef" :confirm-txt="t('已设置过进度还款数据，保存后请再次设置进度还款以更新为最新数据')" v-model:visible="sureVisible" @submit="saveRequest"></vco-confirm-alert>

  <div @click.stop ref="modeRef" class="myMode text-left sys-form-content">
    <a-modal :width="edit ? 1000 : 900" :open="visible" :title="t('开发成本')" :getContainer="() => $refs.modeRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <div class="flex items-center justify-end gap-4 mb-2">
          <p>{{ t('借款金额') }}</p>
          <vco-number :value="loanAmount" size="fs_xl" :precision="2" :end="true" :bold="true" color="#F19915"></vco-number>
        </div>
        <a-form-item-rest>
          <div v-for="(item, p_index) in data.data" :key="item.type" class="mb-5 card">
            <!-- 建筑成本 -->
            <template v-if="p_index === 0">
              <div class="flex justify-between tabel-type">
                <div class="flex gap-2">
                  <p class="bold fs_xl">{{ item.type }}</p>
                  <a-button type="brown" size="small" shape="round" @click="data.model = data.model ? 0 : 1">for {{ data.model ? t('QS报告') : t('进度放款') }}</a-button>
                </div>
                <a-popover trigger="click" v-if="edit">
                  <template #content>
                    <a-menu :selectable="false" style="border: none !important">
                      <a-menu-item>
                        <div v-if="!showAdd" :class="[{ disabled: !showAdd }]" class="text-center">{{ t('选择') }}</div>
                        <div v-else @click="add(p_index, 0)" class="text-center">{{ t('选择') }}</div>
                      </a-menu-item>
                      <a-menu-item>
                        <div @click="add(p_index, 1)" class="text-center">{{ t('自定义') }}</div>
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="primary" shape="round" size="small" class="uppercase">{{ t('添加') }}</a-button>
                </a-popover>
              </div>
              <a-table :columns="ConstructionColumns" :data-source="item.list" :pagination="false" :scroll="{ x: '100%' }">
                <template #bodyCell="{ column, record, index }">
                  <template v-if="edit">
                    <template v-if="column.dataIndex === 'type'">
                      <div class="flex items-center">
                        <PlusCircleOutlined class="addChid" @click="addChid(index)" />
                        <div style="flex: 1; width: 0px">
                          <a-select v-if="!record.model" :loading="loading_type" style="width: 100%" :disabled="Boolean(record?.status)" v-model:value="record.type" :options="initTypes" :fieldNames="{ label: 'name', value: 'code' }"></a-select>
                          <a-input v-if="record.model" style="width: 100%" :disabled="Boolean(record?.status)" v-model:value="record.type"></a-input>
                        </div>
                      </div>
                      <template v-if="record?.list">
                        <div v-for="(sub, subIndex) in record?.list" :key="subIndex" class="flex items-center mt-2" style="padding-left: 30px">
                          <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="removeChid(index, subIndex)">
                            <MinusCircleOutlined class="addChid removeChid" />
                          </a-popconfirm>
                          <div style="flex: 1">
                            <a-input v-model:value="sub.type" />
                          </div>
                        </div>
                      </template>
                    </template>
                    <template v-if="column.dataIndex === 'loan' || column.dataIndex === 'borrower_equity'">
                      <a-input-number
                        v-if="(record.type !== 'Land_gst' && record.type !== 'Build_gst') || column.dataIndex === 'loan'"
                        v-model:value="record[column.dataIndex]"
                        :disabled="(disabledLoan && column.dataIndex === 'loan') || Boolean(record?.list && record?.list.length)"
                        @change="initData"
                        :max="99999999999"
                        :min="0"
                        :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                      <a-input-number
                        v-if="(record.type == 'Land_gst' || record.type == 'Build_gst') && column.dataIndex === 'borrower_equity'"
                        v-model:value="record[column.dataIndex]"
                        :disabled="true"
                        :max="99999999999"
                        :min="-99999999999"
                        :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                      <template v-if="record?.list">
                        <div v-for="(sub, subIndex) in record?.list" :key="subIndex" class="mt-2">
                          <a-input-number
                            v-if="(record.type !== 'Land_gst' && record.type !== 'Build_gst') || column.dataIndex === 'loan'"
                            v-model:value="sub[column.dataIndex]"
                            :disabled="disabledLoan && column.dataIndex === 'loan'"
                            @change="initItemData(index)"
                            :max="99999999999"
                            :min="0"
                            :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                          />
                          <a-input-number
                            v-if="(record.type == 'Land_gst' || record.type == 'Build_gst') && column.dataIndex === 'borrower_equity'"
                            v-model:value="sub[column.dataIndex]"
                            :disabled="true"
                            :max="99999999999"
                            :min="-99999999999"
                            :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                          />
                        </div>
                      </template>
                    </template>
                  </template>
                  <template v-else>
                    <template v-if="column.dataIndex === 'type'">
                      {{ getTypeName(record.type) }}
                    </template>
                    <template v-if="column.dataIndex === 'loan' || column.dataIndex === 'borrower_equity'">
                      <vco-number :value="record[column.dataIndex]" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                    </template>
                  </template>
                  <template v-if="column.dataIndex === 'total'">
                    <div style="position: absolute; top: 13px">
                      <vco-number :value="record[column.dataIndex]" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                    </div>
                  </template>
                  <template v-if="column.dataIndex === 'operation'">
                    <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(p_index, index)">
                      <i class="iconfont" style="cursor: pointer">&#xe8c1;</i>
                    </a-popconfirm>
                  </template>
                </template>
              </a-table>
              <div class="flex items-center total-row" :class="[{ myModeEidt: edit }]" v-if="item.list.length">
                <div class="title bold pl">{{ t('小计') }}</div>
                <div class="amount pl">
                  <vco-number :value="item.loan" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="amount pl">
                  <vco-number :value="item.borrower_equity" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="amount">
                  <vco-number :value="item.total" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="total" v-if="edit"></div>
              </div>
            </template>
            <!-- 财务成本 -->
            <template v-if="p_index === 3">
              <div class="flex justify-between tabel-type">
                <p class="bold fs_xl">{{ item.type }}</p>
                <template v-if="record?.list">
                  <div v-for="(sub, subIndex) in record?.list" :key="subIndex" class="flex items-center mt-2" style="padding-left: 30px">
                    <div style="flex: 1">
                      {{ sub.type }}
                    </div>
                  </div>
                </template>
              </div>
              <a-table :columns="FinanceColumns" :data-source="item.list" :pagination="false" :scroll="{ x: '100%' }">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'loan' || column.dataIndex === 'borrower_equity'">
                    <vco-number :value="record[column.dataIndex]" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                  </template>
                  <template v-if="column.dataIndex === 'total'">
                    <vco-number :value="record[column.dataIndex]" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                  </template>
                </template>
              </a-table>
              <div class="flex items-center total-row" v-if="item.list.length">
                <div class="title bold pl">{{ t('总财务费用') }}</div>
                <div class="amount pl">
                  <vco-number :value="item.loan" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="amount pl">
                  <vco-number :value="item.borrower_equity" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="amount">
                  <vco-number :value="item.total" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="total" v-if="edit"></div>
              </div>
            </template>
            <!-- 净商品与服务税 -->
            <div v-if="p_index === 1 || p_index === 2" class="flex items-center total-row">
              <div class="title bold bold fs_xl text-left" style="padding: 0">{{ item.type }}</div>
              <template v-if="edit">
                <div class="amount">
                  <a-input-number
                    v-model:value="item.loan"
                    :disabled="disabledGST"
                    :max="99999999999"
                    :min="-99999999999"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    @change="initData"
                  />
                </div>
                <div class="amount">
                  <a-input-number
                    v-model:value="item.borrower_equity"
                    :disabled="disabledGST || p_index == 1"
                    :max="99999999999"
                    :min="-99999999999"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    @change="initData"
                  />
                </div>
              </template>
              <template v-else>
                <div class="amount">
                  <vco-number :value="item.loan" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="amount">
                  <vco-number :value="item.borrower_equity" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
              </template>
              <div class="amount">
                <vco-number :value="item.total" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
              </div>
              <div class="total" v-if="edit"></div>
            </div>
          </div>
        </a-form-item-rest>
        <div class="flex items-center total-row" style="border: none; padding: 0 24px">
          <div class="title bold bold fs_xl text-left">{{ t('总计') }}</div>
          <div class="amount pl">
            <vco-number :value="data.loan" :precision="2" size="fs_xl" :bold="true" :end="true"></vco-number>
          </div>
          <div class="amount pl">
            <vco-number :value="data.borrower_equity" :precision="2" size="fs_xl" :bold="true" :end="true"></vco-number>
          </div>
          <div class="amount">
            <vco-number :value="data.total" :precision="2" size="fs_xl" :bold="true" :end="true"></vco-number>
          </div>
          <div class="total" v-if="edit"></div>
        </div>
        <div class="flex justify-center" v-if="edit">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="saveLoading" :disabled="data?.total < 0">
            {{ t('保存') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool, { numberStrFormat } from '@/utils/tool';
import Icon, { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons-vue';
import { systemDictData } from '@/api/system';
import { cloneDeep } from 'lodash';
import { toolsSaveDevCost } from '@/api/import';

const { t } = useI18n();
const emits = defineEmits(['update:value', 'update:dataJson', 'change']);

const props = defineProps({
  value: {
    type: [String, Number]
  },
  edit: {
    type: Boolean,
    default: true
  },
  dataJson: {
    type: [Array, String]
  },
  disabledGST: {
    type: Boolean,
    default: false
  },
  disabledLoan: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loanAmount: {
    type: Number,
    default: 0
  },
  currentId: {
    type: [String, Number]
  },
  hasBuildData: {
    type: Boolean,
    default: false
  }
});

const visible = ref(false);

const ConstructionColumns = reactive([
  { title: t('类型'), dataIndex: 'type', ellipsis: true },
  { title: t('贷款'), dataIndex: 'loan', width: 180, ellipsis: true },
  { title: t('借款人权益'), dataIndex: 'borrower_equity', width: 180, ellipsis: true },
  { title: t('总计'), dataIndex: 'total', width: 180, ellipsis: true },
  { title: t('操作'), dataIndex: 'operation', width: 110, align: 'center', ellipsis: true }
]);

const FinanceColumns = reactive([
  { title: t('类型'), dataIndex: 'type', ellipsis: true },
  { title: t('贷款'), dataIndex: 'loan', width: 180, ellipsis: true },
  { title: t('借款人权益'), dataIndex: 'borrower_equity', width: 180, ellipsis: true },
  { title: t('总计'), dataIndex: 'total', width: 180, ellipsis: true },
  { title: t(''), dataIndex: 'operation', width: 110, align: 'center', ellipsis: true }
]);
const data = ref({
  loan: 0,
  borrower_equity: 0,
  total: 0,
  data: [
    {
      type: t('建筑成本'),
      loan: 0,
      borrower_equity: 0,
      total: 0,
      list: []
    },
    {
      type: t('补充股权'),
      loan: 0,
      borrower_equity: 0,
      total: 0
    },
    {
      type: t('净商品与服务税'),
      loan: 0,
      borrower_equity: 0,
      total: 0
    },
    {
      type: t('财务成本'),
      loan: 0,
      borrower_equity: 0,
      list: []
    }
  ]
});

const updateVisible = (value) => {
  visible.value = value;
};

const add = (index, model) => {
  data.value.data[index].list.push({
    type: '',
    loan: 0,
    model: model,
    borrower_equity: 0
  });
};


const remove = (p_index, index) => {
  data.value.data[p_index].list.splice(index, 1);
  initData();
};

const errorTxt = ref('');
const errorVisible = ref(false);

const sureAlertRef = ref();
const sureVisible = ref(false);
const currentParams = ref();

const dataHasChanged = (arr) => {
  const list = props.dataJson[0].data[0].list;
  for (let i = 0; i < list.length; i++) {
    if (list[i].loan !== arr[i].loan) {
      return true;
    }
  }
  return false;
};

const validateTypes = (obj) => {
  // 检查当前对象的type
  if (obj.type === undefined || obj.type === null || obj.type === '') {
    return false;
  }

  // 如果存在list数组，递归检查每个元素
  if (Array.isArray(obj.list)) {
    for (const item of obj.list) {
      if (!validateTypes(item)) {
        return false;
      }
    }
  }

  return true;
};

const saveLoading = ref(false);
const save = () => {
  const doneData = cloneDeep(data.value);
  doneData.data[0].list.forEach((item) => {
    item.name = typesObj.value[item.type] || '';
  });

  if (!validateTypes(doneData.data[0])) {
    message.error(t('建设成本类型不能为空'));
    return;
  }
  const conLoan = Number(doneData.data[0].loan);

  if (Number(props.loanAmount) !== conLoan) {
    const diffNum = tool.minus(props.loanAmount, conLoan);

    errorTxt.value = t(`借款金额为：<span>{0}</span>，设置的建筑成本为：<span>{1}</span>，相差：<span>{2}</span>`, [`$${numberStrFormat(props.loanAmount)}`, `$${numberStrFormat(conLoan)}`, `$${numberStrFormat(diffNum)}`]);
    errorVisible.value = true;
  } else {
    const params = {
      uuid: props.currentId,
      devCost: doneData.total,
      devCostDetail: [doneData]
    };

    currentParams.value = params;

    if (props.hasBuildData && dataHasChanged(doneData.data[0].list)) {
      sureVisible.value = true;
    } else {
      saveRequest();
    }
  }
};

const saveRequest = () => {
  saveLoading.value = true;
  sureAlertRef.value.changeLoading(true);

  toolsSaveDevCost(currentParams.value)
    .then(() => {
      saveLoading.value = false;
      sureVisible.value = false;
      sureAlertRef.value.changeLoading(false);

      emits('update:value', cloneDeep(currentParams.value.devCost));
      emits('update:dataJson', cloneDeep(currentParams.value.devCostDetail));
      emits('change', cloneDeep(currentParams.value));
      updateVisible(false);
    })
    .catch(() => {
      saveLoading.value = false;
      sureVisible.value = false;
      sureAlertRef.value.changeLoading(false);
    });
};

const getTypeName = (type) => {
  const obj = types.value.find((item) => item.code === type);
  return obj ? obj.name : '';
};

const loading_type = ref(false);
const types = ref([]);
const typesObj = ref(); // 字典名称
const loadType = (key) => {
  if (types.value.length) {
    return;
  }
  loading_type.value = true;
  systemDictData('devCostTypeConstruction')
    .then((res) => {
      const resData = res || [];
      types.value = resData;

      // 字典名称记录
      const obj = {};
      for (let i = 0; i < resData.length; i++) {
        obj[resData[i].code] = resData[i].name;
      }
      typesObj.value = obj;

      if (!data.value.data[0].list.length) {
        res.map((item) => {
          data.value.data[0].list.push({
            type: item.code,
            loan: 0,
            borrower_equity: 0
          });
        });
        emits('update:value', cloneDeep(data.value.total));
        emits('update:dataJson', cloneDeep([data.value]));
        emits('change', cloneDeep({ devCost: data.value.total, devCostDetail: [data.value] }));
      }
    })
    .finally((_) => {
      loading_type.value = false;
    });
};

const initData = () => {
  data.value.loan = 0;
  data.value.borrower_equity = 0;
  data.value.total = 0;
  data.value.data.map((item) => {
    if (item.list) {
      item.loan = 0;
      item.borrower_equity = 0;
      item.list.map((sub) => {
        if (sub.type === 'Land_gst' || sub.type === 'Build_gst') {
          sub.borrower_equity = tool.minus(0, sub.loan);
        }
        sub.total = tool.plus(sub.loan || 0, sub.borrower_equity || 0);
        item.loan = tool.plus(item.loan || 0, sub.loan || 0);
        item.borrower_equity = tool.plus(item.borrower_equity || 0, sub.borrower_equity || 0);
      });
    }
    item.total = tool.plus(item.loan || 0, item.borrower_equity || 0);
    data.value.loan = tool.plus(data.value.loan || 0, item.loan || 0);
    data.value.borrower_equity = tool.plus(data.value.borrower_equity || 0, item.borrower_equity || 0);
  });
  data.value.total = tool.plus(data.value.loan || 0, data.value.borrower_equity || 0);
};
const init = () => {
  if (props.disabled) return;
  loadType();
  if (props.dataJson && props.dataJson.length) {
    data.value = cloneDeep(props.dataJson[0]);
    if (data.value.data.length == 3) {
      data.value.data.splice(1, 0, {
        type: t('补充股权'),
        loan: 0,
        borrower_equity: 0,
        total: 0
      });
    }
    data.value.data[0].type = t('建筑成本');
    data.value.data[1].type = t('补充股权');
    data.value.data[2].type = t('净商品与服务税');
    data.value.data[3].type = t('财务成本');
    initData();
  }
  if (!props.edit) {
    ConstructionColumns.splice(4, 1);
    FinanceColumns.splice(4, 1);
  }
  visible.value = true;
};

const initTypes = computed(() => {
  const selectArr = data.value.data[0].list.map((item) => {
    if (!item.status) return item.type;
  });
  types.value.map((item) => {
    item['disabled'] = selectArr.includes(item.code);
  });
  return types.value;
});

const showAdd = computed(() => {
  return data.value.data[0].list.filter((item) => item.status !== 1 && !item.model).length != types.value.length;
});

const addChid = (index) => {
  if (!data.value.data[0].list[index]['list']) {
    data.value.data[0].list[index]['list'] = [];
    data.value.data[0].list[index].loan = 0;
    data.value.data[0].list[index].borrower_equity = 0;
  }
  data.value.data[0].list[index]['list'].push({
    type: '',
    loan: 0,
    borrower_equity: 0
  });
  initData();
};

const removeChid = (p_index, index) => {
  data.value.data[0].list[p_index].list.splice(index, 1);
  initItemData(p_index);
};

const initItemData = (index) => {
  let item = data.value.data[0].list[index];
  if (item.list) {
    item.loan = 0;
    item.borrower_equity = 0;
    item.list.map((sub) => {
      if (item.type === 'Land_gst' || item.type === 'Build_gst') {
        sub.borrower_equity = tool.minus(0, sub.loan);
      }
      sub.total = tool.plus(sub.loan || 0, sub.borrower_equity || 0);
      item.loan = tool.plus(item.loan || 0, sub.loan || 0);
      item.borrower_equity = tool.plus(item.borrower_equity || 0, sub.borrower_equity || 0);
    });
  }
  initData();
};

onMounted(() => {
  if (!props.dataJson) {
    emits('update:value', cloneDeep(data.value.total));
    emits('update:dataJson', cloneDeep([data.value]));
  }
});
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.myMode {
  position: relative;
  z-index: 9999;
  .myModeEidt {
    .pl {
      padding-left: 28px !important;
    }
  }
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 22px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    .ant-table-wrapper .ant-table,
    .ant-table-wrapper .ant-table-tbody > tr.ant-table-placeholder:hover > td,
    .ant-table-wrapper .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-wrapper .ant-table-tbody > tr > td.ant-table-cell-row-hover {
      background: transparent !important;
    }
    .ant-input-number,
    .ant-input,
    .ant-select-selector {
      border-color: #d9d9d9 !important;
      height: 30px !important;
      border-radius: 4px !important;
      .ant-select-selection-placeholder,
      .ant-select-selection-search-input,
      .ant-select-selection-item,
      .ant-input-number-input,
      .ant-select-selection-item {
        line-height: 28px !important;
        height: 28px !important;
      }
      &.err {
        border-color: #c1430c;
      }
    }

    .ant-empty {
      min-height: 50px;
      margin-block: 0;
    }
    .ant-table-wrapper .ant-table-thead > tr > th,
    .ant-table-wrapper .ant-table-tbody > tr > td,
    .ant-table-wrapper tfoot > tr > th,
    .ant-table-wrapper tfoot > tr > td {
      padding: 10px 16px;
    }
    .ant-table-wrapper .ant-table-thead > tr > th {
      font-size: 12px;
    }
    padding: 0px !important;
    .tabel-type {
      border-bottom: 1px solid #bebaba;
      padding-bottom: 10px;
    }
    .content {
      line-height: 1.33;
      padding: 24px 30px 72px;
      .user-item {
        padding: 8px 10px;
        border-radius: 8px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .name {
          flex: 1;
          font-weight: bold;
        }
      }
      .label {
        color: #888;
        font-size: 12px;
        padding: 0 0 8px;
        &.err {
          color: #c1430c;
        }
      }

      .total-row {
        .title {
          flex: 1;
          padding: 10px 16px;
        }
        .amount {
          flex: 0 0 180px;
          padding: 10px 16px;
        }
        .total {
          flex: 0 0 110px;
        }
      }
      .save {
        margin-top: 24px;
      }
    }
  }
  .card {
    background: #f1f1f1;
    padding: 24px;
    border-radius: 8px;
  }
  .disabled {
    cursor: not-allowed !important;
    opacity: 0.4;
  }
  :deep(.ant-table-wrapper) {
    .ant-table-thead > tr > th,
    .ant-table-thead > tr > td {
      background: transparent !important;
    }
  }
}

.addChid {
  display: inline-block;
  color: @colorPrimary;
  cursor: pointer;
  margin-right: 10px;
  &.removeChid {
    color: @color_red-half;
  }
}
.disabled {
  color: #999;
  cursor: not-allowed;
}
</style>
