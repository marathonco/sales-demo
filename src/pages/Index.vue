<template>
  <q-page class="bg-dark">
    <div class="row flex-center">
      <img src="~assets/logo.svg" class="logo" />
    </div>
    <div class="row flex-center">
      <video autoplay playsinline muted loop style="width: 100%">
        <source type="video/webm" src="~/assets/demo.webm" />
        <source type="video/mp4" src="~/assets/demo.mp4" />
      </video>
    </div>
    <div class="row flex-center q-mt-lg">
      <q-btn
        label="Schedule an appointment"
        icon="event"
        color="primary"
        size="xl"
        class="shadow-8"
        @click="dialogDay = true"
      ></q-btn>
    </div>
    <q-dialog
      v-model="dialogDay"
      transition-show="flip-up"
      transition-hide="jump-left"
    >
      <q-date
        v-model="form.date"
        landscape
        :options="dateOptions"
        :navigation-min-year-month="minMonth"
        @update:model-value="updateDate"
      />
    </q-dialog>
    <q-dialog
      v-model="dialogTime"
      transition-show="jump-left"
      transition-hide="jump-left"
    >
      <q-card style="width: 420px">
        <q-banner rounded class="bg-primary text-white">
          <h5>Choose a time slot below:</h5>
        </q-banner>
        <q-list bordered separator dense class="text-center">
          <q-item
            v-for="(time, index) in allowedTimes"
            :key="index"
            :active="form.time == time"
            active-class="bg-secondary text-dark text-bold"
            dense
            clickable
            v-ripple
            @click="updateTime(time)"
          >
            <q-item-section>
              <q-item-label>
                {{ time }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="dialogInfo"
      transition-show="jump-left"
      transition-hide="jump-left"
    >
      <q-card style="width: 420px">
        <q-banner rounded class="bg-primary text-white">
          <h5>Please provide your contact information:</h5>
        </q-banner>
        <q-form
          class="bg-white q-pa-md"
          autocorrect="off"
          autocomplete="off"
          spellcheck="false"
          @submit="updateInfo"
        >
          <q-input
            v-model="form.name"
            placeholder="Your Name"
            :rules="[(val) => !!val || 'Please let us know who you are']"
          />
          <q-input
            v-model="form.business"
            placeholder="Your Business"
            :rules="[
              (val) => !!val || 'Please let us know what business you are with',
            ]"
          />
          <q-input
            v-model="form.email"
            placeholder="Email Address"
            type="email"
            :rules="[(val) => !!val || 'Please provide an email address']"
          />
          <q-input
            v-model="form.phone"
            placeholder="Phone Number"
            type="tel"
            mask="(###) ### - ####"
            :rules="[(val) => !!val || 'Please provide an email address']"
          />
          <div class="row justify-center q-mt-md">
            <q-btn type="submit" size="lg" label="Continue" color="dark" />
          </div>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="dialogConfirm"
      transition-show="jump-left"
      transition-hide="flip-down"
    >
      <q-card class="text-center" style="width: 420px">
        <q-item class="bg-dark text-white">
          <q-item-section>
            <q-item-label>{{ prettyDate }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-card-section>
          <q-item>
            <q-item-section>
              <q-item-label>{{ form.name }}</q-item-label>
              <q-item-label caption>{{ form.business }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-card-section>
          <q-item>
            <q-item-section>
              <q-item-label caption>{{ form.email }}</q-item-label>
              <q-item-label caption>{{ form.phone }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>
        <q-card-section
          ><q-toggle
            v-model="form.reminder"
            checked-icon="mail"
            unchecked-icon="clear"
            color="green"
            label="Email reminder 1 hour before?"
            left-label
        /></q-card-section>
        <q-card-actions align="center">
          <q-btn
            label="Confirm Appointment"
            color="primary"
            size="lg"
            @click="createAppointment"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="dialogSuccess"
      transition-show="flip-down"
      transition-hide="scale"
    >
      <q-card class="text-center" style="width: 420px">
        <q-banner rounded class="bg-dark text-white">
          <h5>All Done!</h5>
        </q-banner>
        <p class="q-pt-lg">Thanks for taking the time.</p>
        <p>We look forward to seeing you again soon!</p>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, watch } from "vue";
import { date } from "quasar";
import { db } from "boot/firestore";

export default defineComponent({
  name: "PageIndex",
  setup() {
    const dialogDay = ref(false);
    const dialogTime = ref(false);
    const dialogInfo = ref(false);
    const dialogConfirm = ref(false);
    const dialogSuccess = ref(false);
    const today = date.formatDate(Date.now(), "YYYY/MM/DD");

    const form = ref({
      name: "",
      business: "",
      email: "",
      phone: "",
      reminder: true,
      date: today,
      time: null,
    });
    function resetForm() {
      form.value = {
        name: "",
        business: "",
        email: "",
        phone: "",
        reminder: true,
        date: today,
        time: null,
      };
      dialogDay.value = false;
      dialogTime.value = false;
      dialogInfo.value = false;
      dialogConfirm.value = false;
      dialogSuccess.value = false;
    }

    const prettyDate = computed(() => {
      if (form.value.date) {
        return date.formatDate(form.value.date, "MMMM Do, YYYY");
      } else {
        return null;
      }
    });

    const minMonth = date.formatDate(Date.now(), "YYYY/MM");

    const Holidays = require("date-holidays");
    const hd = new Holidays("US");

    function dateOptions(dateOption) {
      const day = date.getDayOfWeek(dateOption); // 6 = sat, 7 = sun
      const holiday = hd.isHoliday(dateOption);
      return dateOption >= today && day !== 6 && day !== 7 && !holiday;
    }
    function updateDate(value, reason, details) {
      if (reason === "add-day") {
        dialogDay.value = false;
        dialogTime.value = true;
        form.value.date = value;
      }
    }

    const allowedTimes = [
      "09:00 AM EST",
      "09:30 AM EST",
      "10:00 AM EST",
      "10:30 AM EST",
      "11:00 AM EST",
      "11:30 AM EST",
      "12:00 PM EST",
      "12:30 PM EST",
      "1:00 PM EST",
      "1:30 PM EST",
      "2:00 PM EST",
      "2:30 PM EST",
      "3:00 PM EST",
      "3:30 PM EST",
      "4:00 PM EST",
      "4:30 PM EST",
    ];
    function updateTime(value) {
      form.value.time = value;
      dialogTime.value = false;
      dialogInfo.value = true;
    }

    function updateInfo() {
      dialogInfo.value = false;
      dialogConfirm.value = true;
    }

    async function createAppointment() {
      // TODO: add timestamp of when now is...
      // First try firebase, if not... push to session storage.
      db.collection("appointments")
        .doc()
        .set({
          ...form.value,
          datetime: `${form.value.date}/${form.value.time}`,
        })
        .then(() => {
          console.log(`appointment set... let's move on`);
        })
        .catch((error) => {
          console.log(`oops, there was an error...: ${error}`);
        });

      dialogConfirm.value = false;
      dialogSuccess.value = true;
      setTimeout(() => {
        resetForm();
      }, 3000);
    }

    let clearForm;
    watch(
      form,
      () => {
        clearTimeout(clearForm);
        clearForm = setTimeout(() => {
          resetForm();
        }, 30000);
      },
      { deep: true }
    );

    return {
      dialogDay,
      dialogTime,
      dialogInfo,
      dialogConfirm,
      dialogSuccess,
      minMonth,
      form,
      prettyDate,
      dateOptions,
      updateDate,
      allowedTimes,
      updateTime,
      updateInfo,
      createAppointment,
    };
  },
});
</script>
<style lang="scss">
.q-dialog__backdrop {
  backdrop-filter: blur(6px);
}
</style>
