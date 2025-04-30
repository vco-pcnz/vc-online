<template>
  <div>
    <div class="inline" @click="init"><slot></slot></div>
    <div @click.stop ref="JournalRef" class="Journal">
      <a-modal :width="800" :open="visible" :title="t('添加')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
        <div class="content">
          <div class="mb-5 flex justify-end">
            <vco-page-search @keyup.enter="searchHandle">
              <vco-page-search-item width="220" :title="t('邮箱')">
                <a-input v-model:value="formState.email" :placeholder="t('请输入')" />
              </vco-page-search-item>
              <vco-page-search-item width="220" :title="t('电话')">
                <a-input v-model:value="formState.mobile" :placeholder="t('请输入')" />
              </vco-page-search-item>
              <vco-page-search-item width="100%">
                <a-button type="dark" @click="searchHandle">
                  <i class="iconfont">&#xe756;</i>
                  {{ t('搜索') }}
                </a-button>
              </vco-page-search-item>
            </vco-page-search>
          </div>

          <div class="sys-table-content">
            <a-spin :spinning="loading" size="large">
              <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '100%' }">
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.dataIndex === 'avatar'">
                    <div class="avatarBox cursor">
                      <vco-avatar :src="record.avatar" :radius="true"></vco-avatar>
                    </div>
                  </template>
                  <template v-if="column.dataIndex === 'user_name'">
                    <p>
                      <span class="black bold">
                        {{ record.user_name }}
                      </span>
                    </p>
                  </template>
                  <template v-if="column.dataIndex === 'email'">
                    <p>
                      <i class="iconfont" :class="{ cer: record.email_ok }">&#xe66f;</i>
                      <span>
                        {{ record.email }}
                      </span>
                    </p>
                  </template>
                  <template v-if="column.dataIndex === 'mobile'">
                    <p>
                      <i class="iconfont" :class="{ cer: record.mobile_ok }">&#xe678;</i>
                      <span>+{{ record.pre }} {{ record.mobile }}</span>
                    </p>
                  </template>
                  <template v-if="column.dataIndex === '4'">
                    <p v-if="record.roles.length">{{ record.roles.join('/') }}</p>
                    <p v-else>--</p>
                  </template>
                  <template v-else-if="column.dataIndex === 'type'">
                    <span class="type_text orange" v-if="record.type">{{ t('公司') }}</span>
                    <span class="type_text green" v-else>{{ t('个人') }}</span>
                  </template>

                  <template v-else-if="column.dataIndex === 'operation'">
                    <a-popconfirm :title="t('确定要添加到我的团队吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="add(record.uuid, index)" :loading="loading">
                      <span style="text-transform: lowercase">
                        <a-button type="primary" shape="round">{{ t('选择') }}</a-button>
                      </span>
                    </a-popconfirm>
                  </template>
                </template>
              </a-table>
            </a-spin>
          </div>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script scoped setup>
import { ref, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { relationUser, relationApply } from '@/api/users';

const { t } = useI18n();
const emits = defineEmits(['reload']);

const props = defineProps({
  uuid: {
    type: String
  },
  detail: {
    type: Object
  },
  projectDetail: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);
const formState = ref({
  email: '',
  mobile: ''
});

const tableData = ref([]);
const columns = reactive([
  { title: t('头像'), dataIndex: 'avatar', width: 110, align: 'center' },
  { title: t('名称'), dataIndex: 'user_name', align: 'left' },
  { title: t('邮箱'), dataIndex: 'email', align: 'left' },
  { title: t('电话'), dataIndex: 'mobile', align: 'left' },
  { title: t('类型'), dataIndex: 'type', width: 100, align: 'center' },
  {
    title: t('操作1'),
    dataIndex: 'operation',
    align: 'center',
    width: 50
  }
]);

const updateVisible = (value) => {
  visible.value = value;
};

const searchHandle = () => {
  if (!formState.value.email && !formState.value.mobile) return;
  loading.value = true;
  relationUser({ ...formState.value, page: 1, limit: 999 })
    .then((res) => {
      tableData.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

const add = (uuid, index) => {
  loading.value = true;
  relationApply({ uuids: [uuid] })
    .then((res) => {
      tableData.value.splice(index, 1);
      message.success(t('添加成功'));
      emits('reload');
      updateVisible(false);
    })
    .finally(() => {
      loading.value = false;
    });
};

const init = () => {
  tableData.value = [];
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-empty {
      min-height: 100px;
    }
  }
}
</style>
