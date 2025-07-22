<template>
  <div class="table-content">
    <div class="table-block">
      <ul class="table-col header">
        <li class="check">
          <a-checkbox v-model:checked="noticeStore.checkedAll" @change="checkedAllHandle"></a-checkbox>
        </li>
        <li>
          <a-button type="cyan" @click="handleMarkRead" :disabled="!noticeStore.selectedNoticeIds.length">
            {{ t('标记已读') }}
          </a-button>
        </li>
        <li>
          <a-button type="cyan" @click="handleAllRead" :disabled="!noticeList.length">
            {{ t('全部已读') }}
          </a-button>
        </li>
      </ul>
      <div v-if="noticeList.length" class="table-body">
        <template v-for="item in noticeList" :key="item.id">
          <ul class="table-col tr">
            <li class="check">
              <a-checkbox v-model:checked="item.checked" :disabled="item.look === 1" @change="itemcheck"></a-checkbox>
            </li>
            <li :class="`notice-info ${item.look > 0 ? 'mark-read' : ''}`" @click="handleDetail(item)">
              <h3 class="title">{{ item.title }}</h3>
              <div class="flex items-end fs_xs" style="opacity: 0.4">
                <p :title="item.describe" class="content text-ellipsis overflow-hidden whitespace-normal line-clamp-1 flex-1">{{ item.describe }}</p>
                <div style="flex: 0 0 140px" class="text-right">{{ item.create_time }}</div>
              </div>
            </li>
          </ul>
        </template>
        <a-pagination show-quick-jumper show-size-changer :hideOnSinglePage="true" :total="total" :show-total="(total) => t('共{0}条', [total])" @change="handlePageChange" />
      </div>
      <a-empty v-else :image="simpleImage" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Empty } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { useNoticeStore } from '@/store';

const noticeStore = useNoticeStore();
const noticeList = computed(() => noticeStore.noticeList);
const total = computed(() => noticeStore.total);

const { t } = useI18n();

const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

const itemcheck = () => {
  noticeStore.setNoticeCheck();
};

const checkedAllHandle = (e) => {
  const flag = e.target.checked;
  noticeStore.setAllNoticeCheck(flag);
};

const handleMarkRead = () => {
  noticeStore.updateNoticeStatus({ ids: noticeStore.selectedNoticeIds });
};

const handleAllRead = () => {
  noticeStore.setAllRead();
};

const handleDetail = (item) => {
  noticeStore.setShowDetail(true);
  noticeStore.getNoticeDetail(item.id);
};

const handlePageChange = (current, size) => {
  noticeStore.setPaginate(current, size);
  noticeStore.getNoticeList();
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.table-content {
  border-top: 1px solid @clr_stone1;
  padding-left: 5px;
}

.table-col {
  display: flex;
  align-items: center;
  font-size: 12px;

  &.header {
    border-bottom: 1px solid @clr_stone1;
    padding: 12px 0;
  }

  > li {
    margin-right: 16px;
  }

  &.tr {
    border-radius: 10px;
    margin-top: 10px;
    transition: all 0.3s ease;
  }

  .notice-info {
    flex: 1;
    background-color: @clr_card_bg;
    border: 1px solid #e2e5e2;
    border-radius: 10px;
    padding: 6px 15px;

    .title {
      font-weight: 600;
    }

    &:hover {
      cursor: pointer;
      border-color: @colorPrimary;
    }
  }

  .mark-read {
    color: @clr_stone1;
  }
}
</style>
