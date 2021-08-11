<template>
  <q-dialog
    v-model="dialogEmail"
    persistent
    transition-show="flip-up"
    transition-hide="jump-left"
  >
    <q-card
      class="q-pa-md text-center z-max shadow-8 absolute-center"
      style="min-width: 400px"
    >
      <q-card-section>
        <div class="text-h5 text-center">Login</div>
      </q-card-section>

      <q-card-section> Please provide your email address. </q-card-section>
      <q-form @submit="checkEmail">
        <q-card-section>
          <q-input
            autofocus
            type="email"
            filled
            label="Email"
            v-model="email"
            :error="
              errorMessage.code === 'email' || errorMessage.code === 'other'
            "
            :error-message="errorMessage.message"
            :rules="[(val) => !!val || 'Field is required']"
          >
            <template v-slot:prepend>
              <q-icon name="face" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-actions align="evenly">
          <q-btn
            :label="resetText"
            icon="restart_alt"
            @click="resetPassword()"
            color="secondary"
            :loading="isSending"
          >
            <template v-slot:loading><q-spinner-rings /></template
          ></q-btn>
          <q-btn
            type="submit"
            label="Continue"
            color="primary"
            icon-right="arrow_forward"
          >
            <template v-slot:loading> <q-spinner-rings /> </template
          ></q-btn>
        </q-card-actions>
        <q-card-actions align="center">
          <q-btn to="/" label="Back to Demo" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
  <q-dialog
    v-model="dialogPassword"
    persistent
    transition-show="jump-right"
    transition-hide="jump-left"
  >
    <q-card
      class="q-pa-md text-center z-max shadow-8 absolute-center"
      style="min-width: 400px"
    >
      <q-form @submit="login()">
        <q-card-section>
          <div class="text-h5 text-center">Login</div>
          <div class="text-subtitle2">{{ email }}</div>
        </q-card-section>

        <q-card-section> Please provide your password </q-card-section>
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
            label="go back"
            icon="arrow_back"
            color="secondary"
            @click="
              dialogEmail = true;
              dialogPassword = false;
            "
          />
          <q-btn
            type="submit"
            label="Log In"
            icon-right="arrow_forward"
            @click="login()"
            :loading="isSubmitting"
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
// TODO: add a "back to demo" button?
// TODO: setup catchall error display
import { defineComponent, ref, onBeforeMount } from "vue";
import { auth } from "src/boot/firebase";
import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  setup(props) {
    const router = useRouter();
    const route = useRoute();
    if (route.query.oobCode && route.query.reset) {
      firebase
        .auth()
        .verifyPasswordResetCode(route.query.oobCode)
        .then(() => {
          email.value = route.query.reset;
        })
        .catch((err) => {
          console.log("invalid reset code");
        });
    }
    const email = ref(null);
    const password = ref(null);
    const isPwd = ref(true);
    const errorMessage = ref({ code: "", message: "" });
    const isSubmitting = ref(false);
    const resetText = ref("Reset Password");
    const isSending = ref(false);
    const dialogEmail = ref(true);
    const dialogPassword = ref(false);
    onBeforeMount(async () => {
      await new Promise((resolve, reject) => {
        auth.onAuthStateChanged((authUser, claims) => {
          resolve(authUser);
        });
      });
    });
    const checkEmail = async () => {
      // TODO: not sure if we can implement a logic to check email here.
      dialogEmail.value = false;
      dialogPassword.value = true;
    };
    const login = async () => {
      console.log("trying to log in");
      isSubmitting.value = true;
      errorMessage.value = { code: "", message: "" };
      try {
        return await auth
          .signInWithEmailAndPassword(email.value, password.value)
          .then((userCredential) => {
            if (userCredential.user) {
              console.log("user", userCredential.user);
              router.push("/admin");
            }
            return Promise.resolve(userCredential.user);
          })
          .catch((err) => {
            if (
              err.code === "auth/invalid-email" ||
              err.code === "auth/user-not-found"
            ) {
              dialogEmail.value = true;
              dialogPassword.value = false;
              errorMessage.value = { code: "email", message: err.message };
            } else if (err.code === "auth/invalid-password") {
              errorMessage.value = { code: "password", message: err.message };
            } else {
              errorMessage.value = { code: "other", message: err.message };
            }
            isSubmitting.value = false;
            console.error(err);
            // TODO: set separate error messages for email/pwd based on err.case
            return Promise.reject(err);
          });
      } catch (err) {
        console.error(err);
        errorMessage.value = { code: "other", message: err.message };
        dialogEmail.value = true;
        dialogPassword.value = false;
      }
      isSubmitting.value = false;
      emit("update:isAuthenticated", true);
    };
    function resetPassword() {
      isSending.value = true;
      const actionCodeSettings = {
        url: `${location.origin}/admin`,
        handleCodeInApp: true,
      };
      auth
        .sendPasswordResetEmail(email.value, actionCodeSettings)
        .then(() => {
          isSending.value = false;
          resetText.value = "Email Sent";
          console.log("sending email link now...");
        })
        .catch((err) => {
          // errorMessage.value = { code: "email", message: err.message };
          isSending.value = false;
          errorMessage.value = { code: "email", message: err.message };
          console.log("error sending email", err);
        });
    }
    const onReset = () => {
      console.log("trying to reset");
      errorMessage.value = { code: "", message: "" };
      email.value = null;
      password.value = null;
      isSubmitting.value = false;
    };
    return {
      dialogEmail,
      dialogPassword,
      email,
      password,
      isPwd,
      isSending,
      isSubmitting,
      resetText,
      resetPassword,
      checkEmail,
      login,
      onReset,
      errorMessage,
    };
  },
});
</script>

<style></style>
