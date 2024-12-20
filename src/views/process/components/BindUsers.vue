<template>
  <div>
    <bind-users-dialog
      v-model:visible="showDialog"
      :current-id="currentId"
      :type="currentType"
      :data="currentData"
      :vc-team="vcTeamData"
      @done="getConfigInfo"
    ></bind-users-dialog>

    <a-spin :spinning="configLoading" size="large">
      <div class="block-item sec mb-5">
        <div class="user-show-item">
          <div class="title-content">
            <p class="uppercase">{{ t('管理者信息') }}</p>
            <a-button
              v-if="vcTeamData.length && !isDetails && hasPermission('process:bind:vcTeam')"
              type="primary"
              size="small"
              shape="round"
              class="uppercase"
              @click="editHandle(1)"
            >{{ t('编辑') }}</a-button>
          </div>
          <div class="info-content">
            <!-- <template v-if="currentId"> -->
              <div v-if="vcDataCom.length" class="user-item-content">
                <vco-user-item
                  v-for="(item, index) in vcDataCom"
                  :key="index"
                  :data="item"
                  :main="true"
                  :post="item.post"
                ></vco-user-item>
              </div>
              <div v-else class="no-data">{{ t('暂无数据') }}</div>
            <!-- </template> -->
            <!-- <div v-else class="no-data">{{ t('请提交信息后操作') }}</div> -->
          </div>
        </div>
        <div class="user-show-item">
          <div class="title-content">
            <p class="uppercase">{{ t('中介信息') }}</p>
            <a-button
              v-if="!isDetails && hasPermission('process:bind:broker')"
              type="primary"
              size="small"
              shape="round"
              class="uppercase"
              @click="editHandle(3)"
            >{{ t('编辑') }}</a-button>
          </div>
          <div class="info-content">
            <div v-if="brokerDataCom.length" class="user-item-content">
              <vco-user-item
                v-for="(item, index) in brokerDataCom"
                :key="index"
                :data="item"
                :main="true"
                :tips="item.tips"
              ></vco-user-item>
            </div>
            <div v-else class="no-data">{{ t('暂无数据') }}</div>
          </div>
        </div>
        <div class="user-show-item">
          <div class="title-content">
            <p class="uppercase">{{ t('借款账号信息') }}</p>
            <a-button
              v-if="!isDetails && hasPermission('process:bind:user')"
              type="primary"
              size="small"
              shape="round"
              class="uppercase"
              @click="editHandle(2)"
            >{{ t('编辑') }}</a-button>
          </div>
          <div class="info-content">
            <div v-if="borrowerDataCom.length" class="user-item-content">
              <vco-user-item
                v-for="(item, index) in borrowerDataCom"
                :key="index"
                :data="item"
                :main="true"
                :tips="item.tips"
              ></vco-user-item>
            </div>
            <div v-else class="no-data">{{ t('暂无数据') }}</div>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from "vue"
  import BindUsersDialog from "./BindUsersDialog.vue";
  import { useI18n } from "vue-i18n";
  import { associateSystemConfig, associateUserList, associateAssignUser } from "@/api/process"
  import { hasPermission } from "@/directives/permission"
  import emitter from "@/event"

  const props = defineProps({
    currentId: {
      type: [Number, String],
      default: ''
    },
    isDetails: {
      type: Boolean,
      default: false
    }
  })

  const { t } = useI18n();

  const showDialog = ref(false)
  const currentData = ref([])
  const currentType = ref(1)

  const vcData = ref(null)
  const borrowerData = ref(null)
  const brokerData = ref(null)

  const vcDataCom = ref([])
  const borrowerDataCom = ref([])
  const brokerDataCom = ref([])

  const editHandle = (type) => {
    let data = null
    if (type === 1) {
      data = vcData.value
    } else if (type === 2) {
      data = borrowerData.value
    } else if (type === 3) {
      data = brokerData.value
    }

    currentType.value = type
    currentData.value = data

    showDialog.value = true
  }

  const userFlatFn = (arrData) => {
    const arr = []
    if (arrData && Object.keys(arrData).length) {
      for (const key in arrData) {
        const item = arrData[key]
        item.forEach(item => {
          item.post = key
          item.tips = key
        })
        arr.push(item)
      }
    }
    const arrFlat = arr.flat()
    return arrFlat
  }

  const configLoading = ref(false)
  const vcTeamData = ref([])

  const getConfigInfo = async () => {
    configLoading.value = true
    let vcTeamArr = []

    await associateSystemConfig().then(res => {
      vcTeamData.value = res || []
      vcTeamArr = vcTeamData.value.map(item => item.code)
    })

    if (props.currentId) {
      await associateUserList({
        uuid: props.currentId
      }).then(res => {
        const vcObj = {}

        for (let i = 0; i < vcTeamArr.length; i++) {
          vcObj[vcTeamArr[i]] = []
          if (res[vcTeamArr[i]] && Object.keys(res[vcTeamArr[i]]).length) {
            const editArr = res[vcTeamArr[i]].edit || []
            const viewArr = res[vcTeamArr[i]].view || []
            vcObj[vcTeamArr[i]] = [...editArr, ...viewArr]
          }
        }

        vcData.value = vcObj && Object.keys(vcObj).length ? vcObj : null
        vcDataCom.value = userFlatFn(vcData.value)

        borrowerData.value = res.user && Object.keys(res.user).length ? res.user : null
        borrowerDataCom.value = userFlatFn(borrowerData.value)

        brokerData.value = res.broker && Object.keys(res.broker).length ? res.broker : null
        brokerDataCom.value = userFlatFn(brokerData.value)

        configLoading.value = false
      }).catch(() => {
        configLoading.value = false
      })
    } else {
      const vcObj = {}
      for (let i = 0; i < vcTeamArr.length; i++) {
        vcObj[vcTeamArr[i]] = []
      }
      vcData.value = vcObj && Object.keys(vcObj).length ? vcObj : null
      vcDataCom.value = userFlatFn(vcData.value)

      borrowerData.value = {
        view: [],
        edit: []
      }
      borrowerDataCom.value = userFlatFn(borrowerData.value)

      brokerData.value = {
        view: [],
        edit: []
      }
      brokerDataCom.value = userFlatFn(brokerData.value)

      configLoading.value = false
    }
  }

  const bindUsersHandle = (data) => {
    if (data.type === 1) {
      vcData.value = data.data
      vcDataCom.value = userFlatFn(vcData.value)
    } else if (data.type === 2) {
      borrowerData.value = data.data
      borrowerDataCom.value = userFlatFn(borrowerData.value)
    } else if (data.type === 3) {
      brokerData.value = data.data
      brokerDataCom.value = userFlatFn(brokerData.value)
    }
  }

  const bindUsersRequest = async (uuid) => {
    for (const key in vcData.value) {
      if (vcData.value[key] && vcData.value[key].length) {
        const params = {
          uuid,
          user_uuid: vcData.value[key].map(item => item.uuid).join(','),
          role_code: key,
          rule: 2
        }

        await associateAssignUser(params)
      }
    }

    for (const key in brokerData.value) {
      if (brokerData.value[key] && brokerData.value[key].length) {
        const params = {
          uuid,
          user_uuid: brokerData.value[key].map(item => item.uuid).join(','),
          role_code: 'broker',
          rule: key === 'view' ? 1 : 2
        }

        await associateAssignUser(params)
      }
    }

    for (const key in borrowerData.value) {
      if (borrowerData.value[key] && borrowerData.value[key].length) {
        const params = {
          uuid,
          user_uuid: borrowerData.value[key].map(item => item.uuid).join(','),
          role_code: 'user',
          rule: key === 'view' ? 1 : 2
        }

        await associateAssignUser(params)
      }
    }
  }

  onMounted(() => {
    getConfigInfo()

    emitter.on('stepOneBindUser', (data) => {
      bindUsersHandle(data)
    })
  })

  defineExpose({
    bindUsersRequest
  })
</script>

<style lang="less" scoped>
  .user-show-item {
    margin-top: 20px;
    &:first-child {
      margin-top: 0;
    }
    > .title-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    > .info-content {
      border-radius: 8px;
      border: 1px dashed #282828;
      margin-top: 10px;
      padding: 15px;
      .no-data {
        text-align: center;
        color: #999;
      }
    }
  }

  .user-item-content {
    .vco-user-item {
      margin-bottom: 10px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
</style>
