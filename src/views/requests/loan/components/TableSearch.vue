<template>
  <div>
    <vco-page-search>
      <vco-page-search-item :title="t('借款人信息')" width="250">
        <vco-type-input
          v-model="searchForm.borrower_keyword"
          v-model:type="searchForm.borrower_search_type"
          :type-data="borrowerTypeData"
          :placeholder="t('请输入')"
        ></vco-type-input>
      </vco-page-search-item>

      <vco-page-search-item :title="t('项目信息')" width="250">
        <vco-type-input
          v-model="searchForm.project_keyword"
          v-model:type="searchForm.project_search_type"
          :type-data="projectsTypeData"
          :placeholder="t('请输入')"
        ></vco-type-input>
      </vco-page-search-item>

      <vco-page-search-item :title="t('项目周期')" width="266">
        <a-range-picker v-model:value="searchForm.time" :placeholder="[t('开放日期'), t('到期日期')]" />
      </vco-page-search-item>

      <vco-page-search-item :title="t('客户经理')" width="180">
        <a-input v-model:value="searchForm.lm_name" :placeholder="t('请输入')" />
      </vco-page-search-item>

      <vco-page-search-item :title="t('借款金额')" width="264">
        <div class="flex items-center gap-2">
          <a-input-number
            v-model:value="searchForm.min_loan_money"
            :min="1"
            :placeholder="t('最小值')"
          />
          <p>-</p>
          <a-input-number
            v-model:value="searchForm.max_loan_money"
            :min="searchForm.min_loan_money"
            :placeholder="t('最大值')"
          />
        </div>
      </vco-page-search-item>
    </vco-page-search>

    <div class="flex justify-end">
      <vco-page-search-item width="100%">
        <div class="flex items-center gap-2">
          <a-button type="dark" @click="searchHandle(false)"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
          <a-button type="dark-line" @click="searchHandle(true)"><i class="iconfont">&#xe757;</i>{{ t('重置') }}</a-button>
        </div>
      </vco-page-search-item>
    </div>
  </div>
  
</template>

<script setup>
  import { ref } from "vue"
  import dayjs from "dayjs";
  import { cloneDeep } from "lodash";
  import { useI18n } from "vue-i18n";

  const emits = defineEmits(['search'])

  const { t } = useI18n();

  const borrowerTypeData = [
    {
      label: t("全部属性"),
      value: ""
    },
    {
      label: t("姓名"),
      value: "name"
    },
    {
      label: t("电话"),
      value: "phone"
    },
    {
      label: t("邮箱"),
      value: "email"
    }
  ]

  const projectsTypeData = [
    {
      label: t("全部属性"),
      value: ""
    },
    {
      label: t("名称"),
      value: "name"
    },
    {
      label: t("ID"),
      value: "apply_sn"
    },
    {
      label: t("地址"),
      value: "address"
    }
  ]

  const searchForm = ref({
    borrower_keyword: '',
    borrower_search_type: '',
    time: null,
    project_search_type: '',
    project_keyword: '',
    lm_name: '',
    min_loan_money: '',
    max_loan_money: ''
  })

  const searchHandle = (flag) => {
    if (flag) {
      for (const key in searchForm.value) {
        searchForm.value[key] = ''
      }
      searchForm.value.time = null
    }
    const data = cloneDeep(searchForm.value)
    if (data.time && data.time.length) {
      data.start_date = dayjs(data.time[0]).format('YYYY-MM-DD')
      data.end_date = dayjs(data.time[1]).format('YYYY-MM-DD')
    }
    delete data.time
    emits('search', data)
  }
</script>
