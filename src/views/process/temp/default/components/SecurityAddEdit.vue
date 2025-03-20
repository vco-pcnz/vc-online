<template>
  <a-modal :open="visible" :title="isEdit ? t('编辑抵押物信息') : t('新增抵押物信息')" :width="1000" :footer="null" :keyboard="false" :maskClosable="false" @update:open="updateVisible">
      <a-tabs v-if="!isEdit" v-model:activeKey="activeKey">
        <a-tab-pane key="batche" :tab="t('批量添加')"></a-tab-pane>
        <a-tab-pane key="single" :tab="t('单个添加')"></a-tab-pane>
      </a-tabs>

      <security-add-edit-single
        v-if="activeKey === 'single'"
        :type-data="typeData"
        :current-id="currentId"
        :security-status="securityStatus"
        :block-info="blockInfo"
        :info-data="infoData"
        :is-open="isOpen"
        :gst-rate="gstRate"
        :project-info="projectInfo"
        @close="updateVisible"
        @refresh="refreshHandle"
      ></security-add-edit-single>

      <security-add-edit-batche
        v-if="activeKey === 'batche'"
        :type-data="typeData"
        :current-id="currentId"
        :security-status="securityStatus"
        :block-info="blockInfo"
        :info-data="infoData"
        :is-open="isOpen"
        :gst-rate="gstRate"
        :units-num="unitsNum"
        :project-info="projectInfo"
        @refresh="refreshHandle"
        @close="updateVisible"
      >
      </security-add-edit-batche>
  </a-modal>
</template>

<script setup>
import { watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { systemDictData } from "@/api/system"
import SecurityAddEditSingle from './SecurityAddEditSingle.vue';
import SecurityAddEditBatche from './SecurityAddEditBatche.vue';

const emits = defineEmits(['update:visible', 'refresh']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  blockInfo: {
    type: Object,
    default: () => {}
  },
  projectInfo: {
    type: Object,
    default: () => {}
  },
  currentId: {
    type: [Number, String],
    required: true
  },
  infoData: {
    type: Object,
    default: () => {}
  },
  securityStatus: {
    type: [Number, String],
    default: 407
  },
  isOpen: {
    type: Boolean,
    default: false
  },
  isSingle: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const refreshHandle = () => {
  emits('refresh')
}

const unitsNum = ref(0)

const isEdit = ref(true)
const activeKey = ref('')

const typeData = ref([])
const getTypeData = () => {
  systemDictData('security_type').then(res => {
    const data = res.map(item => {
      return {
        label: item.name,
        value: Number(item.code)
      }
    })
    typeData.value = data
  })
}

const gstRate = ref(1.15)
const getGstRate = () => {
  systemDictData('gst_rate').then(res => {
    const obj = res.find(item => item.name === 'gst_rate_value')
    gstRate.value = obj ? Number(obj.code) : 1.15
  })
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      unitsNum.value = props.projectInfo.building_num
      getTypeData()
      getGstRate()

      isEdit.value = props.infoData && props.infoData?.uuid
      activeKey.value = props.isSingle ? 'single' : 'batche'
    } else {
      activeKey.value = ''
    }
  }
);
</script>
