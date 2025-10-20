<template>
  <div>
    <template v-if="(detail?.close?.has_permission || hasPermission('projects:about:add:closeFc')) && detail?.close?.cancel_reason">
      <a-alert type="error" :message="t('拟关闭') + ' ' + t('退回原因')" class="mb-5 cancel-reason">
        <template #description>
          {{ detail?.close?.cancel_reason }}
        </template>
      </a-alert>
    </template>

    <template v-if="(detail?.close?.has_permission || detail?.close?.prev_permission || hasPermission('projects:about:add:closeFc')) && detail?.base?.is_open == 2">
      <a-alert type="info" :message="t('关账')" class="mb-5">
        <template #description>
          <div>
            <span class="bold"> {{ t('日期') }}</span
            >: {{ detail?.close?.data?.close_date }}
          </div>
          <div v-if="detail?.close?.data?.close_note">
            <span class="bold"> {{ t('说明') }}</span
            >: {{ detail?.close?.data?.close_note }}
          </div>
          <div class="mt-3 flex items-center justify-end">
            <vco-popconfirm :tip="t('您确定要接受该请求吗？')" v-if="detail?.close?.has_permission" @update="update()" :formParams="{ uuid: currentId, id: detail?.close?.process__id }" url="projectDetail/gsaveStep">
              <a-button type="dark" size="small" class="mx-3">{{ t('接受请求') }}</a-button>
            </vco-popconfirm>
            <vco-form-dialog
              v-if="detail?.close?.has_permission"
              :title="t('退回请求')"
              :initData="[
                {
                  type: 'textarea',
                  label: '原因',
                  key: 'cancel_reason',
                  required: true
                }
              ]"
              :formParams="{ uuid: detail?.close?.data?.uuid || currentId, id: detail?.close?.process__id }"
              url="projectDetail/ggoBack"
              @update="update"
            >
              <a-button type="danger" size="small">{{ t('退回请求') }}</a-button>
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
