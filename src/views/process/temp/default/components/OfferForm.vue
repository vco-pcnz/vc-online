<template>
  <div
    class="block-item mb"
    :class="{ checked: offerInfo.is_check && blockInfo.showCheck, 'details': isDetails}"
  >
    <vco-process-title :title="t('凭证信息')">
      <div class="flex gap-5">
        <a-popconfirm
          v-if="blockInfo.showCheck && !offerInfo.is_check"
          :title="t('确定通过审核吗？')"
          :ok-text="t('确定')"
          :cancel-text="t('取消')"
          @confirm="checkHandle"
        >
          <a-button
            type="dark"
            shape="round"
            class="uppercase"
          >
            {{ t('审核') }}
          </a-button>
        </a-popconfirm>
        <a-button
          v-if="blockInfo.showEdit"
          type="primary"
          shape="round"
          :loading="subLoading"
          class="uppercase"
          @click="saveHandle"
        >
          {{ t('保存') }}
        </a-button>
      </div>
    </vco-process-title>

    <div class="form-item-col mt-5">
      <div class="title">
        <p>{{ t('未签订Offer') }}</p>
        <vco-upload-modal v-if="blockInfo.showEdit" v-model:list="offerList" @change="fileChange">
          <div class="upload-btn">
            <i class="iconfont">&#xe734;</i>
            {{ t('上传文件') }}
          </div>
        </vco-upload-modal>
      </div>
      <div class="file-content">
        <template v-if="offerList.length">
          <div v-for="(item, index) in offerList" :key="index" class="file-item">
            <vco-file-item :file="item" :showClose="Boolean(blockInfo.showEdit)" @remove="removeItem(index, true)"></vco-file-item>
          </div>
        </template>
        <p v-else>{{ t('暂无数据，请上传') }}</p>
      </div>
    </div>

    <div v-if="!['step_lm_audit', 'step_fc_audit'].includes(props.currentStep?.mark)" class="form-item-col mt-5">
      <div class="title">
        <p>{{ t('已签订Offer') }}</p>
        <vco-upload-modal v-if="blockInfo.showEdit" v-model:list="offerSignedList" @change="fileChange">
          <div class="upload-btn">
            <i class="iconfont">&#xe734;</i>
            {{ t('上传文件') }}
          </div>
        </vco-upload-modal>
      </div>
      <div class="file-content">
        <template v-if="offerSignedList.length">
          <div v-for="(item, index) in offerSignedList" :key="index" class="file-item">
            <vco-file-item :file="item" :showClose="Boolean(blockInfo.showEdit)" @remove="removeItem(index, false)"></vco-file-item>
          </div>
        </template>
        <p v-else>{{ t('暂无数据，请上传') }}</p>
      </div>
    </div>
    

    <div v-if="blockInfo.showCheck" class="check-content">
      <i class="iconfont">&#xe647;</i>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import {
    projectAuditSaveMode,
    projectAuditCheckMode
  } from '@/api/process';
  import emitter from '@/event';
  
  const emits = defineEmits(['done', 'refresh']);

  const { t } = useI18n();

  const props = defineProps({
    offerInfo: {
      type: Object,
      default: () => {}
    },
    blockInfo: {
      type: Object,
      default: () => {}
    },
    currentStep: {
      type: Object
    },
    currentId: {
      type: [Number, String],
      default: ''
    },
    isDetails: {
      type: Boolean,
      default: false
    }
  })

  const offerList = ref([])
  const offerSignedList = ref([])

  const fileChange = () => {
    emitter.emit('changeDataLetDis', true)
  }

  const removeItem = (index, flag) => {
    if (flag) {
      offerList.value.splice(index, 1);
    } else {
      offerSignedList.value.splice(index, 1);
    }

    emitter.emit('changeDataLetDis', true)
  };

  const checkHandle = async () => {
    const params = {
      uuid: props.currentId,
      code: props.blockInfo.code
    }
    await projectAuditCheckMode(params)
      .then(() => {
        emits('refresh');
        emitter.emit('refreshAuditHisList');
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  const subLoading = ref(false);
  const saveHandle = async () => {
    const params = {
      code: props.blockInfo.code,
      uuid: props.currentId,
      cert_images: offerList.value.map((item) => item.uuid),
      sign_offer: offerSignedList.value.map((item) => item.uuid)
    };

    subLoading.value = true;

    await projectAuditSaveMode(params)
    .then(async () => {
      subLoading.value = false;
      emits('refresh');
      
      // 操作记录
      emitter.emit('refreshAuditHisList');
      await updateFormData();
    })
    .catch(() => {
      subLoading.value = false;
    });
  };

  onMounted(() => {
    if (props.offerInfo.cert_images) {
      const images = props.offerInfo.cert_images
      const data = images.map((item) => {
        return {
          ...item,
          url: item.value || '',
        };
      });
      offerList.value = data
    }

    if (props.offerInfo.sign_offer) {
      const images = props.offerInfo.sign_offer
      const data = images.map((item) => {
        return {
          ...item,
          url: item.value || '',
        };
      });
      offerSignedList.value = data
    }
  })
</script>

<style lang="less" scoped>
@import '@/views/process/temp/default/styles/common.less';

.upload-content {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px dashed #ddd;
}
</style>
