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
        <span class="cer" v-if="item.cate == 4">{{ t('受托人') }}</span>
        <span class="cer" v-if="item.cate == 9">{{ t('其他') }}</span>
      </div>
    </li>
  </ul>
  <div class="mt-5" v-if="hasPermission('projects:orgs:review')">
    <a-button type="brown" shape="round" @click="navigationTo(`${mode}/projects/orgs?uuid=` + currentId)" size="small">More</a-button>
  </div>
</template>

<script setup>
import { ref, watch,computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { projectDetailGetWash } from '@/api/project/wash';
import { navigationTo } from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';
import { useUserStore } from '@/store';

const { t } = useI18n();

const props = defineProps(['currentId']);

const list = ref([]);

const pageRole = computed(() => useUserStore().pageRole);
const mode = pageRole.value ? '/' + pageRole.value.toLowerCase() : '';

watch(
  () => props.currentId,
  (val) => {
    if (val) {
      projectDetailGetWash({ uuid: props.currentId, page: 1, limit: 5 }).then((res) => {
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
