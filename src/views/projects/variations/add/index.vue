<template>
  <div>
    <div v-if="pageLoading" class="loading-container">
      <a-spin :spinning="pageLoading" size="large"></a-spin>
    </div>
    <div v-if="uuid && projectInfo" class="project-container">
      <div class="project-info">
        <base-card :variations="true" :detail="projectInfo"></base-card>
      </div>
      <div class="sys-form-content">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-row :gutter="24">
            <a-col :span="16">
              <a-form-item :label="t('变更类型')" name="type">
                <a-select v-model:value="formState.type" :options="typeData" @change="typeChange"></a-select>
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item :label="t('变更开始日期')" name="start_date">
                <a-form-item-rest>
                  <a-date-picker
                    v-model:value="formState.start_date"
                    :format="selectDateFormat()"
                    valueFormat="YYYY-MM-DD"
                    :disabledDate="disabledDate"
                    :showToday="false"
                    @change="dateChange('start_date')"
                  />
                  <a-checkbox
                    v-if="initDrawdownData.length"
                    v-model:checked="initDrawdownSel"
                    class="mt-1"
                    style="font-size: 12px;"
                  >{{ t('所选日期存在放款数据，是否将其设置为变更后首次放款') }}</a-checkbox>
                </a-form-item-rest>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="7">
              <a-form-item :label="t('开发成本')">
                <div class="input-number-container">
                  <vco-number :value="projectInfo?.credit?.right?.devCost" :bold="true" size="fs_ml" :precision="2"></vco-number>
                </div>
              </a-form-item>
            </a-col>
            <template v-if="[1, 2, 4, 5].includes(formState.type)">
              <a-col :span="1" class="plus-txt">
                <i class="iconfont" v-if="[1, 4].includes(Number(formState.type))">&#xe712;</i>
                <i class="iconfont" v-else>&#xe711;</i>
              </a-col>
              <a-col :span="7">
                <a-form-item :label="t('变更值')">
                  <DevCostDetail
                    :dataJson="devCostJsonData"
                    :disabledGST="true"
                    :disabledLoan="true"
                    :disabledModel="true"
                    :is-variation="true"
                    :uuid="uuid"
                    :remain-land-amount="Number(projectInfo?.base?.remain_land_amount) || 0"
                    :is-plus="[1, 4].includes(Number(formState.type))"
                    @change="devCostChange"
                  >
                    <div class="input-number-container">
                      <a-input-number
                        v-model:value="changeCost"
                        :max="99999999999"
                        :disabled="true"
                        :formatter="
                          (value) =>
                            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        "
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      />
                      <i class="iconfont">&#xe8cf;</i>
                    </div>
                    
                  </DevCostDetail>
                </a-form-item>
              </a-col>
              <a-col :span="1" class="plus-txt">
                <i class="iconfont">=</i>
              </a-col>
              <a-col :span="8">
                <a-form-item :label="t('变更后')">
                  <div class="input-number-container">
                    <vco-number :value="changeCostAfter" :bold="true" size="fs_ml" :precision="2"></vco-number>
                  </div>
                </a-form-item>
              </a-col>
            </template>
          </a-row>
        </a-form>
      </div>
    </div>
  </div>
  
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { projectDetail } from '@/api/project/project';
import { systemDictData } from '@/api/system';
import { projectVariationDrawdownSel } from '@/api/project/loan';
import { useI18n } from 'vue-i18n';
import DevCostDetail from '@/views/process/temp/default/components/DevCostDetail.vue';
import { selectDateFormat, numberStrFormat, formatMoneyToNumber } from '@/utils/tool';
import BaseCard from '@/views/projects/about/components/base.vue';
import dayjs from 'dayjs';
import tool from '@/utils/tool';
import { cloneDeep } from 'lodash';

const { t } = useI18n();

const pageLoading = ref(false);
const uuid = ref(useRoute().query.uuid);
const typeData = ref([]);
const projectInfo = ref();

const getTypeData = () => {
  systemDictData('variation_type').then((res) => {
    const data = res.map((item) => {
      return {
        label: item.name,
        value: Number(item.code)
      };
    });
    typeData.value = data;
  });
};

const devCostJsonData = ref([]);

const getProjectDetail = async () => {
  pageLoading.value = true;
  const res = await projectDetail({uuid: uuid.value});
  projectInfo.value = res;
  pageLoading.value = false;

  devCostJsonData.value = projectInfo.value.base.devCostDetail;
};

const devCostChange = (val) => {
  devCostJsonData.value = val.devCostDetail;
}

const typeChange = () => {
  devCostJsonData.value = projectInfo.value.base.devCostDetail;
}

const formRef = ref();

const formState = ref({
  type: '',
  amount: '',
  start_date: '',
  end_date: '',
  initial_amount: '',
  note: '',
  initial_sn: ''
});

const changeCost = computed(() => {
  const data = cloneDeep(devCostJsonData.value);
  if (data.length) {
    const itemData = data[0].data[0].list || [];
    // 平铺itemData 并计算change_value 的合
    const flatData = itemData.flatMap((item) => item.list || []);
    const mergeData = [...itemData, ...flatData];
    const changeValue = mergeData.reduce((acc, item) => tool.plus(acc, item.change_value || 0), 0);
    return changeValue;
  } else {
    return 0;
  }
});

const changeCostAfter = computed(() => {
  let changeNum = changeCost.value || 0
  let resNum = 0
  if ([1, 4].includes(Number(formState.value.type))) {
    resNum = tool.plus(projectInfo.value.credit.right.devCost, changeNum)
  }
  if ([2, 5].includes(Number(formState.value.type))) {
    resNum = tool.minus(projectInfo.value.credit.right.devCost, changeNum)
  }
  return resNum;
});

const formRules = ref({
  type: [{ required: true, message: t('请选择') + t('变更类型'), trigger: 'change' }],
  amount: [{ required: true, message: t('请输入') + t('总金额'), trigger: 'change' }],
  start_date: [{ required: true, message: t('请选择') + t('变更开始日期'), trigger: 'change' }],
  end_date: [{ required: true, message: t('请选择') + t('变更结束日期'), trigger: 'change' }],
  initial_amount: [{ required: true, message: t('请输入') + t('首次放款总金额'), trigger: 'change' }]
});

const disabledDate = (current) => {
  const startDate = dayjs(projectInfo.value.date.var_start_date);
  return (current && current.isBefore(startDate.startOf('day').add(1, 'day')));
};

const initDrawdownSel = ref(false);
const initDrawdownData = ref([]);

const initDrawdownSelChange = (val) => {
  if (val) {
    const amount = initDrawdownData.value.find((item) => item.value == val)?.label;
    formState.value.initial_amount = formatMoneyToNumber(amount);
  } else {
    formState.value.initial_amount = '';
  }
};

const getInitDradownData = (flag = false) => {
  projectVariationDrawdownSel({
    uuid: uuid.value,
    date: formState.value.start_date
  }).then((res) => {
    const data = res.map((item) => {
      return {
        label: `$${numberStrFormat(item.amount)}`,
        value: item.sn
      };
    });
    initDrawdownData.value = data;

    if (flag) {
      initDrawdownSelChange(props.detailData.initial_sn)
    }
  });
}


const dateChange = (type) => {
  const start_date = formState.value.start_date;
  const end_date = formState.value.end_date;
  if (start_date && end_date) {
    const date1 = dayjs(start_date);
    const date2 = dayjs(end_date);

    if (date1.isAfter(date2)) {
      message.error(t('{0}应在{1}之前', [t('变更开始日期'), t('变更结束日期')]));
      formState.value[type] = '';
    }
  }

  if (type == 'start_date') {
    formState.value.initial_sn = '';

    initDrawdownSel.value = false;

    // 如果所选时间在当月之前并且天数大于7天
    const startDate = dayjs(formState.value.start_date);
    const nowDate = dayjs(new Date());
    const diffDay = startDate.diff(nowDate, 'day');

    // 晚变更
    if (startDate.isBefore(nowDate.startOf('month')) && Math.abs(diffDay) > 7) {
      getInitDradownData()
    } else {
      initDrawdownData.value = [];
    }
  }
};

onMounted(() => {
  getProjectDetail();
  getTypeData();
});
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.project-container {
  color: @color_coal;
  position: relative;
  display: grid;
  grid-template-columns: 315px 1fr;
  gap: 24px;
  align-items: flex-start;

  .project-info {
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid @clr_white;
    background-color: @clr_white;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
  }

  .sys-form-content {
    padding-left: 30px;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.plus-txt {
  position: relative;
  .iconfont {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #282828;
    font-weight: bold;
    font-size: 18px;
  }
}

.input-number-container {
  height: 48px;
  display: flex;
  align-items: center;
  position: relative;
  .iconfont {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: @colorPrimary;
    font-weight: bold;
    font-size: 18px;
  }
}
</style>