<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="modeRef" class="myMode">
    <a-modal :width="700" :open="visible" title="split bill" :getContainer="() => $refs.modeRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <div class="flex justify-end">
          <a-button type="brown" shape="round" size="small" @click="add">add</a-button>
        </div>
        <a-table :columns="columns" :data-source="list" :pagination="false" :scroll="{ x: '100%' }">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'amount'">
              <a-input-number
                :class="{ err: validate && !record.amount }"
                :disabled="record.disabled"
                v-model:value="record.amount"
                :max="99999999999"
                :min="0"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </template>
            <template v-if="column.dataIndex === 'description'">
              <a-textarea v-model:value="record.description" :disabled="record.disabled" :rows="1" />
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(index)" :disabled="list.length == 2 || record.disabled">
                <i class="iconfont" style="cursor: pointer" :class="{ disabled: list.length == 2 || record.disabled }">&#xe8c1;</i>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
        <div class="flex mt-2 justify-end">
          <div class="flex items-center">
            <span class="mr-2 color_grey">total:</span><vco-number :value="item?.amount" prefix=" " :precision="2" size="fs_xl" :bold="true" :end="true"></vco-number>
          </div>
          <div class="flex items-center ml-5">
            <template v-if="distributableAmount < 0">
              <span class="mr-2 color_red-error">available:</span>:
              <vco-number :value="distributableAmount" :precision="2" size="fs_xl" color="#c1430c" :bold="true" :end="true"></vco-number>
            </template>
            <template v-else>
              <span class="mr-2 color_grey">available:</span>:
              <vco-number :value="distributableAmount" :precision="2" size="fs_xl" :bold="true" :end="true"></vco-number>
            </template>
          </div>
        </div>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :disabled="distributableAmount != 0 || !list.length" :loading="loading">
            {{ t('保存') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import { splitBill } from '@/api/reconciliations';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  item: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const list = ref([]);

const updateVisible = (value) => {
  visible.value = value;
};
const columns = reactive([
  { title: t('金额'), dataIndex: 'amount', width: 180, align: 'center', ellipsis: true },
  { title: t('备注'), dataIndex: 'description', align: 'left', ellipsis: true },
  { title: t('操作'), dataIndex: 'operation', width: 120, align: 'center', ellipsis: true }
]);

// 可分配金额
const distributableAmount = computed(() => {
  const sum = list.value.reduce((accumulator, currentValue) => {
    if (currentValue.amount) {
      return accumulator + parseFloat(currentValue.amount);
    } else {
      return accumulator;
    }
  }, 0);
  return Math.abs(props.item?.amount) - sum;
});

const add = () => {
  list.value.push({
    amount: '',
    description: '',
    disabled: false
  });
};

const remove = (val) => {
  list.value.splice(val, 1);
};

const save = () => {
  validate.value = true;
  let amounts = list.value.filter((item) => {
    return item.amount;
  });
  if (amounts.length != list.value.length || distributableAmount.value != 0) {
    return;
  }
  const sub = list.value
    .filter((item) => {
      return !item.disabled;
    })
    .map((item) => {
      return {
        amount: item.amount,
        description: item.description
      };
    });
  loading.value = true;
  let params = {
    bank_sn: props.item?.bank_sn,
    sub: sub
  };
  splitBill(params)
    .then((res) => {
      message.success(t('保存成功'));
      emits('update');
      updateVisible(false);
    })
    .finally((_) => {
      validate.value = false;
      loading.value = false;
    });
};

const init = () => {
  list.value = [
    {
      amount: '',
      description: '',
      disabled: false
    },
    {
      amount: '',
      description: '',
      disabled: false
    }
  ];
  if (props.item?.children && props.item?.children.length) {
    list.value = props.item.children.map((item) => {
      return {
        amount: item.amount,
        description: item.description,
        disabled: !!item.status
      };
    });
  }
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.myMode {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    .ant-input-number {
      border-color: #d9d9d9;
      &.err {
        border-color: #c1430c;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;
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

      .save {
        width: 100%;
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }

  .iconfont.disabled {
    color: #888;
    cursor: not-allowed !important;
  }
}
</style>
