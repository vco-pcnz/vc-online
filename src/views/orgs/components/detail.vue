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
            <i class="iconfont" :class="{ cer: detail?.name }" v-if="detail?.type == 20">&#xe632;</i>
            <i class="iconfont" :class="{ cer: detail?.name }" v-else>&#xe679;</i>
          </span>
          <span class="value">{{ detail?.name }}</span>
        </p>
      </li>
      <li>
        <p>{{ t('详情') }}</p>
        <!-- 人员 -->

        <p>
          <span class="label">
            <i class="iconfont">&#xe656;</i>
            {{ t('工作') }}:
          </span>
          <span class="value" v-if="!!detail?.job">{{ detail?.job.join('/') }}</span>
        </p>
        <template v-if="detail?.type == 20">
          <p>
            <span class="label">
              <i class="iconfont" :class="{ cer: detail?.idcard }">&#xe679;</i>
              {{ t('身份证号码') }}:
            </span>
            <span class="value">{{ detail?.idcard }}</span>
          </p>
          <p>
            <span class="label"><i class="iconfont" :class="{ cer: detail?.email_ok }">&#xe66f;</i>{{ t('邮箱') }}: </span>
            <span class="value">{{ detail?.email }}</span>
          </p>
          <p>
            <span class="label"><i class="iconfont" :class="{ cer: detail?.mobile_ok }">&#xe678;</i>{{ t('手机号') }}: </span>
            <span class="value" v-if="detail?.mobile">+{{ detail?.pre }} {{ detail?.mobile }}</span>
          </p>
        </template>
        <!-- 其他 -->
        <template v-else>
          <p>
            <span class="label"><i class="iconfont">&#xe65b;</i>NZBZ: </span>
            <span class="value">{{ detail?.nzbz }}</span>
          </p>
          <p v-if="detail.type !== 2 && detail.type !== 3">
            <span class="label"><i class="iconfont">&#xe6e3;</i>{{ t('组织机构代码f') }}: </span>
            <span class="value">{{ detail?.idcard }}</span>
          </p>
          <p>
            <span class="label"><i class="iconfont">&#xe610;</i>{{ t('联系人f') }}: </span>
            <span class="value">{{ detail?.contactName }}</span>
          </p>

          <p>
            <span class="label"><i class="iconfont" :class="{ cer: detail?.email_ok }">&#xe66f;</i>{{ t('邮箱') }}: </span>
            <span class="value">{{ detail?.email }}</span>
          </p>
          <p>
            <span class="label"><i class="iconfont" :class="{ cer: detail?.mobile_ok }">&#xe678;</i>{{ t('手机号') }}: </span>
            <span class="value" v-if="detail?.mobile">+{{ detail?.pre }} {{ detail?.mobile }}</span>
          </p>
          <p v-if="Boolean(detail?.addr)">
            <span class="label"><i class="iconfont">&#xe814;</i>{{ t('地址1') }}: </span>
            <span class="value">{{ detail?.addr }}</span>
          </p>
          <p v-if="Boolean(detail?.address)">
            <span class="label"><i class="iconfont">&#xe814;</i>{{ t('地址2') }}: </span>
            <span class="value">{{ detail?.address }}</span>
          </p>
          <p v-if="Boolean(detail?.city)">
            <span class="label"><i class="iconfont">&#xe814;</i>{{ t('地址') }}: </span>
            <span class="value">{{ detail?.city }}</span>
          </p>
          <p>
            <span class="label"><i class="iconfont">&#xe608;</i>{{ t('邮编') }}: </span>
            <span class="value">{{ detail?.postal }}</span>
          </p>
        </template>
      </li>
      <li v-if="trim(detail?.document)">
        <p>{{ t('证件f') }}</p>
        <vco-file-item :file="item" :time="detail?.expire_time[index]" v-for="(item, index) in detail?.document" :key="index"></vco-file-item>
      </li>
      <li>
        <p>
          <span class="label"><i class="iconfont">&#xe690;</i></span>
          <span class="cer"> {{ detail?.open_count }} {{ t('进行中项目') }} </span>
        </p>
        <p style="padding-left: 20px">
          <span class="label"> {{ detail?.close_count }} {{ t('已关闭项目') }} </span>
        </p>
        <p>
          <span class="label"><i class="iconfont">&#xe751;</i></span>
          <span class="cer">{{ detail?.apply_count }} {{ t('请求') }}</span>
        </p>
      </li>
    </ul>
  </a-spin>
</template>

<script setup>
import { ref, watch,computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { trim } from 'lodash';
import { useRoute } from 'vue-router';
import { navigationTo } from '@/utils/tool';
import { getDetail } from '@/api/orgs';
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
  navigationTo({ path: '/orgs/form/edit', query: { uuid: route.query.uuid } });
};

const updateDetail = () => {
  loading.value = true;
  getDetail({ id: route.query.uuid })
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
