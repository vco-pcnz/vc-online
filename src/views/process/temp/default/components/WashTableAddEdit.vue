<template>
  <a-modal :open="visible" :title="t('新增信息')" :width="640" :footer="null" :keyboard="false" :maskClosable="false" @update:open="updateVisible">
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
        <a-row :gutter="24">
          <a-col :span="24">
            <a-form-item label="">
              <vco-choose-user
                ref="vcoChooseUserRef"
                url="stake/selStake?type=20"
                @change="choiceUserDone"
                :title="t('搜索利益相关者')"
                :showRest="Boolean(!formState.id && formState.stake_uuid)"
              ></vco-choose-user>
            </a-form-item>
          </a-col>
          <!-- <a-col :span="24">
            <a-form-item :label="t('类型')" name="cate">
              <a-select v-model:value="formState.cate">
                <a-select-option v-for="item in cateList" :key="item.id" :value="item.id">
                  {{ item.title }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col> -->

          <a-col :span="24">
            <a-form-item :label="t('类型')" name="cate">
              <a-radio-group v-model:value="formState.cate">
                <a-radio v-for="item in cateList" :key="item.id" :value="item.id">
                  {{ item.title }}
                </a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <template v-if="Boolean(formState.stake_uuid)">
            <a-col :span="24">
              <a-form-item :label="t('名称')" name="name">
                <a-input v-model:value="formState.name" />
              </a-form-item>
            </a-col>
          </template>

          <template v-else>
            <a-col :span="8">
              <a-form-item name="firstName" :label="t('名')">
                <a-input v-model:value="formState.firstName" :placeholder="t('名')" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="middleName" :label="t('中间名')">
                <a-input v-model:value="formState.middleName" :placeholder="t('中间名')" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="lastName" :label="t('姓')">
                <a-input v-model:value="formState.lastName" :placeholder="t('姓')" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('身份证号码')" name="idcard">
                <a-input v-model:value="formState.idcard" :placeholder="t('请输入')" />
              </a-form-item>
            </a-col>
          </template>

          <a-col :span="24">
            <a-form-item :label="t('邮箱')" name="email">
              <a-input v-model:value="formState.email" />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('手机号')" name="mobile">
              <vco-mobile-input
                v-if="visible"
                v-model:value="formState.mobile"
                v-model:areaCode="formState.pre"
                :formRef="formRef"
                validateField="mobile"
              ></vco-mobile-input>
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item :label="t('项目文件')">
              <vco-upload-modal v-model:list="documentList" v-model:value="formState.document"></vco-upload-modal>
              <div class="documents" v-for="(item, index) in documentList" :key="index">
                <vco-file-item :file="item" :showClose="true" @remove="remove(index)"></vco-file-item>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('背景f')" name="note">
              <a-textarea v-model:value="formState.note" :auto-size="{ minRows: 4, maxRows: 5 }" :placeholder="t('请输入')" />
            </a-form-item>
          </a-col>
          <a-col :span="12" class="mb-10">
            <a-form-item-rest>
              <a-checkbox v-model:checked="formState.sendEmail">
                {{ t('发送邀请邮件') }}
              </a-checkbox>
            </a-form-item-rest>
          </a-col>
          <a-col :span="12">
            <a-form-item-rest>
              <a-checkbox v-model:checked="formState.sendSms">
                {{ t('发送邀请短信') }}
              </a-checkbox>
            </a-form-item-rest>
          </a-col>
        </a-row>
      </a-form>

      <a-button type="dark" class="big shadow bold uppercas mb-5 mt-5ze" style="width: 100%" :loading="subLoading" @click="submitHandle">
        {{ t('保存') }}
      </a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { watch, computed, ref, nextTick } from 'vue';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';
import { pick, trim, cloneDeep } from 'lodash';
import { washAdd } from '@/api/project/wash';
import tool from '@/utils/tool';
import { message } from 'ant-design-vue/es';

const emits = defineEmits(['update:visible', 'update']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  currentId: {
    type: [Number, String],
    required: true
  },
  infoData: {
    type: Object,
    default: () => {}
  }
});

const { t } = useI18n();

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const cateList = ref([
  { title: t('借款人'), id: 1 },
  { title: t('担保人'), id: 2 },
  { title: t('投资人'), id: 3 }
]);

const formRef = ref();
const formState = ref({
  id: '',
  uuid: '',
  stake_uuid: '',
  annex_id: 0,
  cate: '',
  // name: '',
  firstName: '',
  idcard: '',
  middleName: '',
  lastName: '',
  pre: '',
  mobile: '',
  email: '',
  note: '',
  sendEmail: false,
  sendSms: false,
  document: []
});
const formRules = {
  name: [{ required: true, message: t('请输入') + t('名称') }],
  idcard: [{ required: true, message: t('请输入') + t('身份证号码') }],
  firstName: [{ required: true, message: t('请输入') + t('名') }],
  lastName: [{ required: true, message: t('请输入') + t('姓') }],
  email: [{ required: true, message: t('请输入') + t('邮箱') }],
  mobile: [{ required: true, message: t('请输入') + t('电话') }],
  cate: [{ required: true, message: t('请选择') + t('类型') }]
};

const subLoading = ref(false);
const submitHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = cloneDeep(formState.value);
      params.uuid = props.currentId;
      params.sendEmail = formState.value.sendEmail ? 1 : 0;
      params.sendSms = formState.value.sendSms ? 1 : 0;
      if (params.stake_uuid) {
        params.firstName = undefined;
        params.middleName = undefined;
        params.lastName = undefined;
        params.idcard = undefined;
      }

      subLoading.value = true;
      washAdd(params)
        .then(() => {
          subLoading.value = false;
          emits('update');
          updateVisible(false);
        })
        .catch(() => {
          subLoading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const vcoChooseUserRef = ref();

const choiceUserDone = (data) => {
  let keys = ['pre', 'mobile', 'email'];
  const newData = pick(data, keys);
  newData['stake_uuid'] = data.uuid;
  documentList.value = data.document ? cloneDeep(data.document) : [];
  formState.value = { ...formState.value, ...newData };
};

const documentList = ref([]);
// 删除文件
const remove = (index) => {
  documentList.value.splice(index, 1);
};

watch(
  () => props.visible,
  (val) => {
    if (!val) {
      formRef.value.clearValidate();
      formRef.value.resetFields();
      formState.value = {
        id: '',
        uuid: '',
        stake_uuid: '',
        annex_id: 0,
        cate: '',
        // name: '',
        firstName: '',
        middleName: '',
        lastName: '',
        pre: '',
        mobile: '',
        email: '',
        note: '',
        sendEmail: false,
        sendSms: false,
        document: []
      };
      documentList.value = [];
    } else {
      if (props.infoData) {
        formState.value = cloneDeep(props.infoData);
        formState.value.sendEmail = formState.value.sendEmail == '1';
        formState.value.sendSms = formState.value.sendSms == '1';
        documentList.value = props.infoData.document ? cloneDeep(props.infoData.document) : [];
      }
    }
  }
);
</script>
<style lang="less" scoped>
.total-amount-info {
  :deep(.ant-statistic-content) {
    font-size: 24px !important;
    line-height: 48px !important;
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
</style>
