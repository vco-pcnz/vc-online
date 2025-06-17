<template>
  <a-modal :open="selectVisible" :title="t('进度付款阶段')" :width="1400" :footer="null" :keyboard="false" :maskClosable="false" class="middle-position" @cancel="selectVisible = false">
    <view-content v-if="selectVisible" :selectedData="selectedData" :buildLogData="buildLogData" :is-select="true" :show-process="true" @selectDone="selectDoneHandle"></view-content>
  </a-modal>
  <div class="input-item" style="margin-top: 16px" v-if="!keepShowOther">
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
  <template v-if="showOther || keepShowOther">
    <a-alert type="info" class="mt-5">
      <template #message>
        <a-row :gutter="24">
          <a-col :span="5">
            <div class="label">{{ t('类型') }}</div>
            <a-select :loading="loading_type" style="width: 100%" v-model:value="formState.other_type" :options="types" :fieldNames="{ label: 'name', value: 'code' }" @change="changeOtherType"></a-select>
          </a-col>
          <a-col :span="7">
            <div class="label">{{ t('金额') }}</div>
            <a-input-number v-model:value="formState.other_money" @input="change()" :max="max_other_money" :min="0" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
          </a-col>
          <a-col :span="12">
            <div class="label">{{ t('说明') }}</div>
            <a-input v-model:value="formState.other_note" @input="change()" />
          </a-col>
        </a-row>
        <div class="flex gap-10 mt-2">
          <div>
            <span class="label">{{ t('土地余额') }}:</span>
            {{ tool.formatMoney(tool.plus(projectDetail?.base?.remain_land_amount || 0, data && editData?.other_type == 1 ? editData?.other_money : 0)) }}
          </div>
          <div>
            <span class="label">{{ t('补充股权') }}:</span>
            {{ tool.formatMoney(tool.plus(projectDetail?.base?.remain_equity_amount || 0, editData && editData?.other_type == 2 ? editData?.other_money : 0)) }}
          </div>
        </div>
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
        <div class="fs_2xl">{{ tool.formatMoney(tool.plus(formState.build_money || 0, formState.other_money || 0)) }}</div>
      </div>
    </div>
  </template>
</template>

<script scoped setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import ViewContent from '@/views/requests/progress-payment/components/ViewContent.vue';
import { cloneDeep } from 'lodash';
import { systemDictData } from '@/api/system';

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
  },
  projectDetail: {
    type: Object
  }
});

const showOther = ref(false);
const selectVisible = ref(false);
const formState = ref({
  build_money: '',
  other_type: '3',
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

const types = ref([]);
const loading_type = ref(false);
const loadType = (reset) => {
  loading_type.value = true;
  systemDictData('other_draw_type')
    .then((res) => {
      types.value = res;
    })
    .finally((_) => {
      loading_type.value = false;
    });
};

const max_other_money = ref(99999999999);

const changeOtherType = () => {
  if (formState.value.other_type == 1) {
    let max = tool.plus(props.projectDetail?.base?.remain_land_amount || 0, editData.value && editData.value?.other_type == 1 ? editData.value?.other_money : 0);
    max_other_money.value = max;
    if (Number(formState.value.other_money) > Number(max)) {
      formState.value.other_money = max;
    }
  } else if (formState.value.other_type == 2) {
    let max = tool.plus(props.projectDetail?.base?.remain_equity_amount || 0, editData.value && editData.value?.other_type == 2 ? editData.value?.other_money : 0);
    max_other_money.value = max;
    if (Number(formState.value.other_money) > Number(max)) {
      formState.value.other_money = max;
    }
  } else {
    formState.value.other_type = '3';
    max_other_money.value = 99999999999;
  }
  emits('change', formState.value);
};

onMounted(() => {
  loadType();
});

const keepShowOther = computed(() => {
  return !(props.projectDetail.base.build_amount > 0);
});

const editData = ref(null);
watch(
  () => props.visible,
  (val) => {
    if (val && props.data) {
      editData.value = cloneDeep(props.data);
      formState.value = cloneDeep(props.data);
      formState.value.other_type += '';
      changeOtherType();
      if (props.data?.build__data) {
        selectedData.value = cloneDeep(props.data?.build__data);
        buildLogData.value = cloneDeep(props.data?.build__data);
      }
      if (props.data?.other_money > 0) {
        showOther.value = true;
      } else {
        showOther.value = false;
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
