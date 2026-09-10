<template>
  <div class="pre-journal-container">
    <div class="w-full flex justify-between items-center">
      <span class="item-title">{{ t('变更前平账') }}</span>
      <a-button v-if="!disabled" type="brown" shape="round" size="small" @click="addItem">{{ t('添加') }}</a-button>
    </div>

    <div v-if="!disabled || list.length" class="table-content sys-table-content no-top-line">
      <a-table :columns="columns" :data-source="list" :pagination="false" :row-key="rowKey">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'type'">
            <span>{{ t('平账') }}</span>
          </template>
          <template v-if="column.dataIndex === 'name'">
            <a-select
              v-if="!disabled"
              v-model:value="record.name"
              style="width: 100%"
              :options="nameOptions"
              :placeholder="t('请选择')"
              @change="() => nameChange(record)"
            ></a-select>
            <span v-else>{{ record.name_str }}</span>
          </template>
          <template v-if="column.dataIndex === 'amount'">
              <a-input-number
              v-if="!disabled"
              v-model:value="record.amount"
              :min="-99999999999"
              :controls="false"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              @change="emitChange"
            ></a-input-number>
            <vco-number v-else :value="record.amount" size="fs_md" :precision="2"></vco-number>
          </template>
          <template v-if="column.dataIndex === 'note'">
            <a-input v-if="!disabled" v-model:value="record.note" />
            <span v-else>{{ record.note }}</span>
          </template>
          <template v-if="column.dataIndex === 'operation'">
            <i v-if="!disabled" class="iconfont remove-icon" @click="() => removeItem(index)">&#xe8c1;</i>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { systemDictData } from '@/api/system';

const { t } = useI18n();
const emits = defineEmits(['change']);
const props = defineProps({
  hasLinefee: {
    type: Boolean,
    default: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  items: {
    type: Array,
    default: null
  }
});

const list = ref([]);
const nameOptions = ref([]);
let rowSeed = 0;
const rowKey = (record) => record._key;

const emptyItem = () => ({
  _key: ++rowSeed,
  type: 'journal_type',
  name: undefined,
  name_str: '',
  amount: '',
  note: ''
});

const columns = computed(() => {
  const cols = [
    { title: t('类别'), dataIndex: 'type', width: 80 },
    { title: t('类型'), dataIndex: 'name', width: 240 },
    { title: t('金额'), dataIndex: 'amount', width: 180 },
    { title: t('说明'), dataIndex: 'note' }
  ];
  if (!props.disabled) {
    cols.push({ title: t('操作'), dataIndex: 'operation', width: 90, align: 'center' });
  }
  return cols;
});

const addItem = () => {
  list.value.push(emptyItem());
};

const removeItem = (index) => {
  list.value.splice(index, 1);
  emitChange();
};

const nameChange = (record) => {
  const opt = nameOptions.value.find((item) => item.value === record.name);
  record.name_str = opt ? opt.label : '';
};

const emitChange = () => {
  emits('change');
};

const getData = () => {
  return list.value
    .filter((item) => item.name && item.amount !== '' && item.amount !== null && item.amount !== undefined)
    .map((item) => ({
      type: 'journal_type',
      name: item.name,
      name_str: item.name_str,
      amount: item.amount,
      note: item.note || ''
    }));
};

const setData = (data) => {
  const incoming = Array.isArray(data) ? data : [];
  list.value = incoming.map((item) => ({
    _key: ++rowSeed,
    type: 'journal_type',
    name: item.name,
    name_str: item.name_str || '',
    amount: item.amount,
    note: item.note || ''
  }));
};

defineExpose({ getData, setData });

watch(
  () => props.items,
  (val) => {
    if (val) setData(val);
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  const dict = props.hasLinefee ? 'journal_type' : 'journal_type2';
  systemDictData(dict).then((res) => {
    nameOptions.value = (res || []).map((item) => ({
      label: item.name,
      value: item.code
    }));
  });
});
</script>

<style scoped lang="less">
.pre-journal-container {
  margin: 0;
  width: 100%;
  padding: 24px 0 28px;
  border-top: 1px dashed #282828;
}

.item-title {
  font-size: 12px;
  color: #888;
}

.table-content {
  padding: 16px 0 4px;
  margin-top: 12px;
  overflow: hidden;

  :deep(.ant-table-wrapper),
  :deep(.ant-table) {
    width: 100%;
  }

  :deep(.ant-empty) {
    min-height: 80px !important;
    margin: 16px 0 !important;
  }

  :deep(.ant-input-number) {
    width: 100%;
  }

  :deep(.remove-icon) {
    cursor: pointer;
    color: #ea3535 !important;
    &:hover {
      color: #f24f4f !important;
    }
  }
}
</style>
