<template>
  <div class="block-item mb">
    <vco-process-title :title="t('放款信息')">
      <div class="flex gap-5">
        <a-popconfirm
          :title="t('确定通过审核吗？')"
          :ok-text="t('确定')"
          :cancel-text="t('取消')"
        >
          <a-button
            type="dark" shape="round"
            class="uppercase"
          >{{ t('审核') }}</a-button>
        </a-popconfirm>
        <a-button
          type="primary" shape="round"
          :loading="subLoading"
          class="uppercase"
          @click="saveHandle"
        >{{ t('保存') }}</a-button>
      </div>
    </vco-process-title>
    <div class="sys-form-content mt-5">
      <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item :label="t('建筑贷款总额')" name="buildAmount">
              <a-input-number
                v-model:value="formState.buildAmount"
                :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="value => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('土地贷款总额')" name="landAmount">
              <a-input-number
                v-model:value="formState.landAmount"
                :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="value => value.replace(/\$\s?|(,*)/g, '')"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="percentItems.length" :span="24"><div class="form-line"></div></a-col>
          <template v-if="percentItems.length">
            <a-col v-for="item in percentItems" :key="item.credit_table" :span="8">
              <a-form-item :label="item.credit_name" :name="item.credit_table">
                <a-input
                  v-model:value="formState[item.credit_table]"
                  :suffix="item.credit_unit"
                />
              </a-form-item>
            </a-col>
          </template>
          <a-col v-if="dollarItems.length" :span="24"><div class="form-line"></div></a-col>
          <template v-if="dollarItems.length">
            <a-col v-for="item in dollarItems" :key="item.credit_table" :span="8">
              <a-form-item :label="item.credit_name" :name="item.credit_table">
                <a-input-number
                  v-model:value="formState[item.credit_table]"
                  :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="value => value.replace(/\$\s?|(,*)/g, '')"
                />
              </a-form-item>
            </a-col>
          </template>
          <a-col v-if="showNumItems.length" :span="24"><div class="form-line"></div></a-col>
          <template v-if="showNumItems.length">
            <a-col v-for="item in showNumItems" :key="item.credit_table" :span="8">
              <a-form-item :label="item.credit_name">
                <vco-number :value="item.value" :precision="2" :end="true"></vco-number>
              </a-form-item>
            </a-col>
          </template>
        </a-row>
      </a-form>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue"
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import { message } from "ant-design-vue/es";
  import { ruleCredit, creditInitial, creditInfo } from "@/api/process"

  const emits = defineEmits(['done'])
  const props = defineProps({
    currentId: {
      type: [Number, String],
      required: true
    }
  })

  const { t } = useI18n();

  const formRef = ref()
  const formState = ref({
    buildAmount: '',
    landAmount: ''
  })
  const formRules = ref({})
  const percentItems = ref([])
  const dollarItems = ref([])
  const showNumItems = ref([])
  const creditId = ref(null)

  const getFormItems = async () => {
    await ruleCredit().then(async (res) => {
      const data = res || []
      const writeData = data.filter(item => item.is_write)
      const perData = writeData.filter(item => item.is_ratio)
      const dolData = writeData.filter(item => !item.is_ratio)

      const rulesData = {}
      for (let i = 0; i < writeData.length; i++) {
        formState.value[writeData[i].credit_table] = writeData[i].value
        if (writeData[i].is_req) {
          rulesData[writeData[i].credit_table] = [
            { required: true, message: t('请输入') + writeData[i].credit_name, trigger: 'blur' }
          ]
        }
      }
      
      formRules.value = rulesData
      percentItems.value = perData
      dollarItems.value = dolData
      showNumItems.value = data.filter(item => !item.is_write)

      await updateFormData()
    })
  }

  const updateFormData = async () => {
    await creditInfo({apply_uuid: props.currentId}).then(res => {
      if (res.length || Object.keys(res).length) {
        for (const key in formState.value) {
          formState.value[key] = res[key] || '0'
        }
        for (let i = 0; i < showNumItems.value.length; i++) {
          showNumItems.value[i].value = res[showNumItems.value[i].credit_table]
        }
        creditId.value = res.id || null

        if (creditId.value) {
          emits('done')
        }
      }
    })
  }

  const subLoading = ref(false)
  const saveHandle = async () => {
    formRef.value
    .validate()
    .then(() => {
      const totalAmount = Number(formState.value.buildAmount) + Number(formState.value.landAmount)
      if (totalAmount <= 0) {
        message.error(t('借款总额不正确'))
        return false
      }
      const params = cloneDeep(formState.value)
      params.apply_uuid = props.currentId
      if (creditId.value) {
        params.id = creditId.value
      }

      subLoading.value = true
      creditInitial(params).then(async () => {
        subLoading.value = false
        await updateFormData()
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  onMounted(() => {
    getFormItems()
  })
</script>

<style lang="less" scoped>
  .form-line {
    width: 100%;
    border-top: 1px dashed #808080;
    margin-bottom: 24px;
  }

  .sys-form-content {
    :deep(.ant-statistic-content) {
      font-size: 21px;
    }
  }
</style>