<script setup lang="ts">
const units = {
  year: 'Year',
  quarter: 'Quarter',
  month: 'Month',
  week: 'Week',
  day: 'Day',
  hour: 'Hour',
  minute: 'Minute',
  second: 'Second',
};
const unitModel = defineModel({ type: String });
</script>
<template>
  <select v-model="unitModel" v-bind="$attrs">
    <option v-for="(unitName, unit) in units" :value="unit" :key="unit">
      {{ unitName }}
    </option>
  </select>
</template>
