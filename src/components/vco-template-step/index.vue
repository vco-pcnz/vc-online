<template>
  <div v-if="processStep.length" class="process-content">
    <div class="step-process no-p">
      <template v-for="(item, index) in processStep" :key="item.code">
        <div class="item" :class="{ pass: index < currentStepIndex || state === 1000 }">
          <div class="check" :class="{ current: index === currentStepIndex }">
            <i v-if="index == 0 && !currentStep && !state" class="iconfont">&#xe753;</i>
            <template v-else>
              <i v-if="index < currentStepIndex || state === 1000" class="iconfont">&#xe647;</i>
              <i v-else class="iconfont">&#xe62d;</i>
            </template>
          </div>

          <h2 v-if="item.name" class="name uppercase">{{ translate ? t(item.name) : item.name }}</h2>
        </div>
      </template>
      <div class="item" :class="{ pass: state === 1000 }">
        <div class="check" :class="{ current: state === 1000 && currentStep }">
          <i v-if="state === 1000" class="iconfont">&#xe647;</i>
          <i v-else class="iconfont">&#xe62d;</i>
        </div>
      </div>
    </div>
    <div class="handle-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { templateStep } from '@/api/process';

const { t } = useI18n();

const props = defineProps({
  type: {
    type: [String],
    default: ''
  },
  currentStep: {
    type: [String],
    default: ''
  },
  state: {
    type: [Number],
    default: 0
  }, 
  translate: {
    type: [Boolean],
    default: false
  }
});

const processStep = ref([]);
const currentStepIndex = computed(() => {
  // if(!props.currentStep) return processStep.value.length - 1;
  if (!processStep.value.length) return -1;
  return processStep.value.findIndex(
    (item) =>
      // 兼容以 mark 或 stateCode 标识当前步骤
      item?.mark === props.currentStep || item?.stateCode === props.currentStep
  );
});
const getStepData = async () => {
  const res = await templateStep({ type: props.type });
  processStep.value = res;
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
    // width: 200px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
