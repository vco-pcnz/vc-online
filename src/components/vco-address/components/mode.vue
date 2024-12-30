<template>
  <a-row :gutter="24" v-if="form">
    <a-col :span="24">
      <a-form-item :label="t('地址1')" :name="config['addr']">
        <a-dropdown trigger="click" v-model:open="open">
          <a-spin :spinning="loading">
            <a-input style="display: block" v-model:value="form[config['addr']]" :placeholder="t('请输入')" @input="search" @click.prevent />
          </a-spin>
          <template #overlay>
            <a-menu v-if="list && list.length">
              <a-menu-item v-for="item in list" :key="item.pxid" @click="searchInfo(item)">
                <a href="javascript:;" :class="{ active: item.a == form.addr }">{{ item.a }}</a>
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </a-form-item>
    </a-col>
    <a-col :span="24">
      <a-form-item :label="t('地址2')" :name="config['address']">
        <a-spin :spinning="loading">
          <a-input v-model:value="form[config['address']]" :placeholder="t('请输入')" />
        </a-spin>
      </a-form-item>
    </a-col>
    <a-col :span="16">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item :label="t('郊区')" :name="config['suburb']">
            <a-spin :spinning="loading">
              <a-input v-model:value="form[config['suburb']]" :placeholder="t('请输入')" />
            </a-spin>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('城市/州')" :name="config['province_code_name']">
            <a-spin :spinning="loading">
              <a-dropdown trigger="click" v-model:open="showCitys">
                <a-spin :spinning="loading">
                  <a-input
                    style="display: block"
                    v-model:value="form[config['province_code_name']]"
                    @focus="showCitys = true"
                    readonly
                    :placeholder="t('请输入')"
                    @click.prevent
                  />
                </a-spin>
                <template #overlay>
                  <a-menu v-if="citys && citys.length">
                    <a-menu-item v-for="item in citys" :key="item.id" @click="setCity(item)">
                      <a href="javascript:;" :class="{ active: item.name == form.province_code_name }">{{ item.name }}</a>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </a-spin>
          </a-form-item>
        </a-col>
      </a-row>
    </a-col>
    <a-col :span="8">
      <a-form-item :label="t('邮编')" :name="config['postal']">
        <a-spin :spinning="loading">
          <a-input v-model:value="form[config['postal']]" :placeholder="t('请输入')" />
        </a-spin>
      </a-form-item>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { systemCitySearch, systemCitySearchInfo, systemCity } from '@/api/system';
import { pick, trim, cloneDeep } from 'lodash';
const { t } = useI18n();

const emits = defineEmits(['change']);
const props = defineProps({
  config: {
    type: Object
  },
  data: {
    type: Object
  }
});

const open = ref(false);
const showCitys = ref(false);
const loading = ref(false);
const list = ref([]);
const citys = ref([]);
const form = ref(null);

const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
};

const search = debounce(() => {
  if (!form.value[props.config['addr']]) return;
  systemCitySearch({ addr: form.value[props.config['addr']] }).then((res) => {
    list.value = res;
    open.value = res && res.length;
  });
}, 300);

const searchInfo = (item) => {
  open.value = false;
  loading.value = true;
  systemCitySearchInfo({ pxid: item.pxid })
    .then((res) => {
      if (res) {
        const index = citys.value.findIndex((item) => {
          return item.name == res.city;
        });
        form.value[props.config['addr']] = res.address_line_1;
        form.value[props.config['address']] = res.address_line_2 || '';
        form.value[props.config['province_code_name']] = res.city;
        form.value[props.config['postal']] = res.postcode;
        form.value[props.config['suburb']] = res.suburb;
        form.value[props.config['con_id']] = res.con_id;
        form.value[props.config['province_code']] = index === -1 ? '0' : citys.value[index].id + '';
      }
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
    });
};

const loadCitys = debounce(() => {
  systemCity().then((res) => {
    citys.value = res;
    if (form.value[props.config['province_code']]) {
      const index = citys.value.findIndex((item) => {
        return item.id == form.value[props.config['province_code']];
      });
      form.value[props.config['province_code_name']] = citys.value[index].name;
    }
  });
}, 300);

const setCity = (item) => {
  form.value[props.config['province_code_name']] = item.name;
  form.value[props.config['province_code']] = item.id + '';
  showCitys.value = false;
};

watch(
  () => props.data,
  (val) => {
    if (trim(val)) {
      val.city_code = '0';
      val.district_code = '0';
      let keys = ['addr', 'address', 'postal', 'suburb', 'province_code_name', 'province_code', 'con_id', 'city_code', 'district_code'].map(
        (item) => {
          return props.config[item];
        }
      );
      form.value = pick(val, keys);
      loadCitys();
    }
  },
  { deep: true, immediate: true }
);

watch(
  () => form.value,
  (val) => {
    emits('change', form.value);
  },
  { deep: true }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.active {
  color: @colorPrimary !important;
}
</style>
