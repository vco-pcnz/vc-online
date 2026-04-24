<template>
  <div>
    <vco-page-search @keyup.enter="searchHandle(false)">
      <vco-page-search-item :title="t('名称')" width="180">
        <a-input v-model:value="searchForm.project_name" :placeholder="t('请输入')" />
      </vco-page-search-item>

      <vco-page-search-item :title="t('ID')" width="180">
        <a-input v-model:value="searchForm.apply_sn" :placeholder="t('请输入')" />
      </vco-page-search-item>
      <vco-page-search-item width="180">
        <div class="flex items-center gap-2">
          <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
          <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置')
            }}</a-button>
        </div>
      </vco-page-search-item>
    </vco-page-search>


  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const emits = defineEmits(['search']);

const { t } = useI18n();

const searchForm = ref({
  project_name: '',
  apply_sn: '',
});

const searchHandle = (flag) => {
  if (flag) {
    for (const key in searchForm.value) {
      searchForm.value[key] = '';
    }
  }
  emits('search', searchForm.value);
};

defineExpose({
  searchHandle
});
</script>

<style lang="less" scoped>
.page-search-content {
  gap: 28px;
}
</style>
