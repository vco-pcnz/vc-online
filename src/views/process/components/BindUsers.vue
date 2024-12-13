<template>
  <div>
    <bind-users-dialog
      v-model:visible="showDialog"
      :type="currentType"
      :data="currentData"
    ></bind-users-dialog>

    <div class="block-item sec">
      <div class="user-show-item">
        <div class="title-content">
          <p class="uppercase">{{ t('管理者信息') }}</p>
          <a-button
            type="primary"
            size="small"
            shape="round"
            class="uppercase"
            @click="editHandle(1)"
          >{{ t('编辑') }}</a-button>
        </div>
        <div class="info-content">
          <div class="no-data">{{ t('暂无数据') }}</div>
        </div>
      </div>
      <div class="user-show-item">
        <div class="title-content">
          <p class="uppercase">{{ t('借款账号信息') }}</p>
          <a-button
            type="primary"
            size="small"
            shape="round"
            class="uppercase"
            @click="editHandle(2)"
          >{{ t('编辑') }}</a-button>
        </div>
        <div class="info-content">
          <div class="no-data">{{ t('暂无数据') }}</div>
        </div>
      </div>
      <div class="user-show-item">
        <div class="title-content">
          <p class="uppercase">{{ t('中介信息') }}</p>
          <a-button
            type="primary"
            size="small"
            shape="round"
            class="uppercase"
            @click="editHandle(3)"
          >{{ t('编辑') }}</a-button>
        </div>
        <div class="info-content">
          <div class="no-data">{{ t('暂无数据') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from "vue"
  import BindUsersDialog from "./BindUsersDialog.vue";
  import { useI18n } from "vue-i18n";

  const props = defineProps({
    currentId: {
      type: [Number, String],
      default: ''
    }
  })

  const { t } = useI18n();

  const showDialog = ref(false)
  const currentData = ref([])
  const currentType = ref(1)

  const vcData = {
    lmData: [
      {
        name: 'clyde lm',
        avatar: 'https://pcnz-testing-api.s3.ap-southeast-2.amazonaws.com/avatar/3.png'
      },
      {
        name: 'clyde lm1',
        avatar: 'https://pcnz-testing-api.s3.ap-southeast-2.amazonaws.com/avatar/3.png'
      }
    ],
    almData: [
      {
        name: 'Johnny Liu',
        avatar: 'https://vco-api.s3.ap-southeast-2.amazonaws.com/user/w3ddhE3dLsC4lLYqF4oLTCcfHRWscoSH61YuEvOh.jpg'
      },
      {
        name: 'renee alm',
        avatar: ''
      }
    ]
  }

  const borrowerData = {
    editors: [
      {
        name: '张小美',
        avatar: ''
      },
      {
        name: '李大壮',
        avatar: ''
      }
    ],
    viewers: [
      {
        name: 'Jack Joden',
        avatar: 'https://vco-api.s3.ap-southeast-2.amazonaws.com/user/w3ddhE3dLsC4lLYqF4oLTCcfHRWscoSH61YuEvOh.jpg'
      },
      {
        name: 'Sicaly Daiyl',
        avatar: ''
      }
    ]
  }

  const brokerData = {
    editors: [
      {
        name: '张小美',
        avatar: ''
      },
      {
        name: '李大壮',
        avatar: ''
      }
    ],
    viewers: [
      {
        name: 'Jack Joden',
        avatar: 'https://vco-api.s3.ap-southeast-2.amazonaws.com/user/w3ddhE3dLsC4lLYqF4oLTCcfHRWscoSH61YuEvOh.jpg'
      },
      {
        name: 'Sicaly Daiyl',
        avatar: ''
      }
    ]
  }

  const editHandle = (type) => {
    let data = null
    if (type === 1) {
      data = vcData
    } else if (type === 2) {
      data = borrowerData
    } else if (type === 3) {
      data = brokerData
    }

    currentType.value = type
    currentData.value = data

    showDialog.value = true
  }
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
</style>
