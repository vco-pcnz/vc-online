<template>
  <div class="importBox">
    <import-export :title="t('用户')" importUrl="/123123" exportUrl="/reconciliation/reportExport"></import-export>
    <import-export :title="t('利益相关者')" importUrl="/123123" exportUrl="/reconciliation/reportExport"></import-export>
  </div>
  <div class="importBox project">
    <import-export :title="t('项目')" importUrl="/123123" exportUrl="/reconciliation/reportExport"></import-export>
    <import-export :title="t('抵押物')" importUrl="/123123" exportUrl="/reconciliation/reportExport"></import-export>
    <import-export :title="t('明细表')" importUrl="/123123" exportUrl="/reconciliation/reportExport"></import-export>
    <import-export :title="t('预测')" importUrl="/123123" exportUrl="/reconciliation/reportExport"></import-export>
    <import-export :title="t('放款')" importUrl="/123123" exportUrl="/reconciliation/reportExport"></import-export>
    <import-export :title="t('文件')" importUrl="/123123" exportUrl="/reconciliation/reportExport"></import-export>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import tool from '@/utils/tool';
import { wash } from '@/api/wash';
import ImportExport from './ImportExport.vue';

const { t } = useI18n();

const showTip = ref(true);
const req = ref(false);
const code = ref('');
const remark = ref('');
const list = ref([]);

const removeItem = (index) => {
  list.value.splice(index, 1);
};

const submit = () => {
  if (!list.value.length) {
    return message.warning(t('请上传'));
  }

  let uuids = list.value.map((item) => {
    return item.uuid;
  });

  wash({ code: code.value, document: uuids, remark: remark.value }).then((res) => {
    showTip.value = true;
  });
};

onMounted(() => {});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.importBox {
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 20px;
  &.project {
    border-radius: 8px;
    background-color: #f8f8f8;
    border: 1px solid #dddddd;
  }
}
</style>
