<template>
  <div class="sys-table-content">
    <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '100%' }" row-key="uuid" :row-selection="{ selectedRowKeys: selectedRowKeys, ...rowSelection }">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === '1'">
          <div class="avatarBox cursor" @click="toDetail(record)">
            <vco-avatar :src="record.avatar" :radius="true"></vco-avatar>
          </div>
        </template>
        <template v-if="column.key === '2'">
          <div @click="toDetail(record)" class="cursor">
            <p class="bold black text-ellipsis overflow-hidden text-nowrap" :title="record.name" style="width: 200px">{{ record.name }}</p>
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
              <p>
                <i class="iconfont">&#xe632;</i>
                <span>{{ record.user_username }}</span>
              </p>
              <div @click.stop>
                <a-popconfirm :title="'Are you sure ' + t('解绑用户')" ok-text="Yes" cancel-text="No" @confirm="orgsStore.stakeUnbind(record.uuid)">
                  <span class="cer ml-2"><DisconnectOutlined /></span>
                </a-popconfirm>
              </div>
            </div>
            <p v-if="record.user_username">
              <i class="iconfont" :class="{ cer: record.user_email_ok }">&#xe66f;</i>
              <span :class="{ cer: record.user_email_ok }">{{ record.user_email }}</span>
            </p>
            <p v-if="record.user_mobile">
              <i class="iconfont" :class="{ cer: record.user_mobile_ok }">&#xe678;</i>
              <span :class="{ cer: record.user_mobile_ok }">
                <template v-if="record.user_mobile && record.user_pre">+{{ record.user_pre }} </template>
                {{ record.user_mobile }}
              </span>
            </p>
          </div>
          <a-button v-else type="brown" shape="round" size="small" @click="showBindUser(record.uuid)">{{ t('绑定用户') }}</a-button>
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
          <div @click="toDetail(record)" class="cursor">
            <span>{{ record.user_create_time ? tool.showDate(record.user_create_time) : '--' }}</span>
            <span> / </span>
            <span>{{ record.create_time ? tool.showDate(record.create_time) : '--' }}</span>
          </div>
        </template>
        <!-- <template v-if="column.key === '6'">
          <p>
            <i class="iconfont black">&#xe690;</i>
            <span class="cer bold"> {{ record.open_count }} {{ t('进行中项目') }} </span>
          </p>
          <p style="padding-left: 20px">
            <span class="bold"> {{ record.close_count }} {{ t('已关闭项目') }} </span>
          </p>
          <p>
            <i class="iconfont black">&#xe751;</i>
            <span class="cer bold"> {{ record.apply_count }} {{ t('请求') }} </span>
          </p>
        </template> -->
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

        <template v-if="column.key === 'address'">
          <div @click="toDetail(record)" class="cursor">
            <p>ID: {{ record.idcard }}</p>
            <p :title="record.address" class="line-clamp-3" style="text-wrap: wrap" v-if="record.address"><i class="iconfont">&#xe814;</i>{{ record.address }}</p>
          </div>
        </template>
        <template v-if="column.key === '7'">
          <div @click="toDetail(record)" class="cursor">
            <template v-if="record.expire_time && record.expire_time.length">
              <p class="black">{{ getExpireTimeNum(record.expire_time).valid }} {{ t('有效') }}</p>
              <p class="err">{{ getExpireTimeNum(record.expire_time).invalid }} {{ t('无效') }}</p>
            </template>
          </div>
        </template>
        <template v-if="column.key === 'operation'">
          <a-dropdown :trigger="['click']">
            <a class="ant-dropdown-link" @click.prevent>
              <i class="iconfont cert">&#xe77a;</i>
            </a>
            <template #overlay>
              <div>
                <a-menu :selectable="false">
                  <a-menu-item key="0" @click="toDetail(record)">
                    <span>{{ t('查看详情') }}</span>
                  </a-menu-item>
                  <a-menu-item key="1" @click="toEdit(record)">
                    <span>
                      {{ t('编辑') }}
                    </span>
                  </a-menu-item>
                  <template v-if="record.type !== 20">
                    <a-menu-item key="2" @click="toTree(record)">
                      <span>{{ t('股权') }}</span>
                    </a-menu-item>
                  </template>
                  <a-popconfirm :title="'Are you sure ' + t('解绑用户')" ok-text="Yes" cancel-text="No" @confirm="orgsStore.stakeUnbind(record.uuid)">
                    <a-menu-item key="3" v-if="record.has_user" @click.stop>
                      <span>{{ t('解绑用户') }}</span>
                    </a-menu-item>
                  </a-popconfirm>
                  <a-menu-item key="4" v-if="!record.has_user" @click="showBindUser(record.uuid)">
                    <span>
                      {{ t('绑定用户') }}
                    </span>
                  </a-menu-item>
                  <a-menu-item key="5" v-if="isDisabled(record) && hasPermission('orgs:delete')">
                    <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(record.uuid)" :loading="orgsStore.loading">
                      <span style="text-transform: lowercase">
                        {{ t('删除') }}
                      </span>
                    </a-popconfirm>
                  </a-menu-item>
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
import { ref, reactive } from 'vue';
import { Empty } from 'ant-design-vue';
import { hasPermission } from '@/directives/permission/index';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import { useOrgsStore } from '@/store';
import { DisconnectOutlined } from '@ant-design/icons-vue';
const orgsStore = useOrgsStore();

const emits = defineEmits(['update:data', 'update:keys', 'change']);

const props = defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  keys: {
    type: Array
  },
  data: {
    type: Array
  }
});
const { t } = useI18n();

const columns = reactive([
  { title: t('缩略图t'), key: '1', width: 110, align: 'center' },
  { title: t('利益相关者信息t'), width: 220, key: '2', align: 'left' },
  { title: t('关联用户t'), key: '3', width: 220, align: 'left' },
  // { title: t('用户角色t'), key: '4', width: 200, align: 'center' },
  { title: t('注册时间/创建时间t'), key: '5', width: 200, align: 'center' },
  { title: 'ID/' + t('地址'), key: 'address', width: 200 },
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
  orgsStore.stakeBind(bindForm.value);
};

const getExpireTimeNum = (val) => {
  let obj = {
    valid: 0,
    invalid: 0
  };
  val.map((item) => {
    if (tool.toUnixTime(item) >= Math.floor(new Date().getTime() / 1000)) {
      obj.valid += 1;
    } else {
      obj.invalid += 1;
    }
  });
  return obj;
};

// 跳转详情
const toDetail = (item) => {
  navigationTo({ path: '/orgs/detail', query: { uuid: item.uuid } });
};

// 跳转组织
const toTree = (item) => {
  navigationTo({ path: '/orgs/tree', query: { uuid: item.uuid } });
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

const selectedRowKeys = ref([]); // 存放UUid
const selectedRows = ref([]); // 存放所有选中的选项的所有内容
const rowSelection = ref({
  checkStrictly: false,
  onSelect: (record, selected) => {
    if (selected) {
      selectedRowKeys.value.push(record.uuid);
      selectedRows.value.push(record);
    } else {
      let index = selectedRowKeys.value.findIndex((it) => {
        return it === record.uuid;
      });
      selectedRowKeys.value.splice(index, 1);
      selectedRows.value.splice(index, 1);
    }
    handlePathChange();
  },
  onSelectAll: (selected, Rows, changeRows) => {
    const changeRowId = changeRows.map((it) => {
      return it.uuid;
    });
    if (selected) {
      let newIds = Array.from(new Set(changeRowId.concat(selectedRowKeys.value)));
      let newRows = Array.from(new Set(changeRows.concat(selectedRows.value)));
      selectedRowKeys.value = newIds;
      selectedRows.value = newRows;
    } else {
      // 取消选中
      changeRowId.map((it) => {
        let index = selectedRowKeys.value.findIndex((item) => {
          return item == it;
        });
        if (index != -1) {
          selectedRowKeys.value.splice(index, 1);
          selectedRows.value.splice(index, 1);
        }
      });
    }
    handlePathChange();
  },
  getCheckboxProps: (r) => ({
    disabled: Boolean(parseInt(r.open_count) + parseInt(r.close_count) + parseInt(r.apply_count))
  })
});

const handlePathChange = () => {
  emits('update:data', selectedRows.value);
  emits('update:keys', selectedRowKeys.value);
  emits('change');
};

const isDisabled = (val) => {
  return !Boolean(parseInt(val.open_count) + parseInt(val.close_count) + parseInt(val.apply_count));
};

const remove = (val) => {
  orgsStore.remove([val], true);
};
</script>
