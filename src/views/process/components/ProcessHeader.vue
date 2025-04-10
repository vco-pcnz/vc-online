<template>
  <div class="process-header">
    <div class="top-content">
      <div class="content">
        <slot name="left"></slot>
      </div>
      <div class="content">
        <slot name="right"></slot>
      </div>
    </div>
    <div v-if="mainStepData.length" class="process-bar-content">
      <div
        v-for="(item, index) in processData"
        :key="index"
        class="item"
        :class="[getItemClass(index + 1, currentStatus), { 'is-check': item.stateCode && item.stateCode.length > 1 && Boolean(currentStep.examine)}]"
      >
        <div class="check" :class="{'pointer': checkPointer(item), 'current': index + 1 === current}" @click="stepHandle(item)">
          <template v-if="current === index + 1">
            <i v-if="current === index + 1" class="iconfont">{{ currentStatus === processData.length ? '&#xe647;' : '&#xe779;'}}</i>
          </template>
          <template v-else>
            <p v-if="index + 1 > currentStatus">{{ index + 1 }}</p>
            <i v-if="index + 1 < currentStatus" class="iconfont">&#xe647;</i>
            <i v-if="index + 1 === currentStatus" class="iconfont">&#xe790;</i>
          </template>
        </div>
        <h2 v-if="item.name" class="name uppercase">
          {{ item.stateCode && item.stateCode.length > 1 && Boolean(currentStep.examine) ? t(currentStep.name) : t(item.name) }}
        </h2>

        <div v-if="item.stateCode && item.stateCode.length > 1 && Boolean(currentStep.examine)" class="check-step-content">
          <div
            v-for="(step, index) of item.stateCode"
            :key="`step${step}`"
            class="item"
            :class="getStepClass(item.stateCode, index)"
          ></div>
        </div>

        <div v-if="item.stateCode && item.stateCode.length > 1 && Boolean(currentStep.examine) && mainStepData.length" class="child-step-content">
          <a-popover>
            <template #content>
              <div class="child-step-line">
                <div
                  v-for="item in completeStepData"
                  :key="item.id"
                  class="item"
                  :class="item.className"
                >
                  <div class="icon">
                    <i v-if="item.done" class="iconfont">&#xe601;</i>
                    <i v-else class="iconfont">&#xe62d;</i>
                  </div>
                  <div class="name">{{ t(item.name) }}</div>
                </div>
              </div>
            </template>
            <a-button type="link" class="link-hover">{{ t('完整审核步骤') }}?</a-button>
          </a-popover>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, ref, onMounted } from "vue"
  import { cloneDeep } from "lodash"
  import { useRoute } from "vue-router"
  import { navigationTo } from "@/utils/tool"
  import { useI18n } from 'vue-i18n';
  import { processRoutes } from "@/constant"

  const { t } = useI18n();
  const route = useRoute()

  const props = defineProps({
    mainStepData: {
      type: Array,
      default: () => []
    },
    stepData: {
      type: Array,
      default: () => []
    },
    currentStep: {
      type: Object
    },
    current: {
      type: Number,
      default: 1
    },
    status: {
      type: Number,
      default: 0
    },
    statusInfo: {
      type: Object
    }
  })

  const currentStatus = ref(0)

  const completeStepData = computed(() => {
    const stepData = cloneDeep(props.stepData)
    const mainStepData = cloneDeep(props.mainStepData)
    const checkStep = mainStepData.find(item => item.stateCode && item.stateCode.length > 1)
    const checkArr = checkStep ? checkStep.stateCode : []

    const resData = []
    const currentStepCode = props.currentStep.stateCode

    for (let i = 0; i < checkArr.length; i++) {
      const step = stepData.find(item => item.stateCode === checkArr[i])
      if (step) {
        const stepobj = cloneDeep(step)
        if (stepobj.stateCode < currentStepCode) {
          stepobj.className = 'active'
          stepobj.done = true
        }

        if (stepobj.stateCode === currentStepCode) {
          stepobj.className = 'current'
        }
        resData.push(stepobj)
      }
    }

    return resData
  })

  const getStepClass = (data, index) => {
    const stateCode = props.currentStep.stateCode
    let currentIndex = data.findIndex(item => item === stateCode)

    if (currentIndex === -1) {
      currentIndex = data.reduce((acc, cur, i) => (cur < stateCode ? i : acc), -1);
    }

    let className = ''

    if (index < currentIndex) {
      className = 'active'
    }

    if (index === currentIndex) {
      className = 'current'
    }

    return className
  }

  const processData = computed(() => {
    const data = cloneDeep(props.mainStepData)
    data.push({
      name: '',
      code: 'end'
    })
    return data
  })

  const getItemClass = (index, current) => {
    if (current === processData.value.length && index === processData.value.length) {
      return 'pass'
    }

    if (index === current) {
      return 'current'
    } else if (index > current) {
      return 'wait'
    } else {
      return 'pass'
    }
  }

  const getStepInfo = (stateCode) => {
    const data = []
    for (let i = 0; i < stateCode.length; i++) {
      const item = props.stepData.find(item => Number(item.stateCode) === Number(stateCode[i]))
      if (item) {
        data.push(item)
      }
    }
    return data
  }

  const checkPointer = (data) => {
    const codeArr = data.stateCode || []
    const isForm = codeArr.length ? getStepInfo(codeArr).every(item => (!item.examine && item.stateCode >= 0)) : false
    const isBefore = codeArr.length ? codeArr.every(item => (Number(item) < Number(props.statusInfo.stateCode) || Number(item) === Number(props.statusInfo.stateCode))) : false
    return isForm && isBefore && !props.currentStep.examine
  }

  const stepHandle = (data) => {
    if (route.query.uuid && checkPointer(data) && data.stateCode && data.stateCode.length === 1) {
      const index = props.stepData.findIndex(item => Number(item.stateCode) === Number(data.stateCode[0]))
      if (index > -1 && processRoutes[index] !== route.path) {
        navigationTo(`${processRoutes[index]}?uuid=${route.query.uuid}`)
      }
    }
  }

  onMounted(() => {
    const num = Number(props.status)
    if (props.mainStepData.length) {
      for (let i = 0; i < props.mainStepData.length; i ++) {
        if (props.mainStepData[i].stateCode.includes(num)) {
          currentStatus.value = i + 1
        } else {
          const index = props.mainStepData[i].stateCode.findIndex(item => item > num);
          if (index > 0) {
            currentStatus.value = i + 1
          }
        }
      }
    }
  })
</script>

<style lang="less" scoped>
  @import "@/styles/variables.less";

  .process-header {
    .top-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 1px solid #808080;
      > .content {
        display: flex;
        align-items: center;
        gap: 15px;
      }
    }
    .process-bar-content {
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 8px rgba(0, 0, 0, .1);
      padding: 50px 60px;
      margin-top: 30px;
      width: 100%;
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
  }

  .child-step-line {
    > .item {
      display: flex;
      gap: 10px;
      height: 40px;
      align-items: flex-start;
      position: relative;
      &::after {
        content: '';
        display: block;
        width: 2px;
        height: 100%;
        background-color: rgba(229, 224, 215, 1);
        position: absolute;
        top: 5px;
        left: 9px;
        z-index: 0;
      }
      &.active {
        &::after,
        > .icon {
          background-color: #0bda8e;
        }
        > .name {
          color: #0bda8e;
        }
      }
      &.current {
        > .icon {
          background-color: #0bda8e;
          box-shadow: 0 0 10px rgba(6, 197, 127, 0.9);
        }
        > .name {
          color: #282828;
        }
      }
      &:last-child {
        &::after {
          display: none;
        }
      }
      > .icon {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: rgba(229, 224, 215, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
        > .iconfont {
          font-size: 11px;
          color: #fff;
        }
      }
      > .name {
        font-size: 14px;
        color: #888;
      }
    }
  }
</style>