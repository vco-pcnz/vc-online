<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="600" :open="visible" :title="t('对账')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.ctype && validate }">{{ t('类型') }}</div>
          <a-select style="width: 100%" v-model:value="formState.ctype" show-search :options="options"></a-select>
        </div>
        <template v-if="formState.ctype == 2">
          <div class="input-item">
            <div class="label" :class="{ err: !formState.bank_type && validate }">{{ t('银行') }}</div>
            <a-select style="width: 100%" v-model:value="formState.bank_type" show-search :options="types" :fieldNames="{ label: 'name', value: 'code' }" @change="resetReconciliationItem"></a-select>
          </div>
          <div class="input-item" v-if="formState.bank_type !== '1'">
            <div class="label" :class="{ err: !formState.bank_sn && validate }">{{ t('单号') }}</div>
            <a-input v-model:value="formState.bank_sn" />
          </div>
          <div class="input-item" v-else>
            <div class="label" :class="{ err: !formState.bank_sn && validate }">
              {{ t('交易记录') }}
            </div>
            <a-dropdown class="Filter" trigger="click" v-model:open="dropdownVisible">
              <div class="list reconciliationItemFill">
                <i class="icon iconfont" v-if="Boolean(reconciliationItem)" @click.stop="resetReconciliationItem">&#xe781;</i>
                <DownOutlined class="icon iconfont DownOutlined" :class="{ active: dropdownVisible }" v-if="Boolean(!reconciliationItem)" />
                <div class="list-item" :class="[{ dis: isDis(reconciliationItem) }]">
                  <template v-if="reconciliationItem">
                    <div class="flex justify-between">
                      <div>
                        {{ tool.showDate(reconciliationItem.date) }} <span class="fs_2xs">({{ reconciliationItem.type }})</span>
                      </div>

                      <vco-number color="#7dc1c1" :value="reconciliationItem.amount" :precision="2" :bold="true" size="fs_md"></vco-number>
                    </div>
                    <p class="fs_2xs color_grey">{{ reconciliationItem.description }}</p>
                  </template>
                </div>
              </div>
              <template #overlay>
                <a-spin :spinning="loading" size="large">
                  <div class="list">
                    <template v-for="item in treeData" :key="item">
                      <div class="list-item" @click="selectReconciliation(item)" :class="[{ par: item.children && item.children.length, dis: isDis(item) }]">
                        <div class="flex justify-between">
                          <div>
                            {{ tool.showDate(item.date) }} <span class="fs_2xs">({{ item.type }})</span>
                          </div>
                          <vco-number color="#7dc1c1" :value="item.amount" :precision="2" :bold="true" size="fs_md"></vco-number>
                        </div>
                        <p class="fs_2xs color_grey">{{ item.description }}</p>
                      </div>
                      <template v-if="item.children && item.children.length">
                        <div class="list-item" :class="[{ dis: isDis(sub) }]" @click="selectReconciliation(sub)" v-for="sub in item.children" :key="sub.id" style="padding-left: 40px">
                          <div class="flex justify-between">
                            <span>{{ tool.showDate(sub.date) }}</span>
                            <vco-number color="#7dc1c1" :value="sub.amount" :precision="2" :bold="true" size="fs_md"></vco-number>
                          </div>
                          <p class="fs_2xs color_grey">{{ sub.description }}</p>
                        </div>
                      </template>
                    </template>
                    <div style="text-align: center; width: 100%">
                      <a-empty v-if="!treeData.length && !loading" :image="simpleImage" style="min-height: 100px" />
                    </div>
                  </div>
                </a-spin>
              </template>
            </a-dropdown>
          </div>
        </template>
        <div class="input-item">
          <div class="label">{{ t('说明') }}</div>
          <a-textarea v-model:value="formState.remark" placeholder="Basic usage" :rows="4" />
        </div>
        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { systemDictData } from '@/api/system';
import { getReconciliation } from '@/api/project/loan';
import { loanDsaveStep, loanRsaveStep, reconciliation } from '@/api/project/loan';
import tool from '@/utils/tool';
import { Empty } from 'ant-design-vue';
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
import { DownOutlined } from '@ant-design/icons-vue';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  detail: {
    type: [String, Number]
  },
  uuid: {
    type: Object
  },
  type: {
    type: [String, Number]
  },
  isSchedule: {
    type: Boolean,
    default: false
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const options = ref([
  {
    label: t('不对账'),
    value: 1
  },
  {
    label: t('对账'),
    value: 2
  }
]);
const types = ref([]);

const formState = ref({
  ctype: 2,
  bank_type: '',
  bank_sn: '',
  remark: ''
});

const updateVisible = (value) => {
  visible.value = value;
  dropdownVisible.value = false;
};

const loading_type = ref(false);

const loadType = () => {
  formState.value.bank_type = '1';
  formState.value.bank_sn = '';
  if (types.value.length) {
    return;
  }
  loading_type.value = true;
  systemDictData('reconciliation_system')
    .then((res) => {
      types.value = res;
    })
    .finally((_) => {
      loading_type.value = false;
    });
};
const save = () => {
  validate.value = true;
  if (formState.value.ctype == 2 && (!formState.value.bank_type || !formState.value.bank_sn)) {
    return;
  }
  loading.value = true;

  let ajax = null;
  // drawdowns
  if (props.type == 1) {
    ajax = loanDsaveStep;
  }
  // repayments
  if (props.type == 2) {
    ajax = loanRsaveStep;
  }
  // isSchedule
  if (props.isSchedule) {
    ajax = reconciliation;
  }
  ajax({ uuid: props.uuid, id: props.detail?.id, ...formState.value })
    .then((res) => {
      message.success(t('提交成功'));
      emits('update');
      updateVisible(false);
    })
    .finally((_) => {
      validate.value = false;
      loading.value = false;
    });
};

const dropdownVisible = ref(false);
const treeData = ref([]);
const loadReconciliation = () => {
  getReconciliation({ uuid: props.uuid, type: props.type }).then((res) => {
    treeData.value = res;
  });
};

const reconciliationItem = ref(null);
const selectReconciliation = (val) => {
  if ((val.children && val.children.length) || isDis(val)) return;
  reconciliationItem.value = val;
  formState.value.bank_sn = val.bank_sn;
  dropdownVisible.value = false;
};

const resetReconciliationItem = () => {
  reconciliationItem.value = null;
  formState.value.bank_sn = '';
  dropdownVisible.value = false;
};

const isDis = (val) => {
  if (val && props.type == 1 && props.detail?.amount == val.amount) {
    // 放款
    return false;
  }
  if (val && props.type == 2) {
    // 全额还款
    if (props.detail?.all_repayment) {
      if (Math.abs(props.detail?.amount) == val.amount && props.detail?.date === val.date) {
        return false;
      }
      return true;
    }
    return false;
  }
  return true;
};

const init = () => {
  formState.value = {
    ctype: 2,
    bank_type: '',
    bank_sn: '',
    remark: ''
  };
  validate.value = false;
  reconciliationItem.value = null;
  loadType();
  loadReconciliation();
  visible.value = true;
};

// 暴露方法给父组件
defineExpose({
  init
});
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;
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
}

.list {
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  background: #fff;
  padding: 20px 0;

  max-height: 380px;
  overflow-y: auto;
  padding-bottom: 8px;
  padding-top: 8px;
  .list-item {
    line-height: 1.5;
    transition: background-color 0.1s cubic-bezier(0.215, 0.61, 0.355, 1);
    align-items: center;
    padding: 8px 20px;
    cursor: pointer;
    &:hover {
      background-color: rgba(227, 235, 235, 0.4);
    }
    &.dis,
    &.par {
      background-color: rgba(206, 206, 206, 0.4);
      opacity: 0.5;
      cursor: auto;
    }
  }

  &.reconciliationItemFill {
    width: 100%;
    padding: 0;
    border: 1px solid #272727 !important;
    min-height: 50px;
    background: #f7f9f8;
    position: relative;
    padding-right: 20px;
    .iconfont {
      position: absolute;
      top: calc(50% - 10px);
      right: 10px;
      color: #a3a3a3;
      cursor: pointer;
    }
    .DownOutlined {
      font-size: 12px;
      color: rgba(0, 0, 0, 0.88);
      top: calc(50% - 6px);
      transition: all 0.2s ease;
      &.active {
        transform: rotate(180deg);
      }
    }
    .list-item {
      background-color: #f7f9f8;
      padding: 5px 20px;
    }
  }
}
</style>
