<template>
  <vco-page-search>
    <vco-page-search-item :title="t('申请状态')">
      <a-select
        :placeholder="t('请选择')"
        v-model:value="searchForm.type"
      >
        <a-select-option
          v-for="(item, index) in statusData"
          :key="item.value || index"
          :value="item.value"
        >{{ item.label }}</a-select-option>
      </a-select>
    </vco-page-search-item>

    
    <vco-page-search-item :title="t('贷款人信息')" width="240">
      <vco-type-input
        v-model="searchForm.borrower"
        v-model:type="searchForm.borrowerType"
        :type-data="borrowerTypeData"
        :placeholder="t('请输入')"
      ></vco-type-input>
    </vco-page-search-item>

    <vco-page-search-item :title="t('项目信息')" width="240">
      <vco-type-input
        v-model="searchForm.projects"
        v-model:type="searchForm.projectsType"
        :type-data="projectsTypeData"
        :placeholder="t('请输入')"
      ></vco-type-input>
    </vco-page-search-item>

    <vco-page-search-item :title="t('项目日期')" width="240">
      <a-range-picker v-model:value="searchForm.time" />
    </vco-page-search-item>

    <vco-page-search-item :title="t('贷款金额')">
      <a-input v-model:value="searchForm.amount" :placeholder="t('请输入')" />
    </vco-page-search-item>

    <vco-page-search-item width="100%">
      <a-button @click="searchHandle"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
    </vco-page-search-item>
  </vco-page-search>
</template>

<script setup>
  import { ref } from "vue"
  import dayjs from "dayjs";
  import { cloneDeep } from "lodash";
  import { useI18n } from "vue-i18n";

  const emits = defineEmits(['search'])

  const { t } = useI18n();

  const statusData = [
    {
      label: t("全部"),
      value: ""
    },
    {
      label: t("申请中"),
      value: "1"
    },
    {
      label: t("已批准"),
      value: "2"
    },
    {
      label: t("已拒绝"),
      value: "3"
    }
  ]

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
      value: "id"
    },
    {
      label: t("地址"),
      value: "address"
    }
  ]

  const searchForm = ref({
    type: '',
    borrower: '',
    borrowerType: '',
    time: null,
    projectsType: '',
    projects: '',
    amount: ''
  })

  const searchHandle = () => {
    const data = cloneDeep(searchForm.value)
    if (data.time && data.time.length) {
      data.startTime = dayjs(data.time[0]).format('YYYY-MM-DD')
      data.endTime = dayjs(data.time[1]).format('YYYY-MM-DD')
    }
    delete data.time
    emits('search', data)
  }
</script>