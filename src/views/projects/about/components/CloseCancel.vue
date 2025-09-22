<template>
  <div>
    <template v-if="(detail?.closeCancel?.has_permission || hasPermission('projects:about:close:revoke')) && (detail?.closeCancel?.cancel_reason || detail?.closeCancel?.decline_reason)">
      <a-alert type="error" :message="t('重新打开') + ' ' + (detail?.closeCancel?.cancel_reason ? t('退回原因') : t('拒绝原因'))" class="mb-5 cancel-reason">
        <template #description>
          {{ detail?.closeCancel?.cancel_reason || detail?.closeCancel?.decline_reason }}
        </template>
      </a-alert>
    </template>

    <template v-if="detail?.closeCancel?.has_permission">
      <a-alert type="info" :message="t('重新打开')" class="mb-5">
        <template #description>
          <div>
            <span class="bold"> {{ t('日期') }}</span
            >: {{ detail?.closeCancel?.data?.close_cancel_date }}
          </div>
          <div v-if="detail?.closeCancel?.data?.close_cancel_note">
            <span class="bold"> {{ t('说明') }}</span
            >: {{ detail?.closeCancel?.data?.close_cancel_note }}
          </div>
          <div>
            <div v-for="(item, index) in detail?.closeCancel?.data?.close_cancel_document" :key="index" class="file-item">
              <vco-file-item :file="item" :showClose="true" @remove="remove(index)"></vco-file-item>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-end">
            <template v-if="detail?.closeCancel?.prev_permission">
              <vco-popconfirm :tip="t('您确实要撤回该请求吗？')" @update="update()" :formParams="{ uuid: detail?.closeCancel?.data?.uuid || currentId, id: detail?.closeCancel?.process__id }" url="projectDetail/crecall">
                <a-button type="dark" size="small">{{ t('撤回申请') }}</a-button>
              </vco-popconfirm>
            </template>
            <vco-popconfirm :tip="t('您确定要接受该请求吗？')" @update="update()" :formParams="{ uuid: detail?.closeCancel?.data?.uuid || currentId, id: detail?.closeCancel?.process__id }" url="projectDetail/csaveStep">
              <a-button type="dark" size="small" class="ml-3">{{ t('接受请求') }}</a-button>
            </vco-popconfirm>
            <vco-form-dialog
              :title="t('拒绝请求')"
              :initData="[
                {
                  type: 'textarea',
                  label: '原因',
                  key: 'decline_reason',
                  required: true
                }
              ]"
              :formParams="{ uuid: detail?.closeCancel?.data?.uuid, id: detail?.closeCancel?.process__id }"
              url="projectDetail/cdecline"
              @update="update"
            >
              <a-button type="danger" size="small" class="ml-3">{{ t('拒绝请求') }}</a-button>
            </vco-form-dialog>
            <vco-form-dialog
              :title="t('退回请求')"
              :initData="[
                {
                  type: 'textarea',
                  label: '原因',
                  key: 'cancel_reason',
                  required: true
                }
              ]"
              :formParams="{ uuid: detail?.closeCancel?.data?.uuid, id: detail?.closeCancel?.process__id }"
              url="projectDetail/cgoBack"
              @update="update"
            >
              <a-button type="brown" size="small" class="ml-3">{{ t('退回请求') }}</a-button>
            </vco-form-dialog>
          </div>
        </template>
      </a-alert>
    </template>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { hasPermission } from '@/directives/permission/index';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  currentId: {
    type: String
  },
  detail: {
    type: Object
  },
  toBeClosedFormData: {
    type: Object
  }
});

const update = () => {
  emits('update');
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';
</style>
