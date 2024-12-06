<template>
  <!-- <div class="table-content">
    <div class="table-block">
      <ul class="table-col header">
        <li class="check">
          <a-checkbox
            v-model:checked="checkedAll"
            :indeterminate="indeterminate"
            @change="checkedAllHandle"
          ></a-checkbox>
        </li>
        <li class="uppercase">{{ t('项目图片') }}</li>
        <li class="uppercase">{{ t('项目信息') }}</li>
        <li class="uppercase">{{ t('借款金额') }}</li>
        <li class="uppercase">{{ t('借款人信息') }}</li>
        <li>{{ t('客户经理') }}</li>
        <li class="uppercase">{{ t('期数') }}</li>
        <li class="uppercase">{{ t('最大费率') }}</li>
        <li class="uppercase">{{ t('创建时间') }}</li>
        <li class="uppercase">{{ t('状态') }}</li>
        <li class="uppercase">{{ t('操作1') }}</li>
      </ul>
      <div v-if="tableData.length" class="table-body">
        <template v-for="item in tableData" :key="item.id">
          <ul class="table-col tr">
            <li class="check">
              <a-checkbox v-model:checked="item.checked" @change="itemcheck"></a-checkbox>
            </li>
            <li>
              <vco-avatar v-if="item.project_images" :src="item.project_images" :radius="true" :round="false"></vco-avatar>
              <span v-else>--</span>
            </li>
            <li>
              <p>ID: {{ item.id }}</p>
              <p class="name">{{ item.project_name }}</p>
              <p>
                <i class="iconfont">&#xe814;</i>
                <span>{{ item.address }}</span>
              </p>
            </li>
            <li>
              <vco-number :value="item.loan_money" :precision="2"></vco-number>
            </li>
            <li>
              <p>
                <i class="iconfont" :class="{'cer': item.borrower_ver}">&#xe683;</i>
                <span class="name" :class="{'cer': item.borrower_ver}">{{ item.borrower }}</span>
              </p>
              <p>
                <i class="iconfont" :class="{'cer': item.borrower_email_ver}">&#xe66f;</i>
                <span :class="{'cer': item.borrower_email_ver}">{{ item.borrower_email }}</span>
              </p>
              <p>
                <i class="iconfont" :class="{'cer': item.borrower_phone_ver}">&#xe678;</i>
                <span :class="{'cer': item.borrower_phone_ver}">{{ item.borrower_phone }}</span>
              </p>
            </li>
            <li>
              <div v-if="item.lm" class="peason-info">
                <vco-avatar :src="item.lm.avatar || ''" :size="22"></vco-avatar>
                <p>{{ item.lm.name || 'LM Name' }}</p>
              </div>
              <span v-else>--</span>
            </li>
            <li>
              <vco-time-line
                v-if="item.openDate && item.maturityDate"
                :open-date="item.openDate"
                :maturity-date="item.maturityDate"
              ></vco-time-line>
              <span v-else>--</span>
            </li>
            <li>{{ item.maxLvr }}</li>
            <li>
              {{ tool.showDate(item.createDate) }}
            </li>
            <li>
              <span v-if="!item.op" class="status-txt">{{ item.status }}</span>
              <a-button v-else type="primary" shape="round">{{ item.status }}</a-button>
            </li>
            <li>
              <a-dropdown :trigger="['click']">
                <a class="ant-dropdown-link" @click.prevent>
                  <i class="iconfont">&#xe77a;</i>
                </a>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="0">
                      <a>{{ t('查看详情') }}</a>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </li>
          </ul>
        </template>
      </div>
      <a-empty v-else :image="simpleImage" />
    </div>
  </div> -->
  <div>
    <a-table
      :columns="columns"
      :data-source="tableData"
      :pagination="false"
      :scroll="{ x: '100%' }"
    >
    </a-table>
  </div>
</template>

<script setup>
  import { ref, reactive } from "vue"
  import { Empty } from 'ant-design-vue';
  import { useI18n } from "vue-i18n";
  import tool from '@/utils/tool';

  const emits = defineEmits(['check'])

  const props = defineProps({
    tableData: {
      type: Array,
      default: () => []
    },
    indeterminate: {
      type: Boolean,
      default: false
    }
  })

  const { t } = useI18n();

  const columns = reactive([
    { title: t('项目图片'), dataIndex: '1', width: 110, align: 'center' },
    { title: t('利益相关者信息t'), key: '2', width: 250, align: 'left' },
    { title: t('关联用户t'), key: '3', width: 250, align: 'left' },
    { title: t('用户角色t'), key: '4', width: 150, align: 'center' },
    { title: t('注册时间/创建时间t'), key: '5', width: 230, align: 'center' },
    { title: t('项目数据t'), key: '6', width: 180, align: 'left' },
    { title: t('状态t'), key: '7', width: 150, align: 'center' },
    {
      title: t('操作1'),
      key: 'operation',
      fixed: 'right',
      align: 'center',
      width: 50
    }
  ]);

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const checkedAll = ref(false)

  const itemcheck = () => {
    const length = props.tableData.filter(item => item.checked).length
    checkedAll.value = length === props.tableData.length
  }

  const checkedAllHandle = () => {
    emits('check', checkedAll.value)
  }
</script>

<style lang="less" scoped>
  @import "@/styles/variables.less";

  .table-content {
    border-top: 1px solid #808080;
    padding-top: 5px;
  }

  .table-col {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    padding: 0 15px;
    font-size: 13px;
    &.header {
      background-color: #fff;
      border-radius: 10px;
      border: 1px solid #fff;
      font-weight: 500;
      font-size: 12px;
    }
    &.tr {
      background-color: #F0F0F0;
      border: 1px solid #e2e5e2;
      border-radius: 10px;
      margin-top: 10px;
      transition: all 0.3s ease;
      &:hover {
        border-color: @colorPrimary;
      }
      &:first-child {
        margin-top: 5px;
      }
    }
    > li {
      padding: 10px;
      flex: 1;
      line-height: 21px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      :deep(.ant-statistic-content) {
        font-size: 15px;
      }
      &.check {
        flex: 0 auto;
        width: 50px;
      }
      &:nth-child(2) {
        flex: 0 auto;
        width: 100px;
      }
      &:nth-child(3) {
        flex: 0 auto;
        width: 170px;
      }
      &:nth-child(4) {
        flex: 0 auto;
        width: 130px;
      }
      &:nth-child(5) {
        flex: 0 auto;
        width: 180px;
      }
      &:nth-child(6) {
        flex: 0 auto;
        width: 120px;
      }
      &:nth-child(8) {
        flex: 0 auto;
        width: 80px;
      }
      &:nth-child(9) {
        flex: 0 auto;
        width: 100px;
      }
      &:nth-child(10) {
        flex: 0 auto;
        width: 120px;
      }
      &:last-child {
        flex: 0 auto;
        width: 50px;
      }
      > p {
        width: 100%;
        word-break: break-all;
        margin-top: 4px;
        &:first-child {
          margin-top: 0;
        }
        &.name {
          font-weight: 500;
        }
        > .iconfont {
          margin-right: 4px;
          color: #999;
          &.cer {
            color: @colorPrimary;
          }
        }
        > span {
          color: #666;
          &.cer {
            color: #000;
          }
          &.name {
            font-weight: 500;
          }
        }
      }
    }
  }

  .peason-info {
    position: relative;
    .vco-avatar {
      position: absolute;
      left: 0;
      top: 0;
    }
    > p {
      line-height: 22px;
      text-indent: 28px;
      word-break: break-all;
    }
  }

  .status-txt {
    font-size: 14px;
    font-weight: 500;
  }
</style>