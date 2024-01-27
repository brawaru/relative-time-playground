<script setup lang="ts">
import { units } from '../shared/units.ts';
const unitModel = defineModel({ type: String });
</script>
<template>
  <select v-model="unitModel" v-bind="$attrs">
    <option v-for="(unitName, unit) in units" :value="unit" :key="unit">
      {{ unitName }}
    </option>
  </select>
</template>
