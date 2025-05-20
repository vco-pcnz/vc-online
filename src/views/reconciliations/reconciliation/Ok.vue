<template>
  <a-col :span="2" class="content_btn">
    <a-popconfirm :title="t('确定要对账吗？')" :cancel-text="t('取消')" :ok-text="t('确定')" @confirm="showTip(item)" :disabled="(!item.transaction && (!item['f_date'] || !item['f_fee'] || !item['f_note'])) || !project">
      <a-button
        :loading="ok_loading && formState.id == item.id"
        :class="{ active: (!item.transaction && item['f_date'] && item['f_fee'] && item['f_note'] && project) || item.transaction }"
        :disabled="(!item.transaction && (!item['f_date'] || !item['f_fee'] || !item['f_note'])) || !project"
      >
        OK
      </a-button>
    </a-popconfirm>
  </a-col>
  <TipModal v-model:visible="visible" :formState="formState" @submit="submit"></TipModal>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import TipModal from './TipModal.vue';
import { addTransaction, checkMatchBill } from '@/api/reconciliations';
const emits = defineEmits(['update']);

const props = defineProps({
  item: {
    type: Object
  },
  project: {
    type: Object
  }
});

const visible = ref(false);
const ok_loading = ref(false);
const formState = ref({});
const showTip = (val) => {
  formState.value = val;
  if (val.f_date && val.f_date !== val.date) {
    visible.value = true;
  } else if (val.transaction && val.date !== val.transaction.date &&  val.date !== val.f_date) {
    visible.value = true;
  } else {
    submit();
  }
};
const submit = () => {
  let params = {};
  let ajaxFn = null;
  if (formState.value.transaction) {
    // 对账
    ajaxFn = checkMatchBill;
    params = {
      data: [
        {
          bank_sn: formState.value.bank_sn,
          sn: formState.value.transaction.sn
        }
      ]
    };
  } else {
    // 新增
    params = {
      apply_project_uuid: props.project.uuid,
      amount: formState.value.amount,
      date: formState.value.date,
      note: formState.value.f_note,
      bank_sn: formState.value.bank_sn,
      ...JSON.parse(formState.value.f_fee)
    };
    ajaxFn = addTransaction;
  }
  ok_loading.value = true;
  ajaxFn(params)
    .then((res) => {
      emits('update');
    })
    .finally(() => {
      ok_loading.value = false;
    });
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.content_btn {
  margin-top: 36px;
  display: flex;
  justify-content: center;
}

.active {
  background: rgb(0, 120, 200);
  color: #fff;
}
</style>
