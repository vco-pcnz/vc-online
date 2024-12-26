<template>
  <div class="flex title mb-10">
    <span class="fs_2xl">Cashflow</span>

    <a-dropdown class="Filter" trigger="click" v-model:open="visible">
      <a-button type="brown" size="small" :class="['picker-btn', { open: visible }]" shape="round" @click="visible = true">
        {{ value }} <DownOutlined class="DropdownIcon" />
      </a-button>
      <template #overlay>
        <ul class="list">
          <li class="item" v-for="item in list" :key="item.uuid" @click="change(item.name)">{{ item.name }}</li>
          <li class="item customPeriod" @click="showDate">Custom period…</li>
        </ul>
      </template>
    </a-dropdown>
  </div>

  <div class="flex items-center gap-10" style="line-height: 1.2">
    <div class="flex items-center gap-3">
      <img src="@/assets/images/cashflow.svg" alt="" />
      <div>
        <vco-number :value="0" :precision="2"></vco-number>
        <p class="fs_xs color_grey">{{ tool.showDate('2024-08-08') }} - {{ tool.showDate('2024-12-08') }}</p>
      </div>
    </div>
    <div class="flex items-center flex-1 gap-5">
      <div class="text-right">
        <p class="fs_2xl color_coal"><i class="iconfont fs_md">&#xe757;</i> $0.00</p>
        <p class="fs_xs color_grey">0 drawdowns</p>
      </div>
      <div class="flex flex-col justify-between flex-1">
        <vco-meter size="medium" color="blacky" :value="51.5" class="mb-3" />
        <vco-meter size="medium" color="greeny" :value="51.5" />
      </div>
      <div class="">
        <p class="fs_2xl color_coal"><i class="iconfont fs_md">&#xe755;</i> ($0.00)</p>
        <p class="fs_xs color_grey">0 repayments</p>
      </div>
    </div>
    <a-button type="cyan" size="small" shape="round" @click="selectDate">{{ t('证件资料') }}</a-button>
  </div>
  <div class="pwYmV" v-if="show">
    <div class="left">
      <span>0 drawdowns</span>
      <span>0 repayments</span>
    </div>
    <div class="item">
      <p class="label" style="margin-bottom: 4px">withdrawn</p>
      <p class="value">$0.00</p>
    </div>
    <div class="item">
      <p class="label" style="margin-bottom: 4px">repaid</p>
      <p class="value">$(0.00)</p>
    </div>
    <div class="item">
      <p class="label" style="margin-bottom: 4px">cashflow</p>
      <p class="value">$0.00</p>
    </div>
  </div>
  <div class="more" @click="show = true" :class="{ moreShow: show }">
    <a-button type="brown" shape="round" size="small" v-if="show" @click.stop="show = false">Hide</a-button>
    <i v-if="!show" class="iconfont">&#xe77f;</i>
  </div>
  <a-modal :width="520" :open="open" @cancel="open = false">
    <div class="text-center bold fs_2xl pt-10 pb-10">Custom period</div>
    <div class="sys-form-content px-10">
      <a-range-picker
        v-model:value="date"
        :disabled-date="disabledStartDate"
        format="DD MMM 'YY"
        valueFormat="YYYY-MM-DD"
        :placeholder="[t('开始日期'), t('结束日期')]"
        @change="timeChange"
      />
    </div>
    <template #footer>
      <div class="flex justify-center pt-5 pb-10">
        <a-button type="dark" size="large" class="uppercase" @click="selectDate">{{ t('选择') }}</a-button>
      </div>
    </template>
  </a-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { DownOutlined } from '@ant-design/icons-vue';
import dayjs, { Dayjs } from 'dayjs';

const { t } = useI18n();

const props = defineProps([]);

const value = ref('');
const date = ref(null);
const open = ref(false);
const visible = ref(false);
const show = ref(false);

const list = ref([
  { name: 'Current week', uuid: '1' },
  { name: 'Previous week', uuid: '2' },
  { name: 'Previous month', uuid: '3' },
  { name: 'Previous 2 months', uuid: '4' },
  { name: 'Upcoming week', uuid: '5' },
  { name: 'Upcoming month', uuid: '6' },
  { name: 'Upcoming 2 months', uuid: '7' }
]);

const change = (val) => {
  value.value = val;
};

const showDate = () => {
  date.value = null;
  visible.value = false;
  open.value = true;
};

const selectDate = () => {
  if (date.value) {
    value.value = tool.showDate(date.value[0]) + ' - ' + tool.showDate(date.value[1]);
  }
  open.value = false;
};

onMounted(() => {
  value.value = list.value[0].name;
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.list {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  list-style-type: none;
  margin: 0;
  padding: 16px 0;
  position: relative;
  text-align: left;
  .item {
    font-weight: 500;
    padding: 8px 24px;
    cursor: pointer;
    font-size: 14px;
    line-height: 22px;
    &:hover {
      background-color: rgba(227, 235, 235, 0.4);
    }
    &.selected {
      color: #181818;
      font-weight: 600;
      background-color: #fffbf0;
    }
    &.customPeriod {
      color: #d8b480;
    }
  }
}

.more {
  background-color: #f7f9f8;
  height: 36px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  color: #bf9425;
  position: relative;
  left: -30px;
  width: calc(100% + 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-top: 40px;
  &:hover {
    background-color: hsla(35, 53%, 67%, 0.2);
  }
  .iconfont {
    display: inline-block;
    transform: rotate(90deg);
  }
  &.moreShow {
    background-color: #fff;
  }
}

.pwYmV {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 12px 24px;
  background-color: #181818;
  border-radius: 12px;

  margin-top: 68px;
  margin-bottom: 40px;
  .left {
    flex: 1;
    gap: 12px;
    font-weight: 600;
    font-size: 20px;
    line-height: 1.2;
    color: #fff;
  }

  .item {
    padding-left: 8px;
    padding-right: 8px;
    color: hsla(0, 0%, 100%, 0.5);
    min-width: 150px;
    text-align: right;
    .label {
      margin-bottom: 4px;
      font-size: 12px;
    }
    .value {
      font-size: 20px;
      font-weight: 600;
    }
  }
}
</style>
