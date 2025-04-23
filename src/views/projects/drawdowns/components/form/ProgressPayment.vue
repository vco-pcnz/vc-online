<template>
  <a-modal :open="selectVisible" :title="t('进度付款阶段')" :width="1400" :footer="null" :keyboard="false" :maskClosable="false" class="middle-position" @cancel="selectVisible = false">
    <view-content v-if="selectVisible" :selectedData="selectedData" :buildLogData="buildLogData" :is-select="true" :show-process="true" @selectDone="selectDoneHandle"></view-content>
  </a-modal>

  <div class="input-item" style="margin-top: 16px">
    <div class="label" :class="{ err: !formState.build_money && validate && !showOther }">{{ t('进度款') }}</div>
    <div class="flex gap-2 items-center">
      <a-input-number
        @click="selectVisible = true"
        :readonly="true"
        v-model:value="formState.build_money"
        :max="99999999999"
        :min="0"
        :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
      />
      <a-button type="brown" style="min-width: 80px; padding: 0; border-radius: 10px" class="big" size="small" @click="selectVisible = true">{{ t('选择') }}</a-button>
      <i class="iconfont add" :style="{ transform: showOther ? 'rotate(0deg)' : 'rotate(45deg)' }" @click="updateShowOther()">&#xe781;</i>
    </div>
  </div>
  <template v-if="showOther">
    <a-alert type="info" class="mt-5">
      <template #message>
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="label">{{ t('其他金额') }}</div>
            <a-input-number v-model:value="formState.other_money" @input="change()" :max="99999999999" :min="0" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
          </a-col>
          <a-col :span="12">
            <div class="label">{{ t('说明') }}</div>
            <a-input v-model:value="formState.other_note" @input="change()" />
          </a-col>
        </a-row>
      </template>
    </a-alert>
    <div class="flex justify-end items-end mt-5">
      <div>
        <div class="label">{{ t('进度款') }}</div>
        <div class="fs_2xl">{{ tool.formatMoney(formState.build_money || 0) }}</div>
      </div>
      <div class="operator">+</div>
      <div>
        <div class="label">{{ t('其他金额') }}</div>
        <div class="fs_2xl">{{ tool.formatMoney(formState.other_money || 0) }}</div>
      </div>
      <div class="operator">=</div>
      <div :class="{ err: tool.plus(formState.build_money || 0, formState.other_money || 0) == 0 && validate }">
        <div class="label">{{ t('总计') }}</div>
        <div class="fs_2xl">${{ tool.plus(formState.build_money || 0, formState.other_money || 0) }}</div>
      </div>
    </div>
  </template>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import ViewContent from '@/views/requests/progress-payment/components/ViewContent.vue';
import { cloneDeep } from 'lodash';
const emits = defineEmits(['change']);
const { t } = useI18n();
const props = defineProps({
  visible: {
    type: Boolean
  },
  validate: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object
  }
});

const showOther = ref(false);
const selectVisible = ref(false);
const formState = ref({
  build_money: '',
  other_money: 0,
  other_note: '',
  build__data: []
});
const selectDoneHandle = (data) => {
  selectVisible.value = false;
  formState.value.build__data = data.build__data;
  formState.value.build_money = data.total;
  selectedData.value = data.build__data;
  change();
};

const change = () => {
  emits('change', formState.value);
};

const selectedData = ref([]);
const buildLogData = ref([]);

const updateShowOther = () => {
  showOther.value = !showOther.value;
  if (!showOther.value) {
    formState.value.other_money = 0;
    formState.value.other_note = '';
  }
  emits('change', formState.value);
};

watch(
  () => props.visible,
  (val) => {
    if (val && props.data) {
      formState.value = cloneDeep(props.data);
      if (props.data?.build__data) {
        selectedData.value = cloneDeep(props.data?.build__data);
        buildLogData.value = cloneDeep(props.data?.build__data);
      }
      if (props.data?.other_money > 0) {
        showOther.value = true;
      }
    }
  },
  {
    immediate: true,
    deep: true
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.label {
  color: #888;
  font-size: 12px;
  padding: 0 0 8px;
  &.err {
    color: #c1430c;
    opacity: 1 !important;
  }
}
.add {
  color: @colorPrimary;
  font-size: 25px;
  cursor: pointer;
  transition: all 0.2s;
}
.operator {
  font-size: 20px;
  margin: 0 20px;
}
.err {
  .label {
    color: #c1430c !important;
    opacity: 1 !important;
  }
  color: #c1430c;
  opacity: 1 !important;
}
</style>
