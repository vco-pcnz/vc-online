<template>
  <a-modal :open="selectVisible" :title="t('进度付款阶段')" :width="1400" :footer="null" :keyboard="false" :maskClosable="false" class="middle-position" @cancel="selectVisible = false">
    <view-content v-if="selectVisible" :selectedData="selectedData" :buildLogData="buildLogData" :showExcess="true" :is-select="isEdit" :show-process="true" :hide-self="!isEdit" :log-date="logDate" @selectDone="selectDoneHandle"></view-content>
  </a-modal>

  <!-- boc放款选择 -->
  <a-modal :open="bocVisible" :title="t('BOC放款')" :width="1000" :footer="null" :keyboard="false" :maskClosable="false" class="middle-position" @cancel="bocVisible = false">
    <boc-view-content v-if="bocVisible" :selected-data="bocSelectedData" :is-select="isEdit" @selectDone="bocSelectDoneHandle"></boc-view-content>
  </a-modal>

  <div class="input-item" style="margin-top: 16px" v-if="!keepShowOther">
    <div class="label" :class="{ err: !formState.build_money && validate && !showOther }">{{ source == 1 ? t('BOC放款金额') : t('进度款') }}</div>
    <div class="flex gap-2 items-center">
      <template v-if="source == 1">
        <a-input-number
          @click="bocVisible = true"
          :readonly="true"
          v-model:value="formState.build_money"
          :max="99999999999"
          :min="0"
          :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
        />
        <a-button type="brown" style="min-width: 80px; padding: 0; border-radius: 10px" class="big" size="small" @click="bocVisible = true">{{ t('选择') }}</a-button>
      </template>
      <template v-else>
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
        <i class="iconfont add" v-if="isEdit" :style="{ transform: showOther ? 'rotate(0deg)' : 'rotate(45deg)' }" @click="updateShowOther()">&#xe781;</i>
      </template>
    </div>
  </div>
  <div class="vip_amount_tip" v-if="!showOther && !keepShowOther && data.vip_amount > 0">
    {{ t('申请金额') }} <span class="vip_amount">{{ tool.formatMoney(data.vip_amount || 0) }}</span>
  </div>
  <template v-if="showOther || keepShowOther">
    <a-alert type="info" class="mt-5">
      <template #message>
        <a-row :gutter="24">
          <a-col :span="8">
            <div class="label">{{ t('土地余额') }} ({{ tool.formatMoney(tool.plus(projectDetail?.base?.remain_land_amount || 0, editData?.land_money || 0)) }})</div>
            <a-input-number
              :readonly="!isEdit"
              v-model:value="formState.land_money"
              @input="change()"
              :max="tool.plus(projectDetail?.base?.remain_land_amount || 0, editData?.land_money || 0)"
              :min="0"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            />
          </a-col>
          <a-col :span="8">
            <div class="label">{{ t('补充股权') }} ({{ tool.formatMoney(tool.plus(projectDetail?.base?.remain_equity_amount || 0, editData?.equity_money || 0)) }})</div>
            <a-input-number
              :readonly="!isEdit"
              v-model:value="formState.equity_money"
              @input="change()"
              :max="tool.plus(projectDetail?.base?.remain_equity_amount || 0, editData?.equity_money || 0)"
              :min="0"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            />
          </a-col>
          <a-col :span="8">
            <div class="label">{{ t('其他金额') }}</div>
            <a-input-number
              :readonly="!isEdit"
              v-model:value="formState.other_money"
              @input="change()"
              :max="99999999999"
              :min="0"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            />
          </a-col>
          <a-col :span="24" class="mt-3">
            <div class="label">{{ t('说明') }}</div>
            <a-input :readonly="!isEdit" v-model:value="formState.other_note" @input="change()" />
          </a-col>
        </a-row>
      </template>
    </a-alert>
    <div class="vip_amount_tip" v-if="(showOther || keepShowOther) && data.vip_amount > 0">
      {{ t('申请金额') }} <span class="vip_amount">{{ tool.formatMoney(data.vip_amount || 0) }}</span>
    </div>
    <div class="flex justify-end items-end mt-5">
      <div>
        <div class="label">{{ t('进度款') }}</div>
        <div class="fs_xl">{{ tool.formatMoney(formState.build_money || 0) }}</div>
      </div>
      <div class="operator">+</div>
      <div>
        <div class="label">{{ t('土地余额') }}</div>
        <div class="fs_xl">{{ tool.formatMoney(formState.land_money || 0) }}</div>
      </div>
      <div class="operator">+</div>
      <div>
        <div class="label">{{ t('补充股权') }}</div>
        <div class="fs_xl">{{ tool.formatMoney(formState.equity_money || 0) }}</div>
      </div>
      <div class="operator">+</div>
      <div>
        <div class="label">{{ t('其他金额') }}</div>
        <div class="fs_xl">{{ tool.formatMoney(formState.other_money || 0) }}</div>
      </div>
      <div class="operator">=</div>
      <div :class="{ err: getTotal() == 0 && validate }">
        <div class="label">{{ t('总计') }}</div>
        <div class="fs_xl">{{ tool.formatMoney(getTotal()) }}</div>
      </div>
    </div>
  </template>
</template>

<script scoped setup>
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import ViewContent from '@/views/requests/progress-payment/components/ViewContent.vue';
import BocViewContent from '@/views/requests/progress-payment/components/BocViewContent.vue';
import { cloneDeep } from 'lodash';
import { pick } from 'lodash';

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
  },
  isEdit: {
    type: Boolean,
    default: true
  },
  logDate: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: ''
  }
});

const showOther = ref(false);
const selectVisible = ref(false);
const formState = ref({
  build_money: '',
  land_money: 0,
  equity_money: 0,
  other_money: 0,
  other_note: '',
  build__data: [],
  progress__data: []
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
    formState.value.land_money = 0;
    formState.value.equity_money = 0;
    formState.value.other_money = 0;
    formState.value.other_note = '';
  }
  emits('change', formState.value);
};

const keepShowOther = computed(() => {
  return !(props.projectDetail.base.build_amount > 0);
});

const getTotal = () => {
  return tool.plus(tool.plus(formState.value.build_money || 0, formState.value.land_money || 0), tool.plus(formState.value.equity_money || 0, formState.value.other_money || 0));
};

const editData = ref(null);

// boc 放款选择
const bocVisible = ref(false);
const bocSelectedData = ref([]);
const bocSelectDoneHandle = (data) => {
  bocVisible.value = false;
  bocSelectedData.value = data.progress__data;
  formState.value.progress__data = data.progress__data;
  formState.value.build_money = data.total;
  change();
};

watch(
  () => props.visible,
  (val) => {
    if (val && props.data) {
      let keys = ['build_money', 'land_money', 'equity_money', 'other_money', 'other_note', 'build__data', 'progress__data'];
      const newData = pick(props.data, keys);
      editData.value = cloneDeep(newData);
      formState.value = cloneDeep(newData);
      if (props.data?.build__data) {
        selectedData.value = cloneDeep(props.data?.build__data);
        buildLogData.value = cloneDeep(props.data?.build__data);
      }
      if (props.data?.progress__data) {
        bocSelectedData.value = cloneDeep(props.data?.progress__data);
      }
      if (tool.plus(props.data?.land_money || 0, tool.plus(props.data?.equity_money || 0, props.data?.other_money || 0)) > 0) {
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
  margin: 0 10px;
}
.err {
  .label {
    color: #c1430c !important;
    opacity: 1 !important;
  }
  color: #c1430c;
  opacity: 1 !important;
}

.vip_amount_tip {
  color: #888;
  margin-top: 5px;
  .vip_amount {
    color: @colorPrimary;
  }
}
</style>
