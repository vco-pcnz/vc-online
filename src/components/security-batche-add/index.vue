<template>
  <div>
    <!-- 确认弹窗 -->
    <vco-confirm-alert ref="changeAlertRef" :confirm-txt="confirmTxt" v-model:visible="changeVisible" @submit="confirmHandle"></vco-confirm-alert>

    <!-- 选择弹窗 -->
    <a-modal :open="selectVisible" :title="t('批量设置')" :width="540" :footer="null" :keyboard="false" :maskClosable="false" @cancel="selectVisible = false">
      <div class="batch-select-content">
        <div class="item" :class="{ checked: batchAll }" @click="checkHandle(false)">{{ t('全部') }}</div>
        <div v-for="(item, index) in formDataSource" :key="index" class="item" :class="{ checked: item.checked }" @click="checkHandle(item)">
          {{ item.name }}
        </div>
      </div>
    </a-modal>
    <vco-page-panel  v-if="!isVariation" @back="back">
      <template #title>
        <div class="page-title-content">
          <div v-if="dataInfo?.base?.project_apply_sn" class="tag">{{ `${dataInfo?.product?.name} - ${dataInfo?.borrower?.organization_name || dataInfo?.base?.project_apply_sn}` }}</div>
          <div class="tag uppercase">{{ t('批量添加抵押物') }}</div>
        </div>
      </template>
    </vco-page-panel>

    <a-spin :spinning="pageLoading" size="large">
      <div class="main-form-content">
        <div v-if="!isVariation" class="form-block-content">
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
                      <a-tooltip placement="topLeft">
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
          <a-table :columns="batchColumns" :data-source="batchDataSource" bordered :pagination="false" table-layout="fixed" :scroll="{ x: '100%' }">
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
                    <a-auto-complete
                      v-model:value="record.typology.beds"
                      :options="getInputOptions(8, false)"
                    />
                    <p>beds</p>
                  </div>
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.bath"
                      :options="getInputOptions(15, true)"
                    />
                    <p>bath</p>
                  </div>
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.lounge"
                      :options="getInputOptions(5, false)"
                    />
                    <p>lounge</p>
                  </div>
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.garage"
                      :options="getInputOptions(5, false)"
                    />
                    <p>garage</p>
                  </div>
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.carpark"
                      :options="getInputOptions(5, false)"
                    />
                    <p>carpark</p>
                  </div>
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.level"
                      :options="getInputOptions(4, false)"
                    />
                    <p>level</p>
                  </div>
                  <template v-if="record.typology.other.length">
                    <div v-for="(item, index) in record.typology.other" :key="index" class="stuff-item other">
                      <a-auto-complete
                        v-model:value="item.value"
                        :options="getInputOptions(5, false)"
                      />
                      <a-select show-search v-model:value="item.key" class="type-key">
                        <a-select-option v-for="_item in otherTypeData" :key="_item.value" :value="_item.label">{{ _item.label }}</a-select-option>
                      </a-select>
                      <div class="delete-btn" @click="typologyRemove(record, index)">
                        <i class="iconfont">&#xe711;</i>
                      </div>
                    </div>
                  </template>
                </div>
                <div class="type-add" @click="typologyAdd(record)">
                  <i class="iconfont">&#xe712;</i>
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
              <template v-if="column.dataIndex === 'is_calc'">
                <a-switch v-model:checked="record.is_calc" />
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
                <a-input-number v-model:value="record.insurance_value" :max="99999999999" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
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
                <a-input-number v-model:value="record.repayment_price" :max="99999999999" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
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
                <a-button type="link" @click="settingHandle" class="uppercase">{{ t('批量设置') }} </a-button>
              </template>
            </template>
          </a-table>
        </div>

        <div class="form-block-content">
          <div class="title flex">
            <p>{{ t('物品信息') }}</p>
            <a-button type="primary" size="small" shape="round" @click="addHandle">{{ t('添加') }}</a-button>
          </div>
          <a-table :columns="formColumns" :data-source="formDataSource" bordered :pagination="false" table-layout="fixed" :scroll="{ x: '100%', y: 600 }" :row-class-name="getRowClassName">
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'card_no'">
                <a-input v-model:value="record.card_no" :disabled="isVariation && record.is_delete" />
                <div v-if="!record.not_variation" class="text-center mt-2">{{ t('变更1') }}</div>
              </template>
              <template v-if="column.dataIndex === 'typology'">
                <div class="stuff-item-content">
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.beds"
                      :disabled="isVariation && record.is_delete"
                      :options="getInputOptions(8, false)"
                    />
                    <p>beds</p>
                  </div>
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.bath"
                      :disabled="isVariation && record.is_delete"
                      :options="getInputOptions(15, true)"
                    />
                    <p>bath</p>
                  </div>
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.lounge"
                      :disabled="isVariation && record.is_delete"
                      :options="getInputOptions(5, false)"
                    />
                    <p>lounge</p>
                  </div>
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.garage"
                      :disabled="isVariation && record.is_delete"
                      :options="getInputOptions(5, false)"
                    />
                    <p>garage</p>
                  </div>
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.carpark"
                      :disabled="isVariation && record.is_delete"
                      :options="getInputOptions(5, false)"
                    />
                    <p>carpark</p>
                  </div>
                  <div class="stuff-item">
                    <a-auto-complete
                      v-model:value="record.typology.level"
                      :disabled="isVariation && record.is_delete"
                      :options="getInputOptions(4, false)"
                    />
                    <p>level</p>
                  </div>
                  <template v-if="record.typology.other.length">
                    <div v-for="(item, index) in record.typology.other" :key="index" class="stuff-item other">
                      <a-auto-complete
                        v-model:value="item.value"
                        :disabled="isVariation && record.is_delete"
                        :options="getInputOptions(5, false)"
                      />
                      <a-select show-search v-model:value="item.key" class="type-key">
                        <a-select-option v-for="_item in otherTypeData" :key="_item.value" :value="_item.label" :disabled="isVariation && record.is_delete">{{ _item.label }}</a-select-option>
                      </a-select>
                      <div class="delete-btn" @click="typologyRemove(record, index)">
                        <i class="iconfont">&#xe711;</i>
                      </div>
                    </div>
                  </template>
                </div>
                <div class="type-add" @click="typologyAdd(record)">
                  <i class="iconfont">&#xe712;</i>
                </div>
              </template>
              <template v-if="column.dataIndex === 'sqm'">
                <a-input v-model:value="record.sqm" suffix="m²" :disabled="isVariation && record.is_delete" />
              </template>
              <template v-if="column.dataIndex === 'est_sales_price'">
                <a-input-number
                  v-model:value="record.est_sales_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @change="salesPriceInput(record)"
                  :disabled="isVariation && record.is_delete"
                />
              </template>
              <template v-if="column.dataIndex === 'sales_price'">
                <a-input-number
                  v-model:value="record.sales_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @change="salesPriceInput(record, true)"
                  :disabled="isVariation && record.is_delete"
                />
              </template>
              <template v-if="column.dataIndex === 'repayment_price'">
                <a-input-number v-model:value="record.repayment_price" :max="99999999999" :disabled="isVariation && record.is_delete" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
              </template>
              <template v-if="column.dataIndex === 'is_gst'">
                <a-switch v-model:checked="record.is_gst" @change="salesPriceInput(record)" :disabled="isVariation && record.is_delete" />
              </template>
              <template v-if="column.dataIndex === 'is_calc'">
                <a-switch v-model:checked="record.is_calc" :disabled="isVariation && record.is_delete" />
              </template>
              <template v-if="column.dataIndex === 'amount'">
                <a-input-number
                  v-model:value="record.amount"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @change="netproceedsPriceInput(record)"
                  :disabled="isVariation && record.is_delete"
                />
              </template>
              <template v-if="column.dataIndex === 'insurance_value'">
                <a-input-number v-model:value="record.insurance_value" :disabled="isVariation && record.is_delete" :max="99999999999" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
              </template>
              <template v-if="column.dataIndex === 'insurance_expire_date'">
                <a-date-picker v-model:value="record.insurance_expire_date" :disabled="isVariation && record.is_delete" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'contract_date'">
                <a-date-picker v-model:value="record.contract_date" :disabled="isVariation && record.is_delete" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'settlement_date'">
                <a-date-picker v-model:value="record.settlement_date" :disabled="isVariation && record.is_delete" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'sunset_date'">
                <a-date-picker v-model:value="record.sunset_date" :disabled="isVariation && record.is_delete" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'repayment_date'">
                <a-date-picker v-model:value="record.repayment_date" :disabled="isVariation && record.is_delete" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" />
              </template>
              <template v-if="column.dataIndex === 'net_proceeds_price'">
                <a-input-number
                  v-model:value="record.net_proceeds_price"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  @input="netproceedsPriceInput(record)"
                  :disabled="isVariation && record.is_delete"
                />
              </template>
              <template v-if="column.dataIndex === 'variance'">
                <span>{{ record.variance || 0 }}%</span>
              </template>
              <template v-if="column.dataIndex === 'dup'">
                <vco-number :value="record.dup" :precision="2" :end="true" size="fs_md" class="text-center" style="font-weight: 500"></vco-number>
              </template>
              <template v-if="column.dataIndex === 'opt'">
                <a-popconfirm v-if="(isVariation && !record.not_variation) || !isVariation" :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="itemDelete(index)">
                  <a-button type="link">{{ t('删除') }} </a-button>
                </a-popconfirm>
                <template v-if="isVariation && record.not_variation">
                  <a-button v-if="record.is_delete" type="link" @click="itemBan(index, false)">{{ t('取消禁用') }} </a-button>
                  <a-button v-else type="link" @click="itemBan(index, true)">{{ t('禁用') }} </a-button>
                </template>
              </template>
            </template>
            <template #summary>
              <a-table-summary fixed>
                <a-table-summary-row>
                  <a-table-summary-cell v-for="(item, index) in summaryCol" :index="index" :key="item.key" class="text-center">
                    <template v-if="item.key === 'card_no'">
                      {{ t('概括') }}
                    </template>
                    <template v-else-if="item.key === 'typology'">
                      {{ totalTypology }}
                    </template>
                    <template v-else-if="item.key === 'sqm'">
                      {{ totalSqm }}
                    </template>
                    <template v-else-if="item.key === 'est_sales_price'">
                      {{ totalEstSprice }}
                    </template>
                    <template v-else-if="item.key === 'amount'">
                      {{ totalSecurityValue }}
                    </template>
                    <template v-else-if="item.key === 'insurance_value'">
                      {{ totalInsuranceValue }}
                    </template>
                    <template v-else-if="item.key === 'sales_price'">
                      {{ totalSalesPrice }}
                    </template>
                    <template v-else-if="item.key === 'repayment_price'">
                      {{ totalAmountReceived }}
                    </template>
                    <template v-else-if="item.key === 'net_proceeds_price'">
                      {{ totalNetIncome }}
                    </template>
                    <template v-else-if="item.key === 'dup'">
                      {{ totalDup }}
                    </template>
                    <template v-else-if="item.key === 'opt'">
                      <p>{{ t('总条数') }}</p>
                      <p>{{ props.isVariation ? formDataSource.filter(item => !item.is_delete).length : formDataSource.length }}</p>
                    </template>
                  </a-table-summary-cell>
                </a-table-summary-row>
              </a-table-summary>
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
import { projectAuditSecurityList, projectDetailApi, projectAuditSaveMode, projectDischargeAddEditSecurity, projectDetailAuditSecurityList } from '@/api/process';
import { projectVariationEdit } from '@/api/project/loan';
import { projectVariationSecurityList } from '@/api/project/variation';
import { systemDictData } from '@/api/system';
import tool, { selectDateFormat, numberStrFormat, navigationTo } from '@/utils/tool';
import { cloneDeep } from 'lodash';
import { QuestionCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue/es';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  isVariation: {
    type: Boolean,
    default: false
  },
  variationId: {
    type: [String, Number],
    default: ''
  },
  securityData: {
    type: Array,
    default: () => []
  },
  hasBuild: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits(['refresh']);

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const uuid = ref(route.query.uuid);

const back = () => {
  if (props.isOpen) {
    navigationTo(`/projects/discharge?uuid=${route.query.uuid}&type=1`);
  } else {
    router.back();
  }
};

const pageLoading = ref(false);
const dataInfo = ref();
const projectInfo = ref();

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

// 户型统计
const totalTypology = computed(() => {
  let data = cloneDeep(formDataSource.value);
  if (props.isVariation) {
    data = data.filter(item => !item.is_delete)
  }
  const typologyArr = data.map((item) => item.typology);

  const calc = typologyArr.reduce((acc, item) => {
    // 累加固定字段
    ['beds', 'bath', 'lounge', 'garage', 'carpark', 'level'].forEach((key) => {
      acc[key] = (acc[key] || 0) + Number(item[key]);
    });

    // 统计 other 里的动态字段，过滤掉没有 key 的数据
    if (Array.isArray(item.other)) {
      item.other
        .filter((entry) => entry.key) // 过滤 key 为空的项
        .forEach(({ key, value }) => {
          acc[key] = (acc[key] || 0) + Number(value);
        });
    }

    return acc;
  }, {});

  const txt = Object.entries(calc)
    .map(([key, value]) => `${value} ${key}`)
    .join(', ');
  return txt;
});

// 总面积
const totalSqm = computed(() => {
  let data = cloneDeep(formDataSource.value);
  if (props.isVariation) {
    data = data.filter(item => !item.is_delete)
  }
  const sqmArr = data.map((item) => item.sqm);
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `${numberStrFormat(sum)} m²`;
});

// 总预测销售价
const totalEstSprice = computed(() => {
  let data = cloneDeep(formDataSource.value);
  if (props.isVariation) {
    data = data.filter(item => !item.is_delete)
  }
  const sqmArr = data.map((item) => item.est_sales_price);
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`;
});

// 总担保价值
const totalSecurityValue = computed(() => {
  let data = cloneDeep(formDataSource.value);
  if (props.isVariation) {
    data = data.filter(item => !item.is_delete)
  }
  const sqmArr = data.map((item) => item.amount);
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`;
});

// 总保险价值
const totalInsuranceValue = computed(() => {
  let data = cloneDeep(formDataSource.value);
  if (props.isVariation) {
    data = data.filter(item => !item.is_delete)
  }
  const sqmArr = data.map((item) => item.insurance_value);
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`;
});

// 总销售价格
const totalSalesPrice = computed(() => {
  let data = cloneDeep(formDataSource.value);
  if (props.isVariation) {
    data = data.filter(item => !item.is_delete)
  }
  const sqmArr = data.map((item) => item.sales_price);
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`;
});

// 总回款金额
const totalAmountReceived = computed(() => {
  let data = cloneDeep(formDataSource.value);
  if (props.isVariation) {
    data = data.filter(item => !item.is_delete)
  }
  const sqmArr = data.map((item) => item.repayment_price);
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`;
});

// 总净收益
const totalNetIncome = computed(() => {
  let data = cloneDeep(formDataSource.value);
  if (props.isVariation) {
    data = data.filter(item => !item.is_delete)
  }
  const sqmArr = data.map((item) => item.net_proceeds_price);
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`;
});

// 总每单位债务
const totalDup = computed(() => {
  let data = cloneDeep(formDataSource.value);
  if (props.isVariation) {
    data = data.filter(item => !item.is_delete)
  }
  const sqmArr = data.map((item) => item.dup);
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`;
});

const baseData = ref(null);
const getDataInfo = async () => {
  pageLoading.value = true;
  await projectDetailApi({
    uuid: uuid.value
  })
    .then((res) => {
      if (res) {
        dataInfo.value = res;
        projectInfo.value = res.project;

        const borrowerName = res.borrower.borrower_type === 1 ? `${res.borrower.first_name} ${res.borrower.middle_name} ${res.borrower.last_name}` : res.borrower.organization_name;
        const nameStr = borrowerName || res.project.project_name || res.base.project_apply_sn;

        formState.value.security_name = t('{0}的抵押物', [nameStr]);

        let { project_address_short, project_address, project_suburb, region_one_id, region_two_id, region_three_id, project_postcode } = res.project;

        baseData.value = res.security?.base;

        if (baseData.value) {
          formState.value.security_name = baseData.value.security_name;
          formState.value.type = baseData.value.type;

          project_address_short = baseData.value.address_short;
          project_address = baseData.value.address;
          project_suburb = baseData.value.suburb;
          region_one_id = baseData.value.region_one_id;
          region_two_id = baseData.value.region_two_id;
          region_three_id = baseData.value.region_three_id;
          project_postcode = baseData.value.postcode;
        }

        formState.value.address_short = project_address_short || '';
        formState.value.address = project_address || '';
        formState.value.suburb = project_suburb || '';
        formState.value.region_one_id = region_one_id || 0;
        formState.value.region_two_id = region_two_id || 0;
        formState.value.region_three_id = region_three_id || 0;
        formState.value.postcode = project_postcode || '';
      }

      pageLoading.value = false;
    })
    .catch(() => {
      pageLoading.value = false;
    });
};

const typeData = ref([]);
const getTypeData = () => {
  systemDictData('security_type').then((res) => {
    const data = res.map((item) => {
      return {
        label: item.name,
        value: Number(item.code)
      };
    });
    typeData.value = data;
  });
};

const otherTypeData = ref([]);
const getOtherTypeData = () => {
  systemDictData('security_other_type').then((res) => {
    const data = res.map((item) => {
      return {
        label: item.name,
        value: item.code
      };
    });
    otherTypeData.value = data;
  });
};

const gstRate = ref(1.15);
const getGstRate = () => {
  systemDictData('gst_rate').then((res) => {
    const obj = res.find((item) => item.name === 'gst_rate_value');
    gstRate.value = obj ? Number(obj.code) : 1.15;
  });
};

const batchColumns = reactive([
  { title: t('修改项'), dataIndex: 'rowSelect', width: 100, align: 'center', fixed: 'left' },
  { title: t('类型1'), dataIndex: 'typology', width: 250, align: 'center' },
  { title: t('面积'), dataIndex: 'sqm', width: 105, align: 'center' },
  { title: t('预计销售价格'), dataIndex: 'est_sales_price', width: 130, align: 'center' },
  { title: t('含消费税'), dataIndex: 'is_gst', width: 110, align: 'center' },
  { title: t('拆分'), dataIndex: 'is_calc', width: 120, align: 'center' },
  { title: t('担保价值'), dataIndex: 'amount', width: 130, align: 'center' },
  { title: t('保险价值'), dataIndex: 'insurance_value', width: 130, align: 'center' },
  { title: t('销售价格'), dataIndex: 'sales_price', width: 130, align: 'center' },
  { title: t('回款金额'), dataIndex: 'repayment_price', width: 130, align: 'center' },
  { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 130, align: 'center' },
  { title: t('保险到期日'), dataIndex: 'insurance_expire_date', width: 145, align: 'center' },
  { title: t('合同日期'), dataIndex: 'contract_date', width: 145, align: 'center' },
  { title: t('结算日期'), dataIndex: 'settlement_date', width: 145, align: 'center' },
  { title: t('日落日期'), dataIndex: 'sunset_date', width: 145, align: 'center' },
  { title: t('还款日期'), dataIndex: 'repayment_date', width: 145, align: 'center' },
  { title: t('操作1'), dataIndex: 'opt', width: 115, align: 'center', fixed: 'right' }
]);

const batchDataSource = ref([
  {
    rowSelect: [],
    typology: {
      beds: 3,
      lounge: 1,
      bath: 2,
      garage: 1,
      level: 2,
      carpark: 1,
      other: []
    },
    sqm: '90',
    est_sales_price: 0,
    sales_price: 0,
    repayment_price: 0,
    is_gst: true,
    is_calc: true,
    insurance_value: 0,
    contract_date: '',
    settlement_date: '',
    sunset_date: '',
    repayment_date: '',
    net_proceeds_price: 0
  }
]);

const formColumns = reactive([
  { title: t('楼栋号'), dataIndex: 'card_no', width: 100, align: 'center', fixed: 'left' },
  { title: t('类型1'), dataIndex: 'typology', width: 250, align: 'center' },
  { title: t('面积'), dataIndex: 'sqm', width: 105, align: 'center' },
  { title: t('预计销售价格'), dataIndex: 'est_sales_price', width: 130, align: 'center' },
  { title: t('含消费税'), dataIndex: 'is_gst', width: 110, align: 'center' },
  { title: t('拆分'), dataIndex: 'is_calc', width: 120, align: 'center' },
  { title: t('担保价值'), dataIndex: 'amount', width: 130, align: 'center' },
  { title: t('保险价值'), dataIndex: 'insurance_value', width: 130, align: 'center' },
  { title: t('销售价格'), dataIndex: 'sales_price', width: 130, align: 'center' },
  { title: t('回款金额'), dataIndex: 'repayment_price', width: 130, align: 'center' },
  { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 130, align: 'center' },
  { title: t('变化比例'), dataIndex: 'variance', width: 100, align: 'center' },
  { title: t('每单位债务'), dataIndex: 'dup', width: 110, align: 'center' },
  { title: t('保险到期日'), dataIndex: 'insurance_expire_date', width: 145, align: 'center' },
  { title: t('合同日期'), dataIndex: 'contract_date', width: 145, align: 'center' },
  { title: t('结算日期'), dataIndex: 'settlement_date', width: 145, align: 'center' },
  { title: t('日落日期'), dataIndex: 'sunset_date', width: 145, align: 'center' },
  { title: t('还款日期'), dataIndex: 'repayment_date', width: 145, align: 'center' },
  { title: t('操作1'), dataIndex: 'opt', width: 115, align: 'center', fixed: 'right' }
]);

const summaryCol = ref([]);
for (let i = 0; i < formColumns.length; i++) {
  summaryCol.value.push({
    key: formColumns[i].dataIndex
  });
}

watch(
  () => formState.value.type,
  (val) => {
    const item = { title: t('类型1'), dataIndex: 'typology', width: 280, align: 'center' };
    const item1 = { key: 'typology' };
    const index1 = batchColumns.findIndex((item) => item.dataIndex === 'typology');
    const index2 = formColumns.findIndex((item) => item.dataIndex === 'typology');
    const index3 = summaryCol.value.findIndex((item) => item.key === 'typology');

    if (val === 2) {
      if (index1 < 0) {
        batchColumns.splice(1, 0, item);
      }
      if (index2 < 0) {
        formColumns.splice(1, 0, item);
      }
      if (index3 < 0) {
        summaryCol.value.splice(1, 0, item1);
      }
    } else {
      if (index1 > -1) {
        batchColumns.splice(index1, 1);
      }
      if (index2 > -1) {
        formColumns.splice(index2, 1);
      }
      if (index3 > -1) {
        summaryCol.value.splice(index3, 1);
      }
    }
  }
);

const formDataSource = ref([]);

const batchitem = {
  card_no: '',
  typology: {
    beds: 3,
    lounge: 1,
    bath: 2,
    garage: 1,
    level: 2,
    carpark: 1,
    other: []
  },
  sqm: '90',
  est_sales_price: 0,
  sales_price: 0,
  repayment_price: 0,
  is_gst: false,
  is_calc: true,
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
};

const oldData = ref([]);

const tableDataInit = async () => {
  let data = [];

  if (route.query.e || props.isVariation) {
    // 编辑
    const batchEditSec = sessionStorage.getItem('batchEditSec');
    if (batchEditSec) {
      const dataJson = JSON.parse(batchEditSec);
      formState.value.type = dataJson[0].type;

      oldData.value = cloneDeep(dataJson);

      const formOldData = dataJson.map((item, index) => {
        const sItem = cloneDeep(batchitem);
        for (const key in sItem) {
          if (item[key]) {
            sItem[key] = item[key];
          }
        }
        sItem.is_gst = sItem.is_gst === 1 ? true : false;
        sItem.is_calc = sItem.is_calc === 1 ? true : false;
        sItem.checked = true;
        sItem.name = item.card_no || t(`第{0}行`, [index + 1]);
        sItem.security_uuid = item.uuid || item.security_uuid;
        sItem.typology.other = sItem.typology.other || [];
        return sItem;
      });
      data = formOldData;
    } else {
      // 请求批量数据
      let list = []
      if (props.isVariation) {
        await projectVariationSecurityList({
          uuid: route.query.uuid
        }).then(res => {
          const resList = res || []
          let canList = resList.filter(item => Boolean(item.can_del) && !Boolean(item.status))
          canList.forEach(item => {
            item.not_variation = true
            item.is_delete = false
          })
          let variationList = []
          if (props.variationId && props.securityData.length) {
            const uuidArr = props.securityData.map(item => item.security_uuid)
            canList = canList.filter(item => !uuidArr.includes(item.uuid))
            variationList = props.securityData
          }
          list = [...cloneDeep(canList), ...cloneDeep(variationList)]
        })
      } else {
        await projectAuditSecurityList({
          uuid: route.query.uuid,
          type: baseData.value.type
        }).then(res => {
          list = res.list || []

          list.forEach(item => {
            item.not_variation = true
          })
        })
      }

      
      const listData = list || [];

      oldData.value = listData;

      const formOldData = listData.map((item, index) => {
        let sItem = cloneDeep(batchitem);
        for (const key in sItem) {
          if (item[key]) {
            sItem[key] = item[key];
          }
        }
        sItem.is_gst = sItem.is_gst === 1 ? true : false;
        sItem.is_calc = sItem.is_calc === 1 ? true : false;
        sItem.checked = true;
        sItem.name = item.card_no || t(`第{0}行`, [index + 1]);
        sItem.security_uuid = item.uuid || item.security_uuid;
        sItem.typology.other = sItem.typology.other || [];
        sItem.not_variation = item.not_variation || false;
        if (props.isVariation) {
          sItem.is_delete = item.is_delete || false;
          sItem.status = item.status || 0;

          sItem = {
            ...item,
            ...sItem
          }
        }
        
        return sItem;
      });
      data = formOldData;
    }
  } else {
    // 新增
    let listData = [];
    if (!props.isOpen) {
      // 请求批量数据
      const { list } = await projectAuditSecurityList({
        uuid: route.query.uuid,
        type: baseData.value?.type || 2
      });
      listData = list;
    }

    if (listData.length || props.isOpen) {
      // 已经批量添加过了
      const item = cloneDeep(batchitem);
      item.card_no = props.isOpen ? '' : `Lot ${listData.length + 1}`;
      item.checked = true;
      item.not_variation = true;
      item.name = props.isOpen ? '' : item.card_no || t(`第{0}行`, [index + 1]);
      item.typology.other = [];
      data.push(item);
    } else {
      for (let i = 0; i < Number(projectInfo.value.building_num); i++) {
        const item = cloneDeep(batchitem);
        item.card_no = `Lot ${i + 1}`;
        item.checked = true;
        item.not_variation = true;
        item.name = item.card_no || t(`第{0}行`, [index + 1]);
        item.typology.other = [];
        data.push(item);
      }
    }
  }
  formDataSource.value = data;
};

const addHandle = () => {
  const item = cloneDeep(batchitem);
  item.checked = true;
  item.name = item.card_no || t(`第{0}行`, [formDataSource.value.length + 1]);
  formDataSource.value.push(item);
};

const itemDelete = (index) => {
  formDataSource.value.splice(index, 1);
};

const itemBan = (index, flag) => {
  formDataSource.value[index].is_delete = flag;
}

const getRowClassName = (record, index) => {
  return record.is_delete ? 'deleted-row' : '';
}

const batchAll = computed(() => {
  const cAll = formDataSource.value.every((item) => item.checked);
  return cAll;
});

const selectVisible = ref(false);
const selectBatchTxt = computed(() => {
  const cAll = formDataSource.value.every((item) => item.checked);
  const nAll = formDataSource.value.every((item) => !item.checked);

  let txt = '';
  if (cAll) {
    txt = t('全部');
  } else {
    if (nAll) {
      txt = t('未选择');
    } else {
      const nameArr = formDataSource.value.filter((item) => item.checked).map((item) => item.name);
      txt = nameArr.join('; ');
    }
  }
  return txt;
});

const netproceedsPriceInput = (data) => {
  const net_proceeds_price = data.net_proceeds_price || 0;
  const amount = data.amount || 0;
  if (amount) {
    const num = tool.minus(net_proceeds_price, amount);
    const num1 = tool.div(num, amount);
    const resNum = tool.times(num1, 100);
    const variance = Math.ceil(resNum * 100) / 100;
    data.variance = variance;
  } else {
    data.variance = 0;
  }
};

const salesPriceInput = (data, flag) => {
  let price = data.est_sales_price || 0;
  if (flag) {
    price = data.sales_price || 0;
    data.est_sales_price = price;
  }

  if (Boolean(data.is_gst)) {
    const num = tool.div(price, gstRate.value);
    const resNum = Math.floor(num * 100) / 100;
    data.amount = resNum;

    if (Number(data.sales_price)) {
      data.repayment_price = resNum;
    }

    netproceedsPriceInput(data);
  } else {
    data.amount = 0;
  }
};

const settingHandle = () => {
  const data = cloneDeep(batchDataSource.value);
  const batchSet = data[0];
  delete batchSet.rowSelect;
  formDataSource.value.forEach((item) => {
    if (item.checked && !item.is_delete) {
      for (const key in batchSet) {
        if (key === 'typology') {
          for (const _key in batchSet[key]) {
            if (_key === 'other') {
              item[key][_key] = [];
              for (const otherKey in batchSet[key][_key]) {
                item[key][_key][otherKey] = batchSet[key][_key][otherKey];
              }
            } else {
              item[key][_key] = batchSet[key][_key];
            }
          }
        } else {
          item[key] = batchSet[key];
        }
      }
    }
  });
};

const checkHandle = (data) => {
  if (data) {
    data.checked = !data.checked;
  } else {
    formDataSource.value.forEach((item) => {
      item.checked = true;
    });
  }
};

const securitySameCheck = (arr1 = [], arr2 = []) => {
  const beforeData = cloneDeep(arr1)
  const afterData = cloneDeep(arr2)
  if (beforeData.length !== afterData.length) {
    return true
  }
  

  for (let i = 0; i < beforeData.length; i++) {
    const beforeId = beforeData[i]?.security_uuid || null
    const afterId = afterData[i]?.security_uuid || null
    if (beforeId !== afterId || beforeData[i].is_delete !== afterData[i].is_delete) {
      return true
    }
  }
  return false;
}

const confirmHandle = () => {
  if (props.isVariation) {
    variationSubmit()
  } else {
    submitRquest()
  }
}

const varationParams = ref({})
const variationSubmit = () => {
  subLoading.value = true;
  projectVariationEdit(varationParams.value).then(res => {
    emits('refresh', res.id);
    subLoading.value = false
    changeVisible.value = false
    changeAlertRef.value.changeLoading(false);
  }).catch(() => {
    subLoading.value = false
    changeAlertRef.value.changeLoading(false);
  })
}

const changeAlertRef = ref();
const changeVisible = ref(false);
const confirmTxt = ref('');

const subLoading = ref(false);
const submitRquest = () => {
  const formVal = cloneDeep(formState.value);
  const formData = cloneDeep(formDataSource.value);
  formData.forEach((item) => {
    item.is_gst = item.is_gst ? 1 : 0;
    item.is_calc = item.is_calc ? 1 : 0;
    item.is_sales = item.sales_price ? 1 : 0;
    item.type = formVal.type;
  });

  let delData = [];
  const oldUuid = oldData.value.map((item) => item.uuid);
  const nowUuid = formData.map((item) => item.security_uuid);

  if (oldUuid && oldUuid.length) {
    const set2 = new Set(nowUuid);
    delData = oldUuid.filter((item) => !set2.has(item));
  }

  const params = {
    code: route.query.code || '',
    uuid: route.query.uuid,
    security__data: {
      base: formVal,
      batch: formData,
      del: delData,
      upd: !baseData.value ? 1 : formVal.upd ? 1 : 0
    },
    security__mode: 2
  };
  delete formVal.upd;


  if (props.isVariation) {
    formData.forEach(item => {
      item.status = item.status || 0
      item.is_delete = item.is_delete || false
      item.not_variation = item.not_variation || false
      item.old_amount = item.old_amount || 0
    })
    const params = {
      security: formData,
      uuid: route.query.uuid
    }

    if (props.variationId) {
      params.id = props.variationId;
    }

    varationParams.value = cloneDeep(params)

    if (props.hasBuild && securitySameCheck(props.securityData, formData)) {
      params.build = []
      params.build_log = []
      params.initial_build_amount = 0

      varationParams.value = cloneDeep(params)
      confirmTxt.value = t('已设置过进度放款数据，提交后将清空设置，是否继续？');
      changeVisible.value = true;
      return;
    }

    variationSubmit()
  } else {
    subLoading.value = true;
    const ajaxFn = props.isOpen ? projectDischargeAddEditSecurity : projectAuditSaveMode;
    ajaxFn(params)
      .then(() => {
        subLoading.value = false;
        changeVisible.value = false;
        changeAlertRef.value.changeLoading(false);

        sessionStorage.removeItem('batchEditSec');
        back();
      })
      .catch(() => {
        changeAlertRef.value.changeLoading(false);
        subLoading.value = false;
      });
  }

  
};
const subHandle = () => {
  if (props.isVariation) {
    const formData = cloneDeep(formDataSource.value);

    for (let i = 0; i < formData.length; i++) {
      if (!formData[i].card_no) {
        message.error(t('请设置第{0}行的名称', [i + 1]));
        return false;
      }
    }

    submitRquest();
    return;
  }

  formRef.value
    .validate()
    .then(() => {
      const { project_address_short, project_address, project_suburb, region_one_id, region_two_id, region_three_id, project_postcode, project_city } = projectInfo.value;
      const { address_short, address, suburb, postcode } = formState.value;
      const region_one_id1 = formState.value.region_one_id;
      const region_two_id1 = formState.value.region_two_id;
      const region_three_id1 = formState.value.region_three_id;

      if (
        project_address_short !== address_short ||
        project_address !== address ||
        project_suburb !== suburb ||
        project_postcode !== postcode ||
        Number(region_one_id) !== Number(region_one_id1) ||
        Number(region_two_id) !== Number(region_two_id1) ||
        Number(region_three_id) !== Number(region_three_id1)
      ) {
        confirmTxt.value = t('当前项目地址为：{0}，抵押物地址与项目地址不一致，确定提交吗？', [project_city]);
        changeVisible.value = true;
      } else {
        const formData = cloneDeep(formDataSource.value);

        for (let i = 0; i < formData.length; i++) {
          if (!formData[i].card_no) {
            message.error(t('请设置第{0}行的名称', [i + 1]));
            return false;
          }
        }
        submitRquest();
      }
    })
    .catch((error) => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // 平滑滚动
      });
      console.log('error', error);
    });
};

const otherItem = {
  value: 1,
  key: ''
};
const typologyAdd = (data) => {
  const item = cloneDeep(otherItem);
  data.typology.other.push(item);
};
const typologyRemove = (data, index) => {
  data.typology.other.splice(index, 1);
};

// 输入提示
const getInputOptions = (max, decimal = false) => {
  if (decimal) {
    return Array.from({ length: max * 2 }, (_, i) => i * 0.5).map((item) => ({
      value: item
    }));
  }
  return Array.from({ length: max }, (_, i) => i + 1).map((item) => ({
    value: item
  }));
};

const dataInit = async () => {
  getTypeData();
  getGstRate();
  getOtherTypeData();
  await getDataInfo();

  tableDataInit();

  nextTick(() => {
    if (!props.isVariation) {
      vcoAddressRef.value && vcoAddressRef.value.init(formState.value);
    }
  });
}

onMounted(() => {
  dataInit()
});

defineExpose({
  dataInit
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
    .ant-table-tbody > tr > td {
      padding-left: 10px;
      padding-right: 10px;
    }
    .deleted-row {
      background-color: #dddddd !important;
      td {
        background-color: #dddddd !important;
      }
    }
    .ant-table-cell-fix-right-first::after,
    * {
      border-color: #272727 !important;
    }
    .ant-table-container table > thead > tr:first-child > *:first-child {
      border-start-start-radius: 0 !important;
    }
    .ant-table-ping-right .ant-table-cell-fix-right-first::after {
      box-shadow: inset -15px 0 8px -8px rgba(5, 5, 5, 0.2);
    }
    .ant-table-ping-left .ant-table-cell-fix-left-last::after {
      box-shadow: inset 15px 0 8px -8px rgba(5, 5, 5, 0.2);
    }
    .ant-table-container {
      border-radius: 0 !important;
      .ant-table-header {
        border-radius: 0 !important;
      }
    }
    .ant-table-summary {
      background-color: #f7f9f8 !important;
      .ant-table-cell {
        border-top: 1px solid #272727;
        padding: 16px 5px;
      }
    }
    .ant-table {
      background-color: transparent;
      border-spacing: 10px;
      table {
        border-top: none !important;
        border-radius: 0 !important;
      }
    }
    .ant-table-thead {
      border: none;
      & > tr > th {
        font-weight: 500;
        font-size: 10px;
        color: #282828 !important;
        background-color: #f7f9f8 !important;
        border-top: 1px solid #272727;
        border-radius: 0 !important;
      }
    }
    .ant-empty {
      min-height: 50px !important;
    }

    .type-add {
      width: 20px;
      height: 20px;
      border: 1px dashed #f19915 !important;
      cursor: pointer;
      color: #f19915;
      position: absolute;
      top: 5px;
      right: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        color: #fff;
        background-color: #f19915;
      }
      > .iconfont {
        font-size: 12px;
        font-weight: bold;
        line-height: 12px;
      }
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
  margin-right: 5px;
  &.line {
    width: 240px;
  }
  &:nth-child(1),
  &:nth-child(2) {
    margin-top: 0;
  }
  &:nth-child(even) {
    margin-right: 0;
  }
  .ant-select {
    width: 56px !important;
  }
  :deep(.ant-select-selector) {
    padding: 0 5px !important;
  }
  &.other {
    width: 220px !important;
    .ant-select.type-key {
      flex: 1;
    }
  }
}

.select-btn {
  cursor: pointer;
  color: #f19915;
  &:hover {
    color: #ef9f28;
  }
  .iconfont {
    font-size: 12px;
  }
}

.delete-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f19915;
  color: #fff;
  cursor: pointer;
  > .iconfont {
    font-size: 14px;
  }
  &:hover {
    background-color: #eb9412;
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
      background-color: #f19915;
      border-color: #f19915;
      color: #fff;
    }
  }
}
</style>
