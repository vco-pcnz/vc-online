<template>
  <a-dropdown trigger="click" :disabled="disabled" v-model:open="open">
    <div>
      <a-input style="display: block" v-model:value="keyword" :placeholder="placeholder" @input="search" @click.prevent :disabled="disabled" />
      <div class="loading-tips"><a-spin :spinning="searchLoading" size="small"></a-spin></div>
    </div>
    <template #overlay>
      <a-menu v-if="list && list.length">
        <a-menu-item v-for="item in list" :key="item.pxid" @click="setValue(item)">
          <a href="javascript:;" :class="{ active: item.entityName == keyword }">
            {{ item.entityName }}
            <span class="fs_xs ml-2" v-if="show_nzbz"> ( NZBZ: {{ item.nzbn }} )</span>
          </a>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getCompanyInfo } from '@/api/project/loan/index';
import { number } from 'echarts';
const { t } = useI18n();

const emits = defineEmits(['update:name', 'update:nzbz']);
const props = defineProps({
  name: {
    type: String
  },
  nzbz: {
    type: [String, Number]
  },
  placeholder: {
    type: String
  },
  disabled: {
    type: Boolean
  },
  show_nzbz: {
    type: Boolean,
    default: false
  },
  is_nzbz: {
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
  if (keyword.value.length < 2) return;

  searchLoading.value = true;
  getCompanyInfo({ page: 1, limit: 15, name: keyword.value })
    .then((res) => {
      list.value = res.items;
      open.value = Boolean(res.items && res.items.length);
    })
    .finally(() => {
      searchLoading.value = false;
    });
}, 300);

const setValue = (val) => {
  keyword.value = props.is_nzbz ? val.nzbn : val.entityName;
  open.value = false;
  emits('update:nzbz', val.nzbn);
  emits('update:name', val.entityName);
};

watch(
  () => props.name,
  (val) => {
    if (!props.is_nzbz) {
      keyword.value = val;
    }
  },
  { deep: true, immediate: true }
);
watch(
  () => props.nzbz,
  (val) => {
    if (props.is_nzbz) {
      keyword.value = val;
    }
  },
  { deep: true, immediate: true }
);
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
