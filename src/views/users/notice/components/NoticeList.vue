<template>
  <div class="table-content">
    <div class="table-block">
      <ul class="table-col header">
        <li class="check">
          <a-checkbox
            v-model:checked="checkedAll"
            @change="checkedAllHandle"
          ></a-checkbox>
        </li>
        <li>
          <a-button @click="handleMarkRead">{{ t("标记已读") }}</a-button>
        </li>
        <li>
          <a-button @click="handleAllRead" :disabled="!tableData.length">{{
            t("全部已读")
          }}</a-button>
        </li>
      </ul>
      <div v-if="tableData.length" class="table-body">
        <template v-for="item in tableData" :key="item.id">
          <ul class="table-col tr">
            <li class="check">
              <a-checkbox
                v-model:checked="item.checked"
                @change="itemcheck"
              ></a-checkbox>
            </li>
            <li class="notice-info">
              <h3 class="title">{{ item.title }}</h3>
              <p class="content">{{ item.content }}</p>
            </li>
          </ul>
        </template>
        <a-pagination
          v-model:current="paginationData.current"
          show-quick-jumper
          :total="paginationData.total"
          :show-total="total => `All ${total} Data`"
        />
      </div>
      <a-empty v-else :image="simpleImage" />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { Empty } from "ant-design-vue";
import { useI18n } from "vue-i18n";

const emits = defineEmits(["check"]);

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
});

const { t } = useI18n();

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

const checkedAll = ref(false);
// TODO
const paginationData = reactive({
  current: 1,
  total: 3,
});

const itemcheck = () => {
  const length = props.tableData.filter((item) => item.checked).length;
  checkedAll.value = length === props.tableData.length;
};

const checkedAllHandle = (e) => {
  const flag = e.target.checked;
  checkedAll.value = flag;
  props.tableData.forEach((item) => (item.checked = flag));
};

const handleMarkRead = () => {};

const handleAllRead = () => {};

</script>

<style lang="less" scoped>
@import "@/styles/variables.less";

.table-content {
  border-top: 1px solid @clr_stone1;
  padding-left: 5px;
}

.table-col {
  display: flex;
  align-items: center;
  font-size: 12px;

  &.header {
    border-bottom: 1px solid @clr_stone1;
    padding: 12px 0;
  }

  > li {
    margin-right: 16px;
  }

  &.tr {
    border-radius: 10px;
    margin-top: 10px;
    cursor: pointer;
    transition: all 0.3s ease;
    &:hover {
      border: 1px solid @colorPrimary;
    }
  }

  .notice-info {
    flex: 1;
    background-color: @clr_card_bg;
    border: 1px solid #e2e5e2;
    border-radius: 10px;
    padding: 6px 15px;

    .title {
      font-weight: 600;
    }
  }
}
</style>
