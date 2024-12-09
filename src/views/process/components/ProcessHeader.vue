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
    <div v-if="stepData.length" class="process-bar-content">
      <div v-for="(item, index) in processData" :key="index" class="item" :class="getItemClass(index + 1, currentStatus)">
        <div class="check" :class="{'pointer': checkPointer(index + 1), 'current': index + 1 === current}" @click="stepHandle(index + 1)">
          <template v-if="current === index + 1">
            <i v-if="current === index + 1" class="iconfont">{{ currentStatus === processData.length ? '&#xe647;' : '&#xe779;'}}</i>
          </template>
          <template v-else>
            <p v-if="index + 1 > currentStatus">{{ index + 1 }}</p>
            <i v-if="index + 1 < currentStatus" class="iconfont">&#xe647;</i>
            <i v-if="index + 1 === currentStatus" class="iconfont">&#xe790;</i>
          </template>
        </div>
        <h2 v-if="item.name" class="name uppercase">{{ t(item.name) }}</h2>
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

  const { t } = useI18n();
  const route = useRoute()

  const props = defineProps({
    stepData: {
      type: Array,
      default: () => []
    },
    current: {
      type: Number,
      default: 0
    },
    status: {
      type: Number,
      default: 0
    }
  })

  const currentStatus = ref(1)

  const routeArr = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eigth', 'nine', 'then']

  const processData = computed(() => {
    const data = cloneDeep(props.stepData)
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

  const checkPointer = (index) => (index <= currentStatus.value && currentStatus.value < 5)

  const stepHandle = (index) => {
    if (route.query.uuid_info) {
      if (index <= currentStatus.value && currentStatus.value < 5) {
        const page = routeArr[index - 1]
        navigationTo(`/process/${page}?uuid_info=${route.query.uuid_info}`)
      }
    }
  }

  onMounted(() => {
    const num = Number(props.status)
    if (num === 0) {
      currentStatus.value = 1
    } else if (num === 100) {
      currentStatus.value = 2
    } else if (num === 200) {
      currentStatus.value = 3
    } else if (num === 300) {
      currentStatus.value = 4
    } else if (num === 400) {
      currentStatus.value = 5
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
      }
    }
  }
</style>