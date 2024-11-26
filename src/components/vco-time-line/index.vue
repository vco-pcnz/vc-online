<template>
  <div class="time-line-content">
    <div class="info-content">
      <div class="day">{{ t('开始日期') }}</div>
      <div class="num">{{ t('{0}天', [gapDate]) }}</div>
      <div class="day">{{ t('结束日期') }}</div>
    </div>
    <div class="info-content mt-2">
      <div class="day txt">{{ tool.showDate(openDate) }}</div>
      <div class="line">
        <template v-if="isList">
          <div class="line-list"></div>
        </template>
      </div>
      <div class="day txt">{{ tool.showDate(maturityDate) }}</div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { useI18n } from "vue-i18n";
  import tool from '@/utils/tool';

  const props = defineProps({
    openDate: {
      type: String,
      required: true
    },
    maturityDate: {
      type: String,
      required: true
    },
    isList: {
      type: Boolean,
      default: true
    }
  })

  const { t } = useI18n();

  const gapDate = ref()
  const getGapDate = () => {
    gapDate.value = tool.diffDate(props.openDate, props.maturityDate)
  }

  onMounted(() => {
    getGapDate()
  })
</script>

<style lang="less" scoped>
  @import "@/styles/variables.less";

  .time-line-content {
    width: 100%;
    > .info-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #888;
      font-size: 12px;
      > .day {
        width: 50px;
        &.txt {
          width: 75px;
          color: #282828;
          font-weight: 500;
          font-size: 13px;
        }
        &:last-child {
          text-align: right
        }
      }
      .num {
        color: @colorPrimary;
        font-weight: 500;
        position: relative;
        top: 8px;
      }
      .line {
        flex: 1;
        padding: 0 5px;
        .line-list {
          width: 100%;
          height: 3px;
          border-radius: 3px;
          background-color: #d5d5d5;
        }
      }
    }
  }
</style>