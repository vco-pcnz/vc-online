<template>
    <a-image src="http://vco.com/uploads/images/avatar/20241127/0ea88a8eab11af46206.jpeg" />
  <div class="base-card">
    <p class="id_async">
      <span>ID {{ baseInfo.id }}</span>
      <a-popconfirm title="Are you sure you want to sync the project transactions with Xero?" okText="confirm">
        <template #icon>
          <CheckCircleOutlined :style="{ color: '#a9ad57' }" />
        </template>
        <img :width="58" :height="14" :src="xeroImg" alt="Xero" />
      </a-popconfirm>
    </p>
    <p class="text-2xl name">{{ baseInfo.name }}</p>
    <p class="purpose">
      <span v-for="item in baseInfo.purpose" :key="item">
        {{ item }}
      </span>
    </p>
    <p>{{ baseInfo.background }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import xeroImg from '@/assets/images/xero.png';

const { t } = useI18n();
const baseInfo = ref({
  id: 1614,
  name: 'test1212',
  purpose: ['Construction'],
  background: 'xxx'
});
const props = defineProps([]);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.base-card {
    padding: 30px;
  font-size: 14px;
  color: @color_grey;

  .id_async {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    > span {
      font-weight: 600;
      font-size: 12px;
      line-height: 1.45;
      letter-spacing: 1px;
    }
  }

  .name {
    font-weight: 500;
    line-height: 1.2;
    margin-bottom: 12px;
    color: @clr_charcoal;
  }

  .purpose {
    margin-bottom: 6px;
  }
}
</style>
