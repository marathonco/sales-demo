<template>
  <q-layout view="hhh lpR fFf">
    <div v-if="secure !== 4444" class="absolute-center">
      <q-input
        v-model.number="secure"
        type="number"
        filled
        label="Security Code"
        style="max-width: 200px"
      />
    </div>
    <q-page-container v-else>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
// TODO: better authentication
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "AdminLayout",

  setup() {
    const secure = ref(null);
    return {
      secure,
    };
  },
});
</script>
