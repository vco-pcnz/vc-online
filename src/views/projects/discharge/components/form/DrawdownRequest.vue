<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <a-modal :width="700" :open="visible" :title="t('解押申请')" :getContainer="() => $refs.drawdownRequestRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-row :gutter="24">
            <!-- <a-col :span="24">
              <a-alert
                type="info"
                class="mb-5"
              >
                <template #message>
                  <a-row :gutter="24">
                    <a-col :span="7">
                      <a-form-item :label="t('土地价值')" class="info-txt" name="land_amount">
                        <vco-number :value="detail?.land_amount" size="fs_xl" :precision="2" :end="true"></vco-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="1" class="plus-txt"><i class="iconfont">&#xe889;</i></a-col>
                    <a-col :span="7">
                      <a-form-item :label="t('建筑价值')" class="info-txt" name="build_amount">
                        <vco-number :value="detail?.build_amount" size="fs_xl" :precision="2" :end="true"></vco-number>
                      </a-form-item>
                    </a-col>
                    <a-col :span="1" class="plus-txt"><i class="iconfont">=</i></a-col>
                    <a-col :span="8" class="total-amount-info">
                      <a-form-item :label="t('抵押物价值')" class="info-txt">
                        <vco-number :value="detail?.amount" size="fs_xl" :precision="2" :end="true"></vco-number>
                      </a-form-item>
                    </a-col>
                  </a-row>
                </template>
              </a-alert>
            </a-col> -->
            <a-col :span="24">
              <a-alert type="info" class="mb-5">
                <template #message>
                  <a-form-item :label="t('抵押物价值')" class="info-txt">
                    <vco-number :value="detail?.amount" size="fs_xl" :precision="2" :end="true"></vco-number>
                  </a-form-item>
                  <a-form-item :label="t('地址')" class="info-txt">
                    <p>{{ detail.card_no + ', ' + detail.city }}</p>
                  </a-form-item>
                </template>
              </a-alert>
            </a-col>
            <a-col :span="14">
              <a-form-item :label="t('文件夹名称')" name="dirname">
                <a-input v-model:value="formState.dirname" :placeholder="t('请输入')" :rows="3" />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item :label="t('当前抵押物价值')" name="real_amount">
                <a-input-number v-model:value="formState.real_amount" :max="99999999999" :placeholder="t('请输入')" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
              </a-form-item>
            </a-col>
            <a-col :span="14">
              <a-form-item :label="t('还款日期')">
                <a-date-picker class="datePicker" inputReadOnly v-model:value="formState.repayment_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" :showToday="false" />
              </a-form-item>
            </a-col>
            <a-col :span="10">
              <a-form-item :label="t('净收益')">
                <a-input-number
                  v-model:value="formState.net_proceeds_price"
                  :max="99999999999"
                  :placeholder="t('请输入')"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('解押说明')" name="reason">
                <a-textarea v-model:value="formState.reason" :placeholder="t('请输入')" :rows="3" />
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
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { dischargeEdit } from '@/api/project/loan';
import DocumentsUpload from './DocumentsUpload.vue';
import { selectDateFormat } from '@/utils/tool';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  pUuid: {
    type: String
  },
  detail: {
    type: Object,
    default: () => {}
  }
});

const visible = ref(false);
const loading = ref(false);

const formState = ref({
  dirname: '',
  real_amount: '',
  reason: '',
  repayment_date: '',
  net_proceeds_price: ''
});
const document = ref([]);

const formRef = ref();

const formRules = ref({
  dirname: [{ required: true, message: t('请输入') + t('文件夹名称'), trigger: 'blur' }],
  real_amount: [{ required: true, message: t('请输入') + t('当前抵押物价值'), trigger: 'blur' }]
});

const updateVisible = (value) => {
  if (!value) {
    document.value = [];
    formRef.value.clearValidate();
    formRef.value.resetFields();
    Object.keys(formState.value).forEach((key) => {
      formState.value[key] = ''; // 清空每个字段
    });
  }

  visible.value = value;
};

const save = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = {
        ...formState.value,
        uuid: props.detail.uuid,
        p_uuid: props.pUuid,
        document: document.value
      };
      loading.value = true;

      dischargeEdit(params)
        .then(() => {
          loading.value = false;
          updateVisible(false);
          emits('change');
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const init = () => {
  updateVisible(true);

  nextTick(() => {
    formState.value.dirname = props.detail.security_name;
  });
};
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
}

.plus-txt {
  position: relative;
  .iconfont {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #282828;
    font-weight: bold;
    font-size: 18px;
  }
}

.info-txt {
  margin-bottom: 0;
}
</style>
