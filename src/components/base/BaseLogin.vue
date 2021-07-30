<template>
  <q-card class="z-max shadow-8 absolute-center" style="min-width: 350px">
    <q-form class="q-gutter-md" @submit="onSubmit" @reset="onReset">
      <q-card-section>
        <q-input
          filled
          label="Username"
          v-model="username"
          error-message="Email or Password is incorrect"
          :error="errorMessage != null"
        >
          <template v-slot:prepend>
            <q-icon name="face" />
          </template>
        </q-input>
        <q-input
          v-model="password"
          filled
          label="Password"
          :type="isPwd ? 'password' : 'text'"
          error-message="Email or Password is incorrect"
          :error="errorMessage != null"
        >
          <template v-slot:prepend>
            <q-icon name="password" />
          </template>
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions align="center">
        <q-btn type="reset">Cancel</q-btn>
        <q-btn type="submit" :loading="isSubmitting">
          <template v-slot:loading> <q-spinner-rings /> </template>Log In</q-btn
        >
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script>
import { ref, onBeforeMount } from "vue";
import firebase from "firebase/app";
import "firebase/auth";

export default {
  props: {
    isAuthenticated: {
      type: Boolean,
      required: true,
    },
  },
  setup(props, { emit }) {
    const username = ref(null);
    const password = ref(null);
    const isPwd = ref(true);
    const errorMessage = ref(null);
    const isSubmitting = ref(false);
    const isOpen = ref(false);
    onBeforeMount(async () => {
      await new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged((authUser, claims) => {
          resolve(authUser);
          emit("update:isAuthenticated", authUser ? true : false);
        });
      });
    });
    const onSubmit = async () => {
      console.log("trying to login");
      isSubmitting.value = true;
      errorMessage.value = null;
      try {
        return await firebase
          .auth()
          .signInWithEmailAndPassword(username.value, password.value)
          .then((userCredential) => {
            emit("update:isAuthenticated", true);
            return Promise.resolve(userCredential.user);
            // return userCredential.user;
          })
          .catch((err) => {
            console.error(err);
            errorMessage.value = err.message;
            // TODO: set separate error messages for email/pwd based on err.case
            return Promise.reject(err);
          });
      } catch (err) {
        console.error("ok", err);
        errorMessage.value = err.message;
      }
      isSubmitting.value = false;
      emit("update:isAuthenticated", true);
    };
    const onReset = () => {
      console.log("trying to reset");
      errorMessage.value = null;
      username.value = null;
      password.value = null;
      isSubmitting.value = false;
    };
    return {
      isOpen,
      username,
      password,
      isPwd,
      isSubmitting,
      onSubmit,
      onReset,
      errorMessage,
    };
  },
};
</script>

<style></style>
