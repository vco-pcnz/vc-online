<template>
  <div>
    <!-- 确认弹窗 -->
    <vco-confirm-alert
      ref="sureAlertRef"
      :confirm-txt="t('提交后，数据将无法再次修改，确定提交吗?')"
      v-model:visible="sureVisible"
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
    <vco-page-panel @back="goBack">
      <template #title>
        <div class="page-title-content">
          <div class="tag">{{ t('批量添加抵押物') }}</div>
        </div>
      </template>
    </vco-page-panel>

    <a-spin :spinning="pageLoading" size="large">
      <div class="main-form-content">
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
                      show-search
                      v-model:value="record.typology.beds"
                    >
                      <a-select-option v-for="num in 8" :key="`beds_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>beds</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      show-search
                      v-model:value="record.typology.bath"
                    >
                      <a-select-option 
                        v-for="num in Array.from({ length: 15 }, (_, i) => i * 0.5)" 
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
                      show-search
                      v-model:value="record.typology.lounge"
                    >
                      <a-select-option v-for="num in 5" :key="`lounge_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>lounge</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      show-search
                      v-model:value="record.typology.garage"
                    >
                      <a-select-option v-for="num in 5" :key="`garage_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>garage</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      show-search
                      v-model:value="record.typology.carpark"
                    >
                      <a-select-option v-for="num in 5" :key="`carpark_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>carpark</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      show-search
                      v-model:value="record.typology.level"
                    >
                      <a-select-option v-for="num in 4" :key="`level_${num}`" :value="num">{{num}}</a-select-option>
                    </a-select>
                    <p>level</p>
                  </div>
                  <template v-if="record.typology.other.length">
                    <div v-for="(item, index) in record.typology.other" :key="index" class="stuff-item other">
                      <a-select
                        show-search
                        v-model:value="item.value"
                      >
                        <a-select-option v-for="num in 5" :key="`other_${index}_${num}`" :value="num">{{num}}</a-select-option>
                      </a-select>
                      <a-select
                        show-search
                        v-model:value="item.key"
                        class="type-key"
                      >
                        <a-select-option v-for="_item in otherTypeData" :key="_item.value" :value="_item.label">{{_item.label}}</a-select-option>
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
                <a-button type="link" @click="settingHandle" class="uppercase">{{ t('批量设置')}} </a-button>
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
            :scroll="{ x: '100%', y: 600 }"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'card_no'">
                <a-input v-model:value="record.card_no" />
              </template>
              <template v-if="column.dataIndex === 'typology'">
                <div class="stuff-item-content">
                  <div class="stuff-item">
                    <a-select
                      show-search
                      v-model:value="record.typology.beds"
                    >
                      <a-select-option v-for="num in 8" :key="`beds_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>beds</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      show-search
                      v-model:value="record.typology.bath"
                    >
                      <a-select-option 
                        v-for="num in Array.from({ length: 15 }, (_, i) => i * 0.5)" 
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
                      show-search
                      v-model:value="record.typology.lounge"
                    >
                      <a-select-option v-for="num in 5" :key="`lounge_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>lounge</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      show-search
                      v-model:value="record.typology.garage"
                    >
                      <a-select-option v-for="num in 5" :key="`garage_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>garage</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      show-search
                      v-model:value="record.typology.carpark"
                    >
                      <a-select-option v-for="num in 5" :key="`carpark_${num - 1}`" :value="num - 1">{{num - 1}}</a-select-option>
                    </a-select>
                    <p>carpark</p>
                  </div>
                  <div class="stuff-item">
                    <a-select
                      show-search
                      v-model:value="record.typology.level"
                    >
                      <a-select-option v-for="num in 4" :key="`level_${num}`" :value="num">{{num}}</a-select-option>
                    </a-select>
                    <p>level</p>
                  </div>
                  <template v-if="record.typology.other.length">
                    <div v-for="(item, index) in record.typology.other" :key="index" class="stuff-item other">
                      <a-select
                        show-search
                        v-model:value="item.value"
                      >
                        <a-select-option v-for="num in 5" :key="`other_${index}_${num}`" :value="num">{{num}}</a-select-option>
                      </a-select>
                      <a-select
                        show-search
                        v-model:value="item.key"
                        class="type-key"
                      >
                        <a-select-option v-for="_item in otherTypeData" :key="_item.value" :value="_item.label">{{_item.label}}</a-select-option>
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
                      <p>{{ formDataSource.length }}</p>
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
import { onMounted, ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { 
  projectDetailAuditSecurityList
} from "@/api/process";
import { toolsAddSecurity } from '@/api/import'
import { systemDictData } from "@/api/system"
import tool, { selectDateFormat, numberStrFormat, goBack } from '@/utils/tool';
import { cloneDeep } from 'lodash';
import { toolsDetail } from '@/api/import'
import { message } from 'ant-design-vue/es';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n();
const route = useRoute();

const pageLoading = ref(false)

// 户型统计
const totalTypology = computed(() => {
  const data = cloneDeep(formDataSource.value)
  const typologyArr = data.map(item => item.typology)

  const calc = typologyArr.reduce((acc, item) => {
    // 累加固定字段
    ['beds', 'lounge', 'bath', 'garage', 'level', 'carpark'].forEach(key => {
      acc[key] = (acc[key] || 0) + item[key];
    });

    // 统计 other 里的动态字段，过滤掉没有 key 的数据
    if (Array.isArray(item.other)) {
      item.other
      .filter(entry => entry.key) // 过滤 key 为空的项
      .forEach(({ key, value }) => {
          acc[key] = (acc[key] || 0) + value;
      });
    }

    return acc;
  }, {});

  const txt = Object.entries(calc)
        .map(([key, value]) => `${value} ${key}`)
        .join(', ');
  return txt
})

// 总面积
const totalSqm = computed(() => {
  const data = cloneDeep(formDataSource.value)
  const sqmArr = data.map(item => item.sqm)
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `${numberStrFormat(sum)} m²`
})

// 总预测销售价
const totalEstSprice = computed(() => {
  const data = cloneDeep(formDataSource.value)
  const sqmArr = data.map(item => item.est_sales_price)
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`
})

// 总担保价值
const totalSecurityValue = computed(() => {
  const data = cloneDeep(formDataSource.value)
  const sqmArr = data.map(item => item.amount)
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`
})

// 总保险价值
const totalInsuranceValue = computed(() => {
  const data = cloneDeep(formDataSource.value)
  const sqmArr = data.map(item => item.insurance_value)
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`
})

// 总销售价格
const totalSalesPrice = computed(() => {
  const data = cloneDeep(formDataSource.value)
  const sqmArr = data.map(item => item.sales_price)
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`
})

// 总回款金额
const totalAmountReceived = computed(() => {
  const data = cloneDeep(formDataSource.value)
  const sqmArr = data.map(item => item.repayment_price)
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`
})

// 总净收益
const totalNetIncome = computed(() => {
  const data = cloneDeep(formDataSource.value)
  const sqmArr = data.map(item => item.net_proceeds_price)
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`
})

// 总每单位债务
const totalDup = computed(() => {
  const data = cloneDeep(formDataSource.value)
  const sqmArr = data.map(item => item.dup)
  const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
  return `$${numberStrFormat(sum)}`
})

const otherTypeData = ref([])
const getOtherTypeData = () => {
  systemDictData('security_other_type').then(res => {
    const data = res.map(item => {
      return {
        label: item.name,
        value: item.code
      }
    })
    otherTypeData.value = data
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
  { title: t('修改项'), dataIndex: 'rowSelect', width: 120, align: 'center', fixed: 'left' },
  { title: t('类型1'), dataIndex: 'typology', width: 260, align: 'center' },
  { title: t('面积'), dataIndex: 'sqm', width: 120, align: 'center' },
  { title: t('预计销售价格'), dataIndex: 'est_sales_price', width: 150, align: 'center' },
  { title: t('含消费税'), dataIndex: 'is_gst', width: 115, align: 'center' },
  { title: t('拆分'), dataIndex: 'is_calc', width: 120, align: 'center' },
  { title: t('担保价值'), dataIndex: 'amount', width: 150, align: 'center' },
  { title: t('保险价值'), dataIndex: 'insurance_value', width: 150, align: 'center' },
  { title: t('销售价格'), dataIndex: 'sales_price', width: 150, align: 'center' },
  { title: t('回款金额'), dataIndex: 'repayment_price', width: 150, align: 'center' },
  { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 150, align: 'center' },
  { title: t('保险到期日'), dataIndex: 'insurance_expire_date', width: 155, align: 'center' },
  { title: t('合同日期'), dataIndex: 'contract_date', width: 155, align: 'center' },
  { title: t('结算日期'), dataIndex: 'settlement_date', width: 155, align: 'center' },
  { title: t('日落日期'), dataIndex: 'sunset_date', width: 155, align: 'center' },
  { title: t('还款日期'), dataIndex: 'repayment_date', width: 155, align: 'center' },
  { title: t('操作1'), dataIndex: 'opt', width: 115, align: 'center', fixed: 'right' }
])

const batchDataSource = ref([{
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
  is_gst: false,
  is_calc: false,
  insurance_value: 0,
  contract_date: '',
  settlement_date: '',
  sunset_date: '',
  repayment_date: '',
  net_proceeds_price: 0
}])

const formColumns = reactive([
  { title: t('楼栋号'), dataIndex: 'card_no', width: 120, align: 'center', fixed: 'left' },
  { title: t('类型1'), dataIndex: 'typology', width: 260, align: 'center' },
  { title: t('面积'), dataIndex: 'sqm', width: 120, align: 'center' },
  { title: t('预计销售价格'), dataIndex: 'est_sales_price', width: 150, align: 'center' },
  { title: t('含消费税'), dataIndex: 'is_gst', width: 115, align: 'center' },
  { title: t('拆分'), dataIndex: 'is_calc', width: 120, align: 'center' },
  { title: t('担保价值'), dataIndex: 'amount', width: 150, align: 'center' },
  { title: t('保险价值'), dataIndex: 'insurance_value', width: 150, align: 'center' },
  { title: t('销售价格'), dataIndex: 'sales_price', width: 150, align: 'center' },
  { title: t('回款金额'), dataIndex: 'repayment_price', width: 150, align: 'center' },
  { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 150, align: 'center' },
  { title: t('变化比例'), dataIndex: 'variance', width: 100, align: 'center' },
  { title: t('每单位债务'), dataIndex: 'dup', width: 150, align: 'center' },
  { title: t('保险到期日'), dataIndex: 'insurance_expire_date', width: 155, align: 'center' },
  { title: t('合同日期'), dataIndex: 'contract_date', width: 155, align: 'center' },
  { title: t('结算日期'), dataIndex: 'settlement_date', width: 155, align: 'center' },
  { title: t('日落日期'), dataIndex: 'sunset_date', width: 155, align: 'center' },
  { title: t('还款日期'), dataIndex: 'repayment_date', width: 155, align: 'center' },
  { title: t('操作1'), dataIndex: 'opt', width: 115, align: 'center', fixed: 'right' }
])

const summaryCol = ref([])
for (let i = 0; i < formColumns.length; i++) {
  summaryCol.value.push({
    key: formColumns[i].dataIndex
  })
}

const formDataSource = ref([])

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
  is_calc: false,
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

const tableDataInit = async () => {
  pageLoading.value = true
  const projectInfo = await toolsDetail({uuid: route.query.uuid})
  const defaultBuildNum = projectInfo.building_num || 0

  const { list } = await projectDetailAuditSecurityList({uuid: route.query.uuid})

  const listData = list || []
  oldData.value = listData

  let data = []

  if (listData.length) { // 编辑
    const formOldData = listData.map((item, index) => {
      const sItem = cloneDeep(batchitem)
      for (const key in sItem) {
        if (item[key]) {
          sItem[key] = item[key]
        }
      }
      sItem.is_gst = sItem.is_gst === 1 ? true : false
      sItem.is_calc = sItem.is_calc === 1 ? true : false
      sItem.checked = true
      sItem.name = item.card_no || t(`第{0}行`, [index + 1])
      sItem.security_uuid = item.uuid
      sItem.typology.other = sItem.typology.other || []
      return sItem
    })
    data = formOldData
  } else { // 新增
    for (let i = 0; i < defaultBuildNum; i++) {
      const item = cloneDeep(batchitem)
      item.card_no = `Lot ${i + 1}`
      item.checked = true
      item.name = item.card_no || t(`第{0}行`, [index + 1])
      item.typology.other = []
      data.push(item)
    }
  }
  formDataSource.value = data

  pageLoading.value = false
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
            if (_key === 'other') {
              item[key][_key] = []
              for (const otherKey in batchSet[key][_key]) {
                item[key][_key][otherKey] = batchSet[key][_key][otherKey]
              }
            } else {
              item[key][_key] = batchSet[key][_key]
            }
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


const subLoading = ref(false)

const sureAlertRef = ref()
const sureVisible = ref(false)
const currentParams = ref()

const submitRquest = () => {
  subLoading.value = true;
  sureAlertRef.value.changeLoading(true)

  toolsAddSecurity(currentParams.value).then(() => {
    subLoading.value = false;
    sureVisible.value = false
    sureAlertRef.value.changeLoading(false)
    goBack()
  }).catch(() => {
    subLoading.value = false;
    sureVisible.value = false
    sureAlertRef.value.changeLoading(false)
  });
}

const subHandle = () => {
  const formData = cloneDeep(formDataSource.value);
  for (let i = 0; i < formData.length; i++) {
    if (!formData[i].card_no) {
      message.error(t('请设置第{0}行的名称', [i + 1]))
      return false
    }
  }

  formData.forEach(item => {
    item.is_gst = item.is_gst ? 1 : 0
    item.is_calc = item.is_calc ? 1 : 0
    item.is_sales = item.sales_price ? 1 : 0
    item.type = 2
    item.security_name = item.name
  })

  let delData = []
  const oldUuid = oldData.value.map(item => item.uuid)
  const nowUuid = formData.map(item => item.security_uuid)

  if (oldUuid && oldUuid.length) {
    const set2 = new Set(nowUuid);
    delData = oldUuid.filter(item => !set2.has(item));
  }

  const params = {
    uuid: route.query.uuid,
    security__data: {
      batch: formData,
      del: delData
    }
  }

  currentParams.value = params

  submitRquest()
  // sureVisible.value = true
}

const otherItem = {
  value: 1,
  key: ''
}
const typologyAdd = (data) => {
  const item = cloneDeep(otherItem)
  data.typology.other.push(item)
}
const typologyRemove = (data, index) => {
  data.typology.other.splice(index, 1)
}

onMounted(async () => {
  getGstRate()
  getOtherTypeData()
  if (route.query.uuid) {
    tableDataInit()
  }
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
    .ant-table-container table>thead>tr:first-child >*:first-child {
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
    .ant-table-fixed-header .ant-table-container {
      // border-bottom: 1px solid #272727;
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
      border: 1px dashed #F19915 !important;
      cursor: pointer;
      color: #F19915;
      position: absolute;
      top: 5px;
      right: 5px;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        color: #fff;
        background-color: #F19915;
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
  color: #F19915;
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
  background-color: #F19915;
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
      background-color: #F19915;
      border-color: #F19915;
      color: #fff;
    }
  }
}
</style>
