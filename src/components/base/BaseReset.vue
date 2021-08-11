<template>
  <q-dialog
    v-model="dialogDefault"
    persistent
    transition-show="flip-up"
    transition-hide="flip-down"
  >
    <q-card
      class="q-pa-md text-center z-max shadow-8 absolute-center"
      style="min-width: 400px"
    >
      <div class="text-h5 text-center">Checking...</div>
      <div v-if="errorMessage.code === 'code'">{{ errorMessage.message }}</div>
      <div v-else>Checking that the link provided is correct.</div>
      <q-spinner-rings />
    </q-card>
  </q-dialog>
  <q-dialog v-model="dialogSuccess">
    <q-card
      class="q-pa-md text-center z-max shadow-8 absolute-center"
      style="min-width: 400px"
    >
      <div class="text-h5 text-center">Success</div>
      <div>
        You have changed your password and will be redirected momentarily.
      </div>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="dialogReset"
    persistent
    transition-show="flip-up"
    transition-hide="jump-left"
  >
    <q-card
      class="q-pa-md text-center z-max shadow-8 absolute-center"
      style="min-width: 400px"
    >
      <q-form @submit="changePassword()">
        <q-card-section>
          <div class="text-h5 text-center">Reset Password</div>
        </q-card-section>

        <q-card-section> Please provide your new password </q-card-section>
        <q-card-section>
          <q-input
            v-model="password"
            autofocus
            filled
            label="Password"
            :type="isPwd ? 'password' : 'text'"
            :error="errorMessage.code === 'password'"
            :error-message="errorMessage.message"
            :rules="[(val) => !!val || 'Field is required']"
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
        <q-card-actions align="evenly">
          <q-btn
            label="cancel"
            icon="arrow_back"
            color="secondary"
            @click="router.push('/login')"
          />
          <q-btn
            type="submit"
            :label="resetText"
            icon-right="arrow_forward"
            @click="resetPassword()"
            :loading="isResetting"
            color="primary"
          >
            <template v-slot:loading><q-spinner-rings /></template
          ></q-btn>
        </q-card-actions>
        <q-card-actions align="center">
          <q-btn to="/" label="Back to Demo" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
// TODO: only show password reset dialog if oobCode is valid
import { defineComponent, ref, onBeforeMount } from "vue";
import { auth } from "src/boot/firebase";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const router = useRouter();
    const route = useRoute();
    onBeforeMount(async () => {
      // check that paramters are a valid reset code
      if (route.query.oobCode) {
        await new Promise((resolve, reject) => {
          auth
            .verifyPasswordResetCode(route.query.oobCode)
            .then(() => {
              dialogReset.value = true;
              dialogDefault.value = false;
            })
            .catch((err) => {
              console.log("invalid reset code");
              errorMessage.value = {
                code: "code",
                message: "The link you followed has expired, please try again.",
              };
            });
        });
      } else {
        errorMessage.value = {
          code: "code",
          message: "The link you followed is incorrect, please try again.",
        };
      }
    });
    const dialogDefault = ref(true);
    const dialogReset = ref(false);
    const dialogSuccess = ref(false);
    const password = ref(null);
    const isPwd = ref(true);
    const errorMessage = ref({ code: "", message: "" });
    const isResetting = ref(false);
    const resetText = ref("Reset Password");
    const changePassword = async () => {
      console.log("changing password");
      isResetting.value = true;
      errorMessage.value = { code: "", message: "" };
      try {
        return await auth
          .confirmPasswordReset(route.query.oobCode, password.value)
          .then(async (resp) => {
            dialogReset.value = false;
            dialogSuccess.value = true;
            setTimeout(() => {
              if (route.query.continueURL) {
                router.push(route.query.continueURL);
              } else {
                router.push("/login");
              }
            }, 3000);
            return Promise.resolve(resp);
          })
          .catch((err) => {
            if (
              err.code === "auth/invalid-email" ||
              err.code === "auth/user-not-found"
            ) {
              dialogReset.value = true;
            } else if (err.code === "auth/invalid-password") {
              errorMessage.value = { code: "password", message: err.message };
            } else {
              errorMessage.value = { code: "other", message: err.message };
            }
            isResetting.value = false;
            console.error(err);
            return Promise.reject(err);
          });
      } catch (err) {
        console.error(err);
        errorMessage.value = { code: "password", message: err.message };
        dialogReset.value = true;
      }
      isResetting.value = false;
    };
    return {
      dialogDefault,
      dialogReset,
      dialogSuccess,
      password,
      isPwd,
      changePassword,
      isResetting,
      resetText,
      errorMessage,
    };
  },
});
</script>

<style></style>
