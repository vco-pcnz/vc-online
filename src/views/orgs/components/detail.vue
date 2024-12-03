<template>
  <ul class="orgs-info">
    <li>
      <a-button v-if="showEdit" type="cyan" shape="round" class="edit" @click="toEdit">{{ t('编辑') }}</a-button>
      <div class="avatar-box">
        <vco-avatar :src="orgsDetailStore.detail?.avatar" :size="100"></vco-avatar>
      </div>
      <p>
        <span class="label"><i class="iconfont" :class="{ cer: orgsDetailStore.detail?.name }">&#xe679;</i></span>
        <span class="value">{{ orgsDetailStore.detail?.name }}</span>
      </p>
    </li>
    <li>
      <p>{{ t('详情') }}</p>
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
        <span class="value" v-if="orgsDetailStore.detail?.mobile">+{{ orgsDetailStore.detail?.pre }} {{ orgsDetailStore.detail?.mobile }}</span>
      </p>
      <p>
        <span class="label"><i class="iconfont">&#xe814;</i>{{ t('地址') }}: </span>
        <span class="value">{{ orgsDetailStore.detail?.city }}</span>
      </p>
    </li>
    <li v-if="trim(orgsDetailStore.detail.document)">
      <p>{{ t('证件f') }}</p>
      <vco-file-item :file="item" :time="orgsDetailStore.detail.expire_time[index]" v-for="(item,index) in orgsDetailStore.detail.document" :key="index"></vco-file-item>
    </li>
    <li>
      <p>
        <span class="label"><i class="iconfont">&#xe690;</i></span>
        <span class="cer"> {{ orgsDetailStore.detail?.open_count }} {{ t('进行中项目') }} </span>
      </p>
      <p style="padding-left: 20px">
        <span class="label"> {{ orgsDetailStore.detail?.close_count }} {{ t('已关闭项目') }} </span>
      </p>
      <p>
        <span class="label"><i class="iconfont">&#xe751;</i></span>
        <span class="cer">{{ orgsDetailStore.detail?.apply_count }} {{ t('请求') }}</span>
      </p>
    </li>
  </ul>
</template>

<script setup>
import { ref, onMounted,watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { pick, trim, cloneDeep } from 'lodash';
import { useRoute } from 'vue-router';
import { navigationTo } from '@/utils/tool';
import { useOrgsDetailStore } from '@/store';
import { useOrgsFormStore } from '@/store';
const route = useRoute();

const { t } = useI18n();
const orgsDetailStore = useOrgsDetailStore();
const orgsFormStore = useOrgsFormStore();

const props = defineProps({
  showEdit: {
    type: Boolean,
    default: true
  },
});

onMounted(() => {
  // 加载数据
  if (orgsFormStore.p_uuid || orgsFormStore.uuid) {
    if (props.showEdit) {
      orgsDetailStore.setDetail(orgsFormStore.p_uuid || orgsFormStore.uuid);
    } else {
      orgsDetailStore.setDetail(orgsFormStore.uuid || orgsFormStore.p_uuid);
    }
  }
});
// 跳转编辑
const toEdit = (item) => {
  orgsFormStore.update({
    uuid: orgsDetailStore.detail?.uuid,
    isEdit: true,
    isAddMember:!!orgsDetailStore.detail.is_pid
  })
  navigationTo('/orgs/addOrgs')
}

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
