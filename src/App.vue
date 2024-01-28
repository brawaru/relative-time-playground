<script setup lang="ts">
import { isUnit } from "./shared/units.ts";
import { ref, computed, onMounted, onUnmounted, unref, watch } from "vue";
import LanguageSelector from "./components/LanguageSelector.vue";
import UnitSelector from "./components/UnitSelector.vue";

const $locale = ref("en-us");

const $value = ref(0)

function computeValue(value: number, past: boolean) {
  const abs = Math.abs(value)
  if (past) return abs === 0 ? -0 : abs * -1
  return abs
}

const $past = computed({
  get() {
    const value = unref($value)
    return Object.is(value, -0) || value < 0
  },
  set(past) {
    $value.value = computeValue(unref($value), past)
  },
})

const $visibleValue = computed({
  get() {
    return Math.abs(unref($value))
  },
  set(value) {
    $value.value = computeValue(value, unref($past))
  }
})

const $unit = ref<Intl.RelativeTimeFormatUnit>("day");

const $intlLocale = computed(() => new Intl.Locale(unref($locale)));

const $supportedLocales = computed(() =>
  Intl.RelativeTimeFormat.supportedLocalesOf([unref($intlLocale).toString()])
);

const $isSupported = computed(() => {
  const intlLocale = unref($intlLocale);
  for (const supportedLocale of unref($supportedLocales)) {
    const supportedIntlLocale = new Intl.Locale(supportedLocale);
    if (supportedIntlLocale.language === intlLocale.language) return true;
  }
  return false;
});

const $formatter = computed(() => new Intl.RelativeTimeFormat([unref($locale), 'en-US']));

const $example = computed(() =>
  unref($formatter).format(unref($value), unref($unit))
);

function onLocationChange() {
  const url = new URL(location.href);
  if (url.searchParams.has("locale")) {
    $locale.value = url.searchParams.get("locale")!;
  }
  if (url.searchParams.has("unit")) {
    const v = url.searchParams.get("unit");
    if (isUnit(v)) {
      $unit.value = v;
    }
  }
  if (url.searchParams.has("value")) {
    const v = Number.parseFloat(url.searchParams.get("value")!);
    if (!Number.isNaN(v)) {
      $value.value = v;
    }
  }
}

const $searchParams = computed(() => {
  const s = new URLSearchParams();
  s.set("locale", unref($locale));
  s.set("value", String(unref($value)));
  s.set("unit", unref($unit));
  return String(s);
});

watch($searchParams, (sp) => {
  const url = new URL(location.href);
  url.search = sp;
  history.replaceState({}, "", url.toString());
});

function onStatePop() {
  onLocationChange();
}

onMounted(() => {
  onLocationChange();
  window.addEventListener("popstate", onStatePop);
});

onUnmounted(() => {
  window.removeEventListener("popstate", onStatePop);
});
</script>

<template>
  <div>
    <label>
      <h3>Language</h3>
      <LanguageSelector v-model="$locale" />
    </label>
    <div v-if="!$isSupported" style="color: lightcoral">
      ⚠️ This locale is not supported by your browser.
    </div>
  </div>
  <div>
    <h3>Value</h3>
    <div class="value-group">
      <label>
        Value
        <input type="number" min="0" v-model="$visibleValue" />
      </label>
      <label>
        Unit
        <UnitSelector v-model="$unit" />
      </label>
      <label>
        <input type="checkbox" v-model="$past" />
        In the past
      </label>
    </div>
  </div>
  <div>
    <h3>Example</h3>
    <div>
      {{ $example }}
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
              <code>{{ $locale }}</code>
            </td>
          </tr>
          <tr>
            <th><code>intlLocale</code></th>
            <td>
              <code>{{ $intlLocale }}</code>
            </td>
          </tr>
          <tr>
            <th><code>value</code></th>
            <td>
              <code>{{ $value }}</code>
            </td>
          </tr>
          <tr>
            <th><code>supportedLocales</code></th>
            <td>
              <code>{{ $supportedLocales }}</code>
            </td>
          </tr>
          <tr>
            <th><code>unit</code></th>
            <td>
              <code>{{ $unit }}</code>
            </td>
          </tr>
          <tr>
            <th><code>searchParams</code></th>
            <td>
              <code>{{ $searchParams }}</code>
            </td>
          </tr>
        </table>
      </div>
    </details>
  </div>
</template>
