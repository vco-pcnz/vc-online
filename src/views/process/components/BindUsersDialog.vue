<template>
  <div>
    <!-- 人员选择 -->
    <vco-choose-user ref="vcoChooseUserRef" :url="searchUserUrl" :isMultiple="isMultipleSelect" :role-code="roleCode" :params="otherParams" @done="userChoiced">
      <div></div>
    </vco-choose-user>
    <!-- 人员添加 -->
    <add-user :p__uuid="borrowerComUuid || borrowerComUuid" :isComponent="true" v-model:open="showAddUser" @submit="userChoiced" />
    <!-- borker添加 -->
    <add-broker v-model:visible="showApplyBroker"></add-broker>

    <a-modal :width="500" :open="visible" :title="t(title)" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="form-content">
        <!-- 绑定贷款经理 -->
        <template v-if="type === 1">
          <div v-for="(item, index) in vcTeam" :key="index" class="form-item">
            <div class="title">
              <p>{{ t(item.note) }}</p>
              <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(item.code, item.code !== 'lm')">{{ t('添加') }}</a-button>
            </div>
            <div class="content">
              <template v-if="vcTeamData && vcTeamData[item.code].length">
                <div v-for="(_item, _index) in vcTeamData[item.code]" :key="String(index) + String(_index)" class="user-item">
                  <vco-user-item :data="_item" :main="true"></vco-user-item>
                  <i class="iconfont" @click="removeVcItem(_index, item.code)">&#xe77d;</i>
                </div>
              </template>
            </div>
          </div>
        </template>
        <!-- 绑定借款账号 -->
        <template v-if="type === 2">
          <div class="form-item">
            <div class="title">
              <p>{{ t('借款账号信息') }}</p>
              <div class="gap-3 flex">
                <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(true, false, 'borrower', true)">{{ t('添加') }}</a-button>
                <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(true, false, 'borrower', false)">{{ t('选择') }}</a-button>
              </div>
            </div>
            <div class="content">
              <template v-if="borrowerPuser.length">
                <div v-for="(item, index) in borrowerPuser" :key="index" class="user-item">
                  <vco-user-item :data="item" :main="true"></vco-user-item>
                  <i class="iconfont" @click="removeBorrowerHandle">&#xe77d;</i>
                </div>
              </template>
            </div>
          </div>

          <template v-if="(borrowerComUuid && borrowerHasLowerUsers) || borrowerPuser.length">
            <div class="form-item">
              <div class="title">
                <p>{{ t('编辑者') }}</p>
                <div class="gap-3 flex">
                  <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(true, true, '', 'borrower', true)">{{ t('添加') }}</a-button>
                  <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(true, true, '', 'borrower', false)">{{ t('选择') }}</a-button>
                </div>
              </div>
              <div class="content">
                <template v-if="borrowerEditors.length">
                  <div v-for="(item, index) in borrowerEditors" :key="index" class="user-item">
                    <vco-user-item :data="item" :main="true"></vco-user-item>
                    <i class="iconfont" @click="removeItem(index, 1)">&#xe77d;</i>
                  </div>
                </template>
              </div>
            </div>
            <div class="form-item">
              <div class="title">
                <p>{{ t('浏览者') }}</p>
                <div class="gap-3 flex">
                  <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(false, true, '', 'borrower', true)">{{ t('添加') }}</a-button>
                  <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(false, true, '', 'borrower', false)">{{ t('选择') }}</a-button>
                </div>
              </div>
              <div class="content">
                <template v-if="borrowerViewers.length">
                  <div v-for="(item, index) in borrowerViewers" :key="index" class="user-item">
                    <vco-user-item :data="item" :main="true"></vco-user-item>
                    <i class="iconfont" @click="removeItem(index, 2)">&#xe77d;</i>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </template>
        <!-- 绑定中介 -->
        <template v-if="type === 3">
          <div class="form-item">
            <div class="title">
              <p>{{ t('中介信息') }}</p>

              <div class="gap-3 flex">
                <a-button type="primary" size="small" shape="round" class="uppercase" @click="showApplyBroker = true">{{ t('添加') }}</a-button>
                <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(true, false, 'broker')">{{ t('选择') }}</a-button>
              </div>
            </div>
            <div class="content">
              <template v-if="brokerPuser.length">
                <div v-for="(item, index) in brokerPuser" :key="index" class="user-item">
                  <vco-user-item :data="item" :main="true"></vco-user-item>
                  <i class="iconfont" @click="removeBrokerHandle">&#xe77d;</i>
                </div>
              </template>
            </div>
          </div>

          <template v-if="(brokerComUuid && borkerHasLowerUsers) || brokerPuser.length">
            <div class="form-item">
              <div class="title">
                <p>{{ t('编辑者') }}</p>
                <div class="gap-3 flex">
                  <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(true, true, '', 'broker', true)">{{ t('添加') }}</a-button>
                  <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(true, true, '', 'broker', false)">{{ t('选择') }}</a-button>
                </div>
              </div>
              <div class="content">
                <template v-if="brokerEditors.length">
                  <div v-for="(item, index) in brokerEditors" :key="index" class="user-item">
                    <vco-user-item :data="item" :main="true"></vco-user-item>
                    <i class="iconfont" @click="removeItem(index, 3)">&#xe77d;</i>
                  </div>
                </template>
              </div>
            </div>

            <div class="form-item">
              <div class="title">
                <p>{{ t('浏览者') }}</p>
                <div class="gap-3 flex">
                  <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(false, true, '', 'broker', true)">{{ t('添加') }}</a-button>
                  <a-button type="primary" size="small" shape="round" class="uppercase" @click="openUserSelect(false, true, '', 'broker', false)">{{ t('选择') }}</a-button>
                </div>
              </div>
              <div class="content">
                <template v-if="brokerViewers.length">
                  <div v-for="(item, index) in brokerViewers" :key="index" class="user-item">
                    <vco-user-item :data="item" :main="true"></vco-user-item>
                    <i class="iconfont" @click="removeItem(index, 4)">&#xe77d;</i>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </template>
      </div>
      <a-button v-if="(type === 1 && vcTeam.length) || type !== 1" type="dark" class="big shadow bold uppercase w-full mb-5 mt-5" @click="submitHandle" :loading="subLoading">{{ t('保存') }}</a-button>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import { message } from 'ant-design-vue/es';
import { removeDuplicates } from '@/utils/tool';
import { associateAssignUser, associateAssignTeam } from '@/api/process';
import { getUserRelation } from '@/api/users';
import emitter from '@/event';
import AddUser from '@/views/users/components/AddUser.vue';
import AddBroker from './AddBroker.vue';

const { t } = useI18n();
const vcoChooseUserRef = ref();

const emits = defineEmits(['done', 'update:visible']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: Number,
    required: true
  },
  data: {
    type: Object,
    default: () => {}
  },
  vcTeam: {
    type: Array,
    default: () => []
  },
  pIds: {
    type: Array,
    default: () => []
  },
  currentId: {
    type: [Number, String],
    default: ''
  }
});

const searchUserUrl = ref('');

const isMultipleSelect = ref(false);

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const title = computed(() => {
  let txt = '';
  if (props.type === 1) {
    txt = '绑定贷款经理';
  } else if (props.type === 2) {
    txt = '绑定借款账号';
  } else if (props.type === 3) {
    txt = '绑定中介';
  }
  return txt;
});

const vcTeamData = ref(null);

const borrowerEditors = ref([]);
const borrowerViewers = ref([]);
const borrowerPuser = ref([]);
const borrowerHasLowerUsers = ref(false);

const brokerEditors = ref([]);
const brokerViewers = ref([]);
const brokerPuser = ref([]);
const borkerHasLowerUsers = ref(false);

const removeItem = (index, type) => {
  let data = null;
  if (type === 1) {
    data = borrowerEditors.value;
  } else if (type === 2) {
    data = borrowerViewers.value;
  } else if (type === 3) {
    data = brokerEditors.value;
  } else if (type === 4) {
    data = brokerViewers.value;
  }
  if (data) {
    data.splice(index, 1);
  }
};

const removeVcItem = (index, type) => {
  vcTeamData.value[type].splice(index, 1);
};

const removeBrokerHandle = () => {
  brokerPuser.value = [];
  brokerEditors.value = [];
  brokerViewers.value = [];
};

const removeBorrowerHandle = () => {
  borrowerPuser.value = [];
  borrowerEditors.value = [];
  borrowerViewers.value = [];
};

const brokerComUuid = computed(() => {
  let uuid = '';
  if (brokerPuser.value.length) {
    uuid = brokerPuser.value[0].uuid;
  }

  return uuid;
});

const borrowerComUuid = computed(() => {
  let uuid = '';
  if (borrowerPuser.value.length) {
    uuid = borrowerPuser.value[0].uuid;
  }

  return uuid;
});

const getLowerUsers = (flag = false) => {
  const uuid = flag ? brokerComUuid.value : borrowerComUuid.value;
  getUserRelation({
    puuid: uuid,
    sta__ok: 1
  })
    .then((res) => {
      if (flag) {
        borkerHasLowerUsers.value = Boolean(res.count);
      } else {
        borrowerHasLowerUsers.value = Boolean(res.count);
      }
    })
    .catch(() => {
      if (flag) {
        borkerHasLowerUsers.value = false;
      } else {
        borrowerHasLowerUsers.value = false;
      }
    });
};

const itemCode = ref('');
const isEdit = ref(false);
const roleCode = ref('');
const otherParams = ref({});
const currentPuser = ref('');

const openUserSelect = (code, isMultiple, puser = '', secType = '', isAdd) => {
  searchUserUrl.value = '';

  currentPuser.value = puser;
  otherParams.value = {};

  isMultipleSelect.value = isMultiple;
  if (props.type === 1) {
    itemCode.value = code;

    roleCode.value = code;
  } else {
    isEdit.value = code;

    roleCode.value = props.type === 2 ? 'user' : 'broker';

    if (puser === 'broker') {
      otherParams.value = { is_broker: 1 };
    } else {
      if (puser === 'borrower') {
        otherParams.value = { is_borrower: 1 };
      }

      roleCode.value = '';
      if (secType === 'broker') {
        searchUserUrl.value = 'user/relation';
        otherParams.value = { puuid: brokerComUuid.value, sta__ok: 1 };
      }

      if (secType === 'borrower') {
        searchUserUrl.value = 'user/relation';
        otherParams.value = { puuid: borrowerComUuid.value, sta__ok: 1 };
      }
    }
  }
  console.log(isAdd);
  if (isAdd) {
    showAddUser.value = true;
  } else {
    nextTick(() => {
      vcoChooseUserRef.value.init();
    });
  }
};

const userChoiced = (data) => {
  data.forEach((item) => {
    item.name = item.user_name;
  });
  if (props.type === 1) {
    const dataArr = [...vcTeamData.value[itemCode.value], ...data];

    if (itemCode.value === 'lm') {
      // 单选
      vcTeamData.value[itemCode.value] = removeDuplicates(data, 'uuid');
    } else {
      vcTeamData.value[itemCode.value] = removeDuplicates(dataArr, 'uuid');
    }
  }

  if (props.type === 2) {
    const isBorrowerCom = currentPuser.value && currentPuser.value === 'borrower';
    const staticData = isEdit.value ? (isBorrowerCom ? borrowerPuser.value : borrowerEditors.value) : borrowerViewers.value;
    const dataArr = [...staticData, ...data];
    if (isEdit.value) {
      if (currentPuser.value && currentPuser.value === 'borrower') {
        // 单选
        borrowerPuser.value = removeDuplicates(data, 'uuid');
        borrowerEditors.value = [];
        borrowerViewers.value = [];
        getLowerUsers(false);
      } else {
        borrowerEditors.value = removeDuplicates(dataArr, 'uuid');
      }
    } else {
      borrowerViewers.value = removeDuplicates(dataArr, 'uuid');
    }
  }

  if (props.type === 3) {
    const isBrokerCom = currentPuser.value && currentPuser.value === 'broker';
    const staticData = isEdit.value ? (isBrokerCom ? brokerPuser.value : brokerEditors.value) : brokerViewers.value;
    const dataArr = [...staticData, ...data];
    if (isEdit.value) {
      if (currentPuser.value && currentPuser.value === 'broker') {
        // 单选
        brokerPuser.value = removeDuplicates(data, 'uuid');
        brokerEditors.value = [];
        brokerViewers.value = [];
        getLowerUsers(true);
      } else {
        brokerEditors.value = removeDuplicates(dataArr, 'uuid');
      }
    } else {
      brokerViewers.value = removeDuplicates(dataArr, 'uuid');
    }
  }
};

const dataInit = () => {
  if (props.type === 1) {
    vcTeamData.value = cloneDeep(props.data);
  } else if (props.type === 2) {
    if (props.data) {
      const { edit, view, company } = props.data;
      borrowerPuser.value = cloneDeep(company);
      borrowerEditors.value = cloneDeep(edit);
      borrowerViewers.value = cloneDeep(view);

      if (company && company.length) {
        getLowerUsers(false);
      }
    }
  } else if (props.type === 3) {
    if (props.data) {
      const { edit, view, company } = props.data;
      brokerPuser.value = cloneDeep(company);
      brokerEditors.value = cloneDeep(edit);
      brokerViewers.value = cloneDeep(view);

      if (company && company.length) {
        getLowerUsers(true);
      }
    }
  }
};

const subLoading = ref(false);
const submitHandle = async () => {
  if (props.type === 1) {
    // vcTeam 数据
    if (props.currentId || (props.pIds && props.pIds.length)) {
      subLoading.value = true;
      for (let i = 0; i < props.vcTeam.length; i++) {
        const code = props.vcTeam[i].code;
        const params = {
          uuid: [props.currentId],
          user_uuid: vcTeamData.value[code].map((item) => item.uuid),
          role_code: code
        };

        if (props.pIds && props.pIds.length) {
          params.uuid = props.pIds;
        }

        if (code === 'lm' && !params.user_uuid.length) {
          message.error(t(code) + t('为必填项'));
          subLoading.value = false;
          return false;
        }
        await associateAssignTeam(params)
          .then(() => {
            if (i === props.vcTeam.length - 1) {
              subLoading.value = false;
              emits('done');
              updateVisible(false);
            }
          })
          .catch(() => {
            subLoading.value = false;
          });
      }
    } else {
      emitter.emit('stepOneBindUser', {
        type: 1,
        data: vcTeamData.value
      });

      updateVisible(false);
    }
  } else {
    const companyData = props.type === 2 ? cloneDeep(borrowerPuser.value) : cloneDeep(brokerPuser.value);
    const editData = props.type === 2 ? cloneDeep(borrowerEditors.value) : cloneDeep(brokerEditors.value);
    const viewData = props.type === 2 ? cloneDeep(borrowerViewers.value) : cloneDeep(brokerViewers.value);

    if (props.currentId) {
      subLoading.value = true;

      const params = {
        uuid: props.currentId,
        code: props.type === 2 ? 'user' : 'broker',
        company: companyData.length ? companyData[0].uuid : '',
        view: viewData.map((item) => item.uuid),
        edit: editData.map((item) => item.uuid)
      };

      await associateAssignUser(params)
        .then(() => {
          subLoading.value = false;
          emits('done');
          updateVisible(false);
        })
        .catch(() => {
          subLoading.value = false;
        });
    } else {
      emitter.emit('stepOneBindUser', {
        type: props.type,
        data: {
          company: companyData,
          view: viewData,
          edit: editData
        }
      });
      updateVisible(false);
    }
  }
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      dataInit();
    } else {
      vcTeamData.value = null;
      borrowerPuser.value = [];
      borrowerEditors.value = [];
      borrowerViewers.value = [];
      brokerPuser.value = [];
      brokerEditors.value = [];
      brokerViewers.value = [];

      borkerHasLowerUsers.value = false;
      borrowerHasLowerUsers.value = false;
    }
  }
);

const showAddUser = ref(false);
const showApplyBroker = ref(false);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.form-content {
  min-height: 120px;
  padding-bottom: 20px;
  .form-item {
    margin-top: 30px;
    > .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    > .content {
      border-radius: 8px;
      border: 1px solid #282828;
      margin-top: 10px;
      padding: 15px;
      min-height: 50px;
      .user-item {
        padding: 8px 10px;
        background-color: #f7f0e6;
        border-radius: 8px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        &:first-child {
          margin-top: 0;
        }
        .iconfont {
          font-size: 13px;
          cursor: pointer;
          color: @colorPrimary;
          &:hover {
            opacity: 0.8;
          }
        }
      }
    }
  }
}
</style>
