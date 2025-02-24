<template>
  <a-col :span="11">
    <a-row :class="['content', { content_match: false }]">
      <a-col :span="2" class="content_cell">
        <a-checkbox :checked="selectedRowKeys.includes(data?.id)" :disabled="!data.transaction" @click="check(data)"></a-checkbox>
      </a-col>
      <a-col :span="9" class="content_cell">
        <p class="xs_text">{{ tool.showDate(data.date) }}</p>
        <p v-if="project">{{ project.project_name }}</p>
        <p>{{ data.type }}</p>
        <p>{{ data.description || '' }}</p>
      </a-col>
      <a-col :span="6" class="content_cell content_middle">
        <p class="xs_text">Spent</p>
        <p v-if="data.amount > 0">{{ tool.formatMoney(Math.abs(data.amount), { prefix: '' }) }}</p>
      </a-col>
      <a-col :span="7" class="content_cell relative">
        <p class="xs_text">Received</p>
        <p v-if="data.amount < 0">{{ tool.formatMoney(Math.abs(data.amount), { prefix: '' }) }}</p>
        <div class="splitBillBox" v-if="!data.parent_id">
          <template v-if="data?.way == 'api'">
            <splitBill :item="data" @update="update">
              <a-button type="primary" shape="round" size="small">{{ t('拆分账单') }}</a-button>
            </splitBill>
            <MergeBill :item="data" @update="update">
              <a-button type="primary" shape="round" size="small">{{ t('合并账单') }}</a-button>
            </MergeBill>
          </template>
          <a-popconfirm v-if="data?.way == 'api-split'" :title="t('确定撤销拆分吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="bindRevokeSplit(index)" :disabled="isDisabled">
            <a-button type="cyan" shape="round" size="small" :loading="loading" :disabled="isDisabled">{{ t('撤销拆分') }}</a-button>
          </a-popconfirm>
          <template v-if="data?.way == 'api-merge'">
            <MergeDetails :item="data" @update="update">
              <a-button type="cyan" shape="round" size="small" :loading="loading" :disabled="isDisabled">{{ t('合并详情') }}</a-button>
            </MergeDetails>
            <!-- <a-popconfirm :title="t('确定撤销合并吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="bindRevokeMerge(index)" :disabled="isDisabled">
              <a-button type="cyan" shape="round" size="small" :loading="loading" :disabled="isDisabled">{{ t('撤销合并') }}</a-button>
            </a-popconfirm> -->
          </template>
        </div>
      </a-col>
    </a-row>
  </a-col>
</template>

<script scoped setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
import tool from '@/utils/tool';
import SplitBill from './SplitBill.vue';
import MergeBill from './MergeBill.vue';
import MergeDetails from './MergeDetails.vue';
import { revokeSplit, revokeMerge } from '@/api/reconciliations';

const emits = defineEmits(['update', 'check']);

const props = defineProps({
  data: {
    type: Object
  },
  project: {
    type: Object
  },
  selectedRowKeys: {
    type: Array,
    default: []
  }
});

const update = () => {
  emits('update');
};

const isDisabled = computed(() => {
  return (
    props.data?.children.filter((item) => {
      return item.status;
    }).length > 0
  );
});

const loading = ref(false);
const bindRevokeSplit = () => {
  loading.value = true;
  revokeSplit({ bank_sn: props.data?.bank_sn })
    .then((res) => {
      update();
    })
    .finally(() => {
      loading.value = false;
    });
};

const bindRevokeMerge = () => {
  loading.value = true;
  revokeMerge({ bank_sn: props.data?.bank_sn })
    .then((res) => {
      update();
    })
    .finally(() => {
      loading.value = false;
    });
};

const check = (val) => {
  emits('check', val);
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.content {
  background-color: white;
  border: 1px solid #e6e7e9;
  overflow: hidden;
  border-radius: 4px;
  &_match {
    border: 1px solid #50dcaa;
    border-radius: 4px 4px 0 0;
    background-color: #a8eed5;
  }

  &_cell {
    width: 100%;
    padding: 12px 16px;
    > p {
      font-size: 14px;
      font-weight: 500;
    }

    .xs_text {
      font-size: 12px;
      font-weight: 400;
    }
  }

  &_middle {
    border-left: 1px solid #e6e7e9;
    border-right: 1px solid #e6e7e9;
  }

  .splitBillBox {
    display: flex;
    position: absolute;
    bottom: 10px;
    right: 5px;
    button {
      transform: scale(0.8);
    }
  }
}
</style>
