<template>

  <!-- 确认弹窗 -->
  <vco-confirm-alert
    ref="changeAlertRef"
    :confirm-txt="confirmTxt"
    v-model:visible="changeVisible"
    @submit="saveDone"
  ></vco-confirm-alert>

  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="modeRef" class="myMode text-left sys-form-content">
    <a-modal :width="edit ? (isVariation ? 1200 : 1000) : 1000" :open="visible" :title="t('开发成本')" :getContainer="() => $refs.modeRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <a-form-item-rest>
          <div v-for="(item, p_index) in data.data" :key="item.type" class="mb-5 card">
            <!-- 建筑成本 -->
            <template v-if="p_index === 0">
              <div class="flex justify-between tabel-type">
                <div class="flex gap-2">
                  <p class="bold fs_xl">{{ item.type }}</p>
                  <a-button v-if="!disabledModel && edit" type="brown" size="small" shape="round" @click="data.model = data.model ? 0 : 1">for {{ data.model ? t('QS报告') : t('进度放款') }}</a-button>
                  <a-button v-else type="brown" size="small" shape="round"> {{ data.model ? t('QS报告') : t('进度放款') }}</a-button>
                </div>
                <a-popover trigger="click" v-if="edit">
                  <template #content>
                    <a-menu :selectable="false" style="border: none !important">
                      <a-menu-item>
                        <div v-if="!showAdd" :class="[{ disabled: !showAdd }]" class="text-center">{{ t('选择') }}</div>
                        <div v-else @click="add(p_index, 0)" class="text-center">{{ t('选择') }}</div>
                      </a-menu-item>
                      <a-menu-item>
                        <div @click="add(p_index, 1)" class="text-center">{{ t('自定义') }}</div>
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button v-if="isVariation && isPlus || !isVariation" type="primary" shape="round" size="small" class="uppercase">{{ t('添加') }}</a-button>
                </a-popover>
              </div>
              <a-table :columns="ConstructionColumns" :data-source="item.list" :pagination="false" :scroll="{ x: '100%' }">
                <template #bodyCell="{ column, record, index }">
                  <template v-if="edit">
                    <template v-if="column.dataIndex === 'type'">
                      <div class="flex items-center">
                        <PlusCircleOutlined class="addChid" @click="addChid(index)" v-if="!Boolean(record?.status)" />
                        <div style="flex: 1; width: 0px">
                          <a-select v-if="!record.model" :loading="loading_type" style="width: 100%" :disabled="Boolean(record?.status)" v-model:value="record.type" :options="initTypes" :fieldNames="{ label: 'name', value: 'code' }"></a-select>
                          <a-input v-if="record.model" style="width: 100%" :disabled="Boolean(record?.status)" v-model:value="record.type"></a-input>
                        </div>
                      </div>
                      <template v-if="record?.list">
                        <div v-for="(sub, subIndex) in record?.list" :key="subIndex" class="flex items-center mt-2" style="padding-left: 30px">
                          <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="removeChid(index, subIndex)" :disabled="Boolean(record?.status)" v-if="!Boolean(record?.status)">
                            <MinusCircleOutlined class="addChid removeChid" />
                          </a-popconfirm>
                          <div style="flex: 1">
                            <a-input v-model:value="sub.type" :disabled="Boolean(record?.status)" />
                          </div>
                        </div>
                      </template>
                    </template>
                    <template v-if="column.dataIndex === 'loan' || column.dataIndex === 'borrower_equity'">
                      <a-input-number
                        v-if="(record.type !== 'Land_gst' && record.type !== 'Build_gst') || column.dataIndex === 'loan'"
                        v-model:value="record[column.dataIndex]"
                        :disabled="Boolean(record?.status) || (disabledLoan && column.dataIndex === 'loan') || Boolean(record?.list && record?.list.length) || isVariation"
                        @change="initData"
                        :max="99999999999"
                        :min="0"
                        :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                      <a-input-number
                        v-if="(record.type == 'Land_gst' || record.type == 'Build_gst') && column.dataIndex === 'borrower_equity'"
                        v-model:value="record[column.dataIndex]"
                        :disabled="true"
                        :max="99999999999"
                        :min="-99999999999"
                        :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                      <template v-if="record?.list">
                        <div v-for="(sub, subIndex) in record?.list" :key="subIndex" class="mt-2">
                          <a-input-number
                            v-if="(record.type !== 'Land_gst' && record.type !== 'Build_gst') || column.dataIndex === 'loan'"
                            v-model:value="sub[column.dataIndex]"
                            :disabled="Boolean(record?.status) || (disabledLoan && column.dataIndex === 'loan')"
                            @change="initItemData(index)"
                            :max="99999999999"
                            :min="0"
                            :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                          />
                          <a-input-number
                            v-if="(record.type == 'Land_gst' || record.type == 'Build_gst') && column.dataIndex === 'borrower_equity'"
                            v-model:value="sub[column.dataIndex]"
                            :disabled="true"
                            :max="99999999999"
                            :min="-99999999999"
                            :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                          />
                        </div>
                      </template>
                    </template>
                  </template>
                  <template v-else>
                    <template v-if="column.dataIndex === 'type'">
                      {{ record.name }}
                      <template v-if="record?.list">
                        <div v-for="(sub, subIndex) in record?.list" :key="subIndex" class="flex items-center mt-2" style="padding-left: 30px">
                          <div style="flex: 1">
                            {{ sub.type }}
                          </div>
                        </div>
                      </template>
                    </template>
                    <template v-if="column.dataIndex === 'loan' || column.dataIndex === 'borrower_equity'">
                      <vco-number :value="record[column.dataIndex]" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                      <template v-if="record?.list">
                        <div v-for="(sub, subIndex) in record?.list" :key="subIndex" class="flex items-center mt-2">
                          <div style="flex: 1">
                            <vco-number :value="sub[column.dataIndex]" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                          </div>
                        </div>
                      </template>
                    </template>
                  </template>
                  <template v-if="column.dataIndex === 'total'">
                    <div style="position: absolute; top: 13px">
                      <vco-number :value="record[column.dataIndex]" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                    </div>
                  </template>
                  <template v-if="column.dataIndex === 'operation'">
                    <div style="position: absolute; top: 13px; left: 0px; right: 0">
                      <a-popconfirm :title="t('确定删除吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="remove(p_index, index)" :disabled="Boolean(record?.status)">
                        <i class="iconfont" style="cursor: pointer" :class="[{ disabled: Boolean(record?.status) }]">&#xe8c1;</i>
                      </a-popconfirm>
                    </div>
                  </template>
                  <template v-if="column.dataIndex === 'change_value'">
                    <template v-if="record?.name !== 'Land GST'">
                      <div v-if="!record?.list || !record?.list?.length || record?.name === 'Construction'" class="flex items-center gap-2">
                        <i class="iconfont" v-if="isPlus" style="color: #31bd65">&#xe712;</i>
                        <i class="iconfont" v-else style="color: #eb4b6d">&#xe711;</i>
                        <a-input-number
                          v-if="edit"
                          v-model:value="record.change_value"
                          :max="isPlus ? 999999999 : Number(record.max_amount || 0)"
                          :min="0"
                          :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                        />
                        <vco-number v-else :value="record.change_value" :precision="2" :color="isPlus ? '#31bd65' : '#eb4b6d'" size="fs_md" :bold="true" :end="true"></vco-number>
                        <a-tooltip v-if="!isPlus && edit">
                          <template #title>
                            <p>{{ t('最大变更值') }}：${{ numberStrFormat(record.max_amount) }}</p>
                          </template>
                          <i class="iconfont cursor-pointer">&#xe6b3;</i>
                        </a-tooltip>
                      </div>
                      <div v-else style="height: 28px;"></div>
                      <template v-if="record?.list && record?.list?.length && record?.name !== 'Construction'">
                        <div v-for="(sub, subIndex) in record?.list" :key="subIndex" class="flex items-center gap-2 mt-2">
                          <i class="iconfont" v-if="isPlus" style="color: #31bd65">&#xe712;</i>
                          <i class="iconfont" v-else style="color: #eb4b6d">&#xe711;</i>
                          <a-input-number
                            v-if="edit"
                            v-model:value="sub.change_value"
                            :max="isPlus ? 999999999 : Number(sub.max_amount || 0)"
                            :min="0"
                            :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                          />
                          <vco-number v-else :value="sub.change_value" :precision="2" :color="isPlus ? '#31bd65' : '#eb4b6d'" size="fs_md" :bold="true" :end="true"></vco-number>
                          <a-tooltip v-if="!isPlus && edit">
                            <template #title>
                              <p>{{ t('最大变更值') }}：${{ numberStrFormat(sub.max_amount) }}</p>
                            </template>
                            <i class="iconfont cursor-pointer">&#xe6b3;</i>
                          </a-tooltip>
                        </div>
                      </template>
                    </template>
                  </template>
                </template>
              </a-table>
              <div class="flex items-center total-row" :class="[{ myModeEidt: edit }]" v-if="item.list.length">
                <div class="title bold pl">{{ t('小计') }}</div>
                <div class="amount pl">
                  <vco-number :value="item.loan" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="amount pl">
                  <vco-number :value="item.borrower_equity" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="amount">
                  <vco-number :value="item.total" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="total" v-if="edit && !isVariation"></div>
                <div v-if="isVariation" class="change-value-container" :class="{'edit': edit, 'reduce': !isPlus}">
                  <i class="iconfont" v-if="isPlus" style="color: #31bd65">&#xe712;</i>
                  <i class="iconfont" v-else style="color: #eb4b6d">&#xe711;</i>
                  <vco-number :value="changeTotal" :precision="2" size="fs_md" :color="isPlus ? '#31bd65' : '#eb4b6d'" :bold="true" :end="true"></vco-number>
                </div>
              </div>
            </template>
            <!-- 财务成本 -->
            <template v-if="p_index === 3">
              <div class="flex justify-between tabel-type">
                <p class="bold fs_xl">{{ item.type }}</p>
              </div>
              <a-table :columns="FinanceColumns" :data-source="item.list" :pagination="false" :scroll="{ x: '100%' }">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'loan' || column.dataIndex === 'borrower_equity'">
                    <vco-number :value="record[column.dataIndex]" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                  </template>
                  <template v-if="column.dataIndex === 'total'">
                    <vco-number :value="record[column.dataIndex]" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                  </template>
                </template>
              </a-table>
              <div class="flex items-center total-row" v-if="item.list && item.list.length">
                <div class="title bold pl">{{ t('总财务费用') }}</div>
                <div class="amount pl">
                  <vco-number :value="item.loan" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="amount pl">
                  <vco-number :value="item.borrower_equity" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="amount">
                  <vco-number :value="item.total" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="total" v-if="edit"></div>
              </div>
            </template>
            <!-- 净商品与服务税 -->
            <div v-if="p_index === 1 || p_index === 2" class="flex items-center total-row">
              <div class="title bold bold fs_xl text-left" style="padding: 0">{{ item.type }}</div>
              <template v-if="edit">
                <div class="amount">
                  <a-input-number
                    v-model:value="item.loan"
                    :disabled="disabledGST"
                    :max="99999999999"
                    :min="-99999999999"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    @change="initData"
                  />
                </div>
                <div class="amount">
                  <a-input-number
                    v-model:value="item.borrower_equity"
                    :disabled="disabledGST || p_index == 1"
                    :max="99999999999"
                    :min="-99999999999"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    @change="initData"
                  />
                </div>
              </template>
              <template v-else>
                <div class="amount">
                  <vco-number :value="item.loan" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
                <div class="amount">
                  <vco-number :value="item.borrower_equity" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
              </template>
              <div class="amount">
                <vco-number :value="item.total" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
              </div>
              <div class="total" v-if="edit"></div>
            </div>
          </div>
          <div v-if="showRefinancial" class="refinancial-row">
            <div class="flex gap-4 items-center">
              <p>{{ t('是否需要再融资') }}</p>
              <a-switch v-if="edit" v-model:checked="isRefinancialChecked" @change="changeRefinancial" />
            </div>

            <template v-if="isRefinancialChecked">
              <div class="refinancial-select">
                <a-select
                  v-model:value="refinancialIds"
                  mode="multiple"
                  :options="refinancialData"
                  :filter-option="filterOption"
                  :placeholder="t('请选择项目')"
                  :disabled="!edit"
                  :loading="refinancialLoading"
                  @change="(value, option) => refinancialChange(option)"
                >
                  <template #option="{ label, value, item }">
                    <p>{{ label }}</p>
                    <p style="color: #666; font-size: 12px;">{{ item.project_apply_sn }}</p>
                  </template>
                </a-select>

                <div class="amount">
                  <vco-number :value="refinancialAmount" :precision="2" size="fs_md" :bold="true" :end="true"></vco-number>
                </div>
              </div>
              <div v-if="selectedDatas.length" class="refinancial-table">
                <div class="th col-item">
                  <div>{{ t('建议标准税率') }}(%)</div>
                  <div>{{ t('罚息减免最大额度') }}</div>
                  <div>{{ t('还款总额') }}</div>
                  <div>{{ t('减免额度') }}</div>
                  <div>{{ t('还款金额1') }}</div>
                  <div>Loan IRR</div>
                </div>
                <div v-for="col in selectedDatas" :key="col.value" class="col-item tr">
                  <div>
                    <a-input-number
                      :max="100"
                      :min="col.item.allRepayment.min_StandardRate"
                      v-model:value="col.item.allRepayment.StandardRate"
                      :formatter="
                        (value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :controls="false"
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      :disabled="!edit || !(Number(col.item.allRepayment.min_StandardRate) > 0)"
                      @input="() => refinancialInputChange(col)"
                      @blur="() => refinancialInputBlur(col)"
                    >
                      <template #addonAfter>
                        <a-tooltip placement="top">
                          <template #title>
                            <p v-if="col.item.allRepayment.isOld">{{ t('此数据为老数据，请移除后，重新选择') }}</p>
                            <template v-else>
                              <p>{{ col.label }}</p>
                              <p>{{ `${t('最小值')}: ${col.item.allRepayment.min_StandardRate}%` }}</p>
                            </template>
                          </template>
                          <i class="iconfont limit-icon" :class="{'old': col.item.allRepayment.isOld}">&#xe6b3;</i>
                        </a-tooltip>
                      </template>
                    </a-input-number>
                  </div>
                  <div>{{ `$${numberStrFormat(col.item.allRepayment.reduction_money)}` }}</div>
                  <div class="row">
                    <div>{{ `$${numberStrFormat(col.item.allRepayment.last_money)}` }}</div>
                    <i class="iconfont">&#xe711;</i>
                  </div>
                  <div class="input">
                    <a-input-number
                      :max="Number(col.item.allRepayment.reduction_money)"
                      v-model:value="col.item.allRepayment.reduction_money_input"
                      :formatter="
                        (value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      "
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      :controls="false"
                      :disabled="!edit || !(Number(col.item.allRepayment.reduction_money) > 0)"
                      @input="() => refinancialCaclIrr(col)"
                    >
                    </a-input-number>
                  </div>
                  <div>{{ repaymentAmount(col) }}</div>
                  <div class="row gap-2">
                    {{ col.item.allRepayment.new_irr }}
                    <p>({{ col.item.allRepayment.irr }})</p>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </a-form-item-rest>
        <div class="flex items-center total-row" style="border: none; padding: 0 24px">
          <div class="title bold bold fs_xl text-left">{{ t('总计') }}</div>
          <div class="amount pl">
            <vco-number :value="data.loan" :precision="2" size="fs_xl" :bold="true" :end="true"></vco-number>
          </div>
          <div class="amount pl">
            <vco-number :value="data.borrower_equity" :precision="2" size="fs_xl" :bold="true" :end="true"></vco-number>
          </div>
          <div class="amount">
            <vco-number :value="devTotal" :precision="2" size="fs_xl" :bold="true" :end="true"></vco-number>
          </div>
          <div class="total" v-if="edit"></div>
        </div>
        <div class="flex justify-center" v-if="edit">
          <a-button @click="save" type="dark" class="save big uppercase" :disabled="data?.total < 0">
            {{ t('保存') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue/es';
import tool, { isArrayEqual, numberStrFormat } from '@/utils/tool';
import { systemDictData } from '@/api/system';
import { cloneDeep } from 'lodash';
import { projectLoanGetBuild, projectAuditSubstitution, projectDetailSubstitution } from "@/api/process"
import { projectLoanAllRepayment, projectLoanCalcIrr } from '@/api/project/loan';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons-vue';
import { debounce } from 'lodash';

const { t } = useI18n();
const emits = defineEmits(['update:value', 'update:dataJson', 'update:isRefinancial', 'update:substitutionIds', 'change', 'reChange', 'clearBuild']);

const props = defineProps({
  value: {
    type: [String, Number]
  },
  edit: {
    type: Boolean,
    default: true
  },
  dataJson: {
    type: [Array, String]
  },
  disabledGST: {
    type: Boolean,
    default: false
  },
  disabledLoan: {
    type: Boolean,
    default: false
  },
  disabledModel: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  hasBuild: {
    type: Boolean,
    default: false
  },
  isRefinancial: {
    type: Boolean,
    default: false
  },
  selectedRefinancialObj: {
    type: Object,
    default: () => {}
  },
  substitutionIds: {
    type: Array,
    default: () => []
  },
  isVariation: {
    type: Boolean,
    default: false
  },
  uuid: {
    type: String,
    default: ''
  },
  remainLandAmount: {
    type: Number,
    default: 0
  },
  isPlus: {
    type: Boolean,
    default: false
  },
  loanDate: {
    type: Array,
    default: () => []
  },
  lendingInfo: {
    type: Object,
    default: () => null
  }
});

const visible = ref(false);

const columnsData = [
  { title: t('类型'), dataIndex: 'type', ellipsis: true },
  { title: t('贷款'), dataIndex: 'loan', width: 180, ellipsis: true },
  { title: t('借款人权益'), dataIndex: 'borrower_equity', width: 180, ellipsis: true },
  { title: t('总计'), dataIndex: 'total', width: 180, ellipsis: true },
  { title: t('操作'), dataIndex: 'operation', width: 110, align: 'center', ellipsis: true }
]

const isDetails = computed(() => {
  return !props.edit || props.isVariation
})

const showRefinancial = computed(() => {
  if (isDetails.value) {
    // 兼容之前已经置换的项目，之前的没有减免额度等数据
    // return props.selectedRefinancialObj ? Object.keys(props.selectedRefinancialObj).length : false
    return true
  } else {
    return refinancialData.value.length
  }
})

const ConstructionColumns = reactive(columnsData);

if (props.isVariation) {
  if (!props.isPlus) {
    ConstructionColumns.splice(4, 1);
  }
  // 在第四个后面插入
  ConstructionColumns.splice(4, 0, { title: t('变更值'), dataIndex: 'change_value', width: 220, ellipsis: true });
}

const FinanceColumns = reactive([
  { title: t('类型'), dataIndex: 'type', ellipsis: true },
  { title: t('贷款'), dataIndex: 'loan', width: 180, ellipsis: true },
  { title: t('借款人权益'), dataIndex: 'borrower_equity', width: 180, ellipsis: true },
  { title: t('总计'), dataIndex: 'total', width: 180, ellipsis: true },
  { title: t(''), dataIndex: 'operation', width: 110, align: 'center', ellipsis: true }
]);
const data = ref({
  loan: 0,
  borrower_equity: 0,
  total: 0,
  model: 0,
  data: [
    {
      type: t('建筑成本'),
      loan: 0,
      borrower_equity: 0,
      total: 0,
      list: []
    },
    {
      type: t('补充股权'),
      loan: 0,
      borrower_equity: 0,
      total: 0
    },
    {
      type: t('净商品与服务税'),
      loan: 0,
      borrower_equity: 0,
      total: 0
    },
    {
      type: t('财务成本'),
      loan: 0,
      borrower_equity: 0,
      list: []
    }
  ]
});

const updateVisible = (value) => {
  visible.value = value;
};

const add = (index, model) => {
  data.value.data[index].list.push({
    type: '',
    loan: 0,
    model: model,
    borrower_equity: 0
  });
};

const remove = (p_index, index) => {
  data.value.data[p_index].list.splice(index, 1);
  initData();
};

const validateTypes = (obj) => {
  // 检查当前对象的type
  if (obj.type === undefined || obj.type === null || obj.type === '') {
    return false;
  }

  // 如果存在list数组，递归检查每个元素
  if (Array.isArray(obj.list)) {
    for (const item of obj.list) {
      if (!validateTypes(item)) {
        return false;
      }
    }
  }

  return true;
};


const changeAlertRef = ref()
const changeVisible = ref(false)
const confirmTxt = ref('')

const saveDone = () => {
  const doneData = cloneDeep(data.value);
  doneData.data[0].list.forEach((item) => {
    item.name = item.model ? item.type : typesObj.value[item.type] || '';

    if (props.isVariation) {
      item.change_type = props.isPlus ? 1 : 0
      if (item.list && item.list.length) {
        item.list.forEach((sub) => {
          sub.change_type = props.isPlus ? 1 : 0
        })
      }
    }
  });

  if (changeVisible.value) {
    emits('clearBuild');
  }

  emits('update:value', cloneDeep(doneData.total));
  emits('update:dataJson', cloneDeep([doneData]));
  emits('change', cloneDeep({ devCost: doneData.total, devCostDetail: [doneData] }));
  updateVisible(false);

  changeAlertRef.value.changeLoading(false)
  changeVisible.value = false
}

const save = () => {
  emits('update:isRefinancial', isRefinancialChecked.value);
  emits('update:substitutionIds', refinancialIds.value);
  emits('reChange', selectedDatas.value);


  const doneData = cloneDeep(data.value);
  doneData.data[0].list.forEach((item) => {
    item.name = item.model ? item.type : typesObj.value[item.type] || '';
  });

  if (!validateTypes(doneData.data[0])) {
    message.error(t('建设成本类型不能为空'));
    return;
  }

  if (props.hasBuild) {
    const hasDataList = cloneDeep(hasSetData.value.data[0].list)
    const setDataList = doneData.data[0].list
    const hasChange = isArrayEqual(hasDataList, setDataList)

    const isRefinancialChange = isArrayEqual(props.substitutionIds, refinancialIds.value)

    if (!hasChange) {
      confirmTxt.value = t('建设成本数据有改动，保存后将重置进度还款设置及首次建筑放款')
      changeVisible.value = true
    } else if (!isRefinancialChange) {
      confirmTxt.value = t('再融资数据有改动，保存后将重置进度还款设置及首次建筑放款')
      changeVisible.value = true
    } else {
      saveDone()
    }
  } else {
    saveDone()
  }
};

const loading_type = ref(false);
const types = ref([]);
const typesObj = ref(); // 字典名称
const loadType = (key) => {
  if (types.value.length) {
    return;
  }
  loading_type.value = true;
  systemDictData('devCostTypeConstruction')
    .then((res) => {
      const resData = res || [];
      types.value = resData;

      // 字典名称记录
      const obj = {};
      for (let i = 0; i < resData.length; i++) {
        obj[resData[i].code] = resData[i].name;
      }
      typesObj.value = obj;

      console.log('1111111', data.value)
      if (!data.value.data[0].list.length) {
        res.map((item) => {
          data.value.data[0].list.push({
            type: item.code,
            loan: 0,
            borrower_equity: 0
          });
        });
        emits('update:value', cloneDeep(data.value.total));
        emits('update:dataJson', cloneDeep([data.value]));
        emits('change', cloneDeep({ devCost: data.value.total, devCostDetail: [data.value] }));
      }
    })
    .finally((_) => {
      loading_type.value = false;
    });
};

const hasSetData = ref()

const initData = () => {
  data.value.loan = 0;
  data.value.borrower_equity = 0;
  data.value.total = 0;
  data.value.data.map((item) => {
    if (item.list) {
      item.loan = 0;
      item.borrower_equity = 0;
      item.list.map((sub) => {
        if (sub.type === 'Land_gst' || sub.type === 'Build_gst') {
          sub.borrower_equity = tool.minus(0, sub.loan);
        }
        sub.total = tool.plus(sub.loan || 0, sub.borrower_equity || 0);
        item.loan = tool.plus(item.loan || 0, sub.loan || 0);
        item.borrower_equity = tool.plus(item.borrower_equity || 0, sub.borrower_equity || 0);
      });
    }
    item.total = tool.plus(item.loan || 0, item.borrower_equity || 0);
    data.value.loan = tool.plus(data.value.loan || 0, item.loan || 0);
    data.value.borrower_equity = tool.plus(data.value.borrower_equity || 0, item.borrower_equity || 0);
  });
  data.value.total = tool.plus(data.value.loan || 0, data.value.borrower_equity || 0);

  hasSetData.value = cloneDeep(props.dataJson[0])

  isRefinancialChecked.value = props.isRefinancial
  if (props.substitutionIds && props.substitutionIds.length) {
    refinancialIds.value = props.substitutionIds

    // const objArr = props.refinancialData.filter(item => props.substitutionIds.includes(item.value))
    // selectedDatas.value = objArr
  }

  if (props.isVariation && props.uuid && !props.isPlus) {
    projectLoanGetBuild({ uuid: props.uuid }).then(res => {
      const use_amount = Number(res.use_amount)
      let footer_use_amount = 0
      const summary = res.summary

      data.value.data[0].list.forEach((item) => {
        if (item.list && item.list.length) {
          const newObj = {}
          for (const key in summary) {
            if (key.indexOf(item.name) > -1) {
              newObj[key] = summary[key]
            }
          }

          item.list.forEach((sub) => {
            for (const key in newObj) {
              if (key === `${item.name} [${sub.type}]`) {
                sub.use_amount = newObj[key].use_amount
                sub.max_amount = tool.minus(Number(sub.loan), Number(sub.use_amount))
                footer_use_amount = tool.plus(footer_use_amount, Number(sub.use_amount))
              }
            }
          })
        } else {
          for (const key in summary) {
            if (key === item.name) {
              item.use_amount = summary[key].use_amount
              item.max_amount = tool.minus(Number(item.loan), Number(item.use_amount))
              footer_use_amount = tool.plus(footer_use_amount, Number(item.use_amount))
            }
          }
        }
      })

      const construction_use_amount = tool.minus(use_amount, footer_use_amount)

      const constructionItem = data.value.data[0].list.find(item => item.name === 'Construction')
      constructionItem.use_amount = construction_use_amount
      constructionItem.max_amount = tool.minus(Number(constructionItem.loan), Number(constructionItem.use_amount))

      const landItem = data.value.data[0].list.find(item => item.name === 'Land')
      landItem.use_amount = tool.minus(Number(landItem.loan), Number(props.remainLandAmount))
      landItem.max_amount = Number(props.remainLandAmount)
    })
  }

  if (props.isVariation) {
    data.value.data[0].list.forEach((item) => {
      item.is_variation = 1
      if (item.list && item.list.length) {
        item.list.forEach((sub) => {
          sub.is_variation = 1
        })
      }
    })
  }
};

const init = () => {
  if (props.disabled && props.edit) return;
  loadType();
  if (props.dataJson && props.dataJson.length) {
    data.value = cloneDeep(props.dataJson[0]);
    if (data.value.data.length == 3) {
      data.value.data.splice(1, 0, {
        type: t('补充股权'),
        loan: 0,
        borrower_equity: 0,
        total: 0
      });
    }
    data.value.data[0].type = t('建筑成本');
    data.value.data[1].type = t('补充股权');
    data.value.data[2].type = t('净商品与服务税');
    data.value.data[3].type = t('财务成本');
    initData();
  }
  if (!props.edit) {
    if (props.isVariation) {
      ConstructionColumns.splice(5, 1);
      FinanceColumns.splice(4, 1);
    } else {
      ConstructionColumns.splice(4, 1);
      FinanceColumns.splice(4, 1);
    }
  }
  visible.value = true;
};

const initTypes = computed(() => {
  const selectArr = data.value.data[0].list.map((item) => {
    if (!item.status) return item.type;
  });

  // 变更时，不能选择已变更的类型
  const variationArr = data.value.data[0].list.map((item) => {
    if (item.is_variation) return item.type;
  });

  types.value.map((item) => {
    item['disabled'] = selectArr.includes(item.code) || variationArr.includes(item.code);
  });
  return types.value;
});

const showAdd = computed(() => {
  return data.value.data[0].list.filter((item) => item.status !== 1 && !item.model).length != types.value.length;
});

const addChid = (index) => {
  if (!data.value.data[0].list[index]['list']) {
    data.value.data[0].list[index]['list'] = [];
    data.value.data[0].list[index].loan = 0;
    data.value.data[0].list[index].borrower_equity = 0;
  }
  data.value.data[0].list[index]['list'].push({
    type: '',
    loan: 0,
    borrower_equity: 0
  });
  initData();
};

const removeChid = (p_index, index) => {
  data.value.data[0].list[p_index].list.splice(index, 1);
  initItemData(p_index);
};

const initItemData = (index) => {
  let item = data.value.data[0].list[index];
  if (item.list) {
    item.loan = 0;
    item.borrower_equity = 0;
    item.list.map((sub) => {
      if (item.type === 'Land_gst' || item.type === 'Build_gst') {
        sub.borrower_equity = tool.minus(0, sub.loan);
      }
      sub.total = tool.plus(sub.loan || 0, sub.borrower_equity || 0);
      item.loan = tool.plus(item.loan || 0, sub.loan || 0);
      item.borrower_equity = tool.plus(item.borrower_equity || 0, sub.borrower_equity || 0);
    });
  }
  initData();
};

const isRefinancialChecked = ref(false);
const refinancialIds = ref([]);
const selectedDatas = ref([]);

const filterOption = (input, option) => {
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const changeRefinancial = (value) => {
  if (!value) {
    refinancialIds.value = []
    selectedDatas.value = []
  }
}

const refinancialAmount = computed(() => {
  const oldData = props.lendingInfo && props.lendingInfo?.substitution_amount && props.lendingInfo?.substitution_ids?.length && !props.lendingInfo?.substitution_data
  // 老数据详情
  if (oldData && isDetails.value) {
    return props.lendingInfo?.substitution_amount
  }
  if (selectedDatas.value.length) {
    const dataArr = selectedDatas.value.map(item => Number(item.item.allRepayment.repayment_money))
    const sum = dataArr.reduce((acc, cur) => acc + cur, 0)
    return sum
  }
  return 0
})

const repaymentAmount = computed(() => {
  return (data) => {
    const last_money = Number(data.item.allRepayment.last_money)
    const money = Number(data.item.allRepayment.reduction_money_input)
    // 兼容老数据
    if (!last_money && !money && !data.item.allRepayment.StandardRate && !data.item.allRepayment.min_StandardRate) {
      if (isDetails.value) {
        return data.item.allRepayment.repayment_money || '--'
      } else {
        const num = Number(tool.minus(last_money, money))
        data.item.allRepayment.repayment_money = num
        return num
      }
    } else {
      const num = Number(tool.minus(last_money, money))
      data.item.allRepayment.repayment_money = num
      return num
    }
  }
})

const refinancialLoading = ref(false)
const refinancialChange = async (data) => {
  if (data.length) {
    const selectUuids = selectedDatas.value.map(item => item.value)
    const dataUuids = data.map(item => item.value)

    const delUuids = selectUuids.filter(item => !dataUuids.includes(item))

    // 移除已删除选项
    for (let i = 0; i < delUuids.length; i++) {
      const itemUuid = delUuids[i]
      const index = selectedDatas.value.findIndex(item => item.value === itemUuid)
      if (index > -1) {
        selectedDatas.value.splice(index, 1)
      }
    }

    // 添加新选项
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const itemUuid = item.value
      // 新选项
      if (!selectUuids.includes(itemUuid)) {

        refinancialLoading.value = true
        await projectAuditSubstitution({
          uuid: props.uuid,
          substitution_uuids: [itemUuid]
        }).then(res => {
          const resData = res.length ? res[0] : null
          if (resData) {
            const itemIndex = selectUuids.findIndex(item => item === itemUuid)
            if (itemIndex === -1) {
              const obj = cloneDeep(item)
              
              obj.item.allRepayment = obj.item.allRepayment || cloneDeep(resData.allRepayment)
              obj.item.allRepayment.reduction_money = Number(resData.allRepayment.reduction_money || 0)
              obj.item.allRepayment.reduction_money_input = 0
              obj.item.allRepayment.new_irr = resData.allRepayment.irr
              selectedDatas.value.push(obj)
            }
          }
          refinancialLoading.value = false
        }).catch(() => {
          // 如果不满足条件将本项移除
          const itemIndex = refinancialIds.value.findIndex(item => item === itemUuid)
          if (itemIndex > -1) {
            refinancialIds.value.splice(itemIndex, 1)
          }
          refinancialLoading.value = false
        })
        
      }
    }
  } else {
    selectedDatas.value = []
  }
}

const refinancialInputChange = debounce((data) => {
  const StandardRate = data.item.allRepayment.StandardRate
  const min_StandardRate = data.item.allRepayment.min_StandardRate
  if (StandardRate < min_StandardRate) {
    return;
  } else {
    if (props.loanDate && props.loanDate.length) {
      const start_date = props.loanDate[0]
      const start_date_time = dayjs(start_date).format('YYYY-MM-DD')

      const params = {
        uuid: data.value,
        date: start_date_time,
        StandardRate
      }
      projectLoanAllRepayment(params).then(res => {
        data.item.allRepayment.reduction_money = Number(res.reduction_money) < 0 ? 0 : Number(res.reduction_money)
        data.item.allRepayment.reduction_money_input = 0
        data.item.allRepayment.new_irr = data.item.allRepayment.irr
      })
    }
  }
}, 300)

const refinancialInputBlur = (data) => {
  const StandardRate = data.item.allRepayment.StandardRate
  const min_StandardRate = data.item.allRepayment.min_StandardRate
  if (StandardRate > min_StandardRate) {
    return;
  } else {
    data.item.allRepayment.StandardRate = min_StandardRate
    data.item.allRepayment.reduction_money_input = 0

    if (props.loanDate && props.loanDate.length) {
      const start_date = props.loanDate[0]
      const start_date_time = dayjs(start_date).format('YYYY-MM-DD')

      const params = {
        uuid: data.value,
        date: start_date_time,
        StandardRate: min_StandardRate
      }
      projectLoanAllRepayment(params).then(res => {
        data.item.allRepayment.reduction_money = Number(res.reduction_money) < 0 ? 0 : Number(res.reduction_money)
      })
    }
  }
}

const refinancialCaclIrr = debounce((data) => {
  if (props.loanDate && props.loanDate.length) {
    const start_date = props.loanDate[0]
    const start_date_time = dayjs(start_date).format('YYYY-MM-DD')

    const params = {
      uuid: data.value,
      date: start_date_time,
      last_money: data.item.allRepayment.repayment_money
    }
    projectLoanCalcIrr(params).then(res => {
      data.item.allRepayment.new_irr = res.irr || 0
    })
  }

}, 300)

const devTotal = computed(() => {
  return tool.plus(data.value.total, refinancialAmount.value)
})

const changeTotal = computed(() => {
  const dataList = data.value.data[0].list
  let total = 0

  dataList.forEach(item => {
    if (item.list && item.list.length) {
      item.list.forEach(sub => {
        total = tool.plus(total, Number(sub.change_value || 0))
      })
    } else {
      total = tool.plus(total, Number(item.change_value || 0))
    }
  })

  return total
})

const hasInitSelectedDatas = ref(false)
const setSelectedDatas = () => {
  if (!hasInitSelectedDatas.value) {
    const idsArr = cloneDeep(props.substitutionIds)
    const resArr = cloneDeep(refinancialData.value)
    const fObj = cloneDeep(props.selectedRefinancialObj)
    if (idsArr && idsArr.length && resArr && resArr.length) {
      const objArr = resArr.filter(item => idsArr.includes(item.value))
      objArr.forEach(item => {
        if (fObj[item.value]) {
          item.item.allRepayment = fObj[item.value]
        } else {
          item.item.allRepayment = {
            min_StandardRate: 0,
            isOld: true
          }
        }
      })
      selectedDatas.value = objArr
      hasInitSelectedDatas.value = true
    }
  }
}
const refinancialData = ref([])

const getRefinancialList = () => {
  const ajaxFn = isDetails.value ? projectDetailSubstitution : projectAuditSubstitution
  ajaxFn({
    uuid: props.uuid
  }).then(res => {
    const data = res || []
    const dataArr = data.map(item => {
      return {
        label: item.project_name,
        value: item.uuid,
        item: item
      }
    })
    refinancialData.value = dataArr
    setSelectedDatas()
  })
}

watch(
  () => props.isRefinancial,
  (newVal) => {
    isRefinancialChecked.value = newVal;
  }
)

watch(
  () => props.substitutionIds,
  (newVal) => {
    refinancialIds.value = newVal;
    if (newVal && newVal.length) {
      setSelectedDatas()
    }
  }
)

watch(
  () => visible.value,
  (newVal) => {
    if (newVal) {
      if (!isRefinancialChecked.value) {
        selectedDatas.value = []
        refinancialIds.value = []
      } else {
        setSelectedDatas()
      }
    } else {
      hasInitSelectedDatas.value = false
    }
  }
)

onMounted(() => {
  if (!props.dataJson) {
    emits('update:value', cloneDeep(data.value.total));
    emits('update:dataJson', cloneDeep([data.value]));
  }

  if (props.uuid) {
    getRefinancialList()
  }
});
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.myMode {
  position: relative;
  z-index: 9999;
  .myModeEidt {
    .pl {
      padding-left: 28px !important;
    }
  }
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 22px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    .ant-table-wrapper .ant-table,
    .ant-table-wrapper .ant-table-tbody > tr.ant-table-placeholder:hover > td,
    .ant-table-wrapper .ant-table-tbody > tr.ant-table-row:hover > td,
    .ant-table-wrapper .ant-table-tbody > tr > td.ant-table-cell-row-hover {
      background: transparent !important;
    }
    .ant-input-number,
    .ant-input,
    .ant-select-selector {
      border-color: #d9d9d9 !important;
      height: 30px !important;
      border-radius: 4px !important;
      .ant-select-selection-placeholder,
      .ant-select-selection-search-input,
      .ant-select-selection-item,
      .ant-input-number-input,
      .ant-input-number-input,
      .ant-select-selection-item {
        line-height: 28px !important;
        height: 28px !important;
      }
      &.err {
        border-color: #c1430c;
      }
    }

    .refinancial-select {
      .ant-select-selector {
        height: auto !important;
      }
    }

    .ant-empty {
      min-height: 50px;
      margin-block: 0;
    }
    .ant-table-wrapper .ant-table-thead > tr > th,
    .ant-table-wrapper .ant-table-tbody > tr > td,
    .ant-table-wrapper tfoot > tr > th,
    .ant-table-wrapper tfoot > tr > td {
      padding: 10px 16px;
    }
    .ant-table-wrapper .ant-table-thead > tr > th {
      font-size: 12px;
    }
    padding: 0px !important;
    .tabel-type {
      border-bottom: 1px solid #bebaba;
      padding-bottom: 10px;
    }
    .content {
      line-height: 1.33;
      padding: 24px 30px 72px;
      .user-item {
        padding: 8px 10px;
        border-radius: 8px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .name {
          flex: 1;
          font-weight: bold;
        }
      }
      .label {
        color: #888;
        font-size: 12px;
        padding: 0 0 8px;
        &.err {
          color: #c1430c;
        }
      }

      .total-row {
        .title {
          flex: 1;
          padding: 10px 16px;
        }
        .amount {
          flex: 0 0 180px;
          padding: 10px 16px;
        }
        .total {
          flex: 0 0 110px;
        }
      }
      .save {
        margin-top: 24px;
      }
    }
  }
  .card {
    background: #f1f1f1;
    padding: 24px;
    border-radius: 8px;
  }
  .disabled {
    cursor: not-allowed !important;
    opacity: 0.4;
  }
  :deep(.ant-table-wrapper) {
    .ant-table-thead > tr > th,
    .ant-table-thead > tr > td {
      background: transparent !important;
    }
  }
}

.addChid {
  display: inline-block;
  color: @colorPrimary;
  cursor: pointer;
  margin-right: 10px;
  &.removeChid {
    color: @color_red-half;
  }
}

.disabled {
  color: #999;
  cursor: not-allowed;
}

.refinancial-row {
  background: #f1f1f1;
  padding: 24px;
  border-radius: 8px;
  > .items-center {
    margin-bottom: 15px;
    > p {
      font-size: 18px;
      font-weight: 500;
    }
  }
}

.refinancial-select {
  display: flex;
  align-items: center;
  gap: 30px;
  .ant-select {
    flex: 1;
  }
  .amount {
    width: 274px;
  }
}

.change-value-container {
  flex: 0 0 220px;
  padding: 0 16px;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  &.edit {
    flex: 0 0 330px;
  }
  &.reduce {
    flex: 0 0 220px !important;
  }
}

.refinancial-table {
  margin-top: 15px;
  border: 1px solid #d9d9d9;
  background-color: #f7f9f8;
  > .col-item {
    display: flex;
    align-items: center;
    :deep(.ant-input-number) {
      border-color: #272727 !important;
      border-top-right-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
    }
    &.th {
      border-bottom: 1px solid #e2e5e2;
      > div {
        font-size: 12px;
        font-weight: 600;
        color: #888;
        &:nth-child(6) {
          align-items: flex-start;
        }
      }
    }
    &.tr {
      > div {
        height: 48px;
      }
    }
    > div {
      height: 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      &:nth-child(1) {
        width: 162px;
      }
      &:nth-child(2) {
        width: 145px;
      }
      &:nth-child(3) {
        width: 160px;
      }
      &:nth-child(4) {
        width: 145px
      }
      &:nth-child(5) {
        width: 130px;
        align-items: flex-start;
      }
      &:nth-child(6) {
        flex: 1;
        > p {
          font-size: 12px;
          color: #888;
        }
      }
      &.row {
        flex-direction: row;
        justify-content: flex-start;
        > div {
          text-align: center;
          flex: 1;
        }
      }
      &.input {
        :deep(.ant-input-number) {
          border-top-right-radius: 4px !important;
          border-bottom-right-radius: 4px !important;
        }
      }
    }
  }
}
.limit-icon {
  cursor: pointer;
  &.old {
    color: #ff4d4f;
  }
  &:hover {
    opacity: 0.8;
  }
}
</style>
