<template>
  <div>
    <template v-if="(detail?.reopen?.has_permission || hasPermission('projects:about:reopen')) && (detail?.reopen?.cancel_reason || detail?.reopen?.decline_reason)">
      <a-alert type="error" :message="t('退回到进件') + ' ' + t('退回原因')" class="mb-5 cancel-reason">
        <template #description>
          {{ detail?.reopen?.cancel_reason || detail?.reopen?.decline_reason }}
        </template>
      </a-alert>
    </template>

    <template v-if="detail?.reopen?.has_permission || detail?.reopen?.prev_permission || (hasPermission('projects:about:reopen') && detail?.reopen?.state > 0)">
      <a-alert type="info" :message="t('退回到进件')" class="mb-5">
        <template #description>
          <div v-if="detail?.reopen?.data?.reason">
            <span class="bold"> {{ t('原因') }}</span
            >: {{ detail?.reopen?.data?.reason }}
          </div>
          <div class="mt-3 flex items-center justify-end">
            <vco-popconfirm v-if="detail?.reopen?.prev_permission" :tip="t('您确实要撤回该请求吗？')" @update="update()" :formParams="{ uuid: currentId, id: detail?.reopen?.process__id }" url="projectDetail/rerecall">
              <a-button type="dark" size="small">{{ t('撤回申请') }}</a-button>
            </vco-popconfirm>
            <vco-popconfirm v-if="detail?.reopen?.has_permission" :tip="t('您确定要接受该请求吗？')" @update="updateSuc()" :formParams="{ uuid: currentId, id: detail?.reopen?.process__id }" url="projectDetail/resaveStep">
              <a-button type="dark" size="small" class="mx-3">{{ t('接受请求') }}</a-button>
            </vco-popconfirm>
            <vco-form-dialog
              v-if="detail?.reopen?.has_permission"
              :title="t('退回请求')"
              :initData="[
                {
                  type: 'textarea',
                  label: '原因',
                  key: 'cancel_reason',
                  required: true
                }
              ]"
              :formParams="{ uuid: detail?.reopen?.data?.uuid || currentId, id: detail?.reopen?.process__id }"
              url="projectDetail/regoBack"
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
import { useRouter } from 'vue-router';

const { t } = useI18n();
const emits = defineEmits(['update']);
const router = useRouter();

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
const updateSuc = () => {
  if (props.detail?.reopen?.mark === 'reopen_director') {
    router.push(`/projects/list`);
    return;
  }
  emits('update');
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';
</style>
