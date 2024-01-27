<script lang="ts">
interface Locale {
  name: string;
  nativeName: string;
}

let remoteLocales: null | Promise<Record<string, Locale>> = null;

function fetchRemoteLocales() {
  if (remoteLocales != null) return remoteLocales;
  remoteLocales = fetch(
    'https://gistcdn.githack.com/brawaru/517ef2e7bcfd29e6bb556cbfee6a29a5/raw/37fa9cbc88453d99425302f65b53d2c9c8a91b26/known-locales-firefox.json'
  ).then((resp) => resp.json());
  return remoteLocales;
}
</script>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const locale = defineModel({ type: String });
const locales = ref<Record<string, Locale> | null>(null);
onMounted(() => {
  fetchRemoteLocales().then((value) => {
    locales.value = value;
  });
});
</script>

<template>
  <template v-if="locales == null">
    <select v-bind="$attrs">
      <option value="en-x-placeholder">Loading...</option>
    </select>
  </template>
  <template v-else>
    <select :disabled="locales == null" v-model="locale" v-bind="$attrs">
      <option v-for="(locale, k) in locales" :value="k" :key="k">
        {{ locale.name }}
      </option>
    </select>
  </template>
</template>
