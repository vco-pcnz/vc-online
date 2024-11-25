<template>
  <vco-page-search>
    <vco-page-search-item :title="t('类型')" width="100">
      <a-select :placeholder="t('请选择')" v-model:value="searchForm.cid">
        <a-select-option
          v-for="(item, index) in types"
          :key="item.code || index"
          :value="item.code"
          >{{ item.name }}</a-select-option
        >
      </a-select>
    </vco-page-search-item>

    <vco-page-search-item :title="t('人员信息')" width="220">
      <vco-type-input
        v-model="searchForm.org__name"
        v-model:type="searchForm.key"
        :type-data="keys"
        :placeholder="t('请输入')"
      ></vco-type-input>
    </vco-page-search-item>

    <vco-page-search-item :title="t('关键词')" width="140">
      <a-input v-model:value="searchForm.lm" :placeholder="t('请输入')" />
    </vco-page-search-item>

    <vco-page-search-item width="100%">
      <a-button type="dark-line" @click="searchHandle"
        ><i class="iconfont">&#xe756;</i>{{ t("搜索") }}</a-button
      >
    </vco-page-search-item>
  </vco-page-search>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import dayjs from "dayjs";
import { cloneDeep } from "lodash";
import { useI18n } from "vue-i18n";
import { getStakeholderTypet } from "@/api/orgs";

const emits = defineEmits(["search"]);

const { t } = useI18n();

const types = ref([{ name: t("全部"), code: "" }]);

const keys = ref([
  {
    label: t("全部"),
    value: "all",
  },
  {
    label: t("名称"),
    value: "name",
  },
  {
    label: t("邮箱"),
    value: "email",
  },
  {
    label: t("地址"),
    value: "mobile",
  },
  {
    label: t("身份证"),
    value: "code",
  },
  {
    label: t("用户Id"),
    value: "userId",
  },
]);

const searchForm = ref({
  cid: "",
  key: "all",
  org__name: "",
  keywords: null,
});

const searchHandle = () => {
  const data = cloneDeep(searchForm.value);
  emits("search", data);
};

onMounted(() => {
  getStakeholderTypet().then((res) => {
    types.value = types.value.concat(res);
  });
});
</script>
