<template>
  <div>
    <!-- 人员选择 -->
    <vco-choose-user
      ref="vcoChooseUserRef"
      :isMultiple="type !== 1 || (type === 1 && itemCode === 'alm')"
      :role-code="roleCode"
      @done="userChoiced"
    >
      <div></div>
    </vco-choose-user>
    <a-modal
      :width="500"
      :open="visible"
      :title="t(title)"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="form-content">
        <!-- 绑定贷款经理 -->
        <template v-if="type === 1">
          <div v-for="(item, index) in vcTeam" :key="index" class="form-item">
            <div class="title">
              <p>{{ t(item.note) }}</p>
              <a-button
                type="primary"
                size="small"
                shape="round"
                class="uppercase"
                @click="openUserSelect(item.code)"
              >{{ t('添加') }}</a-button>
            </div>
            <div class="content">
              <template v-if="vcTeamData && vcTeamData[item.code].length">
                <div
                  v-for="(_item, _index) in vcTeamData[item.code]"
                  :key="String(index) + String(_index)"
                  class="user-item"
                >
                  <vco-user-item :data="_item" :main="true"></vco-user-item>
                  <i class="iconfont" @click="removeVcItem(_index, item.code)">&#xe77d;</i>
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
                type="primary"
                size="small"
                shape="round"
                class="uppercase"
                @click="openUserSelect(true)"
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
                  <i class="iconfont" @click="removeItem(index, 1)">&#xe77d;</i>
                </div>
              </template>
            </div>
          </div>
          <div class="form-item">
            <div class="title">
              <p>{{ t('浏览者') }}</p>
              <a-button
                type="primary"
                size="small"
                shape="round"
                class="uppercase"
                @click="openUserSelect(false)"
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
                  <i class="iconfont" @click="removeItem(index, 2)">&#xe77d;</i>
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
                type="primary"
                size="small"
                shape="round"
                class="uppercase"
                @click="openUserSelect(true)"
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
                  <i class="iconfont" @click="removeItem(index, 3)">&#xe77d;</i>
                </div>
              </template>
            </div>
          </div>
          <div class="form-item">
            <div class="title">
              <p>{{ t('浏览者') }}</p>
              <a-button
                type="primary"
                size="small"
                shape="round"
                class="uppercase"
                @click="openUserSelect(false)"
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
                  <i class="iconfont" @click="removeItem(index, 4)">&#xe77d;</i>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>
      <a-button
        v-if="type === 1 && vcTeam.length || type !== 1"
        type="dark" class="big shadow bold uppercase w-full mb-5 mt-5"
        @click="submitHandle"
        :loading="subLoading"
      >{{ t('保存') }}</a-button>
    </a-modal>
  </div>
</template>

<script setup>
  import { ref, watch, computed, toRefs, nextTick} from "vue";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash"
  import { message } from "ant-design-vue/es";
  import { removeDuplicates } from "@/utils/tool"
  import { associateAssignUser, associateAssignTeam } from "@/api/process"
  import emitter from "@/event"

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
    },
    vcTeam: {
      type: Array,
      default: () => []
    },
    pIds: {
      type: Array,
      default: () => []
    },
    currentId: {
      type: [Number, String],
      default: ''
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

  const vcTeamData = ref(null)
  const borrowerEditors = ref([])
  const borrowerViewers = ref([])
  const brokerEditors = ref([])
  const brokerViewers = ref([])

  const removeItem = (index, type) => {
    let data = null
    if (type === 1) {
      data = borrowerEditors.value
    } else if (type === 2) {
      data = borrowerViewers.value
    } else if (type === 3) {
      data = brokerEditors.value
    } else if (type === 4) {
      data = brokerViewers.value
    }
    if (data) {
      data.splice(index, 1)
    }
  }

  const removeVcItem = (index, type) => {
    vcTeamData.value[type].splice(index, 1)
  }

  const itemCode = ref('')
  const isEdit = ref(false)
  const roleCode = ref('')
  const openUserSelect = (code) => {
    if (props.type === 1) {
      itemCode.value = code

      roleCode.value = code
    } else {
      isEdit.value = code

      roleCode.value = props.type === 2 ? 'user' : 'broker'
    }

    nextTick(() => {
      vcoChooseUserRef.value.init()
    })
  }

  const userChoiced = (data) => {
    data.forEach(item => {
      item.name = item.user_name
    })
    if (props.type === 1) {
      const dataArr = [
        ...vcTeamData.value[itemCode.value],
        ...data
      ]
      
      if (itemCode.value === 'lm') { // 单选
        vcTeamData.value[itemCode.value] = removeDuplicates(data, 'uuid')
      } else {
        vcTeamData.value[itemCode.value] = removeDuplicates(dataArr, 'uuid')
      }
    }

    if (props.type === 2) {
      const staticData = isEdit.value ? borrowerEditors.value : borrowerViewers.value
      const dataArr = [
        ...staticData,
        ...data
      ]
      if (isEdit.value) {
        borrowerEditors.value  = removeDuplicates(dataArr, 'uuid')
      } else {
        borrowerViewers.value  = removeDuplicates(dataArr, 'uuid')
      }
    }

    if (props.type === 3) {
      const staticData = isEdit.value ? brokerEditors.value : brokerViewers.value
      const dataArr = [
        ...staticData,
        ...data
      ]
      if (isEdit.value) {
        brokerEditors.value  = removeDuplicates(dataArr, 'uuid')
      } else {
        brokerViewers.value  = removeDuplicates(dataArr, 'uuid')
      }
    }
    
  }

  const dataInit = () => {
    if (props.type === 1) {
      vcTeamData.value = cloneDeep(props.data)
    } else if (props.type === 2) {
      if (props.data) {
        const {edit, view} = props.data
        borrowerEditors.value = cloneDeep(edit)
        borrowerViewers.value = cloneDeep(view)
      }
    } else if (props.type === 3) {
      if (props.data) {
        const {edit, view} = props.data
        brokerEditors.value = cloneDeep(edit)
        brokerViewers.value = cloneDeep(view)
      }
    }
  }

  const subLoading = ref(false)
  const submitHandle = async () => {
    if (props.type === 1) { // vcTeam 数据
      if (props.currentId || (props.pIds && props.pIds.length)) {
        subLoading.value = true
        for (let i = 0; i < props.vcTeam.length; i++) {
          const code = props.vcTeam[i].code
          const params = {
            uuid: [props.currentId],
            // user_uuid: vcTeamData.value[code].map(item => item.uuid).join(','),
            user_uuid: vcTeamData.value[code].map(item => item.uuid),
            role_code: code
          }

          if (props.pIds && props.pIds.length) {
            params.uuid = props.pIds
          }

          if (code === 'lm' && !params.user_uuid.length) {
            message.error(t(code) + t('为必填项'))
            subLoading.value = false
            return false
          }
          await associateAssignTeam(params).catch(() => {
            subLoading.value = false
          })
        }
      } else {
        emitter.emit('stepOneBindUser', {
          type: 1,
          data: vcTeamData.value
        })
      }
    } else {
      const editData = props.type === 2 ? cloneDeep(borrowerEditors.value) : cloneDeep(brokerEditors.value)
      const viewData = props.type === 2 ? cloneDeep(borrowerViewers.value) : cloneDeep(brokerViewers.value)

      const editParams = {
        uuid: props.currentId,
        user_uuid: editData.map(item => item.uuid).join(','),
        role_code: props.type === 2 ? 'user' : 'broker',
        rule: 2
      }

      const viewParams = {
        uuid: props.currentId,
        user_uuid: viewData.map(item => item.uuid).join(','),
        role_code: props.type === 2 ? 'user' : 'broker',
        rule: 1
      }

      if (props.type === 2 && editParams.user_uuid === '') {
        message.error(t('编辑者') + t('为必填项'))
        return false
      }

      if (props.currentId) {
        subLoading.value = true
        for (let i = 0; i < 2; i++) {
          const params = i ? viewParams : editParams
          await associateAssignUser(params).catch(() => {
            subLoading.value = false
          })
        }
      } else {
        emitter.emit('stepOneBindUser', {
          type: props.type,
          data: {
            view: viewData,
            edit: editData
          }
        })
      }
    }

    if (props.currentId || (props.pIds && props.pIds.length)) {
      subLoading.value = false
      emits('done')
    }

    updateVisible(false)
    
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        dataInit()
      } else {
        vcTeamData.value = null
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
