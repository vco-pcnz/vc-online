<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="550" :open="visible" :title="title" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <template v-for="(item, index) in initData" :key="index">
          <div class="input-item">
            <div class="label" v-if="item.label" :class="{ err: !trim(formState[item.key]) && validate && item.required }">{{ t(item.label) }}</div>
            <!-- 日期 -->
            <template v-if="item.type === 'date'">
              <a-date-picker class="datePicker" inputReadOnly v-model:value="formState[item.key]" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" :disabledDate="item.disabledDate" />
            </template>
            <!-- 文本 -->
            <template v-if="item.type === 'textarea'"> <a-textarea v-model:value="formState[item.key]" :rows="5" /> </template>
            <!-- 金额 -->
            <a-input-number
              v-if="item.type === 'amount'"
              v-model:value="formState[item.key]"
              :min="item.min || 0"
              :max="item.max || 99999999999"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            />

            <!-- 上传 -->
            <template v-if="item.type === 'upload'">
              <vco-upload-modal v-model:list="documentList" v-model:value="formState[item.key]">
                <a-button class="upload_btn" type="brown" shape="round" size="small"> {{ t('上传') }}</a-button>
              </vco-upload-modal>

              <div class="file-content">
                <template v-if="documentList.length">
                  <div v-for="(item, index) in documentList" :key="index" class="file-item">
                    <vco-file-item :file="item" :showClose="true" @remove="remove(index)"></vco-file-item>
                  </div>
                </template>
                <p v-if="!documentList.length">{{ t('暂无数据，请上传') }}</p>
              </div>
            </template>
          </div>
        </template>
        <div class="flex justify-center">
          <a-button @click="verification" type="dark" class="save big uppercase" :loading="loading">
            {{ t('确认') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>

  <!-- 提交确认提示弹窗 -->
  <template v-if="showTip">
    <TipEditForecast @confirm="submit" v-model:visible="visible_tip"></TipEditForecast>
  </template>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { selectDateFormat } from '@/utils/tool';
import { request } from '@/utils/request';
import { trim, cloneDeep } from 'lodash';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  title: {
    type: String
  },
  url: {
    type: String,
    default: ''
  },
  formParams: {
    type: Object,
    default: {}
  },
  showTip: {
    type: Boolean,
    default: false
  },
  initData: {
    type: Array,
    default: () => {
      return [
        {
          type: 'textarea',
          label: '原因',
          key: 'decline_reason',
          required: true
        }
      ];
    }
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);
const visible_tip = ref(false);

const formState = ref({});

const updateVisible = (value) => {
  visible.value = value;
};

const documentList = ref([]);
// 删除文件
const remove = (index) => {
  documentList.value.splice(index, 1);
};

const submit = () => {
  let keys = props.initData.filter((item) => !item.hide).map((item) => item.key);
  keys.map((item) => {
    if (!formState.value[item]) {
      formState.value[item] = '';
    }
  });
  const paramsInfo = {
    url: props.url,
    method: 'post',
    data: formState.value
  };

  loading.value = true;
  request(paramsInfo)
    .then((res) => {
      emits('update');
      message.success(t('操作成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const verification = () => {
  validate.value = true;
  let keys = props.initData.filter((item) => !item.hide).map((item) => item.key);
  let requiredKeys = props.initData.filter((item) => !item.hide && item.required).map((item) => item.key);
  let formRequiredKeys = requiredKeys.filter((item) => formState.value[item]);
  if (requiredKeys.length != formRequiredKeys.length) return;
  if (props.showTip) {
    visible_tip.value = true;
  } else {
    submit();
  }
};

const init = () => {
  formState.value = {};
  formState.value = cloneDeep(props.formParams);
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
    position: relative;
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

.upload_btn {
  position: absolute;
  top: -4px;
  right: 0;
}
</style>
