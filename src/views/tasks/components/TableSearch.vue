<template>
  <div>
    <vco-page-search @keyup.enter="searchHandle(false)">
      <vco-page-search-item width="130" :title="t('产品')">
        <a-select :placeholder="t('请选择')" v-model:value="searchForm.product_uuid">
          <a-select-option v-for="item in productData" :key="item.uuid" :value="item.uuid">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </vco-page-search-item>

      <template v-if="module !== 'other'">
        <vco-page-search-item width="130" :title="t('类型')">
          <a-select :placeholder="t('请选择')" v-model:value="searchForm.ctype">
            <a-select-option v-for="item in typeData" :key="item.value" :value="item.value">
              {{ item.label }}
            </a-select-option>
          </a-select>
        </vco-page-search-item>

        <vco-page-search-item :title="t('项目信息')" width="280">
          <vco-type-input v-model="searchForm.project_keyword" v-model:type="searchForm.project_search_type" :type-data="projectsTypeData" :placeholder="t('请输入')" :typeWidth="135"></vco-type-input>
        </vco-page-search-item>
      </template>

      <template v-else>
        <vco-page-search-item width="320" :title="t('关键字')">
          <vco-type-input v-model="searchForm.keywords" v-model:type="searchForm.key" :type-data="baseInfoData" :placeholder="t('请输入')"></vco-type-input>
        </vco-page-search-item>
      </template>

      <vco-page-search-item width="100%">
        <div class="flex items-center gap-2">
          <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
          <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
        </div>
      </vco-page-search-item>
    </vco-page-search>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { cloneDeep } from 'lodash';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { quick } from '@/api/home/index';
const route = useRoute();
import useProductStore from '@/store/modules/product';

const productStore = useProductStore();
const productData = computed(() => productStore.openProductData);

const emits = defineEmits(['search']);
const props = defineProps({
  module: {
    type: String
  }
});

const { t } = useI18n();

const typeData = ref([
  {
    label: t('全部'),
    value: ''
  }
  // {
  //   label: t('放款'),
  //   value: 'drawdown'
  // },
  // {
  //   label: t('还款'),
  //   value: 'repayment'
  // },
  // {
  //   label: t('解押'),
  //   value: 'discharge'
  // },
  // {
  //   label: t('罚息开始'),
  //   value: 'penalty-start'
  // },
  // {
  //   label: t('罚息结束'),
  //   value: 'penalty-end'
  // },
  // {
  //   label: t('变更'),
  //   value: 'variation'
  // },
  // {
  //   label: t('平账'),
  //   value: 'journal'
  // },
  // {
  //   label: t('关账'),
  //   value: 'closed'
  // },
  // {
  //   label: t('反洗钱'),
  //   value: 'aml'
  // },
  // {
  //   label: t('抵押物'),
  //   value: 'security'
  // },
  // {
  //   label: t('关账撤销'),
  //   value: 'closed-cancel'
  // },
  // {
  //   label: t('申请中介'),
  //   value: 'vip-broker-vip'
  // }
]);

const projectsTypeData = [
  {
    label: t('全部属性'),
    value: ''
  },
  {
    label: t('项目名称'),
    value: 'name'
  },
  {
    label: t('项目ID'),
    value: 'apply_sn'
  },
  {
    label: t('项目地址'),
    value: 'address'
  },

  {
    label: t('借款人姓名'),
    value: 'borrower_name'
  },
  {
    label: t('借款人电话'),
    value: 'borrower_phone'
  },
  {
    label: t('借款人邮箱'),
    value: 'borrower_email'
  }
];

const baseInfoData = [
  {
    label: t('全部'),
    value: 'all'
  },
  {
    label: t('姓名'),
    value: 'name'
  },
  {
    label: t('邮箱'),
    value: 'email'
  },
  {
    label: t('电话'),
    value: 'mobile'
  },
  {
    label: t('用户Id'),
    value: 'id'
  }
];

const searchForm = ref({
  product_uuid: null,
  ctype: '',
  borrower_keyword: '',
  borrower_search_type: '',
  project_search_type: '',
  project_keyword: '',
  key: '',
  keywords: ''
});

const searchHandle = (flag) => {
  if (flag) {
    for (const key in searchForm.value) {
      searchForm.value[key] = '';
    }
    if (props.module === 'other') {
      searchForm.value.key = 'all';
    } else {
      searchForm.value.key = '';
    }
  }

  if (props.module === 'other') {
    Object.assign(searchForm.value, {
      ctype: '',
      borrower_keyword: '',
      borrower_search_type: '',
      project_search_type: '',
      project_keyword: ''
    });
  } else {
    Object.assign(searchForm.value, {
      key: '',
      keywords: ''
    });
  }
  let updateData = cloneDeep(searchForm.value);

  emits('search', updateData);
};

const loading = ref(false);
const loadType = () => {
  loading.value = ref(true);
  quick({ ptype: '2' })
    .then((res) => {
      if (res && res.length) {
        res.map((item) => {
          typeData.value.push({
            label: item.name,
            value: item.type
          });
        });
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  loadType();
  searchForm.value.ctype = route.query.type;
  searchHandle();
});

watch(
  () => props.module,
  (val) => {
    if (props.module === 'other') {
      searchForm.value.key = 'all';
    } else {
      searchForm.value.key = '';
    }
  },
  { deep: true }
);
// 暴露方法给父组件
defineExpose({
  searchHandle
});
</script>

<style lang="less" scoped>
.num {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 8px;
}
.page-search-content {
  margin-top: 0;
}
</style>
