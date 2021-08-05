<template>
  <div class="absolute-center">
    <base-login />
  </div>
</template>

<script>
import { defineComponent } from "vue";
import BaseLogin from "components/base/BaseLogin.vue";

export default defineComponent({
  components: {
    BaseLogin,
  },
  setup() {
    return {};
  },
});
</script>

<style></style>
