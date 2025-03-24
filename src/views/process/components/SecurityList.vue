<template>
  <div>
    <div v-if="tabData.length" class="mt-6">
      <security-add-edit
        v-model:visible="editVisible"
        :current-id="currentId"
        :security-status="securityInfo.check_status"
        :info-data="currentData"
        :block-info="blockInfo"
        :project-info="projectInfo"
      ></security-add-edit>

      <div class="block-item sec">
        <vco-process-title :title="t('抵押物信息')">
          <div class="flex gap-3">
            <a-button
              v-if="tabData.length"
              type="dark" shape="round"
              size="small"
              class="uppercase"
              @click="batchEditHandle"
            >{{ batchEditFlag ? t('点击编辑') : t('批量编辑') }}</a-button>

            <a-button
              v-if="batchEditFlag"
              type="primary" shape="round"
              size="small"
              class="uppercase"
              @click="selectAllHandle"
            >{{ t('全选') }}</a-button>

            <a-button
              v-if="batchEditFlag"
              type="primary" shape="round"
              size="small"
              class="uppercase"
              @click="batchEditFlag = false"
            >{{ t('取消') }}</a-button>

            <a-popover
              v-if="tabData.length && !isDetails && blockInfo.showEdit && !batchEditFlag"  
              v-model:open="addSecurityVisible" trigger="click"
            >
              <template #content>
                <a-menu :selectable="false" style="border: none !important;">
                  <a-menu-item>
                    <div @click="editHandle(null, true)" class="text-center">{{ t('批量添加') }}</div>
                  </a-menu-item>
                  <a-menu-item>
                    <div @click="editHandle(null, false)" class="text-center">{{ t('单个添加') }}</div>
                  </a-menu-item>
                </a-menu>
              </template>
              <a-button
                type="primary" shape="round"
                size="small"
                class="uppercase"
              >{{ t('添加') }}</a-button>
            </a-popover>
          </div>
        </vco-process-title>
        
        <a-spin :spinning="tabLoading" size="large">
          <div class="table-content">
            <template v-if="tabData.length">
              <div v-for="item in tabData" :key="item.uuid" class="table-item" :class="{'batch-edit': batchEditFlag}" @click.stop="checkHandle(item)">
                <div v-if="batchEditFlag" class="checked" :class="{'active': item.checked}">
                  <i class="iconfont">&#xe8c5;</i>
                </div>
                <div class="flex-1">
                  <div class="item-header flex justify-between">
                    <p class="flex-1">
                      <span>{{ item.type_name }}</span
                      >{{ item.card_no }}
                    </p>
                    <div v-if="!isDetails && blockInfo.showEdit && !batchEditFlag" class="flex">
                      <i class="iconfont" @click.stop="copyHandle(item)">&#xe8a7;</i>
                      <i class="iconfont" @click.stop="editHandle(item, false)">&#xe8cf;</i>
                      <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="() => deleteHandle(item)">
                        <i class="iconfont">&#xe8c1;</i>
                      </a-popconfirm>
                    </div>
                  </div>
                  <a-row :gutter="24">
                    <a-col :span="12" class="item-txt">
                      <p>{{ t('名称') }}</p>
                      <p>{{ item.security_name }}</p>
                    </a-col>
                    <a-col :span="12" class="item-txt">
                      <p>{{ t('担保公司') }}</p>
                      <p>{{ item.insurance_company }}</p>
                    </a-col>
                    <a-col :span="12" class="item-txt">
                      <p>{{ t('创建人') }}</p>
                      <p>{{ item.create_user_name }}</p>
                    </a-col>
                    <a-col :span="12" class="item-txt">
                      <p>{{ t('创建时间') }}</p>
                      <p>{{ tool.showDate(item.create_time) }}</p>
                    </a-col>
                    <a-col :span="12" class="item-txt">
                      <p>{{ t('抵押登记日期') }}</p>
                      <p>{{ item.mortgage_registration_date ? tool.showDate(item.mortgage_registration_date) : '--' }}</p>
                    </a-col>
                    <a-col :span="12" class="item-txt">
                      <p>{{ t('保险到期日') }}</p>
                      <p>{{ item.insurance_expire_date ? tool.showDate(item.insurance_expire_date) : '--' }}</p>
                    </a-col>
                    <a-col :span="24" class="item-txt">
                      <p>{{ t('地址') }}</p>
                      <p>{{ addressInfo(item) }}</p>
                    </a-col>
                    <a-col :span="12" class="item-txt">
                      <div class="item-txt">
                        <p>{{ t('抵押物价值') }}</p>
                        <vco-number :value="item.amount" :precision="2" :end="true"></vco-number>
                      </div>
                    </a-col>
                    <a-col :span="12" class="item-txt">
                      <div class="item-txt total">
                        <p>{{ t('保险价值') }}</p>
                        <vco-number :value="item.insurance_value" :precision="2" :end="true"></vco-number>
                      </div>
                    </a-col>
                  </a-row>
                </div>
                
              </div>
            </template>
            <div v-if="!tabData.length && !tabLoading" class="no-data">{{ t('暂无数据') }}</div>
          </div>
        </a-spin>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectAuditSecurityList, projectDetailAuditSecurityList, projectAuditDeleteMode } from '@/api/process';
import tool, { navigationTo } from '@/utils/tool';
import SecurityAddEdit from '@/views/process/temp/default/components/SecurityAddEdit.vue';
import emitter from '@/event';
import { useRoute } from 'vue-router'
import { cloneDeep } from "lodash"
import { message } from 'ant-design-vue';

const props = defineProps({
  securityInfo: {
    type: Object,
    default: () => {
      return {
        is_check: false,
        check_status: 407,
        type: []
      };
    }
  },
  blockInfo: {
    type: Object,
    default: () => {}
  },
  projectInfo: {
    type: Object,
    default: () => {}
  },
  currentId: {
    type: [Number, String],
    required: true
  },
  isDetails: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();
const route = useRoute()

const tabLoading = ref(false);
const tabData = ref([]);
const getTableData = () => {
  tabLoading.value = true;
  const ajaxFn = props.isDetails ? projectDetailAuditSecurityList : projectAuditSecurityList
  ajaxFn({
    uuid: props.currentId
  })
    .then((res) => {
      const { list } = res;
      const data = list || [];
      data.forEach(item => {
        item.checked = false
      })
      tabData.value = data;
      tabLoading.value = false;
    })
    .catch(() => {
      tabLoading.value = false;
    });
};

const addSecurityVisible = ref(false)
const editVisible = ref(false);
const currentData = ref(null);

const editHandle = (data, flag = false) => {
  if (flag) {
    navigationTo(`/process/security-batche?uuid=${route.query.uuid}&code=${props.blockInfo.code}`)
  } else {
    currentData.value = data;
    editVisible.value = true;
  }
  
  addSecurityVisible.value = false
};

const copyHandle = (data) => {
  const newData = cloneDeep(data)
  delete newData.uuid
  currentData.value = newData;
  editVisible.value = true;
}

const deleteHandle = async (data) => {
  await projectAuditDeleteMode({
    security_uuid: data.uuid,
    uuid: props.currentId,
    code: props.blockInfo.code
  })
    .then(() => {
      getTableData();

      emitter.emit('refreshSecurityInfo');
      emitter.emit('refreshAuditHisList');
      emitter.emit('refreshIRR');
      emitter.emit('refreshIRR1');
      return true;
    })
    .catch(() => {
      return false;
    });
};

const addressInfo = (data) => {
  return `${data.address_short} ${data.address} ${data.suburb} ${data.region_one_name} ${data.country_name}`
}

const handleRefreshSecurityList = () => {
  getTableData();
}

const batchEditFlag = ref(false)
const batchEditHandle = () => {
  if (batchEditFlag.value) {
    const data = tabData.value.filter(item => item.checked)
    if (data.length) {
      const fType = data[0].type
      const isSame = data.every(item => item.type === fType)
      if (isSame) {
        sessionStorage.setItem('batchEditSec', JSON.stringify(data))
        navigationTo(`/process/security-batche?uuid=${route.query.uuid}&code=${props.blockInfo.code}&e=1`)
      } else {
        message.error(t('请选择类型相同的数据进行操作'))
      }
    } else {
      message.error(t('请至少选择一条数据进行操作'))
    }
    
  } else {
    batchEditFlag.value = true
  }
}

const checkHandle = (data) => {
  data.checked = !data.checked
}

const selectAllHandle = () => {
  const flag = tabData.value[0].checked
  tabData.value.forEach(item => {
    item.checked = !flag
  })
}

onMounted(() => {
  getTableData();
  sessionStorage.removeItem('batchEditSec')

  emitter.on('refreshSecurityList', handleRefreshSecurityList);
});

onUnmounted(() => {
  emitter.off('refreshSecurityList', handleRefreshSecurityList);
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.table-content {
  min-height: 100px;
  max-height: 650px;
  overflow-x: hidden;
  overflow-y: scroll;
  .table-item {
    padding: 10px;
    border: 1px solid #e2e5e2;
    border-radius: 8px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.2s ease;
    &.batch-edit {
      cursor: pointer;
    }
    > .checked {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1px solid #282828;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      > .iconfont {
        color: #fff;
        font-weight: bold;
      }
      &.active {
        background-color: @colorPrimary;
        border-color: @colorPrimary;
      }
    }
    .item-header {
      border-bottom: 1px solid #e2e5e2;
      padding-bottom: 5px;
      min-height: 30px;
      p {
        span {
          background-color: @colorPrimary;
          font-size: 10px;
          padding: 4px 5px;
          border-radius: 3px;
          color: #fff;
          margin-right: 5px;
        }
      }
      > .flex {
        gap: 10px;
        > .iconfont {
          cursor: pointer;
          color: @colorPrimary;
          &:hover {
            opacity: 0.8;
          }
        }
      }
    }

    .item-txt {
      margin-top: 10px;
      &.total {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      p {
        font-size: 13px;
        &:first-child {
          color: #999;
        }
      }
      :deep(.ant-statistic-content) {
        font-size: 22px !important;
      }
    }
  }
}

.no-data {
  height: 100px;
  color: #999;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
