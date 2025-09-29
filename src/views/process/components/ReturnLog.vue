<template>
  <div class="block-item sec">
    <vco-process-title :title="t('退回记录')"></vco-process-title>
    <div ref="listContentRef" class="list-content">
      <div class="list-item" v-for="(item, index) in listData" :key="index">
        <h3>{{ item.name }}</h3>
        <p>{{ item.message }}</p>
        <div class="footer-info">
          <span>{{ item.create_user_name }}</span>
          <span>{{ tool.showTime(item.create_time) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import tool from "@/utils/tool"

  const { t } = useI18n();

  const props = defineProps({
    listData: {
      type: Array,
      default: () => []
    }
  })

  const listContentRef = ref()

  onMounted(() => {
    if (props.listData.length > 3) {
      listContentRef.value.style.height = '300px'
    }
  })
</script>

<style lang="less" scoped>
  .list-content {
    width: 100%;
    // height: 300px;
    overflow-y: scroll;
    overflow-x: hidden;
    margin-top: 10px;
    > .list-item {
      margin-top: 15px;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 15px;
      &:first-child {
        margin-top: 0;
      }
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      > h3 {
        font-weight: 500;
        color: #282828;
        font-size: 14px;
      }
      > p {
        font-size: 13px;
        color: #333;
        margin-top: 5px;
      }
      > .footer-info {
        display: flex;
        justify-content: space-between;
        font-size: 13px;
        color: #666;
        margin-top: 10px;
      }
    }
  }
</style>
