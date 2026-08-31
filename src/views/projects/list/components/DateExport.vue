<template>
  <div class="inline" @click="init">
    <slot>
      <a-button type="cyan" size="small" class="ml-3" shape="round" :loading="loading">{{ t('导出') }}</a-button>
    </slot>
  </div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="486" :open="visible" title=" " :getContainer="() => $refs.JournalRef" :maskClosable="false"
             :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-form-item :label="t('贷款分类')" name="sta">
            <div class="export-sta">
              <a-checkbox
                class="export-sta-all"
                :indeterminate="staIndeterminate"
                :checked="staCheckAll"
                @change="onCheckAllSta"
              >{{ t('全选') }}</a-checkbox>
              <a-checkbox-group v-model:value="formState.sta" class="export-sta-group">
                <div class="export-sta-grid">
                  <a-checkbox :value="1">{{ t('当前项目') }}</a-checkbox>
                  <a-checkbox :value="5">{{ t('紧急管理') }}</a-checkbox>
                  <a-checkbox :value="4">{{ t('已核销的项目') }}</a-checkbox>
                  <a-checkbox :value="2">{{ t('已关闭的项目') }}</a-checkbox>
                </div>
              </a-checkbox-group>
            </div>
          </a-form-item>
          <a-form-item :label="t('日期')" name="date">
            <a-date-picker class="datePicker" :disabledDate="disabledDateFormat" inputReadOnly
                           v-model:value="formState.date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD"
                           :showToday="false" />
          </a-form-item>
        </a-form>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('导出') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { downBl } from '@/api/project/project';
import dayjs from 'dayjs';
import { selectDateFormat } from '@/utils/tool';
import useProductStore from '@/store/modules/product';
const productStore = useProductStore();
const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  searchParams: {
    type: Object
  },
  sta: {
    type: [String, Number]
  }
});

const visible = ref(false);
const loading = ref(false);

const staOptions = [1, 5, 4, 2];

const formState = ref({
  date: '',
  sta: [1]
});

const formRef = ref();
const formRules = ref({
  date: [{ required: true, message: t('请选择') + t('日期'), trigger: 'change' }],
  sta: [{ type: 'array', required: true, min: 1, message: t('请至少选择一类贷款'), trigger: 'change' }]
});

const staCheckAll = computed(() => formState.value.sta.length === staOptions.length);
const staIndeterminate = computed(() => formState.value.sta.length > 0 && formState.value.sta.length < staOptions.length);

const onCheckAllSta = (e) => {
  formState.value.sta = e.target.checked ? [...staOptions] : [];
};

const disabledDateFormat = (current) => {
  const endDate = dayjs();

  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = {
        ...formState.value,
        ...props.searchParams,
        sta: formState.value.sta,
        product_uuid: productStore.currentProduct
      };
      loading.value = true;

      downBl(params)
        .then((res) => {
          window.open(res);
          loading.value = false;
          visible.value = false;
          emits('change');
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const init = () => {
  const currentSta = Number(props.sta);
  formState.value.date = dayjs().format('YYYY-MM-DD');
  formState.value.sta = staOptions.includes(currentSta) ? [currentSta] : [1];
  visible.value = true;
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 32px 84px 0px;
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

      .save {
        width: 100%;
        margin-top: 24px;
      }

      .export-sta {
        width: 100%;

        :deep(.ant-checkbox-wrapper) {
          display: inline-flex !important;
          flex-direction: row;
          align-items: center;
          margin: 0 !important;
          white-space: nowrap;
          line-height: 22px;
        }

        .export-sta-all {
          margin-bottom: 12px;
        }

        .export-sta-group {
          display: block;
          width: 100%;
          padding-left: 0 !important;
        }

        .export-sta-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          column-gap: 16px;
          row-gap: 12px;
          width: 100%;
        }
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
</style>
