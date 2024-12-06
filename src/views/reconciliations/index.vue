<template>
  <layout>
    <template #content>
      <a-row>
        <a-col :span="11">
          <p class="title">{{ t('Review your Xero statement lines...') }}</p>
        </a-col>
        <a-col :span="11" :offset="2">
          <p class="title">
            {{ t('...then match with your transactions in VC Online') }}
          </p>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="11">
          <!-- TODO -->
          <a-row :class="['content', { content_match: false }]">
            <a-col :span="12" class="content_cell">
              <p class="xs_text">9 Jul 2024</p>
              <p>stag-ex-0722</p>
              <p>GP01225772 STARTECH MT</p>
              <p>GP01225772 STARTECH MT</p>
            </a-col>
            <a-col :span="6" class="content_cell content_middle">
              <p class="xs_text">Spent</p>
              <p>60,000,000.00</p>
            </a-col>
            <a-col :span="6" class="content_cell">
              <p class="xs_text">Received</p>
              <p>60,000,000.00</p>
            </a-col>
          </a-row>
        </a-col>
        <a-col :span="2" :class="btn_box" class="content_btn">
          <a-button>OK</a-button>
        </a-col>
        <a-col :span="11">
          <div class="sys-form-content">
            <a-row :class="['content', { content_match: true }]">
              <a-col :span="12" class="content_cell">
                <p class="xs_text">9 Jul 2024</p>
                <p>stag-ex-0722</p>
                <p>drawdown</p>
                <p>01</p>
              </a-col>
              <a-col :span="6" class="content_cell content_middle">
                <p class="xs_text">Spent</p>
                <p>60,000,000.00</p>
              </a-col>
              <a-col :span="6" class="content_cell">
                <p class="xs_text">Received</p>
                <p>60,000,000.00</p>
              </a-col>
            </a-row>
            <!-- TODO -->
            <div class="footer" v-show="true">
              <div class="arrow" @click="onFooterClick">
                <span class="xs_text">Change Record Date</span>
                <i class="iconfont">&#xe778;</i>
              </div>
              <!-- TODO -->
              <div :style="{ marginTop: '8px' }">
                <a-date-picker :disabled="false" :size="large" />
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
    </template>
  </layout>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import Layout from './components/layout.vue';

const { t } = useI18n();

const onFooterClick = () => {};
</script>

<style scoped lang="less">
.title {
  width: 100%;
  border-bottom: 1px solid #a6a9b0;
  margin-bottom: 24px;
  color: #181818;
  font-size: 12px;
  line-height: 18px;
}

.content {
  background-color: white;
  border: 1px solid #e6e7e9;
  overflow: hidden;
  border-radius: 4px;

  &_match {
    border: 1px solid #50dcaa;
    border-radius: 4px 4px 0 0;
    background-color: #a8eed5;
  }

  &_cell {
    width: 100%;
    padding: 12px 16px;
    > p {
      font-size: 14px;
      font-weight: 500;
    }

    .xs_text {
      font-size: 12px;
      font-weight: 400;
    }
  }

  &_middle {
    border-left: 1px solid #e6e7e9;
    border-right: 1px solid #e6e7e9;
  }
}

.footer {
  padding: 8px 16px;
  background-color: white;
  border: 1px solid #e6e7e9;
  border-top: none;
  border-radius: 0 0 4px 4px;
  cursor: pointer;

  .xs_text {
    font-size: 12px;
    font-weight: 400;
  }

  & div {
    display: flex;
    justify-content: start;
    align-items: center;
    gap: 8px;
  }

  .iconfont {
    font-size: 8px;
    transform: rotate(180deg);
  }
 
}

.sys-form-content {
  :deep(.ant-picker) {
    border: none !important;
  }
}

.content_btn {
  align-self: center;
  display: flex;
  justify-content: center;
}
</style>
