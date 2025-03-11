<template>
  <div>
    <!-- 人员选择 -->
    <vco-choose-user
      ref="vcoChooseUserRef"
      :isMultiple="true"
      :title="t('利益相关者')"
      url="stake/selStake"
      @done="userChoiced"
    >
      <div></div>
    </vco-choose-user>

    <a-modal
      :open="visible"
      :title="title"
      :width="700"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      @cancel="updateVisible(false)"
    >
      <div class="sys-form-content">
        <a-tabs v-model:activeKey="activeKey">
          <a-tab-pane :key="1" :tab="t('选择已有数据')"></a-tab-pane>
          <a-tab-pane :key="2" :tab="t('添加新数据')"></a-tab-pane>
        </a-tabs>

        <template v-if="activeKey === 1">
          <div class="choose-btn mt-5" @click="openDialg">
            <a-button type="primary" ghost>{{ t('点击选择') }}</a-button>
          </div>
        </template>
        <template v-if="activeKey === 2">
          <a-form ref="formRef" layout="vertical" :model="form" :rules="dynamicRules" class="mt-5">
            <a-row :gutter="24">
              <a-col :span="24">
                <a-form-item :label="t('分类f')" name="cid">
                  <a-checkbox-group v-model:value="form.cid">
                    <a-checkbox v-for="item in orgsStore.category" :key="item.id" :value="item.id">
                      {{ item.name }}
                    </a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
              </a-col>
              <a-col :span="24">
                <a-form-item :label="t('类型f')" name="type">
                  <a-radio-group v-model:value="form.type">
                    <a-radio :value="item.code" :key="item.code" v-for="item in orgsStore.stakeholderType">
                      {{ item.name }}
                    </a-radio>
                  </a-radio-group>
                </a-form-item>
              </a-col>

              <a-col :span="24" v-if="form.type">
                <a-form-item :label="t('工作')" name="job">
                  <a-checkbox-group v-model:value="form.job">
                    <a-checkbox :value="item.code" :key="item.code" v-for="item in orgsStore.jobs">
                      {{ item.name }}
                    </a-checkbox>
                  </a-checkbox-group>
                </a-form-item>
              </a-col>

              <!-- 个人相关信息 -->
              <template v-if="form.type == 20">
                <a-col :span="8">
                  <a-form-item name="firstName" :label="t('名')">
                    <a-input v-model:value="form.firstName" :placeholder="t('名')" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item name="middleName" :label="t('中间名')">
                    <a-input v-model:value="form.middleName" :placeholder="t('中间名')" />
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item name="lastName" :label="t('姓')">
                    <a-input v-model:value="form.lastName" :placeholder="t('姓')" />
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item :label="t('身份证号码')" name="idcard">
                    <a-input v-model:value="form.idcard" :placeholder="t('请输入')" />
                  </a-form-item>
                </a-col>
              </template>

              <!-- 公司相关信息 -->
              <template v-if="form.type !== 20">
                <a-col :span="24">
                  <a-form-item :label="t('公司名称f')" name="name">
                    <vco-company-select v-model:name="form.name" :placeholder="t('请输入')" v-model:nzbz="form.nzbz" :show_nzbz="true"></vco-company-select>
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item label="NZBZ" name="nzbz">
                    <!-- <a-input v-model:value="form.nzbz" :placeholder="t('请输入')" /> -->
                    <vco-company-select v-model:name="form.name" :placeholder="t('请输入')" v-model:nzbz="form.nzbz" :show_nzbz="true" :is_nzbz="true"></vco-company-select>
                  </a-form-item>
                </a-col>
                <a-col :span="24">
                  <a-form-item :label="t('联系人f')" name="contactName">
                    <a-input v-model:value="form.contactName" :placeholder="t('请输入')" />
                  </a-form-item>
                </a-col>
                <a-col :span="24" v-if="form.type !== 2 && form.type !== 3">
                  <a-form-item :label="t('组织机构代码f')" name="idcard">
                    <a-input v-model:value="form.idcard" :placeholder="t('请输入')" />
                  </a-form-item>
                </a-col>
              </template>

              <!-- ####################################### -->
              <a-col :span="24" v-if="form.type != 20">
                <vco-address ref="vcoAddressRef" @change="setAddressInfo"></vco-address>
              </a-col>

              <a-col :span="12">
                <a-form-item :label="t('邮箱')" name="email">
                  <a-input v-model:value="form.email" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item :label="t('手机号')" name="mobile">
                  <vco-mobile-input
                    v-model:value="form.mobile"
                    v-model:areaCode="form.pre"
                    :formRef="formRef"
                    validateField="mobile"
                  >
                  </vco-mobile-input>
                </a-form-item>
              </a-col>

              <a-col :span="24">
                <a-form-item :label="t('背景f')" name="note">
                  <a-textarea v-model:value="form.note" :auto-size="{ minRows: 4, maxRows: 5 }" :placeholder="t('请输入')" />
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </template>
      </div>

      <div class="mt-5 flex justify-end gap-5">
        <a-button
          type="grey" class="big shadow bold uppercase mb-5 mt-5"
          @click="updateVisible(false)"
        >{{ t('取消') }}</a-button>

        <a-button
          v-if="activeKey === 2"
          type="dark" class="big shadow bold uppercase mb-5 mt-5"
          :loading="subLoading"
          @click="submitHandle"
        >{{ t('提交') }}</a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
  import { ref, reactive, watch, nextTick, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import useFormData from '@/utils/use-form-data';
  import { useOrgsStore } from '@/store';
  import { stakeAdd } from '@/api/orgs/form';
  import emitter from "@/event"

  const emits = defineEmits(['update:visible', 'done'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Title'
    },
    uuid: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    },
    required: {
      type: Boolean,
      default: true
    }
  });

  const { t } = useI18n();

  const activeKey = ref(1)

  const orgsStore = useOrgsStore();
  const vcoChooseUserRef = ref();

  const openDialg = () => {
    vcoChooseUserRef.value.init();
  };

  const formRef = ref()
  // 表单数据
  const { form, assignFields } = useFormData({
    //公司
    name: '',
    nzbz: '',
    contactName: '',
    // 个人
    firstName: '',
    middleName: '',
    lastName: '',
    job: [], //详情添加才会有
    //公共
    cid: [], //分类ID
    type: '', //类型
    idcard: '', // 公司组织机构代码  人员 身份证
    email: '',
    pre: '',
    mobile: '',
    province_code: '',
    city_code: '',
    district_code: '',
    addr: '',
    address: '',
    postal: '',
    note: '',
    suburb: '',
    province_code_name: '',
    con_id: ''
  })

  // 表单验证规则
  const rules = reactive({
    // 公共验证
    idcard: [
      {
        required: true,
        message: t('请输入') + t('组织机构代码f')
      }
    ],
    type: [
      {
        required: true,
        message: t('请选择') + t('类型f')
      }
    ],
    addr: [
      {
        required: true,
        message: t('请输入'),
        trigger: 'blur'
      }
    ]
  });

  // 根据条件动态生成的规则
  const dynamicRules = computed(() => {
    // 个人相关验证
    if (form.type == 20) {
      return {
        ...rules,
        idcard: [
          {
            required: true,
            message: t('请输入') + t('身份证号码'),
            trigger: 'blur'
          }
        ],
        firstName: [
          {
            required: true,
            message: t('请输入') + t('名'),
            type: 'string',
            trigger: 'blur'
          }
        ],
        lastName: [
          {
            required: true,
            message: t('请输入') + t('姓'),
            type: 'string',
            trigger: 'blur'
          }
        ]
      };
    } else {
      return {
        ...rules,
        // 公司相关验证
        name: [
          {
            required: true,
            message: t('请输入') + t('公司名称f')
          }
        ],
        nzbz: [
          {
            required: true,
            message: t('请输入') + 'NZBZ'
          }
        ],
        contactName: [
          {
            required: true,
            message: t('请输入') + t('联系人f')
          }
        ]
      };
    }
  });

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const vcoAddressRef = ref();

  const subLoading = ref(false)
  const submitHandle = () => {
    formRef.value
    .validate()
    .then(() => {
      subLoading.value = true
      stakeAdd({
        ...form,
        sendEmail: 0,
        sendSms: 0
      }).then(res => {
        const data = [res]

        subLoading.value = false
        updateVisible(false)
        emits('done', data)
      }).catch(() => {
        subLoading.value = false
      })
    })
    .catch(error => {
      console.log('error', error);
    });
  }

  // 跟新地址信息
  const setAddressInfo = (val) => {
    assignFields({ ...form, ...val });
  };

  const userChoiced = (data) => {
    updateVisible(false)
    emits('done', data)
  };

  // 监听重置idcard 公用字段  获取job 选项
  watch(
    () => form.type,
    (val, old) => {
      if (old) {
        if ((old == 20 && val < 20) || (old !== 20 && val == 20)) {
          form.idcard = '';
        }
        form.job = [];
      }
      switch (val) {
        case 20:
          orgsStore.getJob('stakeholder_job2');
          break;
        case 1:
        case 2:
        case 4:
          orgsStore.getJob('stakeholder_job');
          break;
        case 3:
          orgsStore.getJob('stakeholder_job1');
          break;
      }

      if (val != 20) {
        nextTick(() => {
          if (vcoAddressRef.value) {
            vcoAddressRef.value.init(form);
          }
        });
      }
    },
    { immediate: true }
  );

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        for (const key in form) {
          if (['job', 'cid'].includes(key)) {
            form[key] = []
          } else {
            form[key] = ''
          }
        }

        subLoading.value = false;
        activeKey.value = 1
        formRef.value?.clearValidate();
      } else {
        // 加载分类
        orgsStore.getCategory();
        // 加载分类
        orgsStore.getStakeholderType();
      }
    }
  )
</script>

<style lang="less" scoped>
  .sys-form-content {
    :deep(.ant-checkbox-group) {
      .ant-checkbox-wrapper {
        margin-bottom: 0 !important;
      }
    }
  }

  .choose-btn {
    padding: 15px;
    height: 70px;
    background-color: #f7f9f8;
    border: 1px dashed #f19915;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    :deep(.ant-btn) {
      border: none !important;
      box-shadow: none !important;
    }
  }
</style>