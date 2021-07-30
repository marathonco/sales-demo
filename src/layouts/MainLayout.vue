<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container class="bg-dark">
      <router-view />
      <!-- <q-page-sticky position="top-right" :offset="[20, 20]">
        <q-btn
          v-if="!$q.fullscreen.isActive"
          color="primary"
          @click="$q.fullscreen.toggle()"
          label="Fullscreen"
          icon="fullscreen"
          class="z-max"
          size="lg"
        />
      </q-page-sticky> -->
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "MainLayout",

  setup() {
    return {};
  },
});
</script>
