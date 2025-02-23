<template>
  <div>
    <div v-if="listData.length" class="mt-6">
      <div class="block-item sec">
        <vco-process-title :title="t('操作记录')"></vco-process-title>

        <a-spin :spinning="pageLoading" size="large">
          <div class="log-content" :class="{'no-data': !listData.length}">
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
                  <p>{{ item.create_time }}</p>
                  <div>{{ item.create_user_name }} {{ item.message }}</div>
                </div>
              </div>
            </template>
            <template v-if="!pageLoading && !listData.length">
              <div class="no-data-content log-content no-data">{{ t('暂无操作记录') }}</div>
            </template>
          </div>
        </a-spin>
      </div>
    </div>
  </div>
  
</template>

<script setup>
  import { ref, onMounted, onUnmounted } from "vue";
  import { useI18n } from "vue-i18n";
  import { auditHistoryList, projectDetailHistoryList } from "@/api/process";
  import emitter from "@/event"

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

  const listData = ref([])

  const pageLoading = ref(false)
  const getListData = () => {
    pageLoading.value = true
    const ajaxFn = props.isDetails ? projectDetailHistoryList : auditHistoryList
    ajaxFn({
      uuid: props.currentId
    }).then(res => {
      listData.value = res
      pageLoading.value = false
    }).catch(() => {
      pageLoading.value = false
    })
  }

  // 绑定事件
  const handleRefresh = () => {
    getListData();
  };

  onMounted(() => {
    getListData()
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
    height: 300px;
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
      &:last-child {
        padding-bottom: 0;
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