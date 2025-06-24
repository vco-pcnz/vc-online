<template>
  <div v-if="processStep.length" class="process-content">
    <!-- 详情弹窗 -->
    <detail-dialog v-model:visible="detailVisible" :uuid="uuid" :detailData="variationsInfo" :projectDetail="detail" @done="refreshHandle"> </detail-dialog>

    <div class="step-process" :class="{ 'no-p': (!variationsInfo.is_me || (variationsInfo.is_me && variationsInfo.state !== 0)) && !variationsInfo.has_permission }">
      <template v-for="(item, index) in processStep" :key="item.code">
        <div v-if="!!detail?.variationInfo?.old_start_date || !item?.pid" class="item" :class="{ pass: item.stateCode < currentStep, showAddStep: !!detail?.variationInfo?.old_start_date }">
          <div class="check" :class="{ current: item.stateCode === currentStep }">
            <i v-if="currentStep === 0 && item.stateCode === 0" class="iconfont">&#xe753;</i>
            <template v-else>
              <i v-if="item.stateCode < currentStep" class="iconfont">&#xe647;</i>
              <i v-else class="iconfont">&#xe62d;</i>
            </template>
          </div>

          <h2 v-if="item.name && index !== processStep.length - 1" class="name uppercase">{{ item.name }}</h2>
        </div>
      </template>
    </div>
    <div v-if="((variationsInfo.state === 0) || variationsInfo.has_permission)" class="handle-content">
      <template v-if="variationsInfo.state === 0 && (hasPermission('projects:variations:request') || hasPermission('projects:variations:delete'))">
        <a-popconfirm v-if="hasPermission('projects:variations:request')" :title="t('您确定提交申请吗？')" @confirm="requesetSub">
          <a-button type="dark" class="big shadow bold uppercase">{{ t('提交申请') }}</a-button>
        </a-popconfirm>
        <a-popconfirm v-if="hasPermission('projects:variations:delete')" :title="t('您确定删除请求吗？')" @confirm="requesetCancel">
          <a-button type="danger" size="small" :shape="hasPermission('projects:variations:request') ? 'round' : ''" :class="hasPermission('projects:variations:request') ? 'mt-5' : 'big shadow bold uppercase'">{{ t('删除请求') }}</a-button>
        </a-popconfirm>
      </template>

      <template v-if="variationsInfo.has_permission && variationsInfo.state > 0">
        <a-button type="dark" class="big shadow bold uppercase" @click="detailVisible = true">{{ variationsInfo.mark === 'variation_lm' || variationsInfo.mark === 'variation_overdue_open' ? t('确认变更') : t('审核') }}</a-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { templateStep } from '@/api/process';
import { projectVariationStep, projectVariationSave, projectVariationDelete } from '@/api/project/variation';
import DetailDialog from '@/views/projects/variations/components/DetailDialog.vue';
import { hasPermission } from '@/directives/permission/index';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const router = useRouter();

const props = defineProps({
  uuid: {
    type: [String, Number],
    default: ''
  },
  id: {
    type: [String, Number],
    default: ''
  },
  detail: {
    type: Object,
    default: () => {}
  }
});

const emits = defineEmits(['update']);

const variationsInfo = computed(() => {
  return props.detail?.variationInfo || {};
});

const processStep = ref([]);
const currentStep = ref(0);

const getStepData = async () => {
  let defStep = await templateStep({ type: 'variation' });
  defStep.push({
    name: ''
  });

  projectVariationStep({
    uuid: props.uuid,
    id: props.id
  }).then((res) => {
    const { step, state } = res;
    let max = 300;
    if (step && step.length) {
      defStep = step;
      defStep.push({
        name: ''
      });
      const stateCode = step.map((item) => item.stateCode);
      max = Math.max(...stateCode);

      defStep.forEach((item) => {
        const child = step.find((_item) => _item.code === item.code);
        if (child) {
          item.stateCode = child.stateCode;
        }
      });
    }

    currentStep.value = state > max ? state * 100 : state;
    processStep.value = defStep;
  });
};

const requesetSub = async () => {
  const params = {
    uuid: props.uuid,
    id: props.id
  };
  await projectVariationSave(params)
    .then((res) => {
      refreshHandle();
      return false;
    })
    .catch(() => {
      return false;
    });
};

const requesetCancel = async () => {
  const params = {
    uuid: props.uuid,
    id: props.id
  };
  await projectVariationDelete(params)
    .then((res) => {
      router.push(`/projects/variations?uuid=${props.uuid}`);
      return false;
    })
    .catch(() => {
      return false;
    });
};

const detailVisible = ref(false);

const refreshHandle = () => {
  getStepData();
  emits('update');
};

onMounted(() => {
  getStepData();
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.process-content {
  min-height: 130px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  padding: 40px 30px;
  margin-bottom: 30px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  > .step-process {
    flex: 1;
    padding-right: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    &.no-p {
      padding-right: 0 !important;
      > .item > .name {
        font-size: 14px !important;
      }
    }
    > .item {
      position: relative;
      flex: 1;
      &.pass {
        > .check {
          background-color: rgba(180, 241, 219, 1);
          border-color: rgba(39, 39, 39, 1);
        }
        &::after {
          background-color: rgba(180, 241, 219, 1);
        }
        > .name {
          color: #282828;
        }
      }
      &.current {
        > .check {
          background-color: #0bda8e;
          border-color: #0bda8e;
        }
        &::after {
          background-color: #0bda8e;
        }
        > .name {
          color: #0bda8e;
          font-weight: bold;
        }
      }
      &:last-child {
        flex: 0 0 auto;
        &::after {
          width: 0;
          display: none;
        }
      }
      &::after {
        content: '';
        display: block;
        width: 100%;
        height: 3px;
        background-color: rgba(229, 224, 215, 1);
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        z-index: 1;
      }
      &.is-check {
        &::after {
          display: none !important;
        }
      }
      > .check {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(229, 224, 215, 1);
        background-color: #fff;
        position: relative;
        z-index: 2;
        &.pointer {
          cursor: pointer;
        }
        &.current {
          background-color: @colorPrimary !important;
          border-color: @colorPrimary !important;
        }
        > i {
          font-size: 14px;
        }
      }
      > .name {
        width: calc(100% - 30px);
        text-align: center;
        position: absolute;
        left: 30px;
        top: -12px;
        color: #666;
        font-size: 12px;
      }
      &.showAddStep .name {
        font-size: 10px !important;
      }
      > .check-step-content {
        width: calc(100% - 40px);
        height: 3px;
        position: absolute;
        left: 35px;
        display: flex;
        justify-content: space-between;
        top: 50%;
        transform: translateY(-50%);
        gap: 8px;
        > .item {
          flex: 1;
          height: 3px;
          border-radius: 3px;
          background-color: rgba(229, 224, 215, 1);
          &.active {
            background-color: #0bda8e;
          }
          &.current {
            background-color: #0bda8e;
            box-shadow: 0 0 5px rgba(6, 197, 127, 0.9);
          }
        }
      }
      > .child-step-content {
        position: absolute;
        left: 35px;
        width: calc(100% - 40px);
        top: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        :deep(.link-hover) {
          padding: 0 !important;
          line-height: 1 !important;
          height: auto !important;
          font-size: 12px !important;
        }
      }
    }
  }
  > .handle-content {
    width: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
