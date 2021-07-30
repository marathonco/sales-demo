<template>
  <q-layout view="hhh lpR fFf">
    <div v-if="!isAuthenticated" class="absolute-center">
      <base-login v-model:isAuthenticated="isAuthenticated" />
    </div>
    <q-page-container v-else>
      <div class="row flex-center">
        <q-btn @click="logout" label="logout" size="md" class="q-ma-md" />
      </div>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import BaseLogin from "components/base/BaseLogin.vue";
import { useRouter } from "vue-router";
import firebase from "firebase/app";
import "firebase/auth";

export default defineComponent({
  name: "AdminLayout",
  components: {
    BaseLogin,
  },
  setup() {
    const isAuthenticated = ref(false);
    const router = useRouter();

    function logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          router.push("/");
        })
        .catch((error) => {
          console.log(error.message);
        });
    }

    return {
      isAuthenticated,
      logout,
    };
  },
});
</script>
