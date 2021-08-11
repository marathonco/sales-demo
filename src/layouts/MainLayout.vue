<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container class="bg-dark">
      <q-pull-to-refresh @refresh="refresh">
        <router-view />
      </q-pull-to-refresh>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "MainLayout",
  setup() {
    return {
      refresh(done) {
        window.location.reload();
        done();
      },
    };
  },
});
</script>
