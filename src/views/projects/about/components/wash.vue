<template>
  <ul class="wash">
    <li class="wash-item flex items-center" v-for="item in list" :key="item">
      <div style="width: 30px">
        <vco-avatar :src="item.avatar" :size="30" class="avatar" />
      </div>
      <div>
        <p class="name">{{ item.name }}</p>
        <span class="cer" v-if="item.cate == 1">{{ t('借款人') }}</span>
        <span class="cer" v-if="item.cate == 2">{{ t('担保人') }}</span>
        <span class="cer" v-if="item.cate == 3">{{ t('投资人') }}</span>
      </div>
    </li>
  </ul>
  <div class="mt-5">
    <washTableModal :currentId="currentId"><a-button type="brown" shape="round" size="small">More</a-button></washTableModal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import washTableModal from './washTableModal.vue';
import { projectDetailGetWash } from '@/api/project/wash';

const { t } = useI18n();

const props = defineProps(['currentId']);

const list = ref([]);

watch(
  () => props.currentId,
  (val) => {
    if (val) {
      projectDetailGetWash({ uuid: props.currentId, page: 1, limit: 10 }).then((res) => {
        list.value = res.data;
      });
    }
  },
  {
    immediate: true
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.wash {
  .wash-item {
    gap: 10px;
    line-height: 1;
    margin-bottom: 10px;
    .name {
      font-size: 12px;
      font-weight: bold;
    }
    .cer {
      font-size: 10px;
      color: #bf9425;
    }
  }
}
</style>
