<template>
  <div class="folder">
    <a-button class="add uppercase" type="brown" shape="round" size="small" @click="updateAddModel('0')">{{ t('添加') }}</a-button>
    <div
      class="folder-item"
      v-for="(item, index) in data"
      :class="{ active: activeIndex == index, disabled: item.status == 0 }"
      :key="item.id"
      @click="setActiveIndex(index)"
    >
      <div>
        <span class="serial-number">{{ tabIndex + 1 }}.{{ index + 1 }}</span>
        <span>{{ item.name }}</span>
        <span class="num">・{{ item.attach_count }}</span>
      </div>
      <div>
        <i class="iconfont delete mr-2" @click="updateAddModel('0', item)">&#xe790;</i>
        <i class="iconfont delete mr-2" @click="updateAddModel(item.id, item)">&#xe8cf;</i>
        <a-popconfirm title="Are you sure delete this task?" ok-text="Yes" cancel-text="No" @confirm="remove(item.id, index)">
          <a href="#" @click.stop class="iconfont delete">&#xe8c1;</a>
        </a-popconfirm>
      </div>
    </div>
    <Add :formParams="formParams" v-model:visible="visibleAdd" @change="change(activeIndex)"></Add>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { annexRemove } from '@/api/project/annex';
import Add from './add.vue';

const { t } = useI18n();
const emits = defineEmits(['update:active', 'change']);

const props = defineProps({
  active: {
    type: Number
  },
  data: {
    type: Array,
    default: false
  },
  tabIndex: {
    type: Number
  },
  apply_uuid: {
    type: String
  },
  pid: {
    type: Number
  }
});

const visibleAdd = ref(false);
const formParams = ref();
const activeIndex = ref(0);

const setActiveIndex = (index) => {
  if (!props.data[index].status) return;
  activeIndex.value = index;
  emits('update:active', index);
};

const updateAddModel = (id, item) => {
  formParams.value = {
    id: id,
    pid: id == '0' && item ? item.id : props.pid,
    apply_uuid: props.apply_uuid,
    name: id == '0' ? '' : item.name
  };
  visibleAdd.value = true;
};

const change = (findex) => {
  emits('change', findex);
};

const remove = (id, index) => {
  annexRemove({ id }).then((res) => {
    change(index == activeIndex.value ? 0 : activeIndex.value);
  });
};
watch(
  () => props.active,
  (val) => {
    activeIndex.value = props.active;
  }
);
</script>
<style lang="less">
@import '@/styles/variables.less';
.folder {
  background-color: #f7f9f8;
  border-radius: 10px;
  padding-bottom: 32px;
  padding-top: 50px;
  position: relative;
  &-item {
    cursor: pointer;
    display: flex;
    font-weight: 600;
    gap: 16px;
    justify-content: space-between;
    align-items: center;
    min-height: 40px;
    padding: 8px 24px 8px 8px;
    text-align: left;
    transition: background-color 0.2s cubic-bezier(0.215, 0.61, 0.355, 1);
    width: 100%;
    &:hover {
      background-color: hsla(35, 53%, 67%, 0.2);
    }

    &.active {
      background-color: #eef1f1;
    }
    .serial-number {
      color: #888;
      margin-right: 10px;
      text-align: right;
      width: 32px;
      display: inline-block;
    }

    .num {
      color: #569695;
      white-space: nowrap;
    }

    .delete {
      font-size: 12px;
      color: @color_brown;
    }
  }
  .add {
    position: absolute;
    right: 10px;
    top: 15px;
  }
}
</style>
