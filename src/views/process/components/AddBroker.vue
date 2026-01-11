<template>
  <a-modal :open="visible" :title="t('添加中介')" :width="700" :footer="null" :keyboard="false" :maskClosable="false" @cancel="closeModal()">
    <div class="content sys-form-content" style="padding-top: 20px">
      <a-form ref="formRef" :model="form" :rules="dynamicRules" layout="vertical">
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item :label="t('类型f')" name="type">
              <a-radio-group v-model:value="form.type">
                <a-radio :value="item.code" :key="item.code" v-for="item in orgsStore.stakeholderType">
                  {{ item.name }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>

          <!-- 工作 -->
          <a-col :span="24" v-if="form.type">
            <a-form-item :label="t('工作')" name="job">
              <a-checkbox-group v-model:value="form.job">
                <a-checkbox :value="item.code" :key="item.code" v-for="item in orgsStore.jobs">
                  {{ item.name }}
                </a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </a-col>
          <!-- 个人相关信息 -->
          <template v-if="form.type == 20">
            <a-col :span="8">
              <a-form-item name="firstName" :label="t('名')">
                <a-input v-model:value="form.firstName" :placeholder="t('名')" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="middleName" :label="t('中间名')">
                <a-input v-model:value="form.middleName" :placeholder="t('中间名')" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="lastName" :label="t('姓')">
                <a-input v-model:value="form.lastName" :placeholder="t('姓')" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('身份证号码')" name="idcard">
                <a-input v-model:value="form.idcard" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
          </template>

          <!-- 公司相关信息 -->
          <template v-if="form.type !== 20">
            <a-col :span="24">
              <a-form-item :label="t('公司名称f')" name="name">
                <vco-company-select :email="form.email" v-model:name="form.name" :placeholder="t('请输入')" v-model:nzbn="form.nzbn" :show_nzbn="true" @change="getCompanyInfo"></vco-company-select>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('新西兰商业号码')" name="nzbn">
                <vco-company-select :email="form.email" v-model:name="form.name" :placeholder="t('请输入')" v-model:nzbn="form.nzbn" :show_nzbn="true" @change="getCompanyInfo" :is_nzbn="true"></vco-company-select>
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('联系人f')" name="contactName">
                <a-input v-model:value="form.contactName" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
          </template>

          <!-- 公共 -->

          <!-- 邮箱 -->
          <a-col :span="24">
            <a-form-item :label="t('联系邮箱f')" name="email">
              <a-input v-model:value="form.email" :placeholder="t('请输入')" :disabled="!!email_ok" />
            </a-form-item>
          </a-col>
          <!-- 电话 -->
          <a-col :span="24">
            <a-form-item :label="t('联系电话f')" name="mobile">
              <vco-mobile-input v-model:value="form.mobile" v-model:areaCode="form.pre" :disabled="!!mobile_ok"></vco-mobile-input>
            </a-form-item>
          </a-col>

          <a-col :span="24" v-if="form.type != 20">
            <vco-address ref="vcoAddressRef" @change="setAddressInfo"></vco-address>
          </a-col>

          <a-col :span="24">
            <a-form-item :label="t('证件f')" name="document">
              <vco-upload-modal v-model:list="documentList" v-model:value="form.document"></vco-upload-modal>
              <div class="documents" v-for="(item, index) in documentList" :key="index">
                <vco-file-item :file="item" :showClose="true" @remove="remove(index)"></vco-file-item>
                <div>
                  <a-date-picker v-model:value="form.expire_time[index]" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" />
                </div>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('背景f')" name="note">
              <a-textarea v-model:value="form.note" :auto-size="{ minRows: 4, maxRows: 5 }" :placeholder="t('请输入')" />
            </a-form-item>
          </a-col>
          <!-- 邀请 -->
          <a-col :span="24">
            <a-form-item :label="t('邀请')" name="verifyMode" v-if="!isEdit && !check_user_uuid">
              <a-row>
                <a-col :span="12">
                  <a-form-item-rest>
                    <a-checkbox v-model:checked="form.sendEmail" :disabled="!form.email">
                      {{ t('发送邀请邮件') }}
                    </a-checkbox>
                  </a-form-item-rest>
                </a-col>
                <a-col :span="12">
                  <a-form-item-rest>
                    <a-checkbox v-model:checked="form.sendSms" :disabled="!form.mobile">
                      {{ t('发送邀请短信') }}
                    </a-checkbox>
                  </a-form-item-rest>
                </a-col>
              </a-row>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <div class="mt-5 flex justify-end gap-5">
      <a-button type="grey" class="big shadow bold uppercase mb-5 mt-5" @click="closeModal()">{{ t('取消') }}</a-button>

      <a-button type="dark" class="big shadow bold uppercase mb-5 mt-5" :loading="loading" @click="submit">{{ t('提交') }}</a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { reactive, onMounted, ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { useOrgsStore } from '@/store';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons-vue';
import tool, { selectDateFormat, expireTimeDefault } from '@/utils/tool';
import { pick, trim, cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import useFormData from '@/utils/use-form-data';
import { stakeAdd } from '@/api/orgs/form';
import { systemConfigData } from '@/api/system';

const orgsStore = useOrgsStore();

const { t } = useI18n();

const formRef = ref();
const loading = ref(false);
const documentList = ref([]);
const isEdit = ref(false);
const check_user_uuid = ref('');
const vcoAddressRef = ref();
const emit = defineEmits(['update']);

const props = defineProps({
  visible: {
    type: Boolean
  }
});
// 表单数据
const { form, assignFields } = useFormData({
  //公司
  name: '',
  nzbn: '',
  contactName: '',
  // 个人
  user_uuid: '',
  firstName: '',
  middleName: '',
  lastName: '',
  job: [], //详情添加才会有
  //公共
  cid: [3], //分类ID
  type: '', //类型
  avatar: '',
  idcard: '', // 公司组织机构代码  人员 身份证
  email: '',
  emailCode: '',
  pre: '',
  mobile: '',
  mobileCode: '',
  province_code: '',
  city_code: '',
  district_code: '',
  addr: '',
  address: '',
  postal: '',
  document: [], //证件
  expire_time: [], //证件有效期
  note: '',
  suburb: '',
  province_code_name: '',
  con_id: '',
  do__retUser: 1
});

const mobile_ok = ref(0);
const email_ok = ref(0);

// 表单验证规则
const rules = reactive({
  // 公共验证
  mobile: [
    {
      pattern: /^\+?\d{1,15}$|^\(?\d+\)?[-.\s]?\d+([-.\s]?\d+)*$/,
      message: t('手机号') + t('格式不正确'),
      trigger: 'blur'
    }
  ],
  type: [
    {
      required: true,
      message: t('请选择') + t('类型f')
    }
  ],
  email: [
    {
      required: true,
      pattern: /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/,
      message: t('邮箱') + t('格式不正确'),
      trigger: 'blur'
    }
  ],
  addr: [
    {
      required: true,
      message: t('请输入'),
      trigger: 'blur'
    }
  ]
});

// 根据条件动态生成的规则
const dynamicRules = computed(() => {
  // 个人相关验证
  if (form.type == 20) {
    return {
      ...rules,
      idcard: [
        {
          required: true,
          message: t('请输入') + t('身份证号码')
        }
      ],
      firstName: [
        {
          required: true,
          message: t('请输入') + t('名'),
          type: 'string',
          trigger: 'blur'
        }
      ],
      lastName: [
        {
          required: true,
          message: t('请输入') + t('姓'),
          type: 'string',
          trigger: 'blur'
        }
      ]
    };
  } else {
    return {
      ...rules,
      // 公司相关验证
      name: [
        {
          required: true,
          message: t('请输入') + t('公司名称f')
        }
      ],
      nzbn: [
        { required: true, message: t('请输入') + t('新西兰商业号码'), trigger: 'blur' },
        {
          pattern: /^[a-zA-Z0-9]+$/,
          message: t('新西兰商业号码') + t('格式不正确'),
          trigger: 'blur'
        }
      ],
      contactName: [
        {
          required: true,
          message: t('请输入') + t('联系人f')
        }
      ]
    };
  }
});

// 删除文件
const remove = (index) => {
  documentList.value.splice(index, 1);
  form.expire_time.splice(index, 1);
};

// 跟新地址信息
const setAddressInfo = (val) => {
  assignFields({ ...form, ...val });
};

// 提交
const submit = () => {
  formRef.value.validate().then(() => {
    let keys = ['cid', 'type', 'avatar', 'email', 'emailCode', 'pre', 'mobile', 'mobileCode', 'document', 'expire_time', 'note', 'job', 'do__retUser', 'sendEmail', 'sendSms', 'user_uuid'];
    if (form.type == 20) {
      keys = keys.concat(['firstName', 'middleName', 'lastName', 'idcard']);
    } else {
      keys = keys.concat(['name', 'nzbn', 'contactName', 'province_code', 'city_code', 'district_code', 'address', 'addr', 'postal', 'suburb', 'province_code_name', 'con_id']);
    }
    const newData = pick(form, keys);
    newData.user_uuid = check_user_uuid.value || form.user_uuid;

    newData.sendEmail = newData.email ? (newData.sendEmail ? 1 : 0) : 0;
    newData.sendSms = newData.mobile ? (newData.sendSms ? 1 : 0) : 0;
    if (form.type == 2 || form.type == 3) newData.idcard = '';
    loading.value = true;
    stakeAdd(newData)
      .then((res) => {
        loading.value = false;
        message.success(t('添加成功'));
        emit('update', [res]);
        closeModal();
      })
      .catch(() => {
        loading.value = false;
      });
  });
};

const getCompanyInfo = (val) => {
  form.email = val.email;
  form.pre = val.pre;
  form.mobile = val.mobile;
  vcoAddressRef.value.init(val);
};

onMounted(() => {
  // 加载分类
  orgsStore.getStakeholderType();
  systemConfigData({ pcode: 'web_config', code: 'broker_value' }).then((res) => {
    form.cid = res.broker_value ? [res.broker_value] : [3];
  });
});

const initJob = (val) => {
  switch (val) {
    case 20:
      orgsStore.getJob('stakeholder_job2');
      break;
    case 1:
    case 2:
    case 4:
      orgsStore.getJob('stakeholder_job');
      break;
    case 3:
      orgsStore.getJob('stakeholder_job1');
      break;
  }
};
// 监听重置idcard 公用字段  获取job 选项
watch(
  () => form.type, // getter 函数返回一个数组
  (val, old) => {
    if (old) {
      if ((old == 20 && val < 20) || (old !== 20 && val == 20)) {
        form.idcard = '';
      }
      form.job = [];
    }
    initJob(val);

    if (val != 20) {
      nextTick(() => {
        if (vcoAddressRef.value) {
          vcoAddressRef.value.init(form);
        }
      });
    }
  },
  { immediate: true }
);

watch(
  () => documentList.value,
  (val) => {
    form.expire_time = expireTimeDefault(documentList.value.length, form.expire_time);
  },
  { immediate: true, deep: true }
);

const closeModal = () => {
  emit('update:visible', false);
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
    } else {
    }
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.verify-btn {
  min-width: 100%;
}

.ant-checkbox-group > .ant-checkbox-wrapper:not(:last-child) {
  margin-bottom: 0;
}

.documents {
  margin-top: 20px;
  .document-name {
    margin: 15px 0 10px;
  }
}

.avatarBox {
  position: relative;
  width: 128px;
  height: 128px;
  cursor: pointer;
  .default {
    width: 100%;
    height: 100%;
    border: 1px dashed #282828;
    box-sizing: border-box;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    &:hover {
      border-color: @colorPrimary !important;
    }
  }
  .anticon-loading,
  .anticon-plus {
    font-size: 18px;
  }
  .delete-img {
    background-color: rgba(0, 0, 0, 0.45);
    position: absolute;
    top: 1px;
    left: 1px;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
    &:hover {
      color: rgba(255, 255, 255, 1);
      .anticon-delete {
        color: rgba(255, 255, 255, 1);
      }
    }
    .anticon-delete {
      font-size: 17px;
      color: rgba(255, 255, 255, 0.8);
    }
    p {
      font-size: 13px;
      margin-top: 5px;
    }
  }
}
</style>
