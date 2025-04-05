<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <!-- 抵押物选择弹窗 -->
    <securities-dialog
      v-model:visible="securitiesVisible"
      :uuid="uuid"
      :select-data="relatedData"
      @done="securitiesDone"
    ></securities-dialog>

    <a-modal :width="800" :open="visible" :title="t('还款申请')" :getContainer="() => $refs.drawdownRequestRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item :label="t('还款标题')" name="name">
                <a-input v-model:value="formState.name" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="t('还款方式')" name="all_repayment">
                <a-select v-model:value="formState.all_repayment" @change="typeChange">
                  <a-select-option :value="0">{{ t('部分还款') }}</a-select-option>
                  <a-select-option :value="1">{{ t('全额还款') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="t('还款日期')" name="apply_date">
                <a-date-picker v-model:value="formState.apply_date" :format="selectDateFormat()" placeholder="" @change="dateChange">
                  <template #suffixIcon>
                    <a-spin v-if="getLoading"></a-spin>
                    <CalendarOutlined v-else />
                  </template>
                </a-date-picker>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="t('还款金额')" name="apply_amount">
                <a-input-number
                  v-model:value="formState.apply_amount"
                  :disabled="formState.all_repayment === 1"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </a-form-item>
            </a-col>
            <template v-if="formState.all_repayment === 1 && reductionAmount && !isNormalUser">
              <a-col :span="12">
                <a-form-item :label="t('罚息减免最大额度')">
                  <a-input-number
                    v-model:value="reductionAmount"
                    :max="99999999999"
                    :disabled="true"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="t('罚息减免')" name="reduction_money">
                  <a-input-number
                    v-model:value="formState.reduction_money"
                    :max="99999999999"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  />
                </a-form-item>
              </a-col>
            </template>
            <a-col :span="24">
              <a-form-item name="note" class="custom-label">
                <template #label>
                  <div class="w-full flex justify-between items-center">
                    <span>{{ t('还款说明') }}</span>
                    <a-dropdown trigger="click">
                      <a-button type="brown" shape="round" size="small"> {{ t('快捷选择') }}</a-button>
                      <template #overlay>
                        <a-menu>
                          <a-menu-item v-for="item in notesTypeData" :key="item.code" @click="notesTap(item)">
                            {{ item.name }}
                          </a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown>
                  </div>
                </template>
                <a-textarea v-model:value="formState.note" :placeholder="t('请输入')" :rows="2" />
              </a-form-item>
            </a-col>
            <a-col v-if="!isNormalUser" :span="24">
              <a-form-item class="custom-label related">
                <template #label>
                  <div class="w-full flex justify-between items-center">
                    <div class="flex gap-2 items-center">
                      <span>{{ t('关联抵押品') }}</span>
                      <a-switch v-model:checked="showRelatedSwitch" size="small"></a-switch>
                    </div>
                    
                    <a-button v-if="showRelatedSwitch" type="brown" shape="round" size="small" @click="securitiesVisible = true"> {{ t('选择') }}</a-button>
                  </div>
                </template>
                <div v-if="showRelatedSwitch" class="table-content sys-table-content related-content no-top-line">
                  <a-table
                    rowKey="uuid"
                    :columns="relatedColumns"
                    :data-source="relatedData"
                    :pagination="false"
                    table-layout="fixed"
                  >
                    <template #bodyCell="{ column, record, index }">
                      <template v-if="column.dataIndex === 'security_name'">
                        <p :title="record.security_name" class="sec-name">{{ record.security_name }}</p>
                      </template>
                      <template v-if="column.dataIndex === 'amount'">
                        <vco-number size="fs_md" :value="record.amount" :precision="2"></vco-number>
                      </template>
                      <template v-if="column.dataIndex === 'real_amount'">
                        <a-input-number
                          v-model:value="record.real_amount"
                          :max="99999999999"
                          :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                          class="mini"
                        />
                      </template>
                      <template v-if="column.dataIndex === 'operation'">
                        <a-popconfirm
                          v-if="dataInfo?.id && itemInData(record.uuid)"
                          :title="t('确定删除吗？')"
                          @confirm="removeItems(index, record)"
                        >
                          <i class="iconfont remove-icon">&#xe8c1;</i>
                        </a-popconfirm>

                        <i v-else class="iconfont remove-icon" @click="removeItems(index)">&#xe8c1;</i>
                      </template>
                    </template>
                  </a-table>
                </div>
              </a-form-item>
            </a-col>
            <a-col v-if="visible" :span="24">
              <documents-upload v-model:value="document">
                <div class="upload-title">{{ t('文件') }}</div>
              </documents-upload>
            </a-col>
          </a-row>
        </a-form>

        <div class="flex justify-center mt-5">
          <a-button @click="save" type="dark" class="save big uppercase shadow bold" :loading="loading">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { loanRDedit, projectLoanAllRepayment, loanDelSecurity } from '@/api/project/loan';
import { systemDictData } from '@/api/system'
import { CalendarOutlined } from '@ant-design/icons-vue';
import DocumentsUpload from './../../../discharge/components/form/DocumentsUpload.vue';
import dayjs from 'dayjs';
import { useUserStore } from '@/store'
import { selectDateFormat, removeDuplicates, numberStrFormat } from '@/utils/tool';
import SecuritiesDialog from './SecuritiesDialog.vue';
import { cloneDeep } from "lodash"

const { t } = useI18n();
const emits = defineEmits(['change']);
const userStore = useUserStore();
const isNormalUser = computed(() => userStore.isNormalUser)

const props = defineProps({
  uuid: {
    type: String
  },
  projectDetail: {
    type: Object,
    default: () => {}
  },
  count: {
    type: Number,
    default: 0
  },
  dataInfo: {
    type: Object,
    default: () => {}
  }
});

const showRelatedSwitch = ref(false)

const visible = ref(false);
const loading = ref(false);

const formState = ref({
  name: '',
  all_repayment: '',
  apply_date: '',
  apply_amount: '',
  note: '',
  reduction_money: ''
});

const reductionAmount = ref(0)

const document = ref([]);

const formRef = ref();

const getValidateInfo = () => {
  return (rule, value) => {
    if (!value) {
      return Promise.reject(t('请输入') + t('还款金额'));
    } else {
      const num = Number(value)
      if (isNaN(num)) {
        return Promise.reject(t('请输入数字'));
      } else {
        if (num < 0 || num === 0) {
          return Promise.reject(t('请输入大于0的数字'));
        }

        return Promise.resolve();
      }
    }
  }
}

const validateRed = () => {
  return (rule, value) => {
    if (!value) {
      return Promise.resolve();
    } else {
      const num = Number(value)
      if (isNaN(num)) {
        return Promise.reject(t('请输入数字'));
      } else {
        if (num < 0) {
          return Promise.reject(t('请输入大于0的数字'));
        }

        if (num > reductionAmount.value) {
          return Promise.reject(t('最大值为：{0}', [`$${numberStrFormat(reductionAmount.value)}`]));
        }

        return Promise.resolve();
      }
    }
  }
}

const formRules = ref({
  name: [{ required: true, message: t('请输入') + t('还款标题'), trigger: 'blur' }],
  all_repayment: [{ required: true, message: t('请选择') + t('还款方式'), trigger: 'change' }],
  apply_date: [{ required: true, message: t('请选择') + t('还款日期'), trigger: 'change' }],
  apply_amount: [ { required: true, validator: getValidateInfo(), trigger: 'blur' } ],
  reduction_money: [ { validator: validateRed(), trigger: 'blur' } ],
  note: [{ required: true, message: t('请输入') + t('还款说明'), trigger: 'blur' }]
});

const updateVisible = (value) => {
  visible.value = value;

  if (!value) {
    formRef.value.clearValidate();
    formRef.value.resetFields();
    Object.keys(formState.value).forEach((key) => {
      formState.value[key] = ''; // 清空每个字段
    });
    relatedData.value = []
    showRelatedSwitch.value = false
    document.value = []
  }
};

const save = () => {
  formRef.value
    .validate()
    .then(() => {
      submit();
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const submit = () => {
  const params = {
    ...formState.value,
    apply_date: dayjs(formState.value.apply_date).format('YYYY-MM-DD'),
    uuid: props.uuid,
    document: document.value
  };

  if (!params.all_repayment) {
    delete params.reduction_money
  }

  if (relatedData.value.length) {
    const security = relatedData.value.map(item => {
      return {
        uuid: item.uuid,
        real_amount: item.real_amount
      }
    })
    params.security = security
  }

  if (props.dataInfo?.id) {
    params.id = props.dataInfo?.id
  }
  loading.value = true;

  loanRDedit(params)
    .then(() => {
      loading.value = false;
      updateVisible(false);
      emits('change');
    })
    .catch(() => {
      loading.value = false;
    });
};

const getLoading = ref(false);

const calAmount = () => {
  getLoading.value = true;

  const time = dayjs(formState.value.apply_date).format('YYYY-MM-DD');
  projectLoanAllRepayment({
    uuid: props.uuid,
    date: time
  })
    .then((res) => {
      formState.value.apply_amount = Number(res.last_money) ? Number(res.last_money) : 0
      reductionAmount.value = Number(res.reduction_money) ? Number(res.reduction_money) : 0
      getLoading.value = false;
    })
    .catch(() => {
      getLoading.value = false;
    });
};

const dateChange = (date) => {
  if (date && formState.value.all_repayment === 1) {
    calAmount();
  } else {
    formState.value.apply_amount = 0;
    reductionAmount.value = 0
  }
};

const typeChange = () => {
  if (formState.value.apply_date && formState.value.all_repayment === 1) {
    calAmount();
  } else {
    formState.value.apply_amount = 0;
    reductionAmount.value = 0
  }
  formState.value.note = formState.value.all_repayment === 1 ? 'Full Repayment' : ''
};

const securitiesVisible = ref(false)

const relatedColumns = reactive([
  { title: t('名称'), dataIndex: 'security_name', width: 140 },
  { title: t('产权编号'), dataIndex: 'card_no', width: 100 },
  { title: t('类型'), dataIndex: 'type_name', width: 90 },
  { title: t('抵押物价值'), dataIndex: 'amount', width: 150 },
  { title: t('当前抵押物价值'), dataIndex: 'real_amount', width: 170 },
  { title: t('操作1'), dataIndex: 'operation', fixed: 'right', align: 'center', width: 50}
]);

const relatedData = ref([])

const securitiesDone = (data) => {
  const arr = cloneDeep(data)
  const selected = Array.from(new Set([...relatedData.value, ...arr]));
  const selData = removeDuplicates(selected, 'uuid')
  selData.forEach(item => {
    item.real_amount = Number(item.real_amount) ? item.real_amount : item.amount
  })

  relatedData.value = selData
}

const removeItems = async (index, data) => {
  if (props.dataInfo?.id && data) {
    const params = {
      uuid: props.uuid,
      ids: [data.uuid]
    }

    await loanDelSecurity(params).then(() => {
      relatedData.value.splice(index, 1)
      const _index = relatedStaticData.value.findIndex(item => item.uuid === data.uuid)
      if (_index > -1) {
        relatedStaticData.value.splice(_index, 1)
      }
      return true
    }).catch(() => {
      return false
    })
  } else {
    relatedData.value.splice(index, 1)
  }
}

const itemInData = (uuid) => {
  const obj = relatedStaticData.value.find(item => item.uuid === uuid)
  return obj ? true : false
}

const setDefaultTitle = () => {
  const project_apply_sn = props.projectDetail?.base?.project_apply_sn || 'Repayment'
  const count = props.count
  const title = `${project_apply_sn}-${count + 1}-${dayjs().format('YYYYMMDD')}`
  formState.value.name = title
}

const notesTypeData = ref([])
const getNotesType = () => {
  systemDictData('repayment_notes_type').then(res => {
    notesTypeData.value = res || []
  })
}

const notesTap = (data) => {
  formState.value.note = data.name
}

const relatedStaticData = ref([])

const setFormData = () => {
  const data = cloneDeep(props.dataInfo)
  for (const key in formState.value) {
    if (key === 'apply_date') {
      formState.value[key] = dayjs(data[key])
    } else {
      formState.value[key] = data[key]
    }
  }

  if (data.security && data.security.length) {
    showRelatedSwitch.value = true
    relatedData.value = cloneDeep(data.security)
    relatedStaticData.value = cloneDeep(data.security)
  }

  if (data.all_repayment) {
    calAmount();
  }
}

const init = () => {
  visible.value = true;
  if (!props.dataInfo?.id) {
    setDefaultTitle()
  } else {
    setFormData()
  }
  getNotesType()
};

defineExpose({
  init
})
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.drawdown-request {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 40px 40px 24px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 40px 40px;
      .save {
        margin-top: 24px;
      }
    }
  }
  :deep(.ant-input-number-disabled) {
    color: #282828 !important;
  }

  :deep(.custom-label) {
    .ant-form-item-label {
      label {
        width: 100%;
      }
    }
    &.related {
      margin-bottom: 0 !important;
      .ant-form-item-control-input {
        min-height: 0 !important;
      }
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
  }
}

.sec-name {
  white-space: nowrap; /* 禁止换行 */
  overflow: hidden; /* 隐藏溢出内容 */
  text-overflow: ellipsis; /* 使用省略号表示溢出内容 */
}
</style>
