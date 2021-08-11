<template>
  <q-page class="bg-dark">
    <div class="absolute-center" style="width: 100%">
      <video
        autoplay="false"
        muted
        playsinline
        loop
        type="video/mp4"
        style="width: 100%"
        src="/web-video.mp4"
        ref="videoBackground"
        @click="videoBackground.play()"
      >
        <source type="video/mp4" src="/web-video.mp4" />
      </video>
    </div>
    <q-page-sticky position="bottom" :offset="[0, 25]">
      <q-btn
        label="Schedule an appointment"
        icon="event"
        color="primary"
        size="xl"
        class="shadow-8"
        @click="dialogDay = true"
      ></q-btn>
    </q-page-sticky>
    <q-dialog
      class="z-max"
      v-model="dialogDay"
      transition-show="flip-up"
      transition-hide="jump-left"
    >
      <q-date
        v-model="formData.date"
        landscape
        :options="dateOptions"
        :navigation-min-year-month="minMonth"
        @update:model-value="updateDate"
      />
    </q-dialog>
    <q-dialog
      class="z-max"
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
            :active="formData.time == time"
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
      class="z-max"
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
            v-model="formData.name"
            placeholder="Your Name"
            autofocus
            :rules="[(val) => !!val || 'Please let us know who you are']"
          />
          <q-input
            v-model="formData.business"
            placeholder="Your Business"
            :rules="[
              (val) => !!val || 'Please let us know what business you are with',
            ]"
          />
          <q-input
            v-model="formData.email"
            placeholder="Email Address"
            type="email"
            :rules="[(val) => !!val || 'Please provide an email address']"
          />
          <q-input
            v-model="formData.phone"
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
      class="z-max"
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
              <q-item-label>{{ formData.name }}</q-item-label>
              <q-item-label caption>{{ formData.business }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>

        <q-card-section>
          <q-item>
            <q-item-section>
              <q-item-label caption>{{ formData.email }}</q-item-label>
              <q-item-label caption>{{ formData.phone }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-card-section>
        <q-card-section
          ><q-toggle
            v-model="formData.reminder"
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
      class="z-max"
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
// TODO: add data to local storage...
import { defineComponent, ref, computed, watch, onMounted } from "vue";
import { date, useQuasar } from "quasar";
import { db } from "src/boot/firebase";
import firebase from "firebase/app";

export default defineComponent({
  name: "PageIndex",
  setup() {
    const $q = useQuasar();
    const videoBackground = ref(null);
    // onMounted(async () => {
    //   videoAsBlob("/web-video.mp4");
    // });

    // TODO: the problem is that the blob saved isn't the entire video...
    // async function videoAsBlob(videoSrcUrl) {
    //   await fetch(videoSrcUrl).then((response) => {
    //     console.log(response);
    //     videoBackground.value.src = videoSrcUrl;
    //     videoBackground.value.play();
    //     return response.blob();
    //   });
    // .then((blob) => {
    //   console.log("video loaded as a blob");
    //   const videoBlob = URL.createObjectURL(blob);
    //   videoBackground.value.src = videoBlob;
    //   videoBackground.value.play();
    // });

    ////////////////////// Local Storage version ////////////////////////////
    // let videoBlob = null;
    // // check localStorage for video
    // const storedBlob = await $q.localStorage.getItem("videoBlobs");
    // if (storedBlob !== null) {
    //   console.log("pulling video src from storage", storedBlob);
    //   // videoBlob = storedBlob; // doesn't work
    //   videoBlob = createObjectURL(storedBlob);
    //   // const buf = await new Response(storedBlob).arrayBuffer();
    //   // videoBlob = URL.createObjectURL(new Blob([buf], { type: "video/mp4" })); // doesn't work.
    // } else {
    //   await fetch(videoSrcUrl)
    //     .then((response) => {
    //       return response.blob();
    //     })
    //     .then((blob) => {
    //       console.log("storing video");
    //       videoBlob = URL.createObjectURL(blob);
    //       // store blob in localStorage...
    //       $q.localStorage.set("videoBlobs", videoBlob);
    //     });
    // }

    // .then(response => {
    //   //make sure this file is cached ffs.

    // })
    // console.log(videoBlob);
    // videoBackground.value.src = videoBlob;
    // videoBackground.value.play();
    // return videoBlob;

    ////////////////////// IndexedDB version /////////////////////////////////
    // let videoBlob = null;
    // let db;
    // const dbVersion = 1;
    // const request = window.indexedDB.open("dbStorage", dbVersion);

    // request.onerror = function (e) {
    //   console.error("Unable to open database.");
    // };

    // request.onsuccess = function (e) {
    //   console.log("db has been found");
    //   db = e.target.result;
    //   console.log("db opened");
    //   const videoStore = db
    //     .transaction("videoBackground", "readwrite")
    //     .objectStore("videoBackground");
    //   const storeRequest = videoStore.get(videoSrcUrl);
    //   storeRequest.onerror = function (e) {
    //     console.log("error", e);
    //   };
    //   storeRequest.onsuccess = async function (e) {
    //     console.log("video store found");
    //     videoBlob = request.result.blob;

    //     console.log("video:", videoBlob);
    //     if (!videoBlob) {
    //       await fetch(videoSrcUrl)
    //         .then((response) => {
    //           console.log(response);
    //           return response.blob();
    //         })
    //         .then((blob) => {
    //           console.log("storing video");
    //           videoBlob = URL.createObjectURL(blob);
    //           console.log("new blob", videoBlob);
    //           // store blob in indexedDb...
    //           const videoStore = db
    //             .transaction("videoBackground", "readwrite")
    //             .objectStore("videoBackground");
    //           videoStore.add({ blob: videoBlob, id: videoSrcUrl });
    //         });
    //     }
    //   };
    // };

    // request.onupgradeneeded = async function (e) {
    //   console.log("creating db for first time");
    //   let db = e.target.result;
    //   db.createObjectStore("videoBackground", { keyPath: "id" });

    //   await fetch(videoSrcUrl)
    //     .then((response) => {
    //       return response.blob();
    //     })
    //     .then((blob) => {
    //       console.log("storing video");
    //       videoBlob = URL.createObjectURL(blob);
    //       // store blob in indexedDb...
    //       const videoStore = db
    //         .transaction("videoBackground", "readwrite")
    //         .objectStore("videoBackground");
    //       videoStore.add({ blob: videoBlob, id: videoSrcUrl });
    //     });
    // };
    // }

    const dialogDay = ref(false);
    const dialogTime = ref(false);
    const dialogInfo = ref(false);
    const dialogConfirm = ref(false);
    const dialogSuccess = ref(false);
    const today = date.formatDate(Date.now(), "YYYY/MM/DD");

    const formData = ref({
      name: "",
      business: "",
      email: "",
      phone: "",
      reminder: true,
      date: today,
      time: null,
    });
    function resetForm() {
      formData.value = {
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
      if (formData.value.date) {
        return date.formatDate(formData.value.date, "MMMM Do, YYYY");
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
        formData.value.date = value;
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
      formData.value.time = value;
      dialogTime.value = false;
      dialogInfo.value = true;
    }

    function updateInfo() {
      dialogInfo.value = false;
      dialogConfirm.value = true;
    }

    async function createAppointment() {
      db.collection("appointments")
        .doc()
        .set({
          ...formData.value,
          datetime: `${formData.value.date}/${formData.value.time}`,
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => {
          console.log(`appointment set... let's move on`);
        })
        .catch((error) => {
          console.log(`oops, there was an error...: ${error}`);
        });

      dialogConfirm.value = false;
      dialogSuccess.value = true;
      clearTimeout(clearForm);
      setTimeout(() => {
        resetForm();
      }, 3000);
    }

    let clearForm;
    watch(
      formData,
      () => {
        clearTimeout(clearForm);
        if (formData.value.time !== null) {
          clearForm = setTimeout(() => {
            console.log("Timeout Triggered");
            resetForm();
          }, 30000);
        }
      },
      { deep: true }
    );

    return {
      videoBackground,
      videoAsBlob,
      dialogDay,
      dialogTime,
      dialogInfo,
      dialogConfirm,
      dialogSuccess,
      minMonth,
      formData,
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
