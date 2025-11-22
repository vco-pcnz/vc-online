<template>
  <div>
    <template v-if="(detail?.buyout?.has_permission || hasPermission('projects:about:buyout')) && (detail?.buyout?.cancel_reason || detail?.buyout?.decline_reason) && detail?.buyout?.state > 0">
      <a-alert type="error" :message="t('买断') + ' ' + t('退回原因')" class="mb-5 cancel-reason">
        <template #description>
          {{ detail?.buyout?.cancel_reason || detail?.buyout?.decline_reason }}
        </template>
      </a-alert>
    </template>

    <template v-if="detail?.buyout?.has_permission || detail?.buyout?.prev_permission || (hasPermission('projects:about:buyout') && detail?.buyout?.state > 0)">
      <a-alert type="info" :message="t('买断')" class="mb-5">
        <template #description>
          <div v-if="detail?.buyout?.data?.note">
            <div class="flex">
              <div class="mr-5">
                <span class="bold"> {{ t('日期') }}</span
                >: {{ tool.showDate(detail?.buyout?.data?.date) }}
              </div>
              <div>
                <span class="bold"> {{ t('Boc总余额') }}</span
                >: {{ tool.formatMoney(detail?.buyout?.data?.amount) }}
              </div>
            </div>

            <div>
              <span class="bold"> {{ t('说明') }}</span
              >: {{ detail?.buyout?.data?.note || '--' }}
            </div>
            <div v-if="detail?.buyout?.data?.document && detail?.buyout?.data?.document.length">
              <span class="bold"> {{ t('文件') }}</span>
              <div v-for="(item, index) in detail?.buyout?.data?.document" :key="index" class="file-item">
                <vco-file-item :file="item"></vco-file-item>
              </div>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-end">
            <vco-popconfirm v-if="detail?.buyout?.prev_permission" :tip="t('您确实要撤回该请求吗？')" @update="update()" :formParams="{ uuid: currentId, id: detail?.buyout?.process__id }" url="project/buyout/recall">
              <a-button type="dark" size="small">{{ t('撤回申请') }}</a-button>
            </vco-popconfirm>
            <vco-popconfirm v-if="detail?.buyout?.has_permission" :tip="t('您确定要接受该请求吗？')" @update="updateSuc()" :formParams="{ uuid: currentId, id: detail?.buyout?.process__id }" url="project/buyout/saveStep">
              <a-button type="dark" size="small" class="mx-3">{{ t('接受请求') }}</a-button>
            </vco-popconfirm>
            <vco-form-dialog
              v-if="detail?.buyout?.has_permission"
              :title="t('退回请求')"
              :initData="[
                {
                  type: 'textarea',
                  label: '原因',
                  key: 'cancel_reason',
                  required: true
                }
              ]"
              :formParams="{ uuid: detail?.buyout?.data?.uuid || currentId, id: detail?.buyout?.process__id }"
              url="project/buyout/goBack"
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
import tool from '@/utils/tool';

const { t } = useI18n();
const emits = defineEmits(['update']);
const router = useRouter();

const props = defineProps({
  currentId: {
    type: String
  },
  detail: {
    type: Object
  }
});

const update = () => {
  emits('update');
};
const updateSuc = () => {
  if (props.detail?.buyout?.mark === 'return_request_director') {
    router.push(`/projects/list`);
    return;
  }
  emits('update');
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';
</style>
