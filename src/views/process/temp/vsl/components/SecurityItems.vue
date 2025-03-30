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
      :block-info="blockInfo"
      :project-info="projectInfo"
    ></security-add-edit>

    <vco-process-title :title="t('抵押物信息')">
      <div v-if="!isDetails" class="flex gap-5 items-center">
        <a-button
          v-if="blockInfo.showEdit && Number(securityInfo.count)"
          type="brown"
          shape="round"
          class="uppercase"
          @click="editHandle"
        >
          {{ t('批量编辑') }}
        </a-button>

        <a-popover
          v-if="blockInfo.showEdit"
          v-model:open="addSecurityVisible" trigger="click"
        >
          <template #content>
            <a-menu :selectable="false" style="border: none !important;">
              <a-menu-item>
                <div @click="addHandle(true)" class="text-center">{{ t('批量添加') }}</div>
              </a-menu-item>
              <a-menu-item>
                <div @click="addHandle(false)" class="text-center">{{ t('单个添加') }}</div>
              </a-menu-item>
            </a-menu>
          </template>
          <a-button
            type="primary"
            shape="round"
            class="uppercase"
          >{{ t('添加') }}</a-button>
        </a-popover>

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
        <div class="target-content" @click="securityTarget = !securityTarget">
          <div class="icon" :title="securityTarget ? t('收起') : t('展开')">
            <i v-if="securityTarget" class="iconfont">&#xe711;</i>
            <i v-else class="iconfont">&#xe712;</i>
          </div>
        </div>
      </div>
    </vco-process-title>

    <div v-show="securityTarget" class="sys-form-content mt-5">
      <a-form layout="vertical">
        <div class="col-item-content">
          <!-- <div class="col-item">
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
          </div> -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectAuditCheckMode } from '@/api/process';
import SecurityAddEdit from './SecurityAddEdit.vue';
import emitter from "@/event"
import { navigationTo } from '@/utils/tool';
import { useRoute } from 'vue-router'

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
const route = useRoute()
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

const securityTarget = ref(true)

const blockShowTargetHandle = (flag) => {
  securityTarget.value = flag
}

const addSecurityVisible = ref(false)
const addHandle = (flag = false) => {
  if (flag) {
    navigationTo(`/process/security-batche?uuid=${route.query.uuid}&code=${props.blockInfo.code}`)
  } else {
    addVisible.value = true
  }
  addSecurityVisible.value = false
}

const editHandle = () => {
  navigationTo(`/process/security-batche?uuid=${route.query.uuid}&code=${props.blockInfo.code}&e=1`)
}

onMounted(() => {
  emitter.on('blockShowTarget', blockShowTargetHandle)
})

onUnmounted(() => {
  emitter.off('blockShowTarget', blockShowTargetHandle)
})
</script>

<style lang="less" scoped>
@import './../styles/common.less';

.total-count {
  font-size: 24px;
}

.col-item-content {
  overflow: hidden;
  > .col-item {
    width: 33.33333%;
    float: left;
    :deep(.ant-statistic-content) {
      font-size: 18px !important;
    }
  }
}
</style>
