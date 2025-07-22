<template>
  <a-modal :open="visible" :title="t('重置当前预测表')" :width="640" :footer="null" :keyboard="false" :maskClosable="false" @cancel="updateVisible(false)">
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
        <a-row :gutter="24">
          <a-col :span="16">
            <a-form-item :label="t('项目周期')" name="time_date">
              <a-range-picker
                v-model:value="formState.time_date"
                :format="selectDateFormat()"
                :placeholder="[t('开放日期'), t('到期日期')]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('真实变更开始日期')" name="real_start_date">
              <a-date-picker v-model:value="formState.real_start_date" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('变更开始日期')" name="var_start_date">
              <a-textarea v-model:value="formState.var_start_date" :placeholder="t('多个以英文逗号分隔')" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="FC1" name="fc1">
              <a-input-number
                v-model:value="formState.fc1"
                :formatter="
                  (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('预计FC2')" name="fc2">
              <a-input-number
                v-model:value="formState.fc2"
                :formatter="
                  (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item label="Line Fee" name="linefee">
              <a-input-number
                v-model:value="formState.linefee"
                :formatter="
                  (value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('Line Fee 费率')" name="LineFeeRate">
              <a-input-number
                v-model:value="formState.LineFeeRate"
                :formatter="
                  (value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/%\s?|(,*)/g, '')"
                addon-after="%"
                :controls="false"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('建立费率')" name="estabRate">
              <a-input-number
                v-model:value="formState.estabRate"
                :formatter="
                  (value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/%\s?|(,*)/g, '')"
                addon-after="%"
                :controls="false"
              />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item :label="t('利率')" name="interestRate">
              <a-input-number
                v-model:value="formState.interestRate"
                :formatter="
                  (value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                "
                :parser="(value) => value.replace(/%\s?|(,*)/g, '')"
                addon-after="%"
                :controls="false"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('覆盖文件')" name="file">
              <a-upload
                v-model:file-list="formState.file"
                accept=".xlsx, .xls"
                :customRequest="onUpload"
              >
                <a-button>
                  <upload-outlined></upload-outlined>
                  Upload
                </a-button>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <div class="flex justify-end gap-5 mt-5">
        <a-button type="brown" class="big shadow bold uppercase" @click="updateVisible(false)">{{ t('取消') }}</a-button>
        <a-button type="dark" class="big shadow bold uppercase" :loading="saveLoading" @click="submitHandle">{{ t('提交') }}</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { UploadOutlined } from '@ant-design/icons-vue';
import { selectDateFormat } from "@/utils/tool";
import { cloneDeep } from 'lodash';
import { projectDownSchedule } from '@/api/process';

const emits = defineEmits(['done', 'update:visible']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentId: {
    type: [String, Number],
    default: ''
  },
});

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const { t } = useI18n();
const formRef = ref();

const formState = ref({
  time_date: [],
  real_start_date: undefined,
  var_start_date: '',
  fc1: undefined,
  fc2: undefined,
  estabRate: undefined,
  interestRate: undefined,
  linefee: undefined,
  LineFeeRate: undefined,
  file: []
});

const formRules = {
  time_date: [
    { required: true, message: t('请选择'), trigger: 'change' }
  ],
  fc1: [
    { required: true, message: t('请输入'), trigger: 'blur' }
  ],
  fc2: [
    { required: true, message: t('请输入'), trigger: 'blur' }
  ],
  // estabRate: [
  //   { required: true, message: t('请输入'), trigger: 'blur' }
  // ],
  // interestRate: [
  //   { required: true, message: t('请输入'), trigger: 'blur' }
  // ],
  linefee: [
    { required: true, message: t('请输入'), trigger: 'blur' }
  ],
  // LineFeeRate: [
  //   { required: true, message: t('请输入'), trigger: 'blur' }
  // ],
  file: [
    { required: true, message: t('请选择'), trigger: 'change' }
  ]
}

const onUpload = ({file}) => {
  const obj = {
    file: file,
    name: file.name,
    uid: file.uid,
    status: 'done'
  }
  formState.value.file = [obj]
}

const saveLoading = ref(false);

const submitHandle = () => {
  formRef.value.validate().then(() => {
    const data = cloneDeep(formState.value);
    data.start_date = data.time_date[0].format('YYYY-MM-DD');
    data.end_date = data.time_date[1].format('YYYY-MM-DD');

    if (data.real_start_date) {
      data.real_start_date = data.real_start_date.format('YYYY-MM-DD');
    }

    delete data.time_date;

    const formData = new FormData();
    formData.append('file', data.file[0].file);
    formData.append('uuid', props.currentId);
    formData.append('start_date', data.start_date);
    formData.append('end_date', data.end_date);
    formData.append('real_start_date', data.real_start_date || '');
    formData.append('var_start_date', data.var_start_date || '');
    formData.append('fc1', data.fc1 || '');
    formData.append('fc2', data.fc2 || '');
    formData.append('estabRate', data.estabRate || '');
    formData.append('interestRate', data.interestRate || '');
    formData.append('linefee', data.linefee || '');
    formData.append('LineFeeRate', data.LineFeeRate || '');


    saveLoading.value = true;
    projectDownSchedule(formData).then(() => {
      saveLoading.value = false;
      updateVisible(false);
      emits('done');
    }).catch(() => {
      saveLoading.value = false;
    });
  });
};

watch(() => props.visible, (val) => {
  if (!val) {
    formRef.value.clearValidate();
    formRef.value.resetFields();
  }
});
</script>