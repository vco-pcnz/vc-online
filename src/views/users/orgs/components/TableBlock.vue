<template>
  <div class="sys-table-content">
    <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '100%' }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === '1'">
          <div class="avatarBox cursor" @click="toDetail(record)">
            <vco-avatar :src="record.avatar" :radius="true"></vco-avatar>
          </div>
        </template>
        <template v-if="column.key === '2'">
          <div @click="toDetail(record)" class="cursor">
            <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="record.name" style="width: 200px">{{ record.name }}</p>
            <p v-if="record.org_name" class="flex items-center">
              <i class="iconfont" :class="{ cer: record.org_name }">&#xe679;</i>
              <span class="text-ellipsis overflow-hidden inline-block text-nowrap" style="width: 200px" :title="record.org_name" :class="{ cer: record.org_name }">{{ record.org_name }}</span>
            </p>
            <p v-if="record.email">
              <i class="iconfont" :class="{ cer: record.email_ok }">&#xe66f;</i>
              <span :class="{ cer: record.email_ok }">{{ record.email }}</span>
            </p>
            <p v-if="record.mobile">
              <i class="iconfont" :class="{ cer: record.mobile_ok }">&#xe678;</i>
              <span :class="{ cer: record.mobile_ok }">
                <template v-if="record.mobile && record.pre">+{{ record.pre }} </template>
                {{ record.mobile }}
              </span>
            </p>
          </div>
        </template>

        <template v-if="column.key === '6'">
          <p>
            <i class="iconfont black">&#xe690;</i>
            <span class="cer bold"> {{ record.open_count }} {{ t('进行中项目') }} </span>
          </p>
          <p style="padding-left: 20px">
            <span class="bold"> {{ record.close_count }} {{ t('已关闭项目') }} </span>
          </p>
          <p>
            <i class="iconfont black">&#xe751;</i>
            <span class="cer bold"> {{ record.apply_count }} {{ t('请求') }} </span>
          </p>
        </template>

        <template v-if="column.key === 'address'">
          <p>ID: {{ record.idcard }}</p>
          <p :title="record.address" style="text-wrap: auto" v-if="record.address"><i class="iconfont">&#xe814;</i>{{ record.address }}</p>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { relationDel } from '@/api/users';

import { navigationTo } from '@/utils/tool';

const emits = defineEmits(['update:data', 'update:keys', 'change', 'loadData']);

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  edit: {
    type: Boolean,
    default: false
  }
});
const { t } = useI18n();

const columns = reactive([
  { title: t('缩略图t'), key: '1', width: 110, align: 'center' },
  { title: t('利益相关者信息t'), width: 250, key: '2', align: 'left' },
  { title: 'ID/' + t('地址'), key: 'address' },
  { title: t('项目数据t'), key: '6', width: 200, align: 'left' }
]);
</script>

<style scoped lang="less">
:deep(.ant-table-tbody) .ant-table-row {
  cursor: pointer;
}

.type_text {
  font-size: 14px;
  &.orange {
    color: #d46b08;
  }
  &.green {
    color: #389e0d;
  }

  &.cre {
    color: #f19915;
  }
}
</style>
