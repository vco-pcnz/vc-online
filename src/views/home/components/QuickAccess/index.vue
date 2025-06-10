<template>
  <a-spin :spinning="loading" size="large">
    <div class="flex justify-between title">
      <div class="bold fs_2xl">{{ t('快捷入口') }}</div>
      <div class="flex items-center cursor-pointer" @click="setting"><i class="iconfont">&#xe604;</i>{{ t('设置1') }}</div>
    </div>
    <div class="wrapper">
      <div class="item" v-for="(item, index) in myList" :key="index" @click="navigationTo(item.path)">
        <img class="icon" :src="item.icon" alt="" />
        <p>{{ item.name }}</p>
      </div>
    </div>
    <a-empty v-if="!myList.length && !loading" :image="simpleImage" style="min-height: 100px" />
  </a-spin>

  <a-modal :width="560" v-if="open" :open="open" :title="t('快捷入口')" @cancel="open = false" :footer="false" class="QuickAccessModal">
    <a-spin :spinning="loading" size="large">
      <div class="bold">{{ t('已添加') }}</div>
      <div class="wrapper">
        <div class="item" v-for="(item, index) in settingData" :key="index">
          <img class="icon" :src="item.icon" alt="" />
          <p>{{ item.name }}</p>
          <i class="iconfont add reduce" @click="handReduce(index)">&#xe620;</i>
        </div>
        <div style="text-align: center; width: 100%">
          <a-empty v-if="!settingData.length && !loading" :image="simpleImage" style="min-height: 100px" />
        </div>
      </div>
      <div class="bold">{{ t('列表') }}</div>
      <div class="wrapper">
        <div class="item" v-for="(item, index) in list" :key="index">
          <img class="icon" :src="item.icon" alt="" />
          <p>{{ item.name }}</p>
          <i class="iconfont add" v-if="showAdd(item)" @click="handAdd(item)">&#xe621;</i>
        </div>
      </div>
    </a-spin>

    <div class="flex justify-center mt-10">
      <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
        {{ t('确认') }}
      </a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Empty } from 'ant-design-vue';
import { navigationTo } from '@/utils/tool';
import { myQuick, quick, saveMyQuick } from '@/api/home/index';
import { cloneDeep } from 'lodash';

const { t } = useI18n();
const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

const open = ref(false);
const loading = ref(false);
const myList = ref([]);
const settingData = ref([]);
const list = ref([]);

const setting = () => {
  if (!list.value.length) geList();
  settingData.value = cloneDeep(myList.value);
  open.value = true;
};

const getMyQuick = () => {
  loading.value = true;
  myQuick()
    .then((res) => {
      myList.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

const geList = () => {
  loading.value = true;
  quick()
    .then((res) => {
      list.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

const showAdd = (val) => {
  return !settingData.value
    .map((item) => {
      return item.id;
    })
    .includes(val.id);
};

const handAdd = (val) => {
  settingData.value.push(val);
};

const handReduce = (index) => {
  settingData.value.splice(index, 1);
};
const save = () => {
  loading.value = ref(false);
  saveMyQuick({ ids: settingData.value.map((d) => d.id) })
    .then((res) => {
      getMyQuick();
      open.value = false;
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  getMyQuick();
});
</script>

<style lang="less" scoped>
.title {
  border-bottom: 1px solid #dbdbdb;
  padding: 8px 15px;
}
.wrapper {
  display: flex;
  flex-wrap: wrap;
  padding: 10px 22px;
  gap: 0 20px;
  .item {
    width: 90px;
    height: 90px;
    text-align: center;
    cursor: pointer;
    border: 1px solid transparent;
    &:hover {
      border: 1px solid #dbdbdb;
    }
    .icon {
      display: inline-block;
      width: auto;
      height: 30px;
      margin: 15px 0 5px;
    }
    p {
      line-height: 1;
    }
  }
}
.QuickAccessModal {
  .wrapper {
    gap: 25px;
    .item {
      border: 1px solid #dbdbdb;
      width: 90px;
      height: 90px;
      position: relative;
      .add {
        position: absolute;
        color: #f19915;
        font-size: 18px;
        top: -13px;
        right: -10px;
        &.reduce {
          color: #adadad;
        }
      }
    }
  }
}
</style>
