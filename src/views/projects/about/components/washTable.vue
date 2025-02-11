<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="1000" :open="visible" :title="t('利益相关者')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '100%' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'name'">
              {{ record.name }}
            </template>
            <template v-if="column.dataIndex === 'cate'">
              <span class="cer" v-if="record.cate == 1">{{ t('借款人') }}</span>
              <span class="cer" v-if="record.cate == 2">{{ t('担保人') }}</span>
              <span class="cer" v-if="record.cate == 3">{{ t('投资人') }}</span>
            </template>
          </template>
        </a-table>
        <div class="flex justify-center">
          <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import { projectDetailGetWash } from '@/api/project/wash';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  currentId: {
    type: String
  }
});

const visible = ref(false);

const updateVisible = (value) => {
  visible.value = value;
};

const loading = ref(false);
const total = ref(0);
const pagination = ref({
  page: 1,
  limit: 10
});

const columns = reactive([
  { title: t('名称'), dataIndex: 'name', width: 150, align: 'left', ellipsis: true },
  { title: t('类型'), dataIndex: 'cate', width: 100, align: 'center', ellipsis: true },
  { title: t('邮箱'), dataIndex: 'email', width: 150, align: 'left', ellipsis: true },
  { title: t('电话'), dataIndex: 'mobile', width: 140, align: 'center', ellipsis: true }
]);
const tableData = ref([]);

const loadData = () => {
  loading.value = true;

  projectDetailGetWash({ uuid: props.currentId, ...pagination.value })
    .then((res) => {
      tableData.value = res.data;
      total.value = res.count;
      if (selectAll.value == 'all') {
        selectAll.value = '';
        onSelectAll('all');
      } else {
        selectAll.value = '';
        onSelectAll('');
      }
    })
    .finally((_) => {
      loading.value = false;
    });
};

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

const init = () => {
  visible.value = true;
  pagination.value.page = 1;
  loadData();
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 24px 72px;
      .label {
        color: #888;
        font-size: 12px;
        padding: 0 0 8px;
        &.err {
          color: #c1430c;
        }
      }

      .save {
        width: 100%;
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
</style>
