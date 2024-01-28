<script setup lang="ts">
import { isUnit } from "./shared/units.ts";
import { ref, computed, onMounted, onUnmounted, unref, watch } from "vue";
import LanguageSelector from "./components/LanguageSelector.vue";
import UnitSelector from "./components/UnitSelector.vue";
import { debounce } from "./shared/debounce";

const $locale = ref("en-us");

const $value = ref(0);

function computeValue(value: number, past: boolean) {
  const abs = Math.abs(value);
  if (past) return abs === 0 ? -0 : abs * -1;
  return abs;
}

const $past = computed({
  get() {
    const value = unref($value);
    return Object.is(value, -0) || value < 0;
  },
  set(past) {
    $value.value = computeValue(unref($value), past);
  },
});

const $visibleValue = computed({
  get() {
    return Math.abs(unref($value));
  },
  set(value) {
    $value.value = computeValue(value, unref($past));
  },
});

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

const $formatter = computed(
  () => new Intl.RelativeTimeFormat([unref($locale), "en-US"])
);

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

const $url = computed(() => {
  const url = new URL(location.href);
  url.searchParams.set("locale", unref($locale));
  url.searchParams.set("value", String(unref($value)));
  url.searchParams.set("unit", unref($unit));
  return String(url);
});

const $historyPushed = ref(false);

watch(
  $url,
  (() => {
    const debouncedPush = debounce((url: string) => {
      history.replaceState({}, "", url.toString());
      $historyPushed.value = true;
    }, 500);

    return function pushToHistory(url: string) {
      $historyPushed.value = false;
      debouncedPush(url);
    };
  })()
);

function onStatePop() {
  onLocationChange();
}

async function copyOrPrompt(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    if (typeof alert !== 'undefined') {
      alert('Copied to clipboard')
    }
  } catch (err) {
    console.error('Clipboard write failed', err)
    if (typeof prompt !== 'undefined') {
      prompt('Cannot copy automatically, please copy it manually', text)
    }
  }
}

function onLinkClick(e: MouseEvent) {
  e.preventDefault();
  if (typeof navigator.share !== "undefined") {
    const shareData = {
      title: "Intl.RelativeTimeFormat tester",
      text: `Using Intl.RelativeTimeFormat API in my browser, ${unref(
        $value
      )} ${unref($unit)}(s) is evaluated to ${unref($example)}`,
      url: unref($url),
    } satisfies ShareData;
    if (navigator.canShare(shareData)) {
      navigator.share(shareData).then(
        () => {
          console.log("Opened share menu successfully");
        },
        (err) => {
          console.error("Cannot share", err);
          copyOrPrompt(shareData.url)
        }
      );
    }
  } else {
    copyOrPrompt(unref($url))
  }
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
    <div>
      <a :href="$url" @click="onLinkClick">Permalink</a>
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
            <th><code>url</code></th>
            <td>
              <code>{{ $url }}</code>
            </td>
          </tr>
          <tr>
            <th><code>historyPushed</code></th>
            <td>
              <code>{{ $historyPushed }}</code>
            </td>
          </tr>
        </table>
      </div>
    </details>
  </div>
</template>
