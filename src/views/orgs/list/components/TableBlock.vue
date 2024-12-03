<template>
  <div class="table-content">
    <div class="table-block">
      <ul class="table-col header">
        <li class="check" style="width: 0; padding: 0">
          <!-- <a-checkbox
            v-model:checked="checkedAll"
            :indeterminate="indeterminate"
            @change="checkedAllHandle"
          ></a-checkbox> -->
        </li>
        <li>{{ t('缩略图t') }}</li>
        <li>{{ t('利益相关者信息t') }}</li>
        <li>{{ t('关联用户t') }}</li>
        <li>{{ t('用户角色t') }}</li>
        <li>{{ t('注册时间/创建时间t') }}</li>
        <li>{{ t('项目数据t') }}</li>
        <li>{{ t('状态t') }}</li>
        <li>{{ t('操作1') }}</li>
      </ul>
      <div v-if="tableData.length" class="table-body">
        <template v-for="item in tableData" :key="item.id">
          <ul class="table-col tr">
            <li class="check" style="width: 0; padding: 0">
              <!-- <a-checkbox
                v-model:checked="item.checked"
                @change="itemcheck"
              ></a-checkbox> -->
            </li>
            <li>
              <vco-avatar v-if="item.avatar" :src="item.avatar" :radius="true"></vco-avatar>
              <span v-else>--</span>
            </li>
            <li>
              <p class="name">{{ item.name }}</p>
              <p v-if="item.org_name">
                <i class="iconfont" :class="{ cer: item.org_name }">&#xe679;</i>
                <span :class="{ cer: item.org_name }">{{ item.org_name }}</span>
              </p>
              <p v-if="item.email">
                <i class="iconfont" :class="{ cer: item.email_ok }">&#xe66f;</i>
                <span :class="{ cer: item.email_ok }">{{ item.email }}</span>
              </p>
              <p v-if="item.mobile">
                <i class="iconfont" :class="{ cer: item.mobile_ok }"> &#xe678; </i>
                <span :class="{ cer: item.mobile_ok }">
                  <template v-if="item.mobile && item.pre"> +{{ item.pre }} </template>
                  {{ item.mobile }}
                </span>
              </p>
            </li>
            <li>
              <p class="name">{{ item.user_name }}</p>
              <p v-if="item.user_username">
                <i class="iconfont">&#xe632;</i>
                <span>{{ item.user_username }}</span>
              </p>
              <p v-if="item.user_username">
                <i class="iconfont" :class="{ cer: item.user_email_ok }"> &#xe66f; </i>
                <span>{{ item.user_email }}</span>
              </p>
              <p v-if="item.user_mobile">
                <i class="iconfont" :class="{ cer: item.user_mobile_ok }"> &#xe678; </i>
                <span :class="{ cer: item.user_mobile_ok }">
                  {{ item.user_mobile }}
                </span>
              </p>
            </li>
            <li>
              <p v-if="item.user_roles.length">
                <span>{{ item.user_roles.join('/') }}</span>
              </p>
              <p v-if="item.cate_name.length">
                <span>{{ item.cate_name.join('/') }}</span>
              </p>
              <p>
                <span>{{ item.job }}</span>
              </p>
            </li>
            <li>
              <p v-if="item.user_create_time">
                <span>{{ tool.showDate(item.user_create_time) }}</span>
              </p>
              <p v-if="item.create_time">
                <span>{{ tool.showDate(item.create_time) }}</span>
              </p>
            </li>
            <li>
              <p>
                <i class="iconfont black">&#xe690;</i>
                <span class="cer bold"> {{ item.open_count }} {{ t('进行中项目') }} </span>
              </p>
              <p style="padding-left: 20px">
                <span class="bold"> {{ item.close_count }} {{ t('已关闭项目') }} </span>
              </p>
              <p>
                <i class="iconfont black">&#xe751;</i>
                <span class="cer bold"> {{ item.apply_count }} {{ t('请求') }} </span>
              </p>
            </li>

            <li>
              <p>
                <span class="cer">
                  {{ item.is_expire ? t('有效') : t('无效') }}
                </span>
              </p>
              <p v-if="item.expire_time" :class="{ err: !item.is_expire }">
                {{ tool.showDate(item.expire_time) }}
              </p>
            </li>
            <li>
              <a-dropdown :trigger="['click']">
                <a class="ant-dropdown-link" @click.prevent>
                  <i class="iconfont">&#xe77a;</i>
                </a>
                <template #overlay>
                  <a-menu>
                    <DetailModal :detail="item" v-if="item.type == 4">
                      <a-menu-item key="0">
                        <span>{{ t('查看详情') }}</span>
                      </a-menu-item>
                    </DetailModal>
                    <a-menu-item key="1" v-else @click="toDetail(item)">
                      <span>{{ t('查看详情') }}</span>
                    </a-menu-item>
                    <a-menu-item key="2" @click="toEdit(item)">
                      <span>
                        {{ t('编辑') }}
                      </span>
                    </a-menu-item>
                    <a-popconfirm :title="'Are you sure ' + t('解绑用户')" ok-text="Yes" cancel-text="No" @confirm="orgsStore.stakeUnbind(item.uuid)" @cancel="cancel">
                      <a-menu-item key="3" v-if="item.has_user">
                        <span>{{ t('解绑用户') }}</span>
                      </a-menu-item>
                    </a-popconfirm>
                    <a-menu-item key="4" v-if="!item.has_user" @click="showBindUser(item.uuid)">
                      <span>
                        {{ t('绑定用户') }}
                      </span>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </li>
          </ul>
        </template>
      </div>
      <a-empty v-else :image="simpleImage" />
      <vco-choose-user ref="vcoChooseUserRef" @change="bindUser">
        <div></div>
      </vco-choose-user>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Empty } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import router from '@/router';
import DetailModal from '../../components/detail-modal.vue';
import { useOrgsStore } from '@/store';
import { useOrgsFormStore } from '@/store';
const orgsFormStore = useOrgsFormStore();
const orgsStore = useOrgsStore();

const emits = defineEmits(['check']);

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  indeterminate: {
    type: Boolean,
    default: false
  }
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

const bindForm = ref({
  user_uuid: '',
  uuid: ''
});
const vcoChooseUserRef = ref();
const showBindUser = (uuid) => {
  bindForm.value.uuid = uuid;
  vcoChooseUserRef.value.searchHandle();
};
const bindUser = (e) => {
  bindForm.value.user_uuid = e.uuid;
  orgsStore.stakeBind(bindForm.value);
};

// 跳转详情
const toDetail = (item) => {
  orgsFormStore.update({
    p_uuid: item.uuid,
    uuid: '',
    isEdit: false,
    isAddMember:false
  })
  router.push({ path: '/orgs/detail' });
};
// 跳转编辑
const toEdit = (item) => {
  orgsFormStore.update({
    p_uuid:'',
    uuid: item.uuid,
    isEdit: true,
    isAddMember:!!item.is_pid
  })
  navigationTo('/orgs/addOrgs')
}
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
      width: 170px;
      text-align: center;
    }

    &:nth-child(6) {
      flex: 0 auto;
      width: 170px;
      text-align: center;
    }

    &:nth-child(7) {
      flex: 0 auto;
      width: 170px;
    }

    &:nth-child(8) {
      flex: 0 auto;
      width: 100px;
      text-align: center;
    }

    &:last-child {
      flex: 0 auto;
      width: 50px;
      text-align: center;
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

        &.bold {
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
