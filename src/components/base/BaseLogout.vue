<template>
  <q-btn label="logout" @click="logout" />
</template>

<script>
// TODO: error catch in login is bypassing... WTF...
import { defineComponent, ref, onBeforeMount } from "vue";
import { auth } from "src/boot/firebase";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    function logout() {
      auth
        .signOut()
        .then(() => {
          router.push("/");
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
    return { logout };
  },
});
</script>

<style></style>
