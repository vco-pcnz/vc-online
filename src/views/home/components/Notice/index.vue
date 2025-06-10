<template>
  <a-spin :spinning="loading" size="large">
    <div class="flex justify-between title items-center">
      <div class="bold fs_2xl">
        {{ t('通知') }}
      </div>
      <div class="cursor-pointer" @click="navigationTo('/profile/notice')">{{ t('更多') }}</div>
    </div>
    <div class="wrapper">
      <div class="item cursor-pointer" v-for="(item, index) in list" :key="index" @click="getDetail(item.id)">
        <h3 class="tit">{{ item.title }}</h3>
        <p class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ item.describe }}</p>
      </div>
      <div style="text-align: center; width: 100%">
        <a-empty v-if="!list.length && !loading" :image="simpleImage" style="min-height: 100px" />
      </div>
    </div>
  </a-spin>

  <a-modal :width="550" :open="open" :title="noticeDetail?.title" @cancel="open = false" :footer="false" class="QuickAccessModal">
    <div class="header">
      <div>{{ noticeDetail?.create_time }}</div>
    </div>
    <div class="content rich-text-content" v-html="noticeDetail?.content"></div>
  </a-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Empty } from 'ant-design-vue';
import { navigationTo } from '@/utils/tool';
import { getNotices, getNoticeDetail, setNoticeRead } from '@/api/notice';

const { t } = useI18n();
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

const list = ref([]);
const loading = ref(false);
const open = ref(false);

const geList = () => {
  loading.value = true;
  getNotices({ sta: '0', limit: 3, key: 'unread' })
    .then((res) => {
      list.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

const noticeDetail = ref();

const getDetail = (id) => {
  getNoticeDetail({ id, sta: '0' }).then((res) => {
    noticeDetail.value = res;
    if (!res.look) {
      setNoticeRead({ ids: [id] }).then((res) => {
        geList();
      });
    }
    open.value = true;
  });
};

onMounted(() => {
  geList();
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.title {
  border-bottom: 1px solid #dbdbdb;
  padding: 8px 15px;
}
.wrapper {
  padding: 10px;
  .item {
    flex: 1;
    background-color: #fbfbfb;
    border: 1px solid #e2e5e2;
    border-radius: 10px;
    padding: 6px 10px;
    margin-bottom: 10px;
    &:nth-child(3n) {
      margin-bottom: 0;
    }

    .tit {
      font-weight: 600;
    }

    &:hover {
      cursor: pointer;
      border-color: @colorPrimary;
    }
  }
}

.content {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid @clr_stone1;
}
</style>
