<template>
  <div class="mt-6">
    <security-add-edit
      v-model:visible="editVisible"
      :current-id="currentId"
      :security-status="securityInfo.check_status"
      :info-data="currentData"
      :type-data="securityInfo.type"
    ></security-add-edit>

    <div class="block-item sec">
      <vco-process-title :title="t('抵押物信息')"></vco-process-title>
      <a-spin :spinning="tabLoading" size="large">
        <div class="table-content">
          <template v-if="tabData.length">
            <div v-for="item in tabData" :key="item.uuid" class="table-item">
              <div class="item-header flex justify-between">
                <p class="flex-1">
                  <span>{{ item.type_name }}</span
                  >{{ item.card_no }}
                </p>
                <div class="flex">
                  <i class="iconfont" @click="editHandle(item)">&#xe8cf;</i>
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
                  <p>{{ tool.showDate(item.insurance_expire_date) }}</p>
                </a-col>
                <a-col :span="24" class="item-txt">
                  <p>{{ t('地址') }}</p>
                  <p>{{ `${item.address_short} ${item.region_three_name} ${item.region_two_name} ${item.region_one_name}` }}</p>
                </a-col>
                <a-col :span="12" class="item-txt">
                  <div class="item-txt">
                    <p>{{ t('总金额') }}</p>
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
          </template>
          <div v-if="!tabData.length && !tabLoading" class="no-data">{{ t('暂无数据') }}</div>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectAuditSecurityList } from '@/api/process';
import tool from '@/utils/tool';
import SecurityAddEdit from '@/views/process/temp/default/components/SecurityAddEdit.vue';
import emitter from '@/event';
import { projectAuditDeleteSecurity } from '@/api/process';

const props = defineProps({
  securityInfo: {
    type: Object,
    default: () => {
      return {
        count: 0,
        total_value: '0.00',
        is_check: false,
        check_status: 407,
        type: []
      };
    }
  },
  currentId: {
    type: [Number, String],
    required: true
  }
});

const { t } = useI18n();

const tabLoading = ref(false);
const tabData = ref([]);
const getTableData = () => {
  tabLoading.value = true;
  projectAuditSecurityList({
    uuid: props.currentId
  })
    .then((res) => {
      const { list } = res;
      tabData.value = list || [];
      tabLoading.value = false;
    })
    .catch(() => {
      tabLoading.value = false;
    });
};

const editVisible = ref(false);
const currentData = ref(null);
const editHandle = (data) => {
  currentData.value = data;
  editVisible.value = true;
};

const deleteHandle = async (data) => {
  await projectAuditDeleteSecurity({
    security_uuid: data.uuid,
    uuid: props.currentId,
    security_status: props.securityInfo.check_status
  })
    .then(() => {
      getTableData();
      emitter.emit('refreshSecurityInfo');
      return true;
    })
    .catch(() => {
      return false;
    });
};

onMounted(() => {
  getTableData();
  emitter.on('refreshSecurityList', () => {
    getTableData();
  });
});
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
    .item-header {
      border-bottom: 1px solid #e2e5e2;
      padding-bottom: 5px;
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
        gap: 5px;
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
        padding-right: 20px;
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
