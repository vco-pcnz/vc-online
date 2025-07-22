<template>
  <div>
    <a-modal
      :open="visible"
      :title="t('选择项目')"
      :width="800"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      @cancel="updateVisible(false)"
    >
      <a-alert v-if="Object.keys(selectedObj).length" type="success">
        <template #message>
          <p>{{ t('当前选择') }}</p>
          <div>
            <span>{{ selectedObj?.project_name || '--' }}</span>
            <span class="pl-1 pr-1">/</span>
            <span>{{ selectedObj?.project_apply_sn || '--' }}</span>
          </div>
        </template>
      </a-alert>

      <vco-page-search>
        <vco-page-search-item :title="t('项目信息')" width="315">
          <vco-type-input v-model="searchForm.project_keyword" v-model:type="searchForm.project_search_type" :type-data="projectsTypeData" :placeholder="t('请输入')"></vco-type-input>
        </vco-page-search-item>

        <vco-page-search-item>
          <div class="flex items-center gap-2">
            <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
            <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
          </div>
        </vco-page-search-item>
      </vco-page-search>

      <a-spin :spinning="tableLoading" size="large">
        <div class="table-content sys-table-content mt-5">
          <a-table
            ref="tableRef"
            rowKey="id"
            :columns="columns"
            :data-source="tableData"
            table-layout="fixed"
            :pagination="false"
            :scroll="{ y: 300 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'project_name'">
                <span>{{ record?.project_name || '--' }}</span>
              </template>
              <template v-if="column.dataIndex === 'project_apply_sn'">
                <span>{{ record?.project_apply_sn || '--' }}</span>
              </template>
              <template v-if="column.dataIndex === 'borrower'">
                <span>{{ getBorrower(record) }}</span>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a-button
                  :type="record.selected ? 'primary' : 'default'" size="small" shape="round" class="uppercase"
                  @click="selectHandle(record)"
                >{{ record.selected ? t('已选择') : t('选择') }}</a-button>
              </template>
            </template>
          </a-table>
        </div>
        <div v-if="tableData.length">
          <a-pagination
            size="small"
            :total="pageObj.total"
            :current="pageObj.currentPage"
            :page-size="pageObj.pageSize"
            show-size-changer
            show-quick-jumper
            :show-total="(total) => t('共{0}条', [total])"
            @change="pageChange"
          />
        </div>
      </a-spin>

      <div class="mt-6 flex justify-end gap-5">
        <a-button
          type="grey" class="big shadow bold uppercase"
          @click="updateVisible(false)"
        >{{ t('取消') }}</a-button>

        <a-button
          type="dark" class="big shadow bold uppercase"
          :loading="submitLoading"
          @click="submitHandle"
        >{{ t('确定') }}</a-button>
      </div>
    </a-modal>
  </div>
  
</template>

<script setup>
  import { ref, reactive, watch, computed } from "vue";
  import { selProject, shareSaveProject } from '@/api/process';
  import { useTableList } from '@/hooks/useTableList';
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from 'lodash';

  const emits = defineEmits(['update:visible', 'done'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    sharedProject: {
      type: Object,
      default: () => {}
    },
    projectUuid: {
      type: String,
      default: ''
    }
  });

  const { t } = useI18n();

  const projectParams = computed(() => ({
    uuid: props.projectUuid
  }))

  const { tableRef, tableLoading, pageObj, tableData, pageChange, getTableData } = useTableList(selProject, projectParams.value, false);
  const columns = reactive([
    { title: t('项目名称'), dataIndex: 'project_name', width: 140, align: 'left' },
    { title: t('项目ID'), dataIndex: 'project_apply_sn', width: 120, align: 'left' },
    { title: t('借款人'), dataIndex: 'borrower', width: 120, align: 'left' },
    {
      title: t('操作1'),
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: 90,
    },
  ]);

  const selectedObj = ref({});

  // 同步 tableData 的 selected 字段
  const syncSelected = () => {
    (tableData.value || []).forEach(item => {
      item.selected = selectedObj.value.uuid === item.uuid;
    });
  };

  watch(
    () => tableData.value,
    () => syncSelected(),
    { immediate: true }
  );

  // 选择按钮点击事件
  const selectHandle = (record) => {
    if (record.selected) {
      selectedObj.value = {};
    } else {
      selectedObj.value = record;
    }
    syncSelected();
  };

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const getBorrower = (record) => {
    if (record.borrower_type === 1) {
      return record.user_name || '--';
    } else {
      return record.organization_name || '--';
    }
  }

  watch(() => props.visible, (val) => {
    if (val) {
      selectedObj.value = cloneDeep(props.sharedProject) || {};
      getTableData(true);
    } else {
      selectedObj.value = {};
      tableData.value = [];
    }
  })

  const projectsTypeData = [
    {
      label: t('全部属性'),
      value: ''
    },
    {
      label: t('名称'),
      value: 'name'
    },
    {
      label: t('ID'),
      value: 'apply_sn'
    },
    {
      label: t('地址'),
      value: 'address'
    }
  ];

  const searchForm = ref({
    project_search_type: '',
    project_keyword: ''
  });

  const searchHandle = (flag) => {
    if (flag) {
      for (const key in searchForm.value) {
        searchForm.value[key] = '';
      }
    }
    const params = {
      ...searchForm.value,
      ...projectParams.value
    };
    getTableData(params);
  }

  const submitLoading = ref(false);
  const submitHandle = () => {
    submitLoading.value = true;
    const params = {
      uuid: props.projectUuid,
      share: selectedObj.value.uuid
    };
    shareSaveProject(params).then(() => {
      submitLoading.value = false;
      emits('done');
      updateVisible(false);
    }).catch(err => {
      submitLoading.value = false;
    });
  }
</script>

<style lang="less" scoped>
  @import '@/styles/variables.less';
  .selected-content {
    padding-bottom: 10px;
    display: flex;
    justify-content: flex-end;
  }
</style>