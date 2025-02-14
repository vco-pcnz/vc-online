<template>
  <div
    class="block-item mb"
    :class="{ checked: securityInfo.is_check && blockInfo?.showCheck, 'details': isDetails }"
  >
    <!-- 确认弹窗 -->
    <vco-confirm-alert
      ref="changeAlertRef"
      :confirm-txt="confirmTxt"
      v-model:visible="changeVisible"
      @submit="submitRquest"
    ></vco-confirm-alert>

    <!-- 新增 -->
    <security-add-edit
      v-model:visible="addVisible"
      :current-id="currentId"
      :security-status="securityInfo.check_status"
      :typeData="securityInfo.type"
      :block-info="blockInfo"
      :project-info="projectInfo"
    ></security-add-edit>

    <vco-process-title :title="t('抵押物信息')">
      <div v-if="!isDetails" class="flex gap-5">
        <template v-if="!securityInfo.is_check && securityInfo.count && blockInfo?.showCheck">
          <a-button
            v-if="confirmTxt"
            type="dark"
            shape="round"
            class="uppercase"
            @click="changeVisible = true"
          >
            {{ t('审核') }}
          </a-button>
          <a-popconfirm
            v-else
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
            @confirm="checkHandle()"
          >
            <a-button
              type="dark"
              shape="round"
              class="uppercase"
            >
              {{ t('审核') }}
            </a-button>
          </a-popconfirm>
        </template>
        
        <a-button
          v-if="blockInfo.showEdit"
          type="primary"
          shape="round"
          class="uppercase"
          @click="addVisible = true"
        >
          {{ t('添加') }}
        </a-button>
      </div>
    </vco-process-title>

    <div class="sys-form-content mt-5">
      <a-form layout="vertical">
        <div class="col-item-content">
          <div class="col-item">
            <a-form-item :label="t('土地总额')">
              <vco-number
                :value="securityInfo.land_amount"
                :precision="2"
                :end="true"
              ></vco-number>
            </a-form-item>
          </div>
          <div class="col-item">
            <a-form-item :label="t('建筑总额')">
              <vco-number
                :value="securityInfo.build_amount"
                :precision="2"
                :end="true"
              ></vco-number>
            </a-form-item>
          </div>
          <div class="col-item">
            <a-form-item :label="t('抵押物价值')">
              <vco-number
                :value="securityInfo.total_money"
                :precision="2"
                :end="true"
              ></vco-number>
            </a-form-item>
          </div>
          <div class="col-item">
            <a-form-item :label="t('保险价值')">
              <vco-number
                :value="securityInfo.total_value"
                :precision="2"
                :end="true"
              ></vco-number>
            </a-form-item>
          </div>
          <div class="col-item">
            <a-form-item :label="t('抵押物数量')">
              <p class="total-count">{{ securityInfo.count }}</p>
            </a-form-item>
          </div>
        </div>
      </a-form>
    </div>
    <div v-if="blockInfo?.showCheck" class="check-content">
      <i class="iconfont">&#xe647;</i>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectAuditCheckMode } from '@/api/process';
import SecurityAddEdit from './SecurityAddEdit.vue';
import emitter from "@/event"

const emits = defineEmits(['refresh']);
const props = defineProps({
  securityInfo: {
    type: Object,
    default: () => {}
  },
  projectInfo: {
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
});

const { t } = useI18n();
const addVisible = ref(false);

const changeAlertRef = ref()
const changeVisible = ref(false)

const confirmTxt = computed(() => {
  if (props.isDetails) {
    return ''
  } else {
    const count = props.securityInfo.count
    const building_num = props.projectInfo.building_num

    if (count !== building_num) {
      return t('项目楼栋数为{0}，抵押物数量为{1}，确认通过审核吗？', [building_num, count])
    } else {
      return ''
    }
  }
})

const submitRquest = async () => {
  await checkHandle()
  changeAlertRef.value.changeLoading(false)
  changeVisible.value = false
}

const checkHandle = async () => {
  const params = {
    uuid: props.currentId,
    code: props.blockInfo.code
  }
  await projectAuditCheckMode(params)
    .then(() => {
      emits('refresh');
      emitter.emit('refreshAuditHisList');
      return true;
    })
    .catch(() => {
      return false;
    });
}
</script>

<style lang="less" scoped>
.total-count {
  font-size: 24px;
}

.col-item-content {
  overflow: hidden;
  > .col-item {
    width: 20%;
    float: left;
    :deep(.ant-statistic-content) {
      font-size: 18px !important;
    }
  }
}
</style>
