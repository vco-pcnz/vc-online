<template>
  <a-spin :spinning="pageLoading" size="large">
    <ul class="step list-content" @scroll="scrollHandle">
      <li class="step-item" v-for="item in listData" :key="item">
        <div class="flex justify-between items-center">
          <div class="content flex items-center">
            <i class="iconfont">&#xe725;</i>
            <span>{{ item.message }}</span>
          </div>
          <span class="date">{{ tool.showDate(item.create_time, 'DD/MM/YY') }}</span>
        </div>
        <span class="create_user_name">{{ item.create_user_name }}</span>
      </li>
      <vco-more-loading v-if="listData.length" :has-more="hasMore" :loading="loading"></vco-more-loading>
    </ul>
  </a-spin>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import tool from '@/utils/tool';
import { historyList } from '@/api/project/project';

const props = defineProps(['currentId']);
const pageLoading = ref(false);

const pageInfo = reactive({
  page: 1,
  limit: 5
})
const listData = ref([])
const loading = ref(false)
const hasMore = ref(true)

const getListData = (flag) => {
  if (flag) {
    pageInfo.page = 1
    listData.value = []
    hasMore.value = true
  }

  if (loading.value || !hasMore.value) { return }

  if (pageInfo.page === 1) {
    pageLoading.value = true
  }

  loading.value = true

  historyList({
    uuid: props.currentId,
    ...pageInfo
  }).then(res => {
    const total = res.count || 0
    const data = res.data || []
    pageLoading.value = false
    loading.value = false

    listData.value = pageInfo.page === 1 ? data : [...listData.value, ...data]
    pageInfo.page += 1
    hasMore.value = total > listData.value.length

  }).catch(() => {
    pageLoading.value = false
    loading.value = false
  })
}

const scrollHandle = (event) => {
  const el = event.target;
  const scrollTop = el.scrollTop;
  const scrollHeight = el.scrollHeight;
  const clientHeight = el.clientHeight;

  // 距离底部距离
  const distanceToBottom = scrollHeight - scrollTop - clientHeight;

  if (distanceToBottom <= 5) {
    getListData()
  }
}

watch(
  () => props.currentId,
  (val) => {
    if (val) {
      getListData(true)
    }
  },
  {
    immediate: true
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.step {
  padding-right: 10px;
  &.list-content {
    height: 300px;
    overflow-y: scroll;
    overflow-x: hidden;
  }
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
        position: relative;
        z-index: 2;
        background: #f7f9f8;
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
      // height: 24px;
      bottom: -24px;
      left: 5.5px;
      position: absolute;
      top: 2px;
      width: 1px;
    }
  }
  .create_user_name {
    color:#888;
    font-size: 10px;
    position: relative;
    top: -10px;
    left: 19px;
    text-align: right;
  }
}
</style>
