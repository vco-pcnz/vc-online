<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop>
    <a-modal :width="830" :open="visible" :title="t('详情')" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-row v-if="detailData" :gutter="24" class="pl-10 pr-10">
          <template v-if="Boolean(process)">
            <a-col v-if="process.cancel_reason || process.decline_reason" :span="24" class="mt-5">
              <a-alert :message="process.cancel_reason ? t('退回原因') : t('拒绝原因')" :description="process.cancel_reason || process.decline_reason" type="error" class="cancel-reason" />
            </a-col>
          </template>

          <a-col :span="8" class="item-txt">
            <p>{{ t('类型') }}</p>
            <p>
              <span class="cer" v-if="detailData.cate == 1">{{ t('借款人') }}</span>
              <span class="cer" v-if="detailData.cate == 2">{{ t('担保人') }}</span>
              <span class="cer" v-if="detailData.cate == 3">{{ t('投资人') }}</span>
            </p>
          </a-col>
          <a-col :span="8" class="item-txt">
            <p>{{ t('名称') }}</p>
            <p>
              {{ detailData.name }}
            </p>
          </a-col>
          <a-col :span="8" class="item-txt">
            <p>{{ t('身份证号码') }}</p>
            <p>{{ detailData.idcard || '--' }}</p>
          </a-col>
          <a-col :span="8" class="item-txt">
            <p>{{ t('邮箱') }}</p>
            <p>{{ detailData.email || '--' }}</p>
          </a-col>
          <a-col :span="8" class="item-txt">
            <p>{{ t('手机号') }}</p>
            <p>
              <template v-if="detailData.pre && detailData.mobile"> +{{ detailData.pre + ' ' + detailData.mobile }} </template>
              <template v-else-if="detailData.mobile">
                {{ detailData.mobile }}
              </template>
              <template v-else> -- </template>
            </p>
          </a-col>
          <a-col :span="24" class="item-txt">
            <p>{{ t('背景f') }}</p>
            <p>{{ detailData.note || '--' }}</p>
          </a-col>
          <a-col :span="8" class="item-txt" v-if="detailData.condition_time">
            <p>{{ t('有条件') }} {{ t('日期') }}</p>
            <p>{{ detailData.condition_time || '--' }}</p>
          </a-col>
          <a-col :span="8" class="item-txt" v-if="detailData.condition_desc">
            <p>{{ t('有条件') }} {{ t('说明') }}</p>
            <p>{{ detailData.condition_desc || '--' }}</p>
          </a-col>
          <a-col :span="24" class="item-txt">
            <p>{{ t('项目文件') }}</p>
            <div style="max-height: 400px; overflow-y: auto; padding-right: 10px">
              <div class="documents" v-for="(item, index) in detailData.document" :key="index">
                <vco-file-item :file="item" :showValidity="true" :time="detailData.expire_time[index]"></vco-file-item>
              </div>
            </div>
            <p v-if="!detailData.document.length">--</p>
          </a-col>

          <a-col :span="24" class="item-txt" v-if="detailData.remark">
            <p>{{ t('反洗钱说明') }}</p>
            <div class="remark bold" style="max-height: 200px; overflow-y: auto">
              <p>{{ detailData.remark || '--' }}</p>
            </div>
          </a-col>
        </a-row>

        <div class="mt-10 mb-5">
          <div class="flex justify-end gap-5">
            <a-button type="grey" class="big shadow bold uppercase mb-5 mt-5" @click="updateVisible(false)">{{ t('关闭') }}</a-button>

            <template v-if="Boolean(process && process.has_permission)">
              <FormDialog :title="t('拒绝原因')" :formParams="{ uuid: uuid, id: process.id }" url="project/wash/wdecline" @update="update">
                <a-button type="brown" class="big shadow bold uppercase mb-5 mt-5">{{ t('拒绝请求') }}</a-button>
              </FormDialog>

              <a-popconfirm :title="t('您确定要接受该请求吗？')" @confirm="accept()">
                <a-button type="dark" class="big shadow bold uppercase mb-5 mt-5">{{ t('接受请求') }}</a-button>
              </a-popconfirm>
            </template>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { wsaveStep } from '@/api/project/wash';

const { t } = useI18n();
const emits = defineEmits(['update:visible', 'update']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  uuid: {
    type: String,
    default: ''
  },
  detailData: {
    type: Object
  },
  process: {
    type: Object
  }
});

// 同意
const accept = async (item) => {
  await wsaveStep({ uuid: props.uuid, id: props.process.id })
    .then((res) => {
      update();
      return true;
    })
    .catch(() => {
      return false;
    });
};

const update = () => {
  emits('update');
  updateVisible(false);
};

const updateVisible = (value) => {
  emits('update:visible', value);
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.item-txt {
  margin-top: 25px;
  > p {
    font-size: 13px;
    &:first-child {
      color: #999;
    }
    &:last-child {
      font-size: 14px;
      margin-top: 5px;
      word-break: break-all;
    }
  }
  :deep(.ant-statistic-content) {
    font-size: 16px !important;
  }
}
.cancel-reason {
  padding: 10px !important;
  margin-bottom: 10px;
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}
</style>
