<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="900" :open="visible" title="Accept documents" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <div class="flex justify-end">
          <vco-choose-user ref="vcoChooseUserRef" title="orgs search" url="stake/selStake" v-model:list="chooseUsers" :isMultiple="true" @change="checkUser">
            <a-button type="brown" shape="round" size="small" @click="showChooseUser">Select stakeholders</a-button>
          </vco-choose-user>
        </div>
        <a-table :columns="columns" :data-source="orgs" :pagination="false" :scroll="{ x: '100%' }">
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'avatar'">
              <div class="flex justify-center">
                <vco-avatar :size="36" :src="record.avatar" :radius="true"></vco-avatar>
              </div>
            </template>
            <template v-if="column.dataIndex === 'amount'">
              <a-input-number
                :class="{ err: validate && !record.amount }"
                v-model:value="record.amount"
                :max="99999999999"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </template>
            <template v-if="column.dataIndex === 'note'">
              <a-textarea v-model:value="record.note" :rows="1" />
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(index)">
                <i class="iconfont cursor" style="cursor: pointer">&#xe8c1;</i>
              </a-popconfirm>
            </template>
          </template>
        </a-table>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading" >
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import { loanDsaveStep } from '@/api/project/loan';
import dayjs, { Dayjs } from 'dayjs';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  uuid: {
    type: String
  },
  detail: {
    type: Object
  },
  projectDetail: {
    type: Object
  },
  stake: {
    type: Array
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);
const vcoChooseUserRef = ref();

const orgs = ref([]);
const chooseUsers = ref([]);

const showChooseUser = () => {
  checkUser.value = [];
  vcoChooseUserRef.value.init()
};

const checkUser = () => {
  chooseUsers.value.map((item) => {
    orgs.value.push({
      uuid: item.uuid,
      name: item.name,
      avatar: item.avatar,
      amount: '',
      note: ''
    });
  });
};

const updateVisible = (value) => {
  visible.value = value;
};
const columns = reactive([
  { title: t('头像'), dataIndex: 'avatar', width: 100, align: 'center', ellipsis: true },
  { title: t('名称'), dataIndex: 'name', width: 120, align: 'left', ellipsis: true },
  { title: t('金额'), dataIndex: 'amount', width: 180, align: 'center', ellipsis: true },
  { title: t('备注'), dataIndex: 'note', align: 'left', ellipsis: true },
  { title: t('操作'), dataIndex: 'operation', width: 120, align: 'center', ellipsis: true }
]);

const remove = (val) => {
  orgs.value.splice(val, 1);
};

const save = () => {
  validate.value = true;

  let stake = [];
  stake = orgs.value.map((item) => {
    return {
      uuid: item.uuid,
      amount: item.amount,
      note: item.note
    };
  });
  let amounts = stake.filter((item) => {
    return item.amount;
  });
  if (amounts.length != stake.length) {
    return;
  }
  loading.value = true;
  let params = {
    uuid: props.uuid,
    id: props.detail.id,
    stake: stake
  };
  loanDsaveStep(params)
    .then((res) => {
      message.success(t('保存成功'));
      emits('change');
      updateVisible(false);
    })
    .finally((_) => {
      validate.value = false;
      loading.value = false;
    });
};

const init = () => {
  orgs.value = [];
  if (props.stake && props.stake.length) {
    orgs.value = props.stake.map((item) => {
      return {
        avatar: item.stakeholder.avatar,
        name: item.stakeholder.name,
        uuid: item.stakeholder.uuid,
        amount: item.amount,
        note: item.note
      };
    });
  }
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    .ant-input-number {
      border-color: #d9d9d9;
      &.err {
        border-color: #c1430c;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;
      .user-item {
        padding: 8px 10px;
        border-radius: 8px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .name {
          flex: 1;
          font-weight: bold;
        }
      }
      .label {
        color: #888;
        font-size: 12px;
        padding: 0 0 8px;
        &.err {
          color: #c1430c;
        }
      }

      .save {
        width: 100%;
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
</style>
