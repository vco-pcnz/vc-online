<template>
  <div class="table-gary sys-table-content">
    <!-- :class="{ noData: !tableData.length }" -->
    <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '100%' }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === '1'">
          <div class="avatarBox cursor" @click="toDetail(record)">
            <vco-avatar :src="record.avatar" :radius="true"></vco-avatar>
          </div>
        </template>
        <template v-if="column.key === '2'">
          <div @click="toDetail(record)" class="cursor">
            <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="record.name" style="width: 200px">
              {{ record.name }}
            </p>
            <p v-if="record.org_name" class="flex items-center">
              <i class="iconfont" :class="{ cer: record.org_name }">&#xe679;</i>
              <span class="text-ellipsis overflow-hidden inline-block text-nowrap" style="width: 200px" :title="record.org_name" :class="{ cer: record.org_name }">{{ record.org_name }}</span>
            </p>
            <p v-if="record.email" class="flex items-center">
              <i class="iconfont" :class="{ cer: record.email_ok }">&#xe66f;</i>
              <span :class="{ cer: record.email_ok }">{{ record.email }}</span>
            </p>
            <p v-if="record.mobile" class="flex items-center">
              <i class="iconfont" :class="{ cer: record.mobile_ok }">&#xe678;</i>
              <span :class="{ cer: record.mobile_ok }">
                <template v-if="record.mobile && record.pre">+{{ record.pre }} </template>
                {{ record.mobile }}
              </span>
            </p>
          </div>
        </template>
        <template v-if="column.key === '3'">
          <div @click="toUserDetail(record)" class="cursor" v-if="record.has_user">
            <p class="bold black">{{ record.user_name }}</p>
            <div v-if="record.user_username" class="flex items-center">
              <p class="flex items-center">
                <i class="iconfont">&#xe632;</i>
                <span>{{ record.user_username }}</span>
              </p>
              <div @click.stop v-if="hasPermission('orgs:unbindUser')">
                <a-popconfirm :title="'Are you sure ' + t('解绑用户')" ok-text="Yes" cancel-text="No" @confirm="orgsDetailStore.stakeUnbind(record.uuid)">
                  <span class="cer ml-2"><DisconnectOutlined /></span>
                </a-popconfirm>
              </div>
            </div>
            <p v-if="record.user_username" class="flex items-center">
              <i class="iconfont" :class="{ cer: record.user_email_ok }">&#xe66f;</i>
              <span :class="{ cer: record.user_email_ok }">{{ record.user_email }}</span>
            </p>
            <p v-if="record.user_mobile" class="flex items-center">
              <i class="iconfont" :class="{ cer: record.user_mobile_ok }">&#xe678;</i>
              <span :class="{ cer: record.user_mobile_ok }">
                <template v-if="record.user_mobile && record.user_pre">+{{ record.user_pre }} </template>
                {{ record.user_mobile }}
              </span>
            </p>
          </div>
          <a-button v-else-if="hasPermission('orgs:bindUser')" type="brown" shape="round" size="small" @click="showBindUser(record.uuid)">{{ t('绑定用户') }}</a-button>
        </template>
        <template v-if="column.key === '4'">
          <p v-if="record.user_roles.length">
            <span>{{ record.user_roles.join('/') }}</span>
          </p>
          <p v-if="record.cate_name.length">
            <span>{{ record.cate_name.join('/') }}</span>
          </p>
          <p>
            <span v-if="!!record.job">{{ record.job.join('/') }}</span>
          </p>
        </template>
        <template v-if="column.key === '5'">
          <div>
            <span>{{ record.user_create_time ? tool.showDate(record.user_create_time) : '--' }}</span>
            <span> / </span>
            <span>{{ record.create_time ? tool.showDate(record.create_time) : '--' }}</span>
          </div>
        </template>
        <template v-if="column.key === 'projects'">
          <div class="cursor" @click="navigationTo('/projects/list')">
            <p>
              <i class="iconfont black">&#xe690;</i>
              <span class="cer bold"> {{ record.open_count }} {{ t('进行中项目') }} </span>
            </p>
            <p style="padding-left: 20px">
              <span class="bold"> {{ record.close_count }} {{ t('已关闭项目') }} </span>
            </p>
          </div>
        </template>
        <template v-if="column.key === 'requests'">
          <p class="cursor" @click="navigationTo('/requests/loan')">
            <i class="iconfont black">&#xe751;</i>
            <span class="cer bold"> {{ record.apply_count }} {{ t('请求') }} </span>
          </p>
        </template>
        <template v-if="column.key === '7'">
          <p>
            <span class="cer">
              {{ record.is_expire ? t('有效') : t('无效') }}
            </span>
          </p>
          <p v-if="record.expire_time" :class="{ err: !record.is_expire }">
            {{ tool.showDate(record.expire_time) }}
          </p>
        </template>
        <template v-if="column.key === 'operation'">
          <a-dropdown :trigger="['click']" v-if="Boolean(record.is_child)">
            <a class="ant-dropdown-link" @click.prevent>
              <i class="iconfont cert">&#xe77a;</i>
            </a>
            <template #overlay>
              <div>
                <a-menu :selectable="false">
                  <a-menu-item key="0" @click="toDetail(record)">
                    <span>{{ t('查看详情') }}</span>
                  </a-menu-item>
                  <a-menu-item key="1" @click="toEdit(record)" v-if="hasPermission('orgs:edit')">
                    <span>{{ t('编辑') }}</span>
                  </a-menu-item>

                  <template v-if="hasPermission('orgs:bindUser')">
                    <a-popconfirm v-if="record.has_user" :title="'Are you sure ' + t('解绑用户')" ok-text="Yes" cancel-text="No" @confirm="orgsDetailStore.stakeUnbind(record.uuid)">
                      <a-menu-item key="2" @click.stop>
                        <span>{{ t('解绑用户') }}</span>
                      </a-menu-item>
                    </a-popconfirm>
                    <a-menu-item key="2" v-if="!record.has_user" @click="showBindUser(record.uuid)">
                      <span>{{ t('绑定用户') }}</span>
                    </a-menu-item>
                  </template>
                </a-menu>
              </div>
            </template>
          </a-dropdown>
        </template>
      </template>
    </a-table>
  </div>
  <!-- 绑定用户弹窗 -->
  <vco-choose-user ref="vcoChooseUserRef" @change="bindUser">
    <div></div>
  </vco-choose-user>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { Empty } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import { useOrgsDetailStore } from '@/store';
import { DisconnectOutlined } from '@ant-design/icons-vue';
import { hasPermission } from '@/directives/permission/index';

const orgsDetailStore = useOrgsDetailStore();

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

const columns = reactive([
  { title: t('缩略图t'), key: '1', width: 110, align: 'center' },
  { title: t('人员'), key: '2', width: 250, align: 'left' },
  { title: t('关联用户t'), key: '3', width: 250, align: 'left' },
  { title: t('用户角色t'), key: '4', width: 150, align: 'center' },
  { title: t('注册时间/创建时间t'), key: '5', width: 230, align: 'center' },
  { title: t('项目数据'), key: 'projects', width: 150, align: 'left' },
  { title: t('请求数据'), key: 'requests', width: 150, align: 'center' },
  { title: t('状态t'), key: '7', width: 150, align: 'center' },
  {
    title: t('操作1'),
    key: 'operation',
    fixed: 'right',
    align: 'center',
    width: 50
  }
]);

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
  vcoChooseUserRef.value.init();
};
const bindUser = (e) => {
  bindForm.value.user_uuid = e.uuid;
  orgsDetailStore.stakeBind(bindForm.value);
};

// 跳转详情
const toDetail = (item) => {
  navigationTo({ path: '/orgs/detail', query: { uuid: item.uuid } });
};
// 跳转编辑
const toEdit = (item) => {
  navigationTo({ path: '/orgs/form/edit', query: { uuid: item.uuid } });
};

// 跳转绑定用户详情
const toUserDetail = (item) => {
  if (!item.user_uuid) return;
  navigationTo({ path: '/users/edit', query: { uuid: item.user_uuid } });
};

// watch(
//   () => props.tableData,
//   (val, old) => {
//     columns[columns.length - 1].fixed = props.tableData.length ? 'right' : 'none';
//     console.log('tableData', props.tableData.length);
//     console.log('columns', columns);
//   },
//   { immediate: true }
// );
</script>

<style lang="less" scoped></style>
