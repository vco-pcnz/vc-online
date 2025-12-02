<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="550" :open="visible" :title="t('买断')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.date && validate }">{{ t('日期') }}</div>
          <a-date-picker class="datePicker" inputReadOnly :open="isOpen" v-model:value="formState.date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" @change="initAmount()" />
        </div>
        <div class="input-item">
          <div class="label">{{ t('Boc总余额') }}</div>
          <a-spin :spinning="initAmount_loading">
            <a-input-number v-model:value="balance" :max="99999999999" :readonly="true" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
          </a-spin>
        </div>
        <div class="input-item">
          <div class="label flex items-end justify-between mt-3">
            {{ t('文件') }}
            <vco-upload-modal v-model:list="documentList" v-model:value="formState.document">
              <a-button class="upload_btn" type="brown" shape="round" size="small"> {{ t('上传') }}</a-button>
            </vco-upload-modal>
          </div>

          <div class="file-content">
            <template v-if="documentList.length">
              <div v-for="(item, index) in documentList" :key="index" class="file-item">
                <vco-file-item :file="item" :showClose="true" @remove="remove(index)"></vco-file-item>
              </div>
            </template>
            <p v-if="!documentList.length">{{ t('暂无数据，请上传') }}</p>
          </div>
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.note && validate }">{{ t('说明') }}</div>
          <a-textarea v-model:value="formState.note" :rows="4" />
        </div>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('确认') }}
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
import { buyOutCalculate, buyOutSave } from '@/api/project/buyout';
import { selectDateFormat } from '@/utils/tool';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  uuid: {
    type: String
  },
  data: {
    type: { Object, Array }
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);
const rename = ref('');

const types = ref([
  { label: 'Journal Credit', value: 1 },
  { label: 'Journal Debit', value: 2 },
  { label: 'Journal Default Interest Credit', value: 3 }
]);

const formState = ref({
  date: '',
  document: [],
  note: ''
});

const initAmount_loading = ref(false);
const balance = ref('');
const initAmount = () => {
  initAmount_loading.value = true;
  buyOutCalculate({ date: formState.value.date, uuid: props.uuid })
    .then((res) => {
      balance.value = res.balance;
    })
    .finally((_) => {
      initAmount_loading.value = false;
    });
};

const updateVisible = (value) => {
  visible.value = value;
  initAmount_loading.value = false;
};

const documentList = ref([]);
// 删除文件
const remove = (index) => {
  documentList.value.splice(index, 1);
};

const save = () => {
  validate.value = true;
  if (!formState.value.date) return message.error(t('请选择') + t('日期'));
  if (!formState.value.note) return message.error(t('请输入') + t('说明'));
  let params = { uuid: props.uuid, ...formState.value };
  if (!Array.isArray(props.data)) {
    params.id = props.data.id;
  }
  buyOutSave(params)
    .then((res) => {
      emits('update');
      message.success(t('保存成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const init = () => {
  formState.value = {
    date: '',
    document: [],
    note: ''
  };
  validate.value = false;
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
      .label {
        color: #888;
        font-size: 12px;
        padding: 0 0 8px;
        &.err {
          color: #c1430c;
        }
      }

      .save {
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
.file-content {
  border: 1px solid #272727 !important;
  border-radius: 10px !important;
  background-color: #f7f9f8;
  padding: 15px;
  > p {
    text-align: center;
    font-size: 14px;
    color: #999;
  }
}
</style>
