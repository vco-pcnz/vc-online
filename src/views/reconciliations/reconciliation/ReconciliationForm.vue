<template>
  <a-col :span="11" class="content empty_content sys-form-content">
    <a-row :gutter="24">
      <a-col :span="12" class="empty_slip">
        <p class="xs_text">When</p>
        <a-date-picker :disabled="disabled" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" v-model:value="item['f_date']" placeholder="" />
      </a-col>
      <a-col :span="12" class="empty_slip">
        <p class="xs_text">What</p>
        <a-select :disabled="disabled" v-model:value="item['f_fee']" :options="fee_type" :fieldNames="{ label: 'name', value: 'value' }"></a-select>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24" class="empty_slip why_slip">
        <p class="xs_text">Why</p>
        <div>
          <a-dropdown trigger="click">
            <div class="mb-2 flex justify-end">
              <a-button type="brown" shape="round" size="small"> {{ t('快捷选择') }}</a-button>
            </div>
            <template #overlay>
              <a-menu>
                <a-menu-item v-for="sub in way_options" :key="sub.code" @click="item['f_note'] = sub.name">
                  {{ sub.name }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>

          <a-textarea v-model:value="item['f_note']" :placeholder="t('请输入')" :rows="2" />
        </div>
        <!-- <a-select v-model:value="item['f_note']" :disabled="disabled">
          <a-select-option v-for="item in way_options" :key="item.code" :value="item.code">
            {{ item.name }}
          </a-select-option>
        </a-select> -->
      </a-col>
    </a-row>
  </a-col>
</template>

<script scoped setup>
import { useI18n } from 'vue-i18n';
import { selectDateFormat } from '@/utils/tool';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  item: {
    type: Object
  },
  fee_type: {
    type: Array
  },
  disabled: {
    type: Boolean
  },
  way_options: {
    type: Array
  }
});
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.content {
  background-color: white;
  border: 1px solid #e6e7e9;
  overflow: hidden;
  border-radius: 4px;

  &_match {
    border: 1px solid #50dcaa;
    border-radius: 4px 4px 0 0;
    background-color: #a8eed5;
  }

  &_cell {
    width: 100%;
    padding: 12px 16px;
    > p {
      font-size: 14px;
      font-weight: 500;
    }

    .xs_text {
      font-size: 12px;
      font-weight: 400;
    }
  }

  &_middle {
    border-left: 1px solid #e6e7e9;
    border-right: 1px solid #e6e7e9;
  }
}

.footer {
  background-color: white;
  border: 1px solid #e6e7e9;
  border-top: none;
  border-radius: 0 0 4px 4px;
  cursor: pointer;

  .xs_text {
    font-size: 12px;
    font-weight: 400;
  }

  :deep(.ant-collapse-header),
  :deep(.ant-collapse-content) {
    background-color: white;
  }
}

.empty_content {
  padding: 12px 16px;
  .empty_slip {
    display: grid;
    grid-template-columns: 40px 1fr;
    align-items: center;
  }

  .why_slip {
    margin-top: 16px;
  }
}

.sys-form-content {
  :deep(.ant-picker),
  :deep(.ant-select-selector) {
    border: none !important;
  }
}

.content_btn {
  margin-top: 60px;
  display: flex;
  justify-content: center;
}

.active {
  background: rgb(0, 120, 200);
  color: #fff;
}
</style>
