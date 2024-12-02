<template>
  <div> 
    <div style="display: inline-block" @click="open = true">
      <slot>
      </slot>
    </div>
    <a-modal
        :width="600"
        v-if="open"
        :open="open"
        :footer="null"
        @cancel="open = false"
        class="sys-form-content"
      >
      <ul class="orgs-info">
        <li>
          <div class="avatar-box">
            <vco-avatar :src="detail?.avatar" :size="100"></vco-avatar>
          </div>
          <p>
            <span class="label"><i class="iconfont" :class="{ cer: detail?.name }">&#xe679;</i></span>
            <span class="value">{{ detail?.name }}</span>
          </p>
        </li>
        <li>
          <p>{{ t('详情') }}</p>
          <p>
            <span class="label"><i class="iconfont">&#xe656;</i>{{t('工作')}}: </span>
            <span class="value">{{ detail?.job }}</span>
          </p>
          <p>
            <span class="label"><i class="iconfont" :class="{ cer: detail?.idcard }">&#xe679;</i>{{ t('身份证号码') }}: </span>
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
        </li>
        <li v-if="detail?.document && detail?.document.length">
          <p>{{ t('证件f') }}</p>
          <vco-file-item :file="item" :time="detail?.expire_time[index]" v-for="(item,index) in detail?.document" :key="index"></vco-file-item>
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
    
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted,watch } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const props = defineProps({
  detail: {
    type:Object
  }
});
const open = ref(false)

onMounted(() => {
  // 加载数据

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
