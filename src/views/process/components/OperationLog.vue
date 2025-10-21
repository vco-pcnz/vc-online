<template>
  <div>
    <div v-if="listData.length" class="mt-6">
      <div class="block-item sec">
        <vco-process-title :title="t('操作记录')"></vco-process-title>

        <a-spin :spinning="pageLoading" size="large">
          <div ref="logContentRef" class="log-content" :class="{'no-data': !listData.length}" @scroll="scrollHandle">
            <template v-if="listData.length">
              <div v-for="(item, index) in listData" :key="index" class="log-item">
                <div class="icon">
                  <i v-if="item.type === 'add'" class="iconfont">&#xe889;</i>
                  <i v-if="item.type === 'check'" class="iconfont">&#xe8c5;</i>
                  <i v-if="item.type === 'save'" class="iconfont">&#xe8cf;</i>
                  <i v-if="item.type === 'edit'" class="iconfont">&#xe8cf;</i>
                  <i v-if="item.type === 'delete'" class="iconfont">&#xe8c1;</i>
                </div>
                <div class="info">
                  <p>{{ tool.showTime(item.create_time) }}</p>
                  <div>{{ item.create_user_name }} {{ item.message }}</div>
                </div>
              </div>
            </template>
            <vco-more-loading v-if="listData.length" :has-more="hasMore" :loading="loading"></vco-more-loading>
          </div>
        </a-spin>
      </div>
    </div>
  </div>
  
</template>

<script setup>
  import { ref, reactive, onMounted, onUnmounted, nextTick } from "vue";
  import { useI18n } from "vue-i18n";
  import { auditHistoryList, projectDetailHistoryList } from "@/api/process";
  import emitter from "@/event"
  import tool from "@/utils/tool"

  const props = defineProps({
    currentId: {
      type: [Number, String],
      default: ''
    },
    isDetails: {
      type: Boolean,
      default: false
    }
  })

  const { t } = useI18n();

  const pageInfo = reactive({
    page: 1,
    limit: 10
  })
  const listData = ref([])
  const loading = ref(false)
  const hasMore = ref(true)
  const pageLoading = ref(false)

  const logContentRef = ref()

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

    const ajaxFn = props.isDetails ? projectDetailHistoryList : auditHistoryList
    ajaxFn({
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

      nextTick(() => {
        if (total > 3) {
          logContentRef.value.style.height = '300px'
        }
      })
      
    }).catch(() => {
      pageLoading.value = false
      loading.value = false
    })
  }

  // 绑定事件
  const handleRefresh = () => {
    getListData(true);
  };

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

  onMounted(() => {
    getListData(true)
    emitter.on('refreshAuditHisList', handleRefresh)
  })

  onUnmounted(() => {
    // 移除事件监听
    emitter.off('refreshAuditHisList', handleRefresh);
  })
</script>

<style lang="less" scoped>
  .log-content {
    width: 100%;
    // height: 300px;
    overflow-y: scroll;
    overflow-x: hidden;
    margin-top: 10px;
    &.no-data {
      overflow: hidden;
      height: 100px;
    }
    .log-item {
      display: flex;
      position: relative;
      padding-bottom: 20px;
      &::after {
        content: '';
        display: block;
        width: 2px;
        height: 100%;
        background-color: #0bda8e;
        position: absolute;
        left: 14px;
        z-index: 1;
      }
      &:nth-last-child(2),
      &:last-child {
        &::after {
          display: none;
        }
      }
      > .icon {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: #0bda8e;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
      }
      > .info {
        flex: 1;
        padding-left: 15px;
        > p {
          color: #666;
          font-size: 13px;
        }
        > div {
          font-size: 13px;
          margin-top: 2px;
        }
      }
    }
    .no-data-content {
      color: #999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>