<template>
  <detail-layout :title="baseInfo.name" active-tab="about">
    <template #content>
      <div class="project-container">
        <div class="project-info">
          <a-image src="http://vco.com/uploads/images/avatar/20241127/0ea88a8eab11af46206.jpeg" />
          <div class="info-card base-card">
            <p class="id_async">
              <span>ID {{ baseInfo.id }}</span>
              <a-popconfirm title="Are you sure you want to sync the project transactions with Xero?" okText="confirm">
                <template #icon>
                  <CheckCircleOutlined :style="{ color: '#a9ad57' }" />
                </template>
                <img :width="58" :height="14" :src="xeroImg" alt="Xero" />
              </a-popconfirm>
            </p>
            <p class="text-2xl name">{{ baseInfo.name }}</p>
            <p class="purpose">
              <span v-for="item in baseInfo.purpose" :key="item">
                {{ item }}
              </span>
            </p>
            <p>{{ baseInfo.background }}</p>
          </div>
          <div class="info-card member-card">
            <div v-for="item in members" :key="item.label">
              <div class="member-row">
                <span>{{ item.label }}</span>
                <a-button type="primary" shape="round" v-if="!item.memberList.length"> associate </a-button>
                <a-button type="primary" shape="round" v-else>edit</a-button>
              </div>
              <div v-for="user in item.memberList" class="member-info" :key="user.id">
                <a-space>
                  <vco-avatar :src="user.avatar" :size="24" class="avatar" />
                  <span>{{ user.name }}</span>
                </a-space>
              </div>
            </div>
          </div>
          <a-collapse expand-icon-position="end" ghost>
            <a-collapse-panel key="History" class="collapse-card history-card">
              <template #header>
                <i class="iconfont">&#xe76c;</i>
                <span class="title">{{t('历史')}}</span>
              </template>
              <ul class="step">
                <li class="step-item flex justify-between items-center" v-for="item in 9" :key="item">
                  <div class="content flex items-center">
                    <i class="iconfont">&#xe725;</i>
                    <span>Loan request created</span>
                  </div>
                  <span class="date">12/12/24</span>
                </li>
              </ul>
            </a-collapse-panel>
            <a-collapse-panel key="Conditions" class="collapse-card conditions-card">
              <template #header>
                <i class="iconfont">&#xe733;</i>
                <span class="title">{{t('条件')}}</span>
              </template>
              <ul class="Conditions">
                <li class="Conditions-item flex items-center" v-for="item in 3" :key="item">
                  <a-checkbox :checked="item.checked"></a-checkbox>
                  <div class="CalendarDate">
                    <p class="CalendarDate-Label">Dec</p>
                    <p class="CalendarDate-Value">16</p>
                    <p class="CalendarDate-Label">Mon</p>
                  </div>
                  <div class="VerticalDivider"></div>
                  <div class="flex-1">
                    <p class="Text Text_cross Box" style="margin-bottom: 6px">111</p>
                    <div class="flex items-center">
                      <vco-avatar src="" :radius="true" :round="true" :size="18" />
                      <span class="name">Created by lm</span>
                    </div>
                    <div class="flex items-center mt-1">
                      <vco-avatar src="" :radius="true" :round="true" :size="18" />
                      <span class="name black"> Borrower's</span>
                    </div>
                  </div>
                </li>
              </ul>
              <a-button type="brown" shape="round" size="small" class="mt-5">add condition</a-button>
            </a-collapse-panel>
            <a-collapse-panel key="Request_details" class="collapse-card request-card">
              <template #header>
                <i class="iconfont">&#xe732;</i>
                <span class="title">{{t('请求详细信息')}}</span>
              </template>
              <div>
                <p>Requested $1,000,000,000.00</p>
                <p>Est. 30 Nov 2024 ⇢ Est. 6 Dec 2025</p>
                <p>Created by</p>
                <div class="flex items-center gap-2">
                  <vco-avatar src="" :radius="true" :round="true" :size="18" />
                  <span class="name black"> Borrower's</span>
                </div>
                <div class="flex">
                  <div class="RequestDetails_member-info__jErzI">
                    <p>{{t('借款人信息2')}}</p>
                    <p>test</p>
                    <p>renee@vincentcapital.cn</p>
                    <p>188888888</p>
                  </div>
                  <div>
                    <p>{{t('经纪人信息')}}</p>
                  </div>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
        <div class="project-content">
          <div class="stats-content">
            <div class="box left">
              <div class="box-top">
                <p>IRR</p>
                <p>0%</p>
                <p>loan IRR 10%</p>
              </div>
              <a-divider />
              <div class="box-bottom">
                <p>Interest & fees</p>
                <p>$1,658,268,367.53</p>
                <p>forecasted</p>
              </div>
            </div>
            <div class="box middle">
              <div class="box-top">
                <p>Current income</p>
                <p>$515,062,584.24</p>
                <p>current interest & fees</p>
              </div>
              <a-divider />
              <div class="box-bottom">
                <div>
                  <p>Security value</p>
                  <p>$1,100,000.00</p>
                  <p>security items <i class="iconfont"></i></p>
                </div>
                <div>
                  <p>Security value</p>
                  <p>$1,100,000.00</p>
                  <p>security items <i class="iconfont"></i></p>
                </div>
              </div>
            </div>
            <div class="box right">
              <div class="box-top">
                <p>LVR</p>
                <p>256452%</p>
                <p>over the max 10%</p>
              </div>
              <a-divider />
              <div class="box-bottom">
                <p>Security value</p>
                <p>$1,100,000.00</p>
                <p>security items <i class="iconfont"></i></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import useFormData from '@/utils/use-form-data';
import xeroImg from '@/assets/images/xero.png';
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import { size, template } from 'lodash';
import detailLayout from '../components/detailLayout.vue';

const { t } = useI18n();
const route = useRoute();

const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});

const members = ref([
  {
    label: 'BORROWER',
    memberList: [
      {
        id: 1,
        avatar: '',
        name: 'kk lm'
      },
      {
        id: 2,
        avatar: '',
        name: 'kk lv'
      }
    ]
  },
  {
    label: 'BROKER',
    memberList: []
  },
  {
    label: 'VC Team',
    memberList: []
  }
]);

const getProjectDetail = (userId) => {
  const uuid = userId || route.query.uuid;
  if (uuid) {
    // 发起请求
  }
};

onMounted(() => {
  getProjectDetail();
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.project-container {
  position: relative;
  display: grid;
  grid-template-columns: 315px 1fr;
  gap: 24px;
  align-items: flex-start;

  .project-info {
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid @clr_white;
    background-color: @clr_white;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);

    .info-card {
      padding: 30px;
    }

    .base-card {
      font-size: 14px;
      color: #888;

      .id_async {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        > span {
          font-weight: 600;
          font-size: 12px;
          line-height: 1.45;
          letter-spacing: 1px;
        }
      }

      .name {
        font-weight: 500;
        line-height: 1.2;
        margin-bottom: 12px;
        color: @clr_charcoal;
      }

      .purpose {
        margin-bottom: 6px;
      }
    }

    .member-card {
      border-top: 1px solid #e2e5e2;
      border-bottom: 1px solid #e2e5e2;

      .member-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }

      > div:nth-child(n + 2) {
        margin-top: 12px;
      }

      .member-info {
        padding-left: 4px;
        margin-top: 12px;
      }
    }

    .collapse-card {
      :deep(.ant-collapse-header-text),
      :deep(.ant-collapse-header) {
        display: flex;
        align-items: center;
      }

      :deep(.ant-collapse-header) {
        padding: 18px 40px 18px 30px;
      }
      :deep(.ant-collapse-content-box) {
        padding: 4px 30px 30px;
      }
      i {
        font-size: 21px;
      }

      .title {
        margin-left: 16px;
        font-weight: 600;
      }

      &:nth-child(2) {
        border-top: 1px solid #e2e5e2;
        border-bottom: 1px solid #e2e5e2;
      }

      :deep(.ant-collapse-expand-icon) {
        color: #888;
      }
    }
  }

  .project-content {
    border-radius: 12px;
    padding: 30px;

    .stats-content {
      grid-gap: 12px;
      display: grid;
      gap: 12px;
      grid-template-columns: 2fr 3fr 2fr;
      padding-left: 40px;
      padding-right: 40px;

      .box {
        background-color: #f0f0f0;
        border: 1px solid #e2e5e2;
        padding: 30px;
        border-radius: 12px;
      }

      .middle {
        .box-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
      }
    }
  }
}

.step {
  .step-item {
    margin-bottom: 12px;
    gap: 6px;
    position: relative;
    .content {
      font-size: 9px;
      font-weight: 600;
      letter-spacing: 1px;
      line-height: 2;
      position: relative;
      text-transform: uppercase;
      gap: 6px;
      .iconfont {
        font-size: 12px;
      }
    }
    .date {
      color: hsla(0, 0%, 9%, 0.3);
      font-size: 10px;
    }
    &:not(:last-child):after {
      background-color: #181818;
      content: '';
      display: block;
      height: 24px;
      left: 5.5px;
      position: absolute;
      top: 18px;
      width: 1px;
    }
  }
}

.Conditions {
  &-item {
    &:not(:last-child) {
      margin-bottom: 24px;
    }
    .CalendarDate {
      flex-shrink: 0;
      text-align: center;
      width: 30px;
      margin-left: 12px;
      &-Label {
        font-size: 8px;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
      }
      &-Value {
        font-size: 20px;
        font-weight: 500;
      }
      &-Label:last-of-type {
        color: #888;
      }
    }
    .VerticalDivider {
      align-self: stretch;
      background-color: #e2e5e2;
      flex-shrink: 0;
      width: 1px;
      margin-left: 16px;
      margin-right: 16px;
    }
    .Text_cross {
      text-decoration: line-through;
      text-decoration-thickness: 1.5px;
    }

    .name {
      color: #888;
      font-weight: 500;
      font-size: 10px;
      line-height: 1.45;
      margin-left: 6px;
    }
    .black {
      color: #000;
    }
  }
}
</style>
