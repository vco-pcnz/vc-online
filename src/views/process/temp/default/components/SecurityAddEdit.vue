<template>
  <a-modal
    :open="visible"
    :title="t('抵押物信息')"
    :width="500"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @update:open="updateVisible"
  >
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
        <a-form-item :label="t('类型')" name="type">
          <a-select v-model:value="formState.type">
            <a-select-option v-for="item in typeData" :key="item.id" :value="item.id">{{ item.title }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="t('产权编号')" name="card_no">
          <a-input v-model:value="formState.card_no"></a-input>
        </a-form-item>
        <a-form-item :label="t('地址')" name="address">
          <a-input v-model:value="formState.address"></a-input>
        </a-form-item>
        <a-form-item :label="t('土地价值')" name="land_value">
          <a-input-number
            v-model:value="formState.land_value"
            :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="value => value.replace(/\$\s?|(,*)/g, '')"
          />
        </a-form-item>
        <a-form-item :label="t('改善值')" name="improvement_value">
          <a-input-number
            v-model:value="formState.improvement_value"
            :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="value => value.replace(/\$\s?|(,*)/g, '')"
          />
        </a-form-item>
        <a-form-item :label="t('备注')" name="remark">
          <a-textarea v-model:value="formState.remark" />
        </a-form-item>
      </a-form>

      <div class="flex gap-4 mb-5 mt-5 justify-between">
        <div class="flex-1">
          <p>{{ t('抵押物价值') }}</p>
          <h3 style="font-size: 24px;">{{ totalValue }}</h3>
        </div>
        <a-button
          type="dark" class="big shadow bold uppercase"
          :loading="subLoading"
          @click="submitHandle"
        >{{ t('保存') }}</a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import { watch, computed, ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import { projectAuditAddSecurity, projectAuditEditSecurity } from "@/api/process"
  import tool from "@/utils/tool"
  import emitter from "@/event"

  const emits = defineEmits(['update:visible']);

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    currentId: {
      type: [Number, String],
      required: true
    },
    infoData: {
      type: Object,
      default: () => {}
    },
    typeData: {
      type: Array,
      default: () => []
    },
    securityStatus: {
      type: [Number, String],
      default: 407
    }
  })

  const { t } = useI18n();

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const totalValue = computed(() => {
    const land = formState.value.land_value || 0
    const improvement = formState.value.improvement_value || 0
    return tool.formatMoney(tool.plus(land, improvement))
  })

  const formRef = ref()
  const formState = ref({
    type: undefined,
    card_no: '',
    address: '',
    land_value: '',
    improvement_value: '',
    remark: ''
  })
  
  const formRules = {
    type: [
      { required: true, message: t('请选择') + t('类型'), trigger: 'change' }
    ],
    card_no: [
      { required: true, message: t('请输入') + t('产权编号'), trigger: 'blur' }
    ],
    address: [
      { required: true, message: t('请输入') + t('地址'), trigger: 'blur' }
    ],
    land_value: [
      { required: true, message: t('请输入') + t('土地价值'), trigger: 'blur' }
    ],
    improvement_value: [
      { required: true, message: t('请输入') + t('改善值'), trigger: 'blur' }
    ]
  }

  const subLoading = ref(false)
  const submitHandle = () => {
    formRef.value
    .validate()
    .then(() => {
      const params = cloneDeep(formState.value)
      params.uuid = props.currentId
      params.security_status = props.securityStatus

      let ajaxFn = projectAuditAddSecurity
      if (props.infoData && props.infoData.uuid) {
        params.security_uuid = props.infoData.uuid
        ajaxFn = projectAuditEditSecurity
      }

      subLoading.value = true
      ajaxFn(params).then(() => {
        subLoading.value = false
        updateVisible(false)

        emitter.emit('refreshSecurityInfo')
        emitter.emit('refreshSecurityList')
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        formRef.value.clearValidate()
        formRef.value.resetFields()
      } else {
        if (props.infoData && props.infoData.uuid) {
          for (const key in formState.value) {
            formState.value[key] = props.infoData[key]
          }
        }
      }
    }
  );
</script>
