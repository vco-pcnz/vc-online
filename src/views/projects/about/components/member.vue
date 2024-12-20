<template>
  <div class="member-card">
    <div v-for="item in members" :key="item.label">
      <div class="member-row">
        <span>{{ item.label }}</span>
        <a-button type="primary" shape="round" v-if="!item.memberList.length"> associate </a-button>
        <a-button type="primary" shape="round" v-else>edit</a-button>
      </div>
      <div v-for="user in item.memberList" class="member-info" :key="user.id">
        <a-space>
          <vco-avatar :src="user.avatar" :size="24" class="avatar" />
          <span>{{ user.name }}</span>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps([]);
const members = ref([
  {
    label: 'BORROWER',
    memberList: []
  },
  {
    label: 'BROKER',
    memberList: []
  },
  {
    label: 'VC Team',
    memberList: [
      {
        id: 1,
        avatar: '',
        name: 'kk lm'
      },
      {
        id: 2,
        avatar: '',
        name: 'kk lv'
      }
    ]
  }
]);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.member-card {
  padding: 30px;
  border-top: 1px solid #e2e5e2;
  border-bottom: 1px solid #e2e5e2;

  .member-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }

  > div:nth-child(n + 2) {
    margin-top: 12px;
  }

  .member-info {
    padding-left: 4px;
    margin-top: 12px;
  }
}
</style>
