<template>
  <q-layout view="hhh lpR fFf">
    <q-page-container>
      <div class="row flex-center q-ma-md">
        <base-logout />
      </div>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
// TODO: error catch in login is bypassing... WTF...

import { defineComponent } from "vue";
import BaseLogout from "components/base/BaseLogout.vue";

export default defineComponent({
  name: "AdminLayout",
  components: {
    BaseLogout,
  },
  setup() {
    return {};
  },
});
</script>
