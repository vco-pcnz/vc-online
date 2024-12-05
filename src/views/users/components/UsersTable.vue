<template>
  <div class="table-content">
    <div class="table-block">
      <ul class="table-col header">
        <li class="check">
          <a-checkbox
            v-model:checked="checkedAll"
            :indeterminate="indeterminate"
            @change="checkedAllHandle"
          ></a-checkbox>
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
            <li>
              <vco-avatar
                :src="item.avatar"
                :radius="true"
                :round="true"
              ></vco-avatar>
            </li>
            <li>
              <p>
                <span class="black_blod">
                  {{ item.user_name }}
                </span>
              </p>
              <p>
                <i class="iconfont" :class="{ cer: item.email_ok }">&#xe66f;</i>
                <span>
                  {{ item.email }}
                </span>
              </p>
              <p>
                <i class="iconfont" :class="{ cer: item.mobile_ok }">
                  &#xe678;
                </i>
                <span>+{{ item.pre }} {{ item.mobile }}</span>
              </p>
            </li>
            <li>
              <p class="black_blod">ID: {{ item.username }}</p>
              <p>
                <span>{{ t('注册于') }}</span>
                <span>{{ tool.showDate(item.create_time) }}</span>
              </p>
            </li>
            <li>
              <p v-if="item.roles.length">{{ item.roles.join('/') }}</p>
              <p v-else>--</p>
            </li>
            <li>
              <p :class="{ black_blod: item.org_stake_type }">
                {{ item.org_stake_type || '--' }}
              </p>
              <p v-if="item.org_stake">
                <i class="iconfont" :class="{ cer: item.org_stake_ok }">
                  &#xe74b;
                </i>
                <span>
                  {{ item.org_stake }}
                </span>
              </p>
              <p v-if="item.stake">
                <i class="iconfont" :class="{ cer: item.stake_ok }">&#xe742;</i>
                <span>
                  {{ item.stake }}
                </span>
              </p>
            </li>
            <li>
              <p>
                <i class="iconfont">&#xe771;</i>
                <span class="black_blod">
                  {{ item.xm ?? 0 }} {{ t('进行中项目') }}
                </span>
              </p>
              <p style="margin-left: 45px">
                {{ item.cxm ?? 0 }} {{ t('已关闭项目') }}
              </p>
            </li>
            <li>
              <p>
                <i class="iconfont">&#xe751;</i>
                <span class="black_blod">
                  {{ item.apply_count ?? 0 }} {{ t('请求') }}
                </span>
              </p>
            </li>
            <li>
              <a-dropdown :trigger="['click']">
                <a class="ant-dropdown-link" @click.prevent>
                  <i class="iconfont">&#xe77a;</i>
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="0">
                      <a @click="editUser(item)">{{ t('查看详情') }}</a>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </li>
          </ul>
        </template>
      </div>
      <a-empty v-else :image="simpleImage" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Empty } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import tool, { navigationTo } from '@/utils/tool';

const emits = defineEmits(['check']);

const props = defineProps({
  tableData: {
    type: Array,
    default: () => [],
  },
  indeterminate: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

const checkedAll = ref(false);

const itemcheck = () => {
  const length = props.tableData.filter((item) => item.checked).length;
  checkedAll.value = length === props.tableData.length;
};

const checkedAllHandle = () => {
  emits('check', checkedAll.value);
};

const editUser = (userData) => {
  navigationTo(`/users/detail?uuid=${userData.uuid}`);
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
    font-weight: bold;
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
    align-items: center;
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
    }
    &:nth-child(3) {
      flex: 0 auto;
      width: 240px;
    }
    &:nth-child(4) {
      flex: 0 auto;
      width: 200px;
    }
    &:nth-child(5) {
      flex: 0 auto;
      width: 180px;
    }
    &:nth-child(6) {
      flex: 0 auto;
      width: 220px;
    }
    &:nth-child(7) {
      flex: 0 auto;
      width: 180px;
    }
    &:nth-child(8) {
      flex: 0 auto;
      width: 120px;
    }
    &:last-child {
      flex: 0 auto;
      width: 50px;
    }
    > p {
      width: 100%;
      word-break: break-all;
      margin-top: 4px;
      color: #666;
      &:first-child {
        margin-top: 0;
      }

      > .iconfont {
        margin-right: 4px;
        color: #999;
        &.cer {
          color: @colorPrimary;
        }
      }
    }
    .black_blod {
      font-weight: 500;
      color: @clr_charcoal;
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
  font-weight: bold;
}
</style>
