<template>
  <div class="inline" @click="init">
    <slot></slot>
  </div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="1000" :open="visible" :title="t('买断')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <template v-if="detail?.buyout?.cancel_reason || detail?.buyout?.decline_reason">
            <a-alert type="error" :message="t('买断') + ' ' + t('退回原因')" class="mb-5 cancel-reason">
              <template #description>
                {{ detail?.buyout?.cancel_reason || detail?.buyout?.decline_reason }}
              </template>
            </a-alert>
          </template>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.date && validate }">{{ t('日期') }}</div>
          <a-date-picker class="datePicker" inputReadOnly :open="isOpen" :disabledDate="disabledDateFormat" v-model:value="formState.date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" @change="initAmount()" />
        </div>
        <div class="input-item">
          <div class="label">{{ t('Boc总余额') }}</div>
          <a-spin :spinning="initAmount_loading">
            <a-input-number v-model:value="balance" :max="99999999999" :readonly="true" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
          </a-spin>
        </div>
        <div class="input-item">
          <div class="label flex items-end justify-between mt-3">
            {{ t('还款分配1') }}
            </div>
            <div class="table-content sys-table-content related-content no-top-line Repayment_allocation">
              <a-spin :spinning="initAmount_loading" size="large">
                <a-table rowKey="uuid" :columns="DrawdownColumns" :data-source="drawdownList" :pagination="false" table-layout="fixed" :scroll="{ y: 300 }">
                  <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'name'">
                    <p :title="record.name" class="sec-name">{{ record.name }}</p>
                  </template>
                    <template v-if="column.dataIndex === 'amount'">
                      <div class="text-center">
                        <vco-number size="fs_md" :value="record.remain_amount" :precision="2"></vco-number>
                        <div class="flex justify-center items-center gap-1">
                          <vco-number style="opacity: 0.6" size="fs_md" :value="record.remain_interest" :precision="2"></vco-number>
                          <i class="iconfont edit-icon" v-if="!record.interest_status && record.sn"
                             @click="record.interest_status = 1">
                            &#xe743;
                          </i>
                        </div>
                      </div>
                    </template>
                    <template v-if="column.dataIndex === 'reality_interest'">
                      <div class="flex justify-center items-center gap-1" v-if="record.interest_status == 1 && record.sn">
                        <a-input-number v-model:value="record.reality_interest" :min="0" :max="99999999999" :formatter="(value) =>`$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g,',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" class="mini" />
                        <i class="iconfont icon-delete" @click="record.interest_status = 0">
                          &#xe781;
                        </i>
                      </div>
                      <div v-else></div>
                    </template>
                    <template v-if="column.dataIndex === 'all_repayment'">
                      {{ t('全额还款') }}
                    </template>

                    <template v-if="column.dataIndex === 'amount1'">
                      <template v-if="record.interest_status == 1">
                        {{ tool.formatMoney(tool.plus(record.remain_amount,record.reality_interest || 0)) }}
                      </template>
                      <template v-else>
                        {{ tool.formatMoney(tool.plus(record.remain_amount,record.remain_interest)) }}
                      </template>
                    </template>
                  </template>
                </a-table>
              </a-spin>
            </div>
          </div>
        <div class="input-item">
          <div class="label flex items-end justify-between mt-3">
            {{ t('文件') }}
            <vco-upload-modal v-model:list="documentList" v-model:value="formState.document">
              <a-button class="upload_btn" type="brown" shape="round" size="small"> {{ t('上传') }}</a-button>
            </vco-upload-modal>
          </div>
          <div class="file-content">
            <template v-if="documentList.length">
              <div v-for="(item, index) in documentList" :key="index" class="file-item">
                <vco-file-item :file="item" :showClose="true" @remove="remove(index)"></vco-file-item>
              </div>
            </template>
            <p v-if="!documentList.length">{{ t('暂无数据，请上传') }}</p>
          </div>
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.note && validate }">{{ t('说明') }}</div>
          <a-textarea v-model:value="formState.note" :rows="4" />
        </div>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('确认') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { buyOutCalculate, buyOutSave } from '@/api/project/buyout';
import tool, { selectDateFormat } from '@/utils/tool';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  uuid: {
    type: String
  },
  data: {
    type: { Object, Array }
  },
  detail: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  date: '',
  document: [],
  note: ''
});

const disabledDateFormat = (current) => {
  const startDate = props.detail?.date?.var_start_date;

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  const endDate = props.detail?.date?.end_date;
  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const initAmount_loading = ref(false);
const balance = ref('');
const drawdownList = ref([]);
const initAmount = () => {
  initAmount_loading.value = true;
  buyOutCalculate({ date: formState.value.date, uuid: props.uuid })
    .then((res) => {
      balance.value = res.balance;
      drawdownList.value = res.drawDown;
    })
    .finally((_) => {
      initAmount_loading.value = false;
    });
};

const updateVisible = (value) => {
  visible.value = value;
  initAmount_loading.value = false;
  balance.value = '';
  drawdownList.value = [];
};

const documentList = ref([]);
// 删除文件
const remove = (index) => {
  documentList.value.splice(index, 1);
};

const save = () => {
  validate.value = true;
  if (!formState.value.date) return message.error(t('请选择') + t('日期'));
  if (!formState.value.note) return message.error(t('请输入') + t('说明'));
  formState.value['buyout'] = drawdownList.value.map(item => {
    return {
      sn: item.sn,
      name: item.name,
      amount: tool.plus(item.remain_amount, item.interest_status == 1? item.reality_interest || 0: item.remain_interest || 0),
      interest: item.remain_interest,
      reality_interest: item.interest_status == 1? item.reality_interest: 0,
      interest_status: item.interest_status || 0
    }
  });
  let params = { uuid: props.uuid, ...formState.value };
  if (!Array.isArray(props.data)) {
    params.id = props.data.id;
  }
  buyOutSave(params)
    .then((res) => {
      emits('update');
      message.success(t('保存成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const showRealityInterestColumn = computed(() => {
  return drawdownList.value.some((item) => Number(item.interest_status) === 1);
});

const DrawdownColumns = computed(() => {
  const base = [
    { title: t('账号'), dataIndex: 'name' },
    { title: t('本金/利息'), dataIndex: 'amount', width: 140, align: 'center' },
    ...(showRealityInterestColumn.value
      ? [{ title: t('实际利息'), dataIndex: 'reality_interest', width: 170 }]
      : []),
    {
      title: t('还款方式'),
      dataIndex: 'all_repayment',
      width: showRealityInterestColumn.value ? 140 : 160,
    },
    {
      title: t('还款金额1'),
      dataIndex: 'amount1',
      align: 'center',
      width: showRealityInterestColumn.value ? 140 : 160,
    },
  ];
  return base
});



watch(
  () => drawdownList.value,
  () => {
    balance.value = drawdownList.value.reduce((sum, item) => {
      if(item.interest_status == 1){
        return tool.plus(sum, tool.plus(item.remain_amount || 0, item.reality_interest || 0)); // 使用 || 0 防止 NaN
      }
      return tool.plus(sum, tool.plus(item.remain_amount || 0, item.remain_interest || 0));
    }, 0)   
  },
  { deep: true }
);



const init = () => {
  formState.value = {
    date: '',
    document: [],
    note: ''
  };
  validate.value = false;
  visible.value = true;
};
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
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}

.file-content {
  border: 1px solid #272727 !important;
  border-radius: 10px !important;
  background-color: #f7f9f8;
  padding: 15px;

  >p {
    text-align: center;
    font-size: 14px;
    color: #999;
  }
}



.related-content {
    padding: 10px;
    border: 1px solid #272727 !important;
    border-radius: 10px !important;
    margin-bottom: 24px;

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

    &.drawdownListInspection {
      border-color: #ff7875 !important;
    }
  }

  .edit-icon {
  color: @colorPrimary !important;
  font-size: 12px;
  cursor: pointer;
}

.icon-delete {
  color: @colorPrimary !important;
  cursor: pointer;
}
.sec-name {
  white-space: nowrap; /* 禁止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 使用省略号表示溢出内容 */
}

</style>
