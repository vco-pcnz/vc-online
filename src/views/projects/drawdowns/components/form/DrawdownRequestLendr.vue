<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <a-modal :width="850" :open="visible" v-if="visible" title="Drawdown request" :getContainer="() => $refs.drawdownRequestRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="input-item">
              <div class="label" :class="{ err: !formState.name && validate }">Drawdown title</div>
              <a-select :loading="loading_type" :disabled="isEdit" style="width: 100%" v-model:value="formState.name" :options="title_type" :fieldNames="{ label: 'name', value: 'code' }"></a-select>
            </div>
            <div class="input-item" style="margin: 15.5px 0">
              <div class="label" :class="{ err: !formState.apply_date && validate }">{{ t('日期') }}</div>
              <a-date-picker class="datePicker" :disabledDate="disabledDateFormat" inputReadOnly v-model:value="formState.apply_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" :showToday="false" />
            </div>

            <div class="input-item">
              <vco-tip style="padding-bottom: 5px" :tip="t('此说明内容将显示在交易记录中')">
                <div class="label" style="padding: 0" :class="{ err: !formState.note && validate }">{{ t('说明') }}</div>
              </vco-tip>
              <a-input v-model:value="formState.note" />
            </div>
            <div class="input-item" style="padding-top: 15px">
              <div class="label">{{ t('金额') }}</div>
              <a-input-number v-model:value="formState.apply_amount" :max="99999999999" :min="0" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="input-item">
              <vco-tip style="padding-bottom: 5px" :tip="t('此消息针对 FC 的批准评论')">
                <div class="label" style="padding: 0">{{ t('消息') }}</div>
              </vco-tip>
              <a-textarea v-model:value="formState.remark" :rows="14" />
            </div>
          </a-col>
        </a-row>
        <p class="my-5 bold fs_xl">Documents</p>
        <p class="label" style="margin-top: -15px; opacity: 0" :class="{ err: !formState.d_file.length && validate }">Provide at least one of these documents{{ docNames ? ` (${docNames})` : '' }}</p>

        <template v-for="item in formModal2" :key="item.id">
          <documents-upload v-if="!item.children" v-model:value="item['files']" v-model:list="item['list']">
            <div class="upload-title">
              <i class="iconfont">&#xe795;</i>
              <span class="name">{{ item.name }}</span>
            </div>
          </documents-upload>
        </template>

        <div class="upload-title">
          <i class="iconfont">&#xe795;</i>
          <span class="name">Certificates</span>
        </div>
        <template v-for="item in formModal3" :key="item.id">
          <documents-upload v-model:visible="item.check" v-model:value="item['files']" v-model:list="item['list']">
            <div class="checkbox-item">
              <a-checkbox v-model:checked="item.check"> {{ item.name }}</a-checkbox>
            </div>
          </documents-upload>
        </template>

        <div class="flex justify-center mt-5">
          <a-button type="dark" @click="save" class="save big uppercase shadow bold" :loading="loading">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
  <vco-confirm-alert v-model:visible="visibleTip" :confirmTxt="confirmTxt" @submit="submit"></vco-confirm-alert>
</template>

<script scoped setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { annexSel } from '@/api/project/annex';
import { loanDedit, loanDchange } from '@/api/project/loan';
import { selectDateFormat } from '@/utils/tool';
import DocumentsUpload from './DocumentsUpload.vue';
import { systemDictData } from '@/api/system';
import tool from '@/utils/tool';
import dayjs from 'dayjs';
import { hasPermission } from '@/directives/permission/index';
import { pick } from 'lodash';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  uuid: {
    type: String
  },
  projectDetail: {
    type: Object
  },
  detail: {
    type: Object
  },
  statisticsData: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);
const formModal2 = ref([]);
const visibleTip = ref(false);
const confirmTxt = ref('');
const formModal3 = ref([]);
const formState = ref({
  uuid: '',
  name: '',
  note: '',
  remark: '',
  apply_date: '',
  apply_amount: '',
  vip_amount: '',
  p_file: [],
  d_file: []
});

const docNames = computed(() => {
  return formModal2.value
    .map((item) => item?.name)
    .filter(Boolean)
    .join(', ');
});

const updateVisible = (value) => {
  visible.value = value;
};

const disabledDateFormat = (current) => {
  const startDate = props.projectDetail.loan.start_date;
  const endDate = props.projectDetail.loan.end_date;
  // 当前日期
  const currentDate = dayjs();

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  // if (currentDate.isBefore(endDate)) {
  //   if (current && current.isAfter(endDate, 'day')) {
  //     return true;
  //   }
  // } else {
  //   if (current && current.isAfter(currentDate, 'day')) {
  //     return true;
  //   }
  // }

  return false;
};

const save = (tip) => {
  validate.value = true;
  formState.value.uuid = props.uuid;
  formState.value.d_file = formModal2.value.filter((item) => {
    return item.files && item.files.length;
  });

  formState.value.p_file = formModal3.value.filter((item) => {
    return item.files && item.files.length;
  });

  let amount = formState.value.apply_amount || 0;
  if (hasPermission('projects:drawdowns:add')) {
    // vip
    amount = formState.value.vip_amount || 0;
  }
  if (!formState.value.name || !formState.value.note || !formState.value.d_file.length || !formState.value.apply_date || amount == 0) return;

  let available = props.statisticsData?.available;
  if (props.detail?.id) {
    available = tool.plus(Number(props.statisticsData?.available), Number(detail_amount.value));
  }

  if (Number(amount) > Number(available)) {
    visibleTip.value = true;
    confirmTxt.value = t('放款金额 {0},可用金额 {1},超出金额 {2} 是否继续放款?', [tool.formatMoney(amount), tool.formatMoney(available), tool.formatMoney(tool.minus(amount, available))]);
    return;
  }
  submit();
};

const submit = () => {
  let ajax = loanDedit;
  let params = {
    ...formState.value
  };
  if (props.detail) {
    params = {
      id: props.detail.id,
      ...formState.value
    };
    ajax = loanDchange;
  }

  // 删除超额数据
  // params.build__data.forEach((item) => {
  //   delete item.excess_amount;
  // });

  loading.value = true;

  ajax(params)
    .then((res) => {
      visible.value = false;
      validate.value = false;
      emits('change');
      message.success(t('提交成功'));
    })
    .finally((_) => {
      loading.value = false;
      visibleTip.value = false;
    });
};

const title_type = ref([]);
const loading_type = ref(false);
const loadType = (reset) => {
  if (title_type.value.length) {
    if (!formState.value.name) {
      formState.value.name = title_type.value[0].code;
    }
    return;
  }
  loading_type.value = true;
  systemDictData('drawdown_title_type')
    .then((res) => {
      title_type.value = res;
      if (!formState.value.name) {
        formState.value.name = res[0].code;
      }
    })
    .finally((_) => {
      loading_type.value = false;
    });
};

const init = () => {
  validate.value = false;
  formModal2.value = [];
  formModal3.value = [];
  detail_amount.value = 0;
  if (props.detail) {
    initData();
  } else {
    formState.value.name = '';
    formState.value.note = 'Development Drawdown';
    formState.value.remark = '';
    formState.value.apply_date = '';
    formState.value.d_file = [];
    formState.value.p_file = [];
    formState.value.apply_amount = '';
    formState.value.vip_amount = '';
  }

  annexSel({ apply_uuid: props.uuid, type: 2 }).then((res) => {
    const ids = res.map((item) => {
      return item.name;
    });
    if (props.detail) {
      props.detail.d_file.map((item) => {
        if (ids.includes(item.name)) {
          res[ids.indexOf(item.name)]['list'] = item.attach;
        }
      });
    }
    formModal2.value = res;
  });
  annexSel({ apply_uuid: props.uuid, type: 3 }).then((res) => {
    if (res && res.length) {
      res.map((item) => {
        item['check'] = false;
      });
      if (props.detail) {
        const file_ids = props.detail.d_file.map((item) => {
          return item.name;
        });
        if (file_ids.includes('Certificates')) {
          const certificateData = props.detail.d_file[file_ids.indexOf('Certificates')];
          const uuids = certificateData.attach.map((item) => {
            return item.uuid;
          });
          res.map((item) => {
            if (certificateData.note_attach[item.name]) {
              item['check'] = true;
              item['list'] = [];
              certificateData.note_attach[item.name].map((sub) => {
                if (uuids.includes(sub)) {
                  item['list'].push(certificateData.attach[uuids.indexOf(sub)]);
                }
              });
            }
          });
        }
      }
    }
    formModal3.value = res;
  });
  loadType();
  visible.value = true;
};

// edit
const detail_amount = ref(0); //编辑总金额
const isEdit = ref(false);
const initData = () => {
  isEdit.value = true;
  let keys = ['name', 'note', 'remark', 'apply_date', 'vip_amount', 'apply_amount'];
  const newData = pick(props.detail, keys);
  Object.assign(formState.value, newData);

  detail_amount.value = props.detail.apply_amount || 0;
  if (hasPermission('projects:drawdowns:add')) {
    // vip
    detail_amount.value = props.detail.vip_amount || 0;
  }
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.drawdown-request {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 24px;
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
          opacity: 1 !important;
        }
      }

      .save {
        margin-top: 24px;
      }
    }
  }

  .upload-title {
    align-items: center;
    border-bottom: 1px solid #e2e5e2;
    margin-bottom: 8px;
    padding-bottom: 12px;
    padding-top: 8px;
    .iconfont {
      font-size: 18px;
    }

    .name {
      font-weight: 600;
      margin-left: 10px;
    }
  }

  .checkbox-item {
    margin-bottom: 8px;
    padding-bottom: 12px;
    padding-top: 8px;
  }
}
</style>
