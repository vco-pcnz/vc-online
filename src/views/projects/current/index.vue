<template>
  <vco-page-nav sup-path="/projects"></vco-page-nav>
  <div class="flex justify-between items-center mt-10">
    <p class="num">{{ pageStore.total }} {{ t('项目') }}</p>
    <TableSearch></TableSearch>
  </div>
  <a-spin :spinning="pageStore.loading" size="large">
    <div class="table-content">
      <table-block :table-data="pageStore.list" type="current"></table-block>
    </div>
    <div class="mt-5" v-if="pageStore.total">
      <a-pagination
        size="small"
        :total="pageStore.total"
        :pageSize="pageStore.pagination.limit"
        :current="pageStore.pagination.page"
        show-size-changer
        show-quick-jumper
        :show-total="(total) => t('共{0}条', [total])"
        @change="pageStore.setPaginate"
      />
    </div>
  </a-spin>
</template>

<script setup>
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from '../components/TableSearch.vue';
import TableBlock from '../components/TableBlock.vue';
import { useCloseProjectsStore } from '@/store';

const { t } = useI18n();
const pageStore = useCloseProjectsStore();

onMounted(() => {
  // 加载数据
  pageStore.getList();
});
</script>

<style lang="less" scoped>
.num {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
}
:deep(.page-search-content) {
  margin: 0;
  .search-item-content {
    & > p {
      display: none;
    }
  }
}
</style>
