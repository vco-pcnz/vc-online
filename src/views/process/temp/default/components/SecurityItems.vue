<template>
  <div
    class="block-item mb"
    :class="{ checked: securityInfo.is_check && blockInfo?.showCheck, 'details': isDetails }"
  >
    <!-- 共享抵押物选择 -->
    <vco-shared-securities
      v-model:visible="sharedVisible"
      :shared-project="sharedProject"
      :project-uuid="currentId"
      @done="sharedDone"
    ></vco-shared-securities>

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

        <template v-if="!securityInfo.is_check && blockInfo?.showCheck && (securityInfo.count || !buildAmount)">
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
        <div class="col-item-content" :class="{ 'share-lvr': shareLvr }">
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
          <div v-if="shareLvr" class="col-item">
            <a-form-item :label="t('共享LVR')">
              <vco-number
                :value="shareLvr"
                :precision="2"
                :end="true"
                suffix="%"
                prefix=""
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

      <div v-if="((isDetails || !props.blockInfo.showEdit) && joinProjectData.length) || props.blockInfo.showEdit" class="flex justify-between items-center">
        <div class="flex gap-2 mb-3 items-center mt-3">
          <p style="font-size: 12px">{{ t('共享抵押物') }}</p>
          <a-switch
            v-if="blockInfo.showEdit && !isDetails"
            v-model:checked="isShared"
            size="small"
          ></a-switch>
        </div>
        <a-button
          v-if="isShared && blockInfo.showEdit && !isDetails"
          type="brown"
          shape="round"
          size="small"
          @click="sharedVisible = true"
        > {{ t('选择') }}</a-button>
      </div>
      
      <div v-if="isShared" class="sales-content">
        <a-table
          v-if="joinProjectData.length"
          :dataSource="joinProjectData"
          :columns="columns"
          :pagination="false"
          :bordered="true"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'amount'">
              <span>
                <vco-number v-if="record.amount" :value="record.amount" :precision="2" size="fs_md"></vco-number>
                <p v-else>--</p>
              </span>
            </template>
            <template v-if="column.dataIndex === 'insurance_value'">
              <span>
                <vco-number v-if="record.insurance_value" :value="record.insurance_value" :precision="2" size="fs_md"></vco-number>
                <p v-else>--</p>
              </span>
            </template>
            <template v-if="column.dataIndex === 'is_direct_bind'">
              <a-tag v-if="record.is_direct_bind" color="green">{{ t('是') }}</a-tag>
              <a-tag v-else color="red">{{ t('否') }}</a-tag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-popconfirm v-if="record.is_direct_bind" :title="t('确定解绑吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="unBindHandle(record)">
                <a-button type="link" size="small">{{ t('解绑') }}</a-button>
              </a-popconfirm>
            </template>
          </template>
        </a-table>
        <p v-else>{{ t('暂无数据') }}</p>
      </div>
    </div>
    <div v-if="blockInfo?.showCheck" class="check-content">
      <i class="iconfont">&#xe647;</i>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectAuditCheckMode, shareSaveProject } from '@/api/process';
import SecurityAddEdit from './SecurityAddEdit.vue';
import emitter from "@/event"
import { navigationTo } from '@/utils/tool';
import { useRoute } from 'vue-router'
import { cloneDeep } from 'lodash';

const emits = defineEmits(['refresh']);
const props = defineProps({
  securityInfo: {
    type: Object,
    default: () => {}
  },
  lendingInfo: {
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

const buildAmount = computed(() => {
  return Number(props.lendingInfo?.build_amount || 0)
})

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
    share: ''
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

const isShared = ref(false);
const sharedVisible = ref(false);

const joinProjectData = computed(() => {
  const data = cloneDeep(props.securityInfo.share_group) || [];
  data.forEach(item => {
    item.loading = false;
    item.is_direct_bind = item.uuid === props.securityInfo.share;
  })
  isShared.value = data.length > 0;
  return data;
})

const sharedProject = computed(() => {
  return joinProjectData.value.find(item => item.is_direct_bind) || {};
})

const shareLvr = computed(() => {
  return props.securityInfo.share_lvr ? Number(props.securityInfo.share_lvr) : 0;
})

const columns = computed(() => {
  const data = [
    { title: t('项目名称'), dataIndex: 'project_name', width: 200 },
    { title: t('项目ID'), dataIndex: 'project_apply_sn', width: 200 },
    { title: t('直接绑定'), dataIndex: 'is_direct_bind', width: 120 }
  ]
  if (!props.isDetails && props.blockInfo.showEdit) {
    data.push({ title: t('操作1'), dataIndex: 'operation', width: 100, align: 'center' })
  }
  return data;
})

const sharedDone = () => {
  emits('refresh');
}

const unBindHandle = async (data) => {
  const params = {
    uuid: props.currentId
  };

  data.loading = true;
  await shareSaveProject(params)
    .then(() => {
      data.loading = false;
      emits('refresh');
      return true;
    })
    .catch(() => {
      data.loading = false;
      return false;
    });
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
  &.share-lvr {
    > .col-item {
      width: 25%;
    }
  }
  > .col-item {
    width: 33.33333%;
    float: left;
    :deep(.ant-statistic-content) {
      font-size: 18px !important;
    }
  }
}

.sales-content {
  border: 1px solid #282828;
  background-color: #f7f9f8;
  border-radius: 10px;
  padding: 10px 15px;
  > p {
    text-align: center;
    font-size: 14px;
    color: #999;
  }
  :deep(.ant-table-wrapper) {
    .ant-table-tbody>tr>td {
      padding: 8px 10px !important;
    }
    .ant-table-thead>tr>th {
      padding: 8px 10px !important;
      color: #282828 !important;
      font-weight: 500 !important;
      font-size: 13px !important;
    }
  }
}
</style>
