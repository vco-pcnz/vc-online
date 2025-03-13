<template>
  <div v-if="processStep.length" class="process-content">
    <div class="step-process">
      <div
        v-for="(item, index) in processStep"
        :key="item.code"
        class="item"
        :class="{'pass': item.stateCode < currentStep}"
      >
        <div class="check" :class="{'current': item.stateCode === currentStep}">
          <i v-if="currentStep === 0 && item.stateCode === 0" class="iconfont">&#xe753;</i>
          <template v-else>
            <i v-if="item.stateCode < currentStep" class="iconfont">&#xe647;</i>
            <i v-else class="iconfont">&#xe62d;</i>
          </template>
        </div>

        <h2 v-if="item.name && index !== processStep.length - 1" class="name uppercase">{{ item.name }}</h2>
      </div>
    </div>
    <div class="handle-content">
      <template v-if="variationsInfo.is_me && variationsInfo.status_name === 'PENDING APPLY'">
        <a-button
          type="dark" class="big shadow bold uppercase"
          :loading="subLoading"
          @click="requesetSub"
        >{{ t('提交申请') }}</a-button>
        <p></p>
      </template>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useI18n } from 'vue-i18n';
  import { templateStep } from '@/api/process'
  import { projectVariationStep, projectVariationSave } from '@/api/project/variation'

  const { t } = useI18n();

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
  })

  const emits = defineEmits(['update'])

  const variationsInfo = computed(() => {
    return props.detail?.variationInfo || {}
  })

  const processStep = ref([])
  const currentStep = ref(0)

  const getStepData = async () => {
    const defStep = await templateStep({ type: 'variation' })
    defStep.push({
      name: ''
    })

    defStep.forEach((item, index) => {
      item.stateCode = index * 100
    })

    projectVariationStep({
      uuid: props.uuid,
      id: props.id
    }).then(res => {
      const { step, state } = res
      let max = 400
      if (step && step.length) {
        const stateCode = step.map(item => item.stateCode)
        max = Math.max(...stateCode)

        defStep.forEach((item) => {
          const child = step.find(_item => _item.code === item.code)
          if (child) {
            item.stateCode = child.stateCode
          }
        })
      }

      currentStep.value = max === state ? state * 100 : state
      processStep.value = defStep
    })
  }

  const subLoading = ref(false)
  const requesetSub = () => {
    const params = {
      uuid: props.uuid,
      id: props.id
    }
    subLoading.value = true
    projectVariationSave(params).then(res => {
      subLoading.value = false
      getStepData()
      emits('update')
    }).catch(() => {
      subLoading.value = false
    })
  }

  onMounted(() => {
    getStepData()
  })
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
      padding-right: 120px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      > .item {
        position: relative;
        flex: 1;
        &.pass {
          > .check {
            background-color: rgba(180, 241, 219, 1);
            border-color:rgba(39, 39, 39, 1);
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
          font-size: 11px;
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
      width: 400px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }
  }
</style>
