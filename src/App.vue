<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, unref, watch } from 'vue';
import LanguageSelector from './components/LanguageSelector.vue';
import UnitSelector from './components/UnitSelector.vue';

const locale = ref('en-us');
const value = ref(0);
const unit = ref('day');

const formatter = computed(() => new Intl.RelativeTimeFormat(locale.value));
const example = computed(() => formatter.value.format(value.value, unit.value));

function onLocationChange() {
  const url = new URL(location.href);
  if (url.searchParams.has('locale')) {
    locale.value = url.searchParams.get('locale');
  }
  if (url.searchParams.has('unit')) {
    unit.value = url.searchParams.get('unit');
  }
  if (url.searchParams.has('value')) {
    const v = Number.parseFloat(url.searchParams.get('value'));
    if (!Number.isNaN(v)) {
      value.value = v;
    }
  }
}

const searchParams = computed(() => {
  const s = new URLSearchParams();
  s.set('locale', unref(locale));
  s.set('value', unref(value));
  s.set('unit', unref(unit));
  return String(s);
});

watch(searchParams, (sp) => {
  const url = new URL(location.href);
  url.search = sp;
  history.replaceState({}, '', url.toString());
});

function onStatePop() {
  onLocationChange();
}

onMounted(() => {
  onLocationChange();
  window.addEventListener('popstate', onStatePop);
});

onUnmounted(() => {
  window.removeEventListener('popstate', onStatePop);
});
</script>

<template>
  <div>
    <label>
      <h3>Language</h3>
      <LanguageSelector v-model="locale" />
    </label>
  </div>
  <div>
    <h3>Value</h3>
    <div class="value-group">
      <label>
        Value
        <input type="number" v-model="value" />
      </label>
      <label>
        Unit
        <UnitSelector v-model="unit" />
      </label>
    </div>
  </div>
  <div>
    <h3>Example</h3>
    <div>
      {{ example }}
    </div>
  </div>
  <div>
    <details>
      <summary>Debugging</summary>
      <div>
        <table>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
          <tr>
            <th><code>locale</code></th>
            <td>
              <code>{{ locale }}</code>
            </td>
          </tr>
          <tr>
            <th><code>unit</code></th>
            <td>
              <code>{{ unit }}</code>
            </td>
          </tr>
          <tr>
            <th><code>searchParams</code></th>
            <td>
              <code>{{ searchParams }}</code>
            </td>
          </tr>
        </table>
      </div>
    </details>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
