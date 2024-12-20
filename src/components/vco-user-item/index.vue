<template>
  <div class="vco-user-item" :class="{'main': main}">
    <div class="avatar">
      <div v-if="tips" class="icon">
        <i v-if="tips === 'edit'" class="iconfont">&#xe739;</i>
        <i v-else-if="tips === 'view'" class="iconfont view">&#xe776;</i>
        <p v-else>{{ tips }}</p>
      </div>
      <vco-avatar :src="data.avatar" :size="size"></vco-avatar>
    </div>
    <p><span v-if="post">[{{ post }}]</span>{{ data.name }}</p>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue"

  const props = defineProps({
    data: {
      type: Object,
      required: true
    },
    main: {
      type: Boolean,
      default: false
    },
    edit: {
      type: Boolean,
      default: false
    },
    view: {
      type: Boolean,
      default: false
    },
    tips: {
      type: String,
      default: ''
    },
    post: {
      type: String,
      default: ''
    }
  })

  const size = ref(28)

  onMounted(() => {
    if (props.main) {
      size.value = 32
    }
  })
</script>

<style lang="less" scoped>
  .vco-user-item {
    display: flex;
    align-items: center;
    > .avatar {
      width: 43px;
      padding-left: 3px;
      position: relative;
      > .icon {
        position: absolute;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: rgba(241, 153, 21, .9);
        display: flex;
        justify-content: center;
        align-items: center;
        bottom: -2px;
        left: 50%;
        transform: translateX(-40%);
        > .iconfont {
          font-size: 10px;
          &.view {
            font-size: 12px;
          }
        }
        > p {
          font-size: 10px;
        }
      }
    }
    > p {
      flex: 1;
      line-height: 1.2;
      font-size: 13px;
      text-align: left;
      > span {
        color: #999;
        padding-right: 3px;
      }
    }
    &.main {
      > .avatar {
        padding-left: 0;
      }
      > p {
        font-size: 14px;
        font-weight: 500;
      }
    }
  }
</style>