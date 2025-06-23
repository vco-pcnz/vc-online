<template>
  <a-dropdown trigger="click" :disabled="disabled" v-model:open="open">
    <div>
      <a-input style="display: block" v-model:value="keyword" :placeholder="placeholder" @input="search" @change="search" @click.prevent :disabled="disabled" />
      <div class="loading-tips"><a-spin :spinning="searchLoading" size="small"></a-spin></div>
    </div>
    <template #overlay>
      <a-menu v-if="list && list.length">
        <a-menu-item v-for="item in list" :key="item.pxid" @click="setValue(item)">
          <a href="javascript:;" :class="{ active: item.entityName == keyword }">
            {{ item.entityName }}
            <span class="fs_xs ml-2" v-if="show_nzbn"> ( {{ t('新西兰商业号码') }}: {{ item.nzbn }} )</span>
          </a>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getCompanyInfo, getCompanyInfoByNzbn } from '@/api/project/loan/index';
const { t } = useI18n();
import { useAppStore } from '@/store';

const appStore = useAppStore();

const emits = defineEmits(['update:name', 'update:nzbn', 'change']);
const props = defineProps({
  name: {
    type: String
  },
  email: {
    type: String
  },
  nzbn: {
    type: [String, Number]
  },
  placeholder: {
    type: String
  },
  disabled: {
    type: Boolean
  },
  show_nzbn: {
    type: Boolean,
    default: false
  },
  is_nzbn: {
    type: Boolean,
    default: false
  }
});

const open = ref(false);
const keyword = ref('');
const list = ref([]);
const searchLoading = ref(false);

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const search = debounce(() => {
  if (props.is_nzbn) {
    emits('update:nzbn', keyword.value);
  } else {
    emits('update:name', keyword.value);
  }
  if (appStore.config.company_information_mode != 2) return;
  if (keyword.value.length < 2) return;

  searchLoading.value = true;
  getCompanyInfo({ page: 1, limit: 15, name: keyword.value, type: props.is_nzbn ? 2 : 1 })
    .then((res) => {
      list.value = res.items;
      open.value = Boolean(res.items && res.items.length);
    })
    .finally(() => {
      searchLoading.value = false;
    });
}, 300);

const hasData = (data) => {
  if (data) {
    if (typeof data === 'string') {
      return !!data;
    } else if (data instanceof Array) {
      return data.length;
    } else {
      return Object.keys(data).length;
    }
  } else {
    return false;
  }
};
const getInfo = (val) => {
  let updateEmail = !props.nzbn || !props.name;
  getCompanyInfoByNzbn({ nzbn: val }).then((res) => {
    const resEmail = hasData(res.email_address) ? res.email_address.emailAddress : '';
    let obj = {
      addr: hasData(res.address) ? res.address.address1 : '',
      address: '',
      suburb: hasData(res.address) ? res.address.address2 : '',
      postal: hasData(res.address) ? res.address.postCode : '',
      con_id: '',
      province_code_name: hasData(res.address) ? res.address.address3 : '',
      email: updateEmail ? props.email || resEmail : resEmail,
      pre: hasData(res.phone_number) ? res.phone_number.phoneCountryCode.replace('+', '') : '',
      mobile: hasData(res.phone_number) ? (hasData(res.phone_number.phoneAreaCode) ? res.phone_number.phoneAreaCode : '') + (hasData(res.phone_number.phoneNumber) ? res.phone_number.phoneNumber : '') : ''
    };
    emits('change', obj);
  });
};

const setValue = (val) => {
  keyword.value = props.is_nzbn ? val.nzbn : val.entityName;
  list.value = [];
  open.value = false;
  getInfo(val.nzbn);
  emits('update:nzbn', val.nzbn);
  emits('update:name', val.entityName);
};

watch(
  () => props.name,
  (val) => {
    if (!props.is_nzbn) {
      keyword.value = val;
    }
  },
  { deep: true, immediate: true }
);
watch(
  () => props.nzbn,
  (val) => {
    if (props.is_nzbn) {
      keyword.value = val;
    }
  },
  { deep: true, immediate: true }
);
onMounted(() => {
  appStore.requestAppInfo();
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.active {
  color: @colorPrimary !important;
}

.loading-tips {
  position: absolute;
  right: 15px;
  top: 55%;
  transform: translateY(-50%);
}
</style>
