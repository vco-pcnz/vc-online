<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="560" :open="visible" title="Accept documents" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="label">{{ t('选择利益相关者') }}</div>
        <vco-choose-user ref="vcoChooseUserRef" url="stake/selStake" @change="checkUser"></vco-choose-user>
        <template v-for="item in orgs" :key="item.uuid">
          <div class="orgCard">
            <div class="user-item">
              <vco-avatar :size="30" :src="item.avatar || ''"></vco-avatar> <span class="ml-3"></span>
              <p class="name">{{ item.name }}</p>
              <i class="iconfont">&#xe77d;</i>
            </div>
            <a-input-number v-model:value="amount" :max="99999999999" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
          </div>
        </template>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
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
  }
});

const visible = ref(true);
const loading = ref(false);
const validate = ref(false);

const orgs = ref([]);

const checkUser = (val) => {
  console.log(val);
  orgs.value.push({
    uuid: val.uuid,
    name: val.name,
    avatar: val.avatar,
    amount: ''
  });
  console.log(orgs.value);
};

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  if (!date.value) return message.error(t('请输入') + t('日期'));
  loading.value = true;
  let params = {
    uuid: props.uuid,
    id: props.detail.id,
    date: date.value
  };
  loanDsaveStep(params)
    .then((res) => {
      date.value = '';
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
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;
      .user-item {
        padding: 8px 10px;
        background-color: #f7f0e6;
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
