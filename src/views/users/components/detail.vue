<template>
  <a-spin :spinning="loading">
    <ul class="orgs-info">
      <li>
        <a-button v-if="showEdit" type="cyan" shape="round" class="edit" @click="toEdit">{{ t('编辑') }}</a-button>
        <div class="avatar-box">
          <vco-avatar :src="detail?.avatar" :size="100"></vco-avatar>
        </div>
       
        <p>
            <span class="label">
              ID:
            </span>
            <span class="value">{{ detail?.username }}</span>
          </p>
      </li>
      <li>
        <p>{{ t('详情') }}</p>
        <!-- 人员 -->

          <p>
            <span class="label">
              <i class="iconfont" >&#xe632;</i>
              {{ t('名称') }}:
            </span>
            <span class="value">{{ detail?.user_name }}</span>
          </p>
          <p>
            <span class="label"><i class="iconfont" :class="{ cer: detail?.email_ok }">&#xe66f;</i>{{ t('邮箱') }}: </span>
            <span class="value">{{ detail?.email }}</span>
          </p>
          <p>
            <span class="label"><i class="iconfont" :class="{ cer: detail?.mobile_ok }">&#xe678;</i>{{ t('手机号') }}: </span>
            <span class="value" v-if="detail?.mobile">+{{ detail?.pre }} {{ detail?.mobile }}</span>
          </p>
       
      </li>
      <li v-if="detail?.roles.length">
        <p >
            <span class="label"><i class="iconfont">&#xe8db;</i></span>
            <span class="value mr-2" v-for="item in detail?.roles" :key="item">{{ item }}</span>
          </p>
      </li>
    </ul>
  </a-spin>
</template>

<script setup>
import { ref, watch,computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { navigationTo } from '@/utils/tool';
import { getUserInfo } from '@/api/users';
const route = useRoute();

const { t } = useI18n();
const emit = defineEmits(['getDetail']);
const detail = ref(null);
const loading = ref(false);

const props = defineProps({
  showEdit: {
    type: Boolean,
    default: true
  }
});

// 跳转编辑
const toEdit = (item) => {
  navigationTo({ path: '/users/edit', query: { uuid: route.query.uuid } });
};

const updateDetail = () => {
  loading.value = true;
  getUserInfo({ uuid: route.query.uuid })
    .then((res) => {
      detail.value = res;
      emit('getDetail', res);
    })
    .finally((_) => {
      loading.value = false;
    });
};

// 监听重置idcard 公用字段
watch(
  () => route.query.uuid,
  (val, old) => {
    if (val) {
      updateDetail();
    }
  },
  { deep: true, immediate: true }
);

// 暴露方法给父组件
defineExpose({
  updateDetail
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.orgs-info {
  li {
    padding: 10px 15px;
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
      word-wrap: break-word;
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
