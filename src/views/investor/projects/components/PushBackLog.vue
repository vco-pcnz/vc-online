<template>
  <div class="inline" @click="init">
    <slot><i class="iconfont" title="Push back history">&#xe76c;</i></slot>
  </div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="600" :open="visible" title="Push back history" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <div style="max-height: 400px; overflow-y: auto; padding: 0 10px">
          <ul class="list" v-for="(item, index) in data" :key="index">
            <li>
              <span class="name">
                {{ item.name }}
              </span>
            </li>
            <li class="msg">{{ item.message }}</li>
            <li class="flex justify-between items-center">
              <span class="create_user_name">
                {{ item.create_user_name }}
              </span>
              <span class="date">
                {{ tool.showTime(item.create_time) }}
              </span>
            </li>
          </ul>
        </div>

        <a-empty v-if="!data || !data.length" />
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';

const { t } = useI18n();
const props = defineProps({
  data: {
    type: Array
  }
});

const visible = ref(false);

const updateVisible = (value) => {
  visible.value = value;
};

const init = () => {
  visible.value = true;
};

// 暴露方法给父组件
defineExpose({
  init
});
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 24px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 24px 72px;
      .list {
        padding: 16px;

        background: #fafafa;
        &:not(:last-child) {
          border-bottom: 1px solid #e2e5e2;
        }
        .name {
          font-size: 14px;
          font-weight: 500;
          color: #282828;
        }
        .date {
          font-size: 12px;
          color: #666;
        }
        .msg {
          font-size: 14px;
          color: #333;
          margin: 8px 0;
        }
        .create_user_name {
          font-size: 12px;
          text-align: right;
          color: #666;
        }
      }
    }
  }
}
</style>
