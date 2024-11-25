<template>
  <vco-page-search>
    <vco-page-search-item width="100">
      <a-select
        :placeholder="t('请选择')"
        v-model:value="searchForm.type"
      >
        <a-select-option
          v-for="(item, index) in typeData"
          :key="item.value || index"
          :value="item.value"
        >{{ item.label }}</a-select-option>
      </a-select>
    </vco-page-search-item>
    
    <vco-page-search-item width="220">
      <vco-type-input
        v-model="searchForm.keywords"
        v-model:type="searchForm.key"
        :type-data="baseInfoData"
        :placeholder="t('请输入')"
      ></vco-type-input>
    </vco-page-search-item>

    <vco-page-search-item width="220">
      <vco-type-input
        v-model="searchForm.org__name"
        :type-data="orgNameData"
        :placeholder="t('请输入')"
      ></vco-type-input>
    </vco-page-search-item>

    <vco-page-search-item width="100%">
      <a-button type="dark-line" @click="searchHandle"><i class="iconfont">&#xe756;</i>{{ t('搜索') }}</a-button>
    </vco-page-search-item>
  </vco-page-search>
</template>

<script setup>
  import { ref } from "vue"
  import { useI18n } from "vue-i18n";

  const emits = defineEmits(['search'])

  const { t } = useI18n();

  const typeData = [
    {
      label: t("类型"),
      value: ""
    },
    {
      label: t("用户"),
      value: "1"
    },
    {
      label: t("经纪人"),
      value: "2"
    },
    {
      label: "vco",
      value: "3"
    }
  ]

  const baseInfoData = [
    {
      label: t("全部"),
      value: ""
    },
    {
      label: t("姓名"),
      value: "name"
    },
    {
      label: t("邮箱"),
      value: "email"
    },
    {
      label: t("电话"),
      value: "mobile"
    },
    {
      label: t("用户Id"),
      value: "id"
    },
    {
      label: t("Id编码"),
      value: "code"
    }
  ]

  const orgNameData = [
    {
      label: t("组织名称"),
      value: ""
    },
  ]

  const searchForm = ref({
    type: '',
    key: '',
    keywords: '',
    org__name: ''
  })

  const searchHandle = () => {
    emits('search', data)
  }
</script>