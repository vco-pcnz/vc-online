<template>
  <a-modal
    :width="500"
    :open="visible"
    :title="t(title)"
    :closable="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
    @ok="save"
  >
    <!-- 人员选择 -->
    <vco-choose-user ref="vcoChooseUserRef" :isMultiple="true">
      <div></div>
    </vco-choose-user>
    <div class="form-content">
      <!-- 绑定贷款经理 -->
      <template v-if="type === 1">
        <div class="form-item">
          <div class="title">
            <p>{{ t('贷款经理') }}</p>
            <a-button
              type="dark"
              size="small"
              shape="round"
              class="uppercase"
              @click="openUserSelect"
            >{{ t('添加') }}</a-button>
          </div>
          <div class="content">
            <template v-if="lmSelData.length">
              <div
                v-for="(item, index) in lmSelData"
                :key="index"
                class="user-item"
              >
                <vco-user-item :data="item" :main="true"></vco-user-item>
                <i class="iconfont" @click="removeItem(index, 1)">&#xe77d;</i>
              </div>
            </template>
          </div>
        </div>
        <div class="form-item">
          <div class="title">
            <p>{{ t('贷款经理助理') }}</p>
            <a-button
              type="dark"
              size="small"
              shape="round"
              class="uppercase"
              @click="openUserSelect"
            >{{ t('添加') }}</a-button>
          </div>
          <div class="content">
            <template v-if="almSelData.length">
              <div
                v-for="(item, index) in almSelData"
                :key="index"
                class="user-item"
              >
                <vco-user-item :data="item" :main="true"></vco-user-item>
                <i class="iconfont" @click="removeItem(index, 2)">&#xe77d;</i>
              </div>
            </template>
          </div>
        </div>
      </template>
      <!-- 绑定借款账号 -->
      <template v-if="type === 2">
        <div class="form-item">
          <div class="title">
            <p>{{ t('编辑者') }}</p>
            <a-button
              type="dark"
              size="small"
              shape="round"
              class="uppercase"
              @click="openUserSelect"
            >{{ t('添加') }}</a-button>
          </div>
          <div class="content">
            <template v-if="borrowerEditors.length">
              <div
                v-for="(item, index) in borrowerEditors"
                :key="index"
                class="user-item"
              >
                <vco-user-item :data="item" :main="true"></vco-user-item>
                <i class="iconfont" @click="removeItem(index, 3)">&#xe77d;</i>
              </div>
            </template>
          </div>
        </div>
        <div class="form-item">
          <div class="title">
            <p>{{ t('浏览者') }}</p>
            <a-button
              type="dark"
              size="small"
              shape="round"
              class="uppercase"
              @click="openUserSelect"
            >{{ t('添加') }}</a-button>
          </div>
          <div class="content">
            <template v-if="borrowerViewers.length">
              <div
                v-for="(item, index) in borrowerViewers"
                :key="index"
                class="user-item"
              >
                <vco-user-item :data="item" :main="true"></vco-user-item>
                <i class="iconfont" @click="removeItem(index, 4)">&#xe77d;</i>
              </div>
            </template>
          </div>
        </div>
      </template>
      <!-- 绑定中介 -->
      <template v-if="type === 3">
        <div class="form-item">
          <div class="title">
            <p>{{ t('编辑者') }}</p>
            <a-button
              type="dark"
              size="small"
              shape="round"
              class="uppercase"
              @click="openUserSelect"
            >{{ t('添加') }}</a-button>
          </div>
          <div class="content">
            <template v-if="brokerEditors.length">
              <div
                v-for="(item, index) in brokerEditors"
                :key="index"
                class="user-item"
              >
                <vco-user-item :data="item" :main="true"></vco-user-item>
                <i class="iconfont" @click="removeItem(index, 5)">&#xe77d;</i>
              </div>
            </template>
          </div>
        </div>
        <div class="form-item">
          <div class="title">
            <p>{{ t('浏览者') }}</p>
            <a-button
              type="dark"
              size="small"
              shape="round"
              class="uppercase"
              @click="openUserSelect"
            >{{ t('添加') }}</a-button>
          </div>
          <div class="content">
            <template v-if="brokerViewers.length">
              <div
                v-for="(item, index) in brokerViewers"
                :key="index"
                class="user-item"
              >
                <vco-user-item :data="item" :main="true"></vco-user-item>
                <i class="iconfont" @click="removeItem(index, 6)">&#xe77d;</i>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash"

  const { t } = useI18n();
  const vcoChooseUserRef = ref()

  const emits = defineEmits(['done', 'update:visible']);

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    type: {
      type: Number,
      required: true
    },
    data: {
      type: Object,
      default: () => {}
    }
  });

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const title = computed(() => {
    let txt = ''
    if (props.type === 1) {
      txt = '绑定贷款经理'
    } else if (props.type === 2) {
      txt = '绑定借款账号'
    } else if (props.type === 3) {
      txt = '绑定中介'
    }
    return txt
  })

  const lmSelData = ref([])
  const almSelData = ref([])
  const borrowerEditors = ref([])
  const borrowerViewers = ref([])
  const brokerEditors = ref([])
  const brokerViewers = ref([])

  const save = () => {
    updateVisible(false);
    emits('done');
  };

  const removeItem = (index, type) => {
    let data = null
    if (type === 1) {
      data = lmSelData.value
    } else if (type === 2) {
      data = almSelData.value
    } else if (type === 3) {
      data = borrowerEditors.value
    } else if (type === 4) {
      data = borrowerViewers.value
    } else if (type === 5) {
      data = brokerEditors.value
    } else if (type === 6) {
      data = brokerViewers.value
    }
    if (data) {
      data.splice(index, 1)
    }
  }

  const openUserSelect = () => {
    vcoChooseUserRef.value.init()
  }

  const dataInit = () => {
    if (props.type === 1) {
      const {lmData, almData} = props.data
      lmSelData.value = cloneDeep(lmData)
      almSelData.value = cloneDeep(almData)
    } else if (props.type === 2) {
      const {editors, viewers} = props.data
      borrowerEditors.value = cloneDeep(editors)
      borrowerViewers.value = cloneDeep(viewers)
    } else if (props.type === 3) {
      const {editors, viewers} = props.data
      brokerEditors.value = cloneDeep(editors)
      brokerViewers.value = cloneDeep(viewers)
    }
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        dataInit()
      } else {
        lmSelData.value = []
        almSelData.value = []
        borrowerEditors.value = []
        borrowerViewers.value = []
        brokerEditors.value = []
        brokerViewers.value = []
      }
    }
  );
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.form-content {
  min-height: 200px;
  padding-bottom: 20px;
  .form-item {
    margin-top: 30px;
    > .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    > .content {
      border-radius: 8px;
      border: 1px solid #282828;
      margin-top: 10px;
      padding: 15px;
      min-height: 50px;
      .user-item {
        padding: 8px 10px;
        background-color: #f7f0e6;
        border-radius: 8px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        &:first-child {
          margin-top: 0;
        }
        .iconfont {
          font-size: 13px;
          cursor: pointer;
          color: @colorPrimary;
          &:hover {
            opacity: 0.8;
          }
        }
      }
    }
  }
}
</style>
