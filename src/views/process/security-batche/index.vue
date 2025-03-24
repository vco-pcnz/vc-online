<template>
  <div>
    <!-- 确认弹窗 -->
    <vco-confirm-alert
      ref="changeAlertRef"
      :confirm-txt="confirmTxt"
      v-model:visible="changeVisible"
      @submit="submitRquest"
    ></vco-confirm-alert>

    <!-- 选择弹窗 -->
    <a-modal
      :open="selectVisible"
      :title="t('批量设置')"
      :width="540"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      @cancel="selectVisible = false"
    >
      <div class="batch-select-content">
        <div class="item" :class="{'checked': batchAll}" @click="checkHandle(false)">{{ t('全部') }}</div>
        <div v-for="(item, index) in formDataSource" :key="index" class="item" :class="{'checked': item.checked}" @click="checkHandle(item)">
          {{ item.name }}
        </div>
      </div>
    </a-modal>
    <vco-page-panel @back="back">
      <template #title>
        <div class="page-title-content">
          <div v-if="dataInfo?.base?.project_apply_sn" class="tag">{{ dataInfo?.base?.project_apply_sn }}</div>
          <div class="tag uppercase">{{ t('批量添加抵押物') }}</div>
        </div>
      </template>
      <a-button type="dark" class="shadow" :loading="subLoading" @click="subHandle">
        {{ t('提交') }}
      </a-button>
    </vco-page-panel>

    <a-spin :spinning="pageLoading" size="large">
      <div class="main-form-content">
        <div class="form-block-content">
          <div class="title">{{ t('抵押物基础信息') }}</div>
          <div class="content sys-form-content">
            <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
              <a-row :gutter="24">
                <a-col :span="10">
                  <a-form-item :label="t('名称')" name="security_name">
                    <a-input v-model:value="formState.security_name"></a-input>
                  </a-form-item>
                  <a-form-item :label="t('类型')" name="type">
                    <a-select v-model:value="formState.type" :options="typeData"></a-select>
                  </a-form-item>
                  <a-form-item :label="t('备注')" name="remark">
                    <a-input v-model:value="formState.remark" />
                  </a-form-item>
                </a-col>
                <a-col :span="14">
                  <vco-address :config="addressConfig" ref="vcoAddressRef" @change="setAddressInfo"></vco-address>
                </a-col>
                <a-col :span="24">
                  <a-form-item name="upd">
                    <template #label>
                      {{ t('更新基础数据') }}
                      <a-tooltip  placement="topLeft">
                        <template #title>
                          <span>{{ t('勾选后，下面数据的基础信息将全部更新为上面设置的数据') }}</span>
                        </template>
                        <QuestionCircleOutlined class="ml-2" />
                      </a-tooltip>
                    </template>
                    <a-switch v-model:checked="formState.upd" />
                  </a-form-item>
                </a-col>
              </a-row>
            </a-form>
          </div>
        </div>

        <div class="form-block-content">
          <div class="title">{{ t('批量操作') }}</div>
          <a-table
            :columns="batchColumns"
            :data-source="batchDataSource"
            bordered
            :pagination="false"
            table-layout="fixed"
            :scroll="{ x: '100%' }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'rowSelect'">
                <p @click="selectVisible = true" class="select-btn">
                  {{ selectBatchTxt }}
                  <i class="iconfont">&#xe791;</i>
                </p>
              </template>
              <template v-if="column.dataIndex === 'typology'">
                <div class="stuff-item-content">
                  <div class="stuff-item">
                    <a-select
                      v-model:value="record.typology.beds"
                    >
                      <a-select-option v-for="num in 21" :key="`beds_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>beds</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      v-model:value="record.typology.lounge"
                    >
                      <a-select-option v-for="num in 21" :key="`lounge_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>lounge</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      v-model:value="record.typology.bath"
                    >
                      <a-select-option 
                        v-for="num in Array.from({ length: 21 }, (_, i) => i * 0.5)" 
                        :key="`bath_${num}`" 
                        :value="num"
                      >
                        {{ num }}
                      </a-select-option>
                    </a-select>
                    <p>bath</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      v-model:value="record.typology.garage"
                    >
                      <a-select-option v-for="num in 21" :key="`garage_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>garage</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      v-model:value="record.typology.leve"
                    >
                      <a-select-option v-for="num in 21" :key="`leve_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>leve</p>
                  </div>
                  <div class="stuff-item">
                    <a-input v-model:value="record.typology.other" placeholder="Other" />
                  </div>
                </div>
              </template>
              <template v-if="column.dataIndex === 'sqm'">
                <a-input v-model:value="record.sqm" suffix="m²" />
              </template>
              <template v-if="column.dataIndex === 'est_sales_price'">
                <a-input-number
                  v-model:value="record.est_sales_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @change="salesPriceInput(record)"
                />
              </template>
              <template v-if="column.dataIndex === 'is_gst'">
                <a-switch v-model:checked="record.is_gst" @change="salesPriceInput(record)" />
              </template>
              <template v-if="column.dataIndex === 'amount'">
                <a-input-number
                  v-model:value="record.amount"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @change="netproceedsPriceInput(record)"
                />
              </template>
              <template v-if="column.dataIndex === 'insurance_value'">
                <a-input-number
                  v-model:value="record.insurance_value"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </template>
              <template v-if="column.dataIndex === 'insurance_expire_date'">
                <a-date-picker v-model:value="record.insurance_expire_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'contract_date'">
                <a-date-picker v-model:value="record.contract_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'settlement_date'">
                <a-date-picker v-model:value="record.settlement_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'sunset_date'">
                <a-date-picker v-model:value="record.sunset_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'repayment_date'">
                <a-date-picker v-model:value="record.repayment_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'sales_price'">
                <a-input-number
                  v-model:value="record.sales_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @change="salesPriceInput(record, true)"
                />
              </template>
              <template v-if="column.dataIndex === 'repayment_price'">
                <a-input-number
                  v-model:value="record.repayment_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </template>
              <template v-if="column.dataIndex === 'net_proceeds_price'">
                <a-input-number
                  v-model:value="record.net_proceeds_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @change="netproceedsPriceInput(record)"
                />
              </template>
              <template v-if="column.dataIndex === 'opt'">
                <a-button type="link" @click="settingHandle">{{ t('批量设置')}} </a-button>
              </template>
            </template>
          </a-table>
        </div>

        <div class="form-block-content">
          <div class="title flex">
            <p>{{ t('物品信息') }}</p>
            <a-button type="primary" size="small" shape="round" @click="addHandle">{{ t('添加') }}</a-button>
          </div>
          <a-table
            :columns="formColumns"
            :data-source="formDataSource"
            bordered
            :pagination="false"
            table-layout="fixed"
            :scroll="{ x: '100%' }"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'card_no'">
                <a-input v-model:value="record.card_no" />
              </template>
              <template v-if="column.dataIndex === 'typology'">
                <div class="stuff-item-content">
                  <div class="stuff-item">
                    <a-select
                      v-model:value="record.typology.beds"
                    >
                      <a-select-option v-for="num in 21" :key="`beds_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>beds</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      v-model:value="record.typology.lounge"
                    >
                      <a-select-option v-for="num in 21" :key="`lounge_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>lounge</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      v-model:value="record.typology.bath"
                    >
                      <a-select-option 
                        v-for="num in Array.from({ length: 21 }, (_, i) => i * 0.5)" 
                        :key="`bath_${num}`" 
                        :value="num"
                      >
                        {{ num }}
                      </a-select-option>
                    </a-select>
                    <p>bath</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      v-model:value="record.typology.garage"
                    >
                      <a-select-option v-for="num in 21" :key="`garage_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>garage</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      v-model:value="record.typology.leve"
                    >
                      <a-select-option v-for="num in 21" :key="`leve_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>leve</p>
                  </div>
                  <div class="stuff-item">
                    <a-input v-model:value="record.typology.other" placeholder="Other" />
                  </div>
                </div>
              </template>
              <template v-if="column.dataIndex === 'sqm'">
                <a-input v-model:value="record.sqm" suffix="m²" />
              </template>
              <template v-if="column.dataIndex === 'est_sales_price'">
                <a-input-number
                  v-model:value="record.est_sales_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @change="salesPriceInput(record)"
                />
              </template>
              <template v-if="column.dataIndex === 'sales_price'">
                <a-input-number
                  v-model:value="record.sales_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @change="salesPriceInput(record, true)"
                />
              </template>
              <template v-if="column.dataIndex === 'repayment_price'">
                <a-input-number
                  v-model:value="record.repayment_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </template>
              <template v-if="column.dataIndex === 'is_gst'">
                <a-switch v-model:checked="record.is_gst" @change="salesPriceInput(record)" />
              </template>
              <template v-if="column.dataIndex === 'amount'">
                <a-input-number
                  v-model:value="record.amount"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @change="netproceedsPriceInput(record)"
                />
              </template>
              <template v-if="column.dataIndex === 'insurance_value'">
                <a-input-number
                  v-model:value="record.insurance_value"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </template>
              <template v-if="column.dataIndex === 'insurance_expire_date'">
                <a-date-picker v-model:value="record.insurance_expire_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'contract_date'">
                <a-date-picker v-model:value="record.contract_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'settlement_date'">
                <a-date-picker v-model:value="record.settlement_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'sunset_date'">
                <a-date-picker v-model:value="record.sunset_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'repayment_date'">
                <a-date-picker v-model:value="record.repayment_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'net_proceeds_price'">
                <a-input-number
                  v-model:value="record.net_proceeds_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @input="netproceedsPriceInput(record)"
                />
              </template>
              <template v-if="column.dataIndex === 'variance'">
                <span>{{ record.variance || 0 }}%</span>
              </template>
              <template v-if="column.dataIndex === 'dup'">
                <vco-number
                  :value="record.dup"
                  :precision="2"
                  :end="true"
                  size="fs_md"
                  class="text-center"
                  style="font-weight: 500;"
                ></vco-number>
              </template>
              <template v-if="column.dataIndex === 'opt'">
                <a-popconfirm
                  :title="t('确定删除吗？')"
                  :ok-text="t('确定')"
                  :cancel-text="t('取消')"
                  @confirm="itemDelete(index)"
                >
                  <a-button type="link">{{ t('删除')}} </a-button>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <div class="flex justify-center mt-10">
        <a-button type="dark" class="shadow big" :loading="subLoading" @click="subHandle">
          {{ t('提交') }}
        </a-button>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { onMounted, ref, nextTick, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { projectDetailApi, projectAuditSaveMode, projectDischargeAddEditSecurity } from "@/api/process";
import { systemDictData } from "@/api/system"
import tool, { selectDateFormat, navigationTo } from '@/utils/tool';
import { cloneDeep } from 'lodash';
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const uuid = ref(route.query.uuid)

const back = () => {
  if (route.query.isOpen) {
    navigationTo(`/projects/discharge?uuid=${route.query.uuid}&type=1`)
  } else {
    router.back()
  }
}

const pageLoading = ref(false)
const dataInfo = ref()
const projectInfo = ref()

const formRef = ref();
const formState = ref({
  security_name: '',
  type: 2,
  address_short: '',
  address: '',
  security_region: '',
  postcode: '',
  remark: '',
  region_one_id: '',
  region_two_id: '',
  region_three_id: '',
  region_one_name: '',
  suburb: '',
  con_id: '',
  upd: false
});

const formRules = {
  security_name: [{ required: true, message: t('请输入') + t('名称'), trigger: 'blur' }],
  type: [{ required: true, message: t('请选择') + t('类型'), trigger: 'change' }],
  security_region: [{ required: true, message: t('请选择') + t('区域'), trigger: 'change' }],
  postcode: [{ required: true, message: t('请输入') + t('邮编'), trigger: 'blur' }],
  region_one_name: [{ required: true, message: t('请输入') + t('城市/州'), trigger: 'blur' }],
  address_short: [{ required: true, message: t('请输入') + t('地址1'), trigger: 'blur' }]
};

const vcoAddressRef = ref();
const addressConfig = ref({
  addr: 'address_short',
  address: 'address',
  suburb: 'suburb',
  postal: 'postcode',
  con_id: 'con_id',
  region: 'region',
  province_code_name: 'region_one_name',
  province_code: 'region_one_id',
  city_code: 'region_two_id',
  district_code: 'region_three_id'
});
const setAddressInfo = (e) => {
  for (const key in e) {
    formState.value[key] = e[key];
  }
};

const getDataInfo = async () => {
  pageLoading.value = true
  await projectDetailApi({
    uuid: uuid.value
  }).then(res => {
    if (res) {
      dataInfo.value = res
      projectInfo.value = res.project

      const borrowerName = res.borrower.borrower_type === 1 ? `${res.borrower.first_name} ${res.borrower.middle_name} ${res.borrower.last_name}` : res.borrower.organization_name
      const nameStr = borrowerName || res.project.project_name || res.base.project_apply_sn

      formState.value.security_name = t('{0}的抵押物', [nameStr])

      const addressInfo = res.security?.base || res.project
      const {project_address_short, project_address, project_suburb, region_one_id, region_two_id, region_three_id, project_postcode} = addressInfo

      formState.value.address_short = project_address_short || ''
      formState.value.address = project_address || ''
      formState.value.suburb = project_suburb || ''
      formState.value.region_one_id = region_one_id || 0
      formState.value.region_two_id = region_two_id || 0
      formState.value.region_three_id = region_three_id || 0
      formState.value.postcode = project_postcode || ''
    }
    
    pageLoading.value = false
  }).catch(() => {
    pageLoading.value = false
  })
}

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

const batchColumns = reactive([
  { title: t('修改项'), dataIndex: 'rowSelect', width: 140, align: 'center' },
  { title: t('类型1'), dataIndex: 'typology', width: 260, align: 'center' },
  { title: t('面积'), dataIndex: 'sqm', width: 120, align: 'center' },
  { title: t('预计销售价格'), dataIndex: 'est_sales_price', width: 140, align: 'center' },
  { title: t('含消费税'), dataIndex: 'is_gst', width: 115, align: 'center' },
  { title: t('担保价值'), dataIndex: 'amount', width: 140, align: 'center' },
  { title: t('保险价值'), dataIndex: 'insurance_value', width: 140, align: 'center' },
  { title: t('保险到期日'), dataIndex: 'insurance_expire_date', width: 155, align: 'center' },
  { title: t('合同日期'), dataIndex: 'contract_date', width: 155, align: 'center' },
  { title: t('结算日期'), dataIndex: 'settlement_date', width: 155, align: 'center' },
  { title: t('日落日期'), dataIndex: 'sunset_date', width: 155, align: 'center' },
  { title: t('还款日期'), dataIndex: 'repayment_date', width: 155, align: 'center' },
  { title: t('销售价格'), dataIndex: 'sales_price', width: 140, align: 'center' },
  { title: t('回款金额'), dataIndex: 'repayment_price', width: 140, align: 'center' },
  { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 140, align: 'center' },
  { title: t('操作1'), dataIndex: 'opt', width: 115, align: 'center', fixed: 'right' }
])

const batchDataSource = ref([{
  rowSelect: [],
  typology: {
    beds: 3,
    lounge: 1,
    bath: 2,
    garage: 1,
    leve: 2,
    other: ''
  },
  sqm: '90',
  est_sales_price: 0,
  sales_price: 0,
  repayment_price: 0,
  is_gst: false,
  insurance_value: 0,
  contract_date: '',
  settlement_date: '',
  sunset_date: '',
  repayment_date: '',
  net_proceeds_price: 0
}])

const formColumns = reactive([
  { title: t('楼栋号'), dataIndex: 'card_no', width: 140, align: 'center' },
  { title: t('类型1'), dataIndex: 'typology', width: 260, align: 'center' },
  { title: t('面积'), dataIndex: 'sqm', width: 120, align: 'center' },
  { title: t('预计销售价格'), dataIndex: 'est_sales_price', width: 140, align: 'center' },
  { title: t('含消费税'), dataIndex: 'is_gst', width: 115, align: 'center' },
  { title: t('担保价值'), dataIndex: 'amount', width: 140, align: 'center' },
  { title: t('保险价值'), dataIndex: 'insurance_value', width: 140, align: 'center' },
  { title: t('保险到期日'), dataIndex: 'insurance_expire_date', width: 155, align: 'center' },
  { title: t('合同日期'), dataIndex: 'contract_date', width: 155, align: 'center' },
  { title: t('结算日期'), dataIndex: 'settlement_date', width: 155, align: 'center' },
  { title: t('日落日期'), dataIndex: 'sunset_date', width: 155, align: 'center' },
  { title: t('还款日期'), dataIndex: 'repayment_date', width: 155, align: 'center' },
  { title: t('销售价格'), dataIndex: 'sales_price', width: 140, align: 'center' },
  { title: t('回款金额'), dataIndex: 'repayment_price', width: 140, align: 'center' },
  { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 140, align: 'center' },
  { title: t('变化比例'), dataIndex: 'variance', width: 100, align: 'center' },
  { title: t('每单位债务'), dataIndex: 'dup', width: 140, align: 'center' },
  { title: t('操作1'), dataIndex: 'opt', width: 115, align: 'center', fixed: 'right' }
])

watch(
  () => formState.value.type,
  (val) => {
    const item = { title: t('类型1'), dataIndex: 'typology', width: 260, align: 'center' }
    const index1 = batchColumns.findIndex(item => item.dataIndex === 'typology')
    const index2 = formColumns.findIndex(item => item.dataIndex === 'typology')

    if (val === 2) {
      if (index1 < 0) {
        batchColumns.splice(1, 0, item)
      }
      if (index2 < 0) {
        formColumns.splice(1, 0, item)
      }
    } else {
      if (index1 > -1) {
        batchColumns.splice(index1, 1)
      }
      if (index2 > -1) {
        formColumns.splice(index2, 1)
      }
    }
  }
)

const formDataSource = ref([])

const batchitem = {
  card_no: '',
  typology: {
    beds: 3,
    lounge: 1,
    bath: 2,
    garage: 1,
    leve: 2,
    other: ''
  },
  sqm: '90',
  est_sales_price: 0,
  sales_price: 0,
  repayment_price: 0,
  is_gst: false,
  amount: 0,
  insurance_value: 0,
  insurance_expire_date: '',
  contract_date: '',
  settlement_date: '',
  sunset_date: '',
  repayment_date: '',
  net_proceeds_price: 0,
  variance: 0,
  dup: ''
}

const oldData = ref([])

const tableDataInit = () => {
  let data = []

  if (route.query.e) { // 编辑
    const batchEditSec = sessionStorage.getItem('batchEditSec')
    if (batchEditSec) {
      const dataJson = JSON.parse(batchEditSec)
      formState.value.type = dataJson[0].type

      oldData.value = cloneDeep(dataJson)

      const formOldData = dataJson.map((item, index) => {
        const sItem = cloneDeep(batchitem)
        for (const key in sItem) {
          if (item[key]) {
            sItem[key] = item[key]
          }
        }
        sItem.is_gst = sItem.is_gst === 1 ? true : false
        sItem.checked = true
        sItem.name = item.card_no || t(`第{0}行`, [index + 1])
        sItem.security_uuid = item.uuid
        return sItem
      })
      data = formOldData
    }
    
  } else { // 新增
    for (let i = 0; i < Number(projectInfo.value.building_num); i++) {
      const item = cloneDeep(batchitem)
      item.card_no = `Lot ${i + 1}`
      item.checked = true
      item.name = item.card_no || t(`第{0}行`, [index + 1])

      data.push(item)
    }
  }

  console.log('data', data);

  
  formDataSource.value = data
}

const addHandle = () => {
  const item = cloneDeep(batchitem)
  item.checked = true
  item.name = item.card_no || t(`第{0}行`, [formDataSource.value.length + 1])
  formDataSource.value.push(item)
}

const itemDelete = (index) => {
  formDataSource.value.splice(index, 1)
}

const batchAll = computed(() => {
  const cAll = formDataSource.value.every(item => item.checked)
  return cAll
})

const selectVisible = ref(false)
const selectBatchTxt = computed(() => {
  const cAll = formDataSource.value.every(item => item.checked)
  const nAll = formDataSource.value.every(item => !item.checked)

  let txt = ''
  if (cAll) {
    txt = t('全部')
  } else {
    if (nAll) {
      txt = t('未选择')
    } else {
      const nameArr = formDataSource.value.filter(item => item.checked).map(item => item.name)
      txt = nameArr.join('; ')
    }
  }
  return txt
})

const netproceedsPriceInput = (data) => {
  const net_proceeds_price = data.net_proceeds_price || 0
  const amount = data.amount || 0
  if (amount) {
    const num = tool.minus(net_proceeds_price, amount)
    const num1 = tool.div(num, amount)
    const resNum = tool.times(num1, 100)
    const variance =  Math.ceil(resNum * 100) / 100
    data.variance = variance
  } else {
    data.variance = 0
  }
}

const salesPriceInput = (data, flag) => {
  let price = data.est_sales_price || 0
  if (flag) {
    price = data.sales_price || 0
    data.est_sales_price = price
  }

  if (Boolean(data.is_gst)) {
    const num = tool.div(price, gstRate.value)
    const resNum = Math.floor(num * 100) / 100
    data.amount = resNum

    if (Number(data.sales_price)) {
      data.repayment_price = resNum
    }

    netproceedsPriceInput(data)
  }
}

const settingHandle = () => {
  const data = cloneDeep(batchDataSource.value)
  const batchSet = data[0]
  delete batchSet.rowSelect
  formDataSource.value.forEach(item => {
    if (item.checked) {
      for (const key in batchSet) {
        if (key === 'typology') {
          for (const _key in batchSet[key]) {
            item[key][_key] = batchSet[key][_key]
          }
        } else {
          item[key] = batchSet[key]
        }
      }
    }
  })
}

const checkHandle = (data) => {
  if (data) {
    data.checked = !data.checked
  } else {
    formDataSource.value.forEach(item => {
      item.checked = true
    })
  }
}

const changeAlertRef = ref()
const changeVisible = ref(false)
const confirmTxt = ref('')

const subLoading = ref(false)
const submitRquest = () => {
  const formVal = cloneDeep(formState.value);
  const formData = cloneDeep(formDataSource.value);
  formData.forEach(item => {
    item.is_gst = item.is_gst ? 1 : 0
    item.is_sales = item.sales_price ? 1 : 0
    item.type = formVal.type
  })

  let delData = []
  const oldUuid = oldData.value.map(item => item.uuid)
  const nowUuid = formData.map(item => item.security_uuid)

  if (oldUuid && oldUuid.length) {
    const set2 = new Set(nowUuid);
    delData = oldUuid.filter(item => !set2.has(item));
  }

  const params = {
    code: route.query.code || '',
    uuid: route.query.uuid,
    security__data: {
      base: formVal,
      batch: formData,
      del: delData,
      upd: formVal.upd ? 1 : 0
    },
    security__mode: 2
  }
  delete formVal.upd

  subLoading.value = true

  const ajaxFn = route.query.isOpen ? projectDischargeAddEditSecurity : projectAuditSaveMode
  ajaxFn(params)
    .then(() => {
      subLoading.value = false;
      changeVisible.value = false
      changeAlertRef.value.changeLoading(false)

      sessionStorage.removeItem('batchEditSec')
      back()
    })
    .catch(() => {
      changeAlertRef.value.changeLoading(false)
      subLoading.value = false;
    });
}
const subHandle = () => {
  formRef.value
    .validate()
    .then(() => {
      const {project_address_short, project_address, project_suburb, region_one_id, region_two_id, region_three_id, project_postcode, project_city} = projectInfo.value
      const {address_short, address, suburb, postcode} = formState.value
      const region_one_id1 = formState.value.region_one_id
      const region_two_id1 = formState.value.region_two_id
      const region_three_id1 = formState.value.region_three_id

      if (project_address_short !== address_short ||
        project_address !== address || 
        project_suburb !== suburb || 
        project_postcode !== postcode || 
        Number(region_one_id) !== Number(region_one_id1) || 
        Number(region_two_id) !== Number(region_two_id1) || 
        Number(region_three_id) !== Number(region_three_id1)
      ) {
        confirmTxt.value = t('当前项目地址为：{0}，抵押物地址与项目地址不一致，确定提交吗？', [project_city])
        changeVisible.value = true
      } else {
        submitRquest()
      }
    })
    .catch((error) => {
      console.log('error', error);
    });
}

onMounted(async () => {
  getTypeData()
  getGstRate()
  await getDataInfo()

  tableDataInit()

  nextTick(() => {
    vcoAddressRef.value.init(formState.value);
  });
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.page-title-content {
  display: flex;
  align-items: center;
  gap: 15px;
  > .tag {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    font-weight: 500;
    font-size: 14px;
    letter-spacing: 1px;
    text-transform: uppercase;
    white-space: nowrap;
    background-color: @clr_charcoal;
    color: @clr_white;
    border-radius: 16px;
    padding: 0 30px;
    &:first-child {
      border-radius: 0 16px 16px 0 !important;
    }
    &.uppercase {
      padding: 0 20px;
      background-color: @colorPrimary;
    }
  }
}

.main-form-content {
  min-height: 300px;
}

.form-block-content {
  margin-bottom: 20px;
  > .title {
    font-weight: 500;
    color: #666;
    margin-bottom: 15px;
    &.flex {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
  > .content {
    background-color: #fbfbfb;
    border: 1px solid #fbfbfb;
    border-radius: 10px;
    box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
    padding: 30px;
  }

  :deep(.ant-table-wrapper) {
    .ant-table-cell-fix-right-first::after,
    * {
      border-color: #272727 !important;
    }
    .ant-table {
      background-color: transparent;
      border-spacing: 10px;
    }
    .ant-table-thead {
      border: none;
      & > tr > th {
        font-weight: 500;
        font-size: 10px;
        color: #282828 !important;
        background-color: #f7f9f8 !important;
      }
    }
    .ant-empty {
      min-height: 50px !important;
    }
  }
  :deep(.ant-input-number) {
    .ant-input-number-handler-wrap {
      display: none !important;
    }
  }
}

.stuff-item-content {
  overflow: hidden;
}

.stuff-item {
  width: 110px;
  display: flex;
  align-items: center;
  gap: 5px;
  float: left;
  margin-top: 10px;
  &:nth-child(1),
  &:nth-child(2) {
    margin-top: 0;
  }
  .ant-select {
    width: 65px !important;
  }
}

.select-btn {
  cursor: pointer;
  color: #F19915;
  &:hover {
    color: #ef9f28;
  }
  .iconfont {
    font-size: 12px;
  }
}

.batch-select-content {
  overflow: hidden;
  margin-top: 20px;
  > .item {
    float: left;
    margin-left: 10px;
    height: 30px;
    min-width: 50px;
    padding: 0 8px;
    border: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
    margin-bottom: 20px;
    &.checked {
      background-color: #F19915;
      border-color: #F19915;
      color: #fff;
    }
  }
}
</style>
