<template>
  <auth-template>
    <template #content v-if="req">
      <div class="anti-money sys-form-content" v-if="!showTip">
        <a-card>
          <p class="title">AML Check</p>
          <p class="label">Identity verification</p>
          <p class="describe">Please choose one of the identification options (must include the signature page)</p>

          <a-select v-model:value="formState.identity_value" style="width: 100%">
            <a-select-option v-for="item in IdentityArr" :key="item.value" :value="item.value">
              <p>{{ item.label }}</p>
              <p class="color_grey fs_xs">{{ item.tip }}</p>
            </a-select-option>
          </a-select>
          <Addfile v-if="formState.identity_value" :code="code" v-model:document="documentList.identity"></Addfile>
          <template v-if="formState.identity_value == 6">
            <p class="color_grey fs_xs">If an overseas document is provided for identity verificatopn and the person is residing in New Zealand, a cop of the visa issued by New Zealand Immigration is also required.</p>
            <Addfile v-model:document="documentList.passport" :code="code"></Addfile>
          </template>
          <template v-if="formState.identity_value == 8">
            <p class="color_grey fs_xs">Please provide copies of one of additional documents.</p>
            <a-select v-model:value="formState.identity_value2" style="width: 100%">
              <a-select-option v-for="item in IdentityArr2" :key="item.value" :value="item.value">
                <p>{{ item.label }}</p>
                <p class="color_grey fs_xs">{{ item.tip }}</p>
              </a-select-option>
            </a-select>
            <Addfile v-if="formState.identity_value2" v-model:document="documentList.driver" :code="code"></Addfile>

            <template v-if="formState.identity_value2 == 3">
              <p class="color_grey fs_xs">Copy of the visa issued by NZ Immigration.</p>
              <Addfile v-model:document="documentList.birth" :code="code"></Addfile>
            </template>

            <template v-if="formState.identity_value2 == 4">
              <p class="color_grey fs_xs">Copy of the visa issued by NZ Immigration.</p>
              <Addfile v-model:document="documentList.citizenship" :code="code"></Addfile>
            </template>
          </template>

          <p class="label mt-10">Address verification</p>
          <p class="describe">Please choose one of the documents. The document must be addressed to the person at their home address and be no more than 12 months old.</p>

          <a-select v-model:value="formState.address_value" style="width: 100%">
            <a-select-option v-for="item in addressArr" :key="item.value" :value="item.value">
              <p>{{ item.label }}</p>
              <p class="color_grey fs_xs">{{ item.tip }}</p>
            </a-select-option>
          </a-select>
          <Addfile v-if="formState.address_value" v-model:document="documentList.address" :code="code"></Addfile>

          <p class="label mt-10">Other verification</p>

          <Addfile v-if="formState.address_value" v-model:document="documentList.other" :code="code"></Addfile>

          <p class="my-5 bold fs_xl">{{ t('反洗钱说明') }}</p>
          <a-textarea v-model:value="remark" :auto-size="{ minRows: 7, maxRows: 7 }" :placeholder="t('请输入')" show-count :maxlength="500" />
        </a-card>
        <div class="flex justify-center my-5">
          <a-button @click="submit" size="large" type="dark" style="width: 40%" :disabled="isDisabled">
            {{ t('确认') }}
          </a-button>
        </div>
      </div>
      <div v-else class="tip">
        <p class="tip-name">Thank you!</p>
        <div class="tip-content">We have received your AML documents throughour submission form, Our team will review it. andwe will contact you if further action is required.</div>
      </div>
    </template>
  </auth-template>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import tool from '@/utils/tool';
import { wash, washCode } from '@/api/wash';
import Addfile from './components/addfile.vue';

const { t } = useI18n();

const showTip = ref(true);
const req = ref(false);
const code = ref('');
const remark = ref('');
const list = ref([]);

const formState = ref({
  identity_value: '',
  identity_value2: '',
  address_value: ''
});

const documentList = ref({
  identity: [],
  passport: [],
  driver: [],
  birth: [],
  citizenship: [],
  address: [],
  other: []
});

const IdentityArr = ref([
  {
    label: 'NZ passport',
    value: '1',
    tip: ''
  },
  {
    label: 'NZ certificate of identity',
    value: '2',
    tip: ''
  },
  {
    label: 'NZ refugee travel document',
    value: '3',
    tip: ''
  },
  {
    label: 'Emergency travel document',
    value: '4',
    tip: ''
  },
  {
    label: 'NZ firearms licence',
    value: '5',
    tip: ''
  },
  {
    label: 'Overseas passport',
    value: '6',
    tip: 'And copy of the visa issued by NZ lmmigration'
  },
  {
    label: 'National identity card',
    value: '7',
    tip: ''
  },
  {
    label: 'NZ driver licence',
    value: '8',
    tip: 'And one of additional documents'
  }
]);

const IdentityArr2 = ref([
  {
    label: 'Embossed bank card',
    value: '1',
    tip: ''
  },
  {
    label: 'Bank statement',
    value: '2',
    tip: ''
  },
  {
    label: 'NZ/overseas birth certificate',
    value: '3',
    tip: 'And copy of the visa issued by NZ lmmigratilon'
  },
  {
    label: 'NZ/overseas citizenship certificate',
    value: '4',
    tip: 'And copy of the visa issued by NZ lmmigration'
  },
  {
    label: 'NZ marriage certificate',
    value: '5',
    tip: ''
  },
  {
    label: 'Statement issued by a government agency',
    value: '6',
    tip: ''
  },
  {
    label: 'SuperGold card',
    value: '7',
    tip: ''
  }
]);

const addressArr = ref([
  {
    label: 'Government document',
    value: '1'
  },
  {
    label: 'Local council notofocation/demand',
    value: '2'
  },
  {
    label: 'Rental tenancy agreement ',
    value: '3'
  },
  {
    label: 'Non-bank financial institution statement',
    value: '4'
  },
  {
    label: 'IRD tax invoice/certificate',
    value: '5'
  },
  {
    label: 'Electoral roll papers',
    value: '6'
  },
  {
    label: 'Government document',
    value: '7'
  },
  {
    label: 'Car registration/demand',
    value: '8'
  }
]);

const isDisabled = computed(() => {
  if (!documentList.value.identity.length || !documentList.value.address.length) {
    return true;
  } else {
    return false;
  }
});

const submit = () => {
  let uuids = [];
  for (const key in documentList.value) {
    if (documentList.value[key].length) {
      documentList.value[key].map((sub) => {
        uuids.push(sub.uuid);
      });
    }
  }
  wash({ code: code.value, document: uuids, remark: remark.value }).then((res) => {
    showTip.value = true;
  });
};

onMounted(() => {
  code.value = tool.getRequestParams(window.location.href).wash_code;
  if (!code.value) return;
  washCode({ code: code.value }).then((res) => {
    showTip.value = res !== 1;
    req.value = true;
  });
});

watch(
  () => formState.value.identity_value,
  (val) => {
    documentList.value.identity = [];
    documentList.value.passport = [];
    documentList.value.driver = [];
    documentList.value.birth = [];
    documentList.value.citizenship = [];
  },
  {
    immediate: true,
    deep: true
  }
);
watch(
  () => formState.value.identity_value2,
  (val) => {
    documentList.value.driver = [];
    documentList.value.birth = [];
    documentList.value.citizenship = [];
  },
  {
    immediate: true,
    deep: true
  }
);
watch(
  () => formState.value.address_value,
  (val) => {
    documentList.value.address = [];
  },
  {
    immediate: true,
    deep: true
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.anti-money {
  width: calc(100% - 20px);
  margin: 20px 10px;
  background: #fff;
  padding: 16px;
  border-radius: 16px;
  .title {
    text-align: center;
    font-size: 20px;
    font-weight: 500;
    line-height: 1.1;
    margin-bottom: 40px;
  }
  .label {
    margin-bottom: 6px;
    font-weight: 600;
    font-size: 16px;
    line-height: 1.25;
  }
  .describe {
    margin-bottom: 16px;
    font-size: 12px;
    line-height: 1.4;
    color: #888;
  }
}

.upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  user-select: none;
  color: @colorPrimary;
  &:hover {
    opacity: 0.8;
  }
  > i {
    font-size: 14px;
  }
}
.file-content {
  padding: 10px 15px;
  min-height: 50px;
  background-color: #f7f9f8;
  border: 1px dashed #282828;
  border-radius: 8px;
  max-height: calc(100vh - 500px);
  overflow-y: scroll;
  > p {
    font-size: 14px;
    color: #999;
    text-align: center;
  }
}
:deep(.unauth_container) {
  &::after {
    display: none;
  }
  .content_container .content {
    max-width: 800px;
    padding-top: 40px;
  }
}

.tip {
  width: 60%;
  margin: 100px auto 0;
  background: #fff;
  border-radius: 16px;
  padding: 60px 70px;
  
  @media (max-width: 560px) {
    width: 80%;
    padding: 60px 30px;
  }
  &-name {
    text-align: center;

    font-size: 30px;
    margin-bottom: 20px;
  }

  &-content {
    font-weight: 500;
  }
}
</style>
