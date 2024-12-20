<template>
  <div class="indicatorsGrid">
    <div class="chart"></div>
    <div class="MeterStat-row">
      <div class="MeterStat MeterStat_type_stone3">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Facility limit 2</p>
          <div class="fs_3xl bold">$0.00</div>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_charcoal">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Current balance</p>
          <div class="fs_3xl bold" style="margin-bottom: 2px">$1,826,948.34</div>
          <p class="color_grey">$0.00 available</p>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_dotsYellow">
        <div class="MeterStat-Dots">
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
        </div>
        <div>
          <p class="color_grey" style="margin-bottom: 2px">Accrued interest</p>
          <div class="fs_3xl bold">$8,509.07</div>
        </div>
      </div>
    </div>
    <div class="MeterStat-row">
      <div class="MeterStat MeterStat_type_transparent">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Facility limit 1</p>
          <div class="fs_3xl bold">$0.00</div>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_cyan">
        <div class="MeterStat-Meter"></div>
        <div>
          <p>Drawn amount</p>
          <div class="fs_3xl bold" style="margin-bottom: 2px">$1,257,347.95</div>
          <p class="color_grey">$0.00 available</p>
        </div>
      </div>
      <div class="MeterStat MeterStat_type_dotsBlack">
        <div class="MeterStat-Dots">
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
          <div class="MeterStat-Dot"></div>
        </div>
        <div>
          <p class="color_grey" style="margin-bottom: 2px">Pending drawdown</p>
          <div class="fs_3xl bold">$0.00</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps([]);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.indicatorsGrid {
  align-items: center;
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 40px;
}

.MeterStat-row {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.MeterStat {
  display: flex;
  font-weight: 500;
  gap: 24px;
  flex: 1;
}
.MeterStat-Meter {
  border: 1px solid;
  border-radius: 4px;
  width: 6px;
}
.MeterStat_type_stone3 > .MeterStat-Meter {
  background-color: #f3ede5;
  border-color: #f3ede5;
}
.MeterStat_type_transparent > .MeterStat-Meter {
  background-color: transparent;
  border-color: hsla(200, 9%, 66%, 0.5);
}
.MeterStat_type_charcoal > .MeterStat-Meter {
  background-color: #272727;
  border-color: #272727;
}
.MeterStat-Dots {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.MeterStat-Dot {
    background-color: rgba(169, 173, 87, .7);
    border: 1px solid rgba(109, 123, 31, .5);
    border-radius: 3px;
    height: 6px;
    width: 6px;
}
.MeterStat_type_cyan>.MeterStat-Meter {
    background-color: #b4f1db;
    border-color: #b4f1db;
}
.MeterStat_type_dotsYellow .MeterStat-Dot {
    background-color: #f19915;
    border-color: #f19915;
}
</style>
