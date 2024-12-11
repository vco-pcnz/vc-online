<template>
  <div class="table-content">
    <div class="table-block">
      <ul class="table-col header">
        <li class="check" v-show="isMultiple" @click="checkedAllHandle">
          <a-checkbox :checked="checkedAll" :indeterminate="indeterminate"></a-checkbox>
        </li>
        <li>{{ t('头像') }}</li>
        <li>{{ t('姓名') }}</li>
        <li v-show="url === 'stake/selStake'">{{ t('类型') }}</li>
        <li>{{ t('邮箱') }}</li>
        <li>{{ t('电话') }}</li>
        <li v-show="!isMultiple">{{ t('操作1') }}</li>
      </ul>
      <div v-if="tableData.length" class="table-body">
        <template v-for="item in tableData" :key="item.id">
          <ul class="table-col tr">
            <li class="check" v-show="isMultiple">
              <a-checkbox :checked="checkedIds.includes(item.uuid)" @change="itemcheck(item)"></a-checkbox>
            </li>
            <li>
              <vco-avatar v-if="item.avatar" :src="item.avatar" :radius="true"></vco-avatar>
              <span v-else>--</span>
            </li>
            <li>
              <p class="name" v-if="url === 'stake/selStake'">{{ item.name }}</p>
              <p class="name" v-else>{{ item.user_name }}</p>
            </li>
            <li v-show="url === 'stake/selStake'">
              <p class="bold">{{ item.type_name }}</p>
            </li>
            <li>
              <p v-if="item.email">
                <i class="iconfont" :class="{ cer: item.email_ok }">&#xe66f;</i>
                <span>{{ item.email }}</span>
              </p>
            </li>

            <li>
              <p v-if="item.mobile">
                <i class="iconfont" :class="{ cer: item.mobile_ok }">&#xe678;</i>

                <span :class="{ cer: item.mobile_ok }">
                  <template v-if="item.mobile && item.pre">+{{ item.pre }} </template>
                  {{ item.mobile }}
                </span>
              </p>
            </li>

            <li v-show="!isMultiple">
              <span class="primary" style="cursor: pointer" @click="checked(item)">
                {{ t('选择') }}
              </span>
            </li>
          </ul>
        </template>
      </div>
      <a-empty v-else :image="simpleImage" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Empty } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import router from '@/router';

const emits = defineEmits(['update:list', 'update:ids', 'update:data', 'change']);
const props = defineProps({
  url: {
    type: String
  },
  tableData: {
    type: Array,
    default: () => []
  },
  isMultiple: {
    type: Boolean,
    default: false
  },
  list: {
    type: Array,
    default: () => []
  },
  ids: {
    type: Array,
    default: () => []
  },
  data: {
    type: Object
  }
});

const { t } = useI18n();
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

const checkedList = ref([]); // 原始数据
const checkedIds = ref([]); // uuid

// 全选状态
const checkedAll = computed(() => {
  const currentIds = props.tableData.map((item) => item.uuid);
  const currentCheckIds = checkedIds.value.filter((item) => currentIds.includes(item));
  return currentCheckIds.length && currentCheckIds.length == currentIds.length;
});

// 半选状态
const indeterminate = computed(() => {
  const currentIds = props.tableData.map((item) => item.uuid);
  const currentCheckIds = checkedIds.value.filter((item) => currentIds.includes(item));
  return currentCheckIds.length && currentCheckIds.length !== currentIds.length;
});
// 单个复选
const itemcheck = (item) => {
  let index = checkedIds.value.indexOf(item.uuid);
  if (index < 0) {
    checkedIds.value.push(item.uuid);
    checkedList.value.push(item);
  } else {
    checkedIds.value.splice(index, 1);
    checkedList.value.splice(index, 1);
  }
  handlePathChange();
};
// 全选
const checkedAllHandle = (val) => {
  const isCheck = !checkedAll.value;
  props.tableData.map((item) => {
    let index = checkedIds.value.indexOf(item.uuid);
    if (!isCheck) {
      if (index !== -1) {
        checkedIds.value.splice(index, 1);
        checkedList.value.splice(index, 1);
      }
    } else {
      if (index == -1) {
        checkedIds.value.push(item.uuid);
        checkedList.value.push(item);
      }
    }
  });
  handlePathChange();
};
// 单选
const checked = (item) => {
  emits('update:data', item);
  emits('change');
};
const handlePathChange = () => {
  emits('update:list', checkedList.value);
  emits('update:ids', checkedIds.value);
  emits('change');
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.table-content {
  border-top: 1px solid #808080;
  padding-top: 5px;
}

.table-col {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 0 15px;
  font-size: 13px;
  &.header {
    background-color: #fff;
    border-radius: 10px;
    border: 1px solid #fff;
    font-weight: 500;
    font-size: 12px;
  }
  &.tr {
    background-color: #f0f0f0;
    border: 1px solid #e2e5e2;
    border-radius: 10px;
    margin-top: 10px;
    transition: all 0.3s ease;
    &:hover {
      border-color: @colorPrimary;
    }
    &:first-child {
      margin-top: 5px;
    }
  }
  > li {
    padding: 10px;
    flex: 1;
    line-height: 21px;
    display: flex;
    flex-direction: column;
    // align-items: center;
    justify-content: center;
    :deep(.ant-statistic-content) {
      font-size: 15px;
    }
    &.check {
      flex: 0 auto;
      width: 50px;
    }
    &:nth-child(2) {
      flex: 0 auto;
      width: 100px;
      align-items: center;
    }
    &:nth-child(3) {
      flex: 0 auto;
      width: 170px;
    }
    &:nth-child(4) {
      flex: 0 auto;
      width: 170px;
    }
    &:nth-child(5) {
      flex: 0 auto;
      width: 200px;
    }
    &:nth-child(6) {
      flex: 0 auto;
      width: 180px;
    }
    &:last-child {
      flex: 0 auto;
      width: 80px;
      text-align: center;
    }
    .bold {
      font-weight: 500;
    }
    .primary {
      color: @colorPrimary;
    }
    > p {
      width: 100%;
      word-break: break-all;
      margin-top: 4px;
      &:first-child {
        margin-top: 0;
      }
      &.name {
        font-weight: 500;
      }
      > .iconfont {
        margin-right: 4px;
        color: #999;
        &.black {
          color: #000;
        }
        &.cer {
          color: @colorPrimary;
        }
      }
      > span {
        color: #666;
        &.cer {
          color: #000;
        }
        &.name {
          font-weight: 500;
        }
      }
      &.err {
        color: #ff4d4f;
      }
    }
  }
}

.peason-info {
  position: relative;
  .vco-avatar {
    position: absolute;
    left: 0;
    top: 0;
  }
  > p {
    line-height: 22px;
    text-indent: 28px;
    word-break: break-all;
  }
}

.status-txt {
  font-size: 14px;
  font-weight: 500;
}
</style>
