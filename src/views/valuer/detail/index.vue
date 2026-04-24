<template>
  <div>
    <vco-page-panel :title="project_name" w="200px" :isBack="true"></vco-page-panel>
    <!-- <div class="tab flex">
      <div class="tab-item flex items-center active">
        <i class="iconfont">&#xe771;</i>
        AML documents
      </div>
    </div> -->
    <!-- -->
    <Documents v-if="project_id" :project_id="project_id" __way__="valuer" :annex_id="'annex_id'" :edit="false"></Documents>
    
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTableList } from '@/hooks/useTableList';
import { navigationTo } from '@/utils/tool';
import useProductStore from '@/store/modules/product';
import { getUserList, getRoles } from '@/api/users';
import Documents from '@/components/documents/index.vue';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

const { t } = useI18n();

const project_name = ref('')
const project_id = ref('')
onMounted(() => {
  project_name.value = route.query.name;
  project_id.value = route.query.uuid;
})

</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.tab {
  &-item {
    gap: 8px;
    border-radius: 24px;
    font-weight: 600;
    height: 36px;
    padding-left: 12px;
    padding-right: 12px;
    transition: all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
    cursor: pointer;
    margin-bottom: 20px;

    .icon {
      width: 20px;
      height: 20px;

      &.icon2 {
        display: none;
      }
    }

    &.active {
      background-color: @color_variation;
    }

    &:hover {
      color: @color_brown;

      .icon {
        display: none;

        &.icon2 {
          display: block;
        }
      }
    }

    &.disabled {
      color: #181818;
      opacity: 0.3;

      .icon {
        display: block;

        &.icon2 {
          display: none;
        }
      }
    }

    &.search {
      display: flex;
      align-items: center;
      transition: all 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);

      .iconfont {
        font-size: 16px;
      }

      span {
        overflow: hidden;
        transition: 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
        transition-property: width, opacity;
        width: 0;
      }

      &.active span {
        opacity: 1;
        width: 53px;
      }
    }
  }
}
</style>
