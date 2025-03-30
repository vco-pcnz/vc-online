<template>
  <div
    class="block-item mb"
    :class="{ checked: bocInfo.is_check && blockInfo.showCheck, 'details': isDetails }"
  >
    <vco-process-title :title="t('BOC审核')">
      <div v-if="!isDetails" class="flex gap-5">
        <a-button
          v-if="blockInfo.showEdit"
          type="primary"
          shape="round"
          :loading="subLoading"
          class="uppercase"
          @click="saveHandle"
        >
          {{ t('保存') }}
        </a-button>
        <a-popconfirm
          v-if="blockInfo.showCheck && !bocInfo.is_check && bocInfo.boc_ok"
          :title="t('确定通过审核吗？')"
          :ok-text="t('确定')"
          :cancel-text="t('取消')"
          @confirm="checkHandle"
        >
          <a-button
            type="dark"
            shape="round"
            class="uppercase"
          >
            {{ t('审核') }}
          </a-button>
        </a-popconfirm>
        <div class="target-content" @click="bocTarget = !bocTarget">
          <div class="icon" :title="bocTarget ? t('收起') : t('展开')">
            <i v-if="bocTarget" class="iconfont">&#xe711;</i>
            <i v-else class="iconfont">&#xe712;</i>
          </div>
        </div>
      </div>
    </vco-process-title>

    <div v-show="bocTarget" class="sys-form-content mt-5">
      <div class="agree-content">
        <p>{{ t('BOC 是否已经通过了审核？') }}</p>
        <div class="check-box" :class="{'active': bocAgree, 'disabled': !blockInfo.showEdit}" @click="bocAgree = !bocAgree">
          <div class="check"><i class="iconfont">&#xe601;</i></div>
          <p>{{ t('已通过') }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="blockInfo.showCheck" class="check-content">
      <i class="iconfont">&#xe647;</i>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    projectAuditSaveMode,
    projectAuditCheckMode
  } from '@/api/process';
  import emitter from '@/event';
  
  const emits = defineEmits(['done', 'refresh']);

  const { t } = useI18n();

  const props = defineProps({
    bocInfo: {
      type: Object,
      default: () => {}
    },
    blockInfo: {
      type: Object,
      default: () => {}
    },
    currentStep: {
      type: Object
    },
    currentId: {
      type: [Number, String],
      default: ''
    },
    isDetails: {
      type: Boolean,
      default: false
    }
  })

  const bocAgree = ref(false)

  const checkHandle = async () => {
    try {
      const params = {
        uuid: props.currentId,
        code: props.blockInfo.code
      };

      await projectAuditCheckMode(params);

      // 触发刷新事件
      emits('refresh');
      emitter.emit('refreshAuditHisList');

      return true; // 操作成功
    } catch (error) {
      console.error('校验或审核失败:', error);
      return false; // 操作失败
    }
  };

  const subLoading = ref(false);
  const saveHandle = async () => {
    const params = {
      boc_ok: bocAgree.value ? 1 : 0,
      code: props.blockInfo.code,
      uuid: props.currentId
    };

    subLoading.value = true;

    await projectAuditSaveMode(params)
    .then(async () => {
      subLoading.value = false;
      emits('refresh');
      
      // 操作记录
      emitter.emit('refreshAuditHisList');
    })
    .catch(() => {
      subLoading.value = false;
    });
  };

  const bocTarget = ref(true)

  const blockShowTargetHandle = (flag) => {
    bocTarget.value = flag
  }

  onMounted(() => {
    bocAgree.value = Boolean(props.bocInfo.boc_ok)
    emitter.on('blockShowTarget', blockShowTargetHandle)
  })

  onUnmounted(() => {
    emitter.off('blockShowTarget', blockShowTargetHandle)
  })
</script>

<style lang="less" scoped>
  @import '@/views/process/temp/default/styles/common.less';
  .agree-content {
    border: 1px solid #272727 !important;
    border-radius: 10px !important;
    background-color: #f7f9f8;
    padding: 20px 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    > .check-box {
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.3s ease;
      cursor: pointer;
      user-select: none;
      &.active {
        > .check {
          background-color: @colorPrimary;
          border-color: @colorPrimary;
        }
        > p {
          color: @colorPrimary;
        }
      }
      &.disabled {
        cursor: default !important;
        opacity: 0.9;
        pointer-events: none;
      }
      > .check {
        width: 20px;
        height: 20px;
        background-color: #fff;
        border-radius: 4px;
        border: 1px solid #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        > .iconfont {
          font-size: 12px;
          color: #fff;
        }
      }
      > p {
        color: #666;
      }
    }
  }
</style>
