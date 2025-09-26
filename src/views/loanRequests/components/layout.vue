<template>
  <vco-page-nav sup-path="/loanRequests"></vco-page-nav>
  <div class="flex justify-between items-end mt-5" v-if="route.name !== 'Project_requestBe_roker'">
    <vco-page-tab :tabData="tabData" v-model:current="currentTab"></vco-page-tab>
    <TableSearch :currentTab="currentTab" :roterName="route.name" :typeData="typeData" :statusData="statusData" @search="updateSearchForm"></TableSearch>
  </div>

  <slot name="content"></slot>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import TableSearch from './TableSearch.vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/store';
import { requestNum } from '@/api/project/loanRequests';

const { t } = useI18n();
const props = defineProps({
  params: {
    type: Object
  },
  tabNum: {
    type: Object
  }
});

const userStore = useUserStore();
const route = useRoute();
const emits = defineEmits(['search']);
const currentTab = ref('1');

const tabData = computed(() => {
  let arr = [
    {
      label: t('申请中'),
      value: '1',
      num: props.tabNum ? props.tabNum['1'] : 0
    },
    {
      label: t('已批准'),
      value: '2',
      num: props.tabNum ? props.tabNum['2'] : 0
    },
    {
      label: route.name == 'LoanRequestsDrawdown' ? 'PAID' : 'REPAID',
      value: '4',
      num: props.tabNum ? props.tabNum['4'] : 0,
      hide: route.name !== 'LoanRequestsDrawdown' && route.name !== 'LoanRequestsRepayment'
    },
    {
      label: t('已拒绝'),
      value: '3',
      num: props.tabNum ? props.tabNum['3'] : 0
    },
    {
      label: t('生效'),
      value: '4',
      num: props.tabNum ? props.tabNum['4'] : 0,
      hide: route.name !== 'LoanRequestsVariation'
    }
  ];
  return arr.filter((item) => !item.hide);
});

const searchOldData = ref({});
const updateSearchForm = (val) => {
  if (route.name === 'LoanRequestsRepayment') {
    val['all_repayment'] = val.type;
  }
  if (route.name === 'LoanRequestsSecurity' || route.name === 'LoanRequestsDefault') {
    val['cate'] = val.type;
    val.type = undefined;
  }
  searchOldData.value = val;
  emits('search', { sta: currentTab.value, ...val, ...props.params });
};

const statusData = computed(() => {
  let arr = [];

  switch (route.name) {
    case 'LoanRequestsDrawdown':
      arr = [
        {
          label: t('全部'),
          value: ''
        },
        {
          label: 'LM REVIEW',
          value: '100'
        },
        {
          label: 'FC REVIEW',
          value: '200'
        },
        {
          label: 'DIRECTOR REVIEW',
          value: '300'
        }
      ];
      break;
    case 'LoanRequestsRepayment':
      arr = [
        {
          label: t('全部'),
          value: ''
        },
        {
          label: 'LM REVIEW',
          value: '100'
        },
        {
          label: 'FC REVIEW',
          value: '200'
        },
        {
          label: 'DIRECTOR REVIEW',
          value: '300'
        }
      ];
      break;
    case 'LoanRequestsVariation':
      arr = [
        {
          label: t('全部'),
          value: ''
        },
        {
          label: 'PENDING APPLY',
          value: '0'
        },
        {
          label: 'FC REVIEW',
          value: '100'
        },
        {
          label: 'DIRECTOR CHECK',
          value: '200'
        },
        {
          label: 'LM OPEN',
          value: '300'
        },
        {
          label: 'DIRECTOR CHECK AGAIN',
          value: '310'
        }
      ];
      break;
    case 'LoanRequestsSecurity':
      arr = [
        {
          label: t('全部'),
          value: ''
        },
        {
          label: 'FC REVIEW',
          value: '100'
        },
        {
          label: 'DIRECTOR REVIEW',
          value: '200'
        }
      ];
      break;
    case 'LoanRequestsJournal':
      arr = [
        {
          label: t('全部'),
          value: ''
        },
        {
          label: 'PENDING SUBMIT',
          value: '0'
        },
        {
          label: 'FC REVIEW',
          value: '100'
        },
        {
          label: 'DIRECTOR REVIEW',
          value: '200'
        }
      ];
      break;
    case 'LoanRequestsDefault':
      arr = [
        {
          label: t('全部'),
          value: ''
        },
        {
          label: 'PENDING SUBMIT',
          value: '0'
        },
        {
          label: 'FC REVIEW',
          value: '100'
        },
        {
          label: 'DIRECTOR REVIEW',
          value: '200'
        }
      ];
      break;
    case 'LoanRequestsBe_roker':
      break;
    case 'LoanRequestsClose':
      break;
  }
  return arr;
});

const typeData = computed(() => {
  let arr = [];
  switch (route.name) {
    case 'LoanRequestsVariation':
      arr = [];
      break;
    case 'LoanRequestsDrawdown':
      break;
    case 'LoanRequestsBe_roker':
      break;
    case 'LoanRequestsJournal':
      break;
    case 'LoanRequestsSecurity':
      arr = [
        {
          label: t('解押'),
          value: '1'
        },
        {
          label: t('添加抵押物'),
          value: '2'
        }
      ];
      break;
    case 'LoanRequestsRepayment':
      arr = [
        {
          label: t('全部'),
          value: ''
        },
        {
          label: t('部分还款'),
          value: '0'
        },
        {
          label: t('全额还款'),
          value: '1'
        }
      ];
      break;
    case 'LoanRequestsClose':
      break;
    case 'LoanRequestsDefault':
      arr = [
        {
          label: t('罚息开始'),
          value: '1'
        },
        {
          label: t('罚息结束'),
          value: '2'
        }
      ];
      break;
  }

  return arr;
});

const requestNumStatistics = ref(null);
onMounted(() => {
  requestNum().then((res) => {
    userStore.LoanRequestsInfo = res;
  });
});

watch(
  () => currentTab.value,
  (val) => {
    let params = { sta: currentTab.value, ...searchOldData.value, ...props.params };
    if (currentTab.value !== '1') {
      params['state'] = '';
    }
    emits('search', params);
  },
  { deep: true, immediate: true }
);
</script>

<style lang="less">
.loanRequestsMark {
  position: absolute !important;
  background-color: #f19915;
  color: #fff;
  font-size: 11px;
  padding: 2px 10px;
  white-space: nowrap;
  text-align: center;
  top: 4px;
  right: 0;
  border-top-right-radius: 12px;
  border-bottom-left-radius: 12px;
}
</style>
