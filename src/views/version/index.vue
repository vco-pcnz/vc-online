<template>
  <vco-page-panel :title="t('版本记录')" :isBack="true"></vco-page-panel>
  <div class="version-page">
    <a-timeline>
      <a-timeline-item v-for="(item, index) in list" :key="item.id">
        <div class="date" :class="[{ active: !index }]">{{ item.date }}</div>
        <a-collapse v-model:activeKey="item.openId">
          <template #expandIcon="{ isActive }">
            <RightOutlined style="position: absolute; right: 10px" :rotate="isActive ? 90 : 0" />
          </template>
          <a-collapse-panel :key="item.id">
            <template #header>
              <p>
                <span style="font-weight: bold; margin-right: 10px; font-size: 16px">{{ item.version }}</span
                ><span>{{ item.title }}</span>
              </p>
            </template>
            <div class="rich-text-content" v-html="item.content || ''"></div>
          </a-collapse-panel>
        </a-collapse>
      </a-timeline-item>
    </a-timeline>
    <div class="mt-5" style="padding-right: 115px" v-if="total">
      <a-pagination size="small" :total="total" :pageSize="pagination.limit" :current="pagination.page" :show-size-changer="false" show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="setPaginate" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { versionList } from '@/api/system';
import { RightOutlined } from '@ant-design/icons-vue';

const { t } = useI18n();

const total = ref(0);
const loading = ref(true);
const pagination = ref({
  page: 1,
  limit: 10
});

const list = ref([]);

const loadData = () => {
  loading.value = true;
  versionList({ ...pagination.value })
    .then((res) => {
      if (!list.value.length && res.count) {
        res.data[0]['openId'] = res.data[0].id
      }
      list.value = res.data;
      total.value = res.count;
    })
    .finally(() => {
      loading.value = false;
    });
};

const setPaginate = (page, limit) => {
  pagination.value = {
    page,
    limit
  };
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<style lang="less">
@import '@/styles/variables.less';
.version-page {
  padding-left: 145px;
  padding-right: 30px;
  .date {
    position: absolute;
    left: -140px;
    top: 6px;
    background: #dbdbdb;
    padding: 5px 10px;
    border-radius: 4px;
    color: #fff;
    &::after {
      display: inline-block;
      content: '';
      position: absolute;
      right: -5px;
      top: 10px;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 6px solid #dbdbdb;
    }
    &.active {
      background: #f19915;
      &::after {
        border-left: 6px solid #f19915;
      }
    }
  }
  .ant-timeline .ant-timeline-item-content {
    inset-block-start: -18px !important;
  }
  .ant-collapse > .ant-collapse-item:last-child,
  :where(.css-dev-only-do-not-override-4tb0ys).ant-collapse > .ant-collapse-item:last-child > .ant-collapse-header {
    border-radius: 8px;
  }
  .rich-text-content {
    padding: 0 10px;
  }
}
</style>
