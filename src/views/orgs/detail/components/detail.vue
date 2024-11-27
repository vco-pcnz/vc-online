<template>
  <ul class="orgs-info">
    <li>
      <a-button type="cyan" shape="round" class="edit" @click="navigationTo('/orgs/addOrgs')">{{ t('编辑') }}</a-button>
      <div class="avatar-box">
        <vco-avatar :src="orgsDetailStore.detail?.avatar" :size="124"></vco-avatar>
      </div>
      <p>
        <span class="label"><i class="iconfont" :class="{ cer: orgsDetailStore.detail?.name }">&#xe679;</i></span>
        <span class="value">{{ orgsDetailStore.detail?.name }}</span>
      </p>
    </li>
    <li>
      <p>{{ t('详情') }}</p>
      <!-- <p>
                <span class="label"><i class="iconfont">&#xe605;</i>Org ID: </span>
                <span class="value">{{ orgsDetailStore.detail?.org_name }}</span>
            </p> -->
      <p>
        <span class="label"><i class="iconfont">&#xe65b;</i>NZBZ: </span>
        <span class="value">{{ orgsDetailStore.detail?.nzbz }}</span>
      </p>
      <p>
        <span class="label"><i class="iconfont" :class="{ cer: orgsDetailStore.detail?.idcard }">&#xe679;</i>{{ t('组织机构代码f') }}: </span>
        <span class="value">{{ orgsDetailStore.detail?.idcard }}</span>
      </p>
      <p>
        <span class="label"><i class="iconfont" :class="{ cer: orgsDetailStore.detail?.email_ok }">&#xe66f;</i>{{ t('邮箱') }}: </span>
        <span class="value">{{ orgsDetailStore.detail?.email }}</span>
      </p>
      <p>
        <span class="label"><i class="iconfont" :class="{ cer: orgsDetailStore.detail?.mobile_ok }">&#xe678;</i>{{ t('手机号') }}: </span>
        <span class="value">+{{ orgsDetailStore.detail?.pre }} {{ orgsDetailStore.detail?.mobile }}</span>
      </p>
      <p>
        <span class="label"><i class="iconfont">&#xe814;</i>{{ t('地址') }}: </span>
        <span class="value">{{ orgsDetailStore.detail?.city }}</span>
      </p>
    </li>
    <li>
      <p>{{ t('证件f') }}</p>

      <p>
        <span class="label"><i class="iconfont">&#xe629;</i>{{ t('证件有效期f') }}: </span>
        <span class="value">{{ orgsDetailStore.detail?.expire_time }}</span>
      </p>
    </li>
    <li>
      <p>
        <span class="label"><i class="iconfont">&#xe690;</i></span>
        <span class="cer"> {{ orgsDetailStore.detail?.open_count }}{{ t('进行中项目') }} </span>
      </p>
      <p style="padding-left: 20px">
        <span class="label"> {{ orgsDetailStore.detail?.close_count }}{{ t('已关闭项目') }} </span>
      </p>
      <p>
        <span class="label"><i class="iconfont">&#xe751;</i></span>
        <span class="cer">{{ orgsDetailStore.detail?.apply_count }}{{ t('请求') }}</span>
      </p>
    </li>
  </ul>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useorgsDetailStore } from '@/store';
import { useRoute } from 'vue-router';
const route = useRoute();

const { t } = useI18n();
const orgsDetailStore = useorgsDetailStore();

onMounted(() => {
  // 加载数据
  orgsDetailStore.setDetail(route.query.id);
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.orgs-info {
  li {
    padding: 10px 30px;
    border-bottom: 1px solid #e2e5e2;
    position: relative;
    .avatar-box {
      display: flex;
      justify-content: center;
    }
    &:last-child {
      border: none;
    }
    .edit {
      position: absolute;
      top: 10px;
      right: 10px;
    }
    p {
      margin-top: 4px;
    }
    .label {
      color: #999;
      .iconfont {
        margin-right: 4px;
        &.cer {
          color: @colorPrimary;
        }
      }
    }

    .value {
      color: #000;
    }
  }
}
</style>
