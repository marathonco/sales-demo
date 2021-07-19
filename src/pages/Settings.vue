<template>
  <q-page padding>
    <q-form>
      <p>Allowed Days of the Week:</p>
      <q-option-group
        :options="weekdays"
        type="toggle"
        v-model="allowedWeekdays"
        color="green"
      />
    </q-form>
    <q-separator />
    <p>Work Hours</p>
    <div class="q-col-gutter-md row">
      <div class="column col-6 text-center items-center">
        <p>Start Time</p>
        <q-time v-model="startTime" />
      </div>
      <div class="column col-6 text-center items-center">
        <p>End Time</p>
        <q-time v-model="endTime" />
      </div>
    </div>
    <q-separator />
    <p>Max days out allowed:</p>
    <input type="number" v-model="dayRange" label="days" /> <q-separator />
    <p>Holidays:</p>
    <q-list bordered dense>
      <q-item v-for="date in badDates" :key="date.name">
        {{ date.date }} - {{ date.name }}
      </q-item>
      <q-input type="date" /> - <q-input type="text" placeholder="name" />
    </q-list>
    <p>List of current holidays in time frame</p>
    <p>Ability to add other holidays:</p>
    <q-separator />
    <p>
      Send a reminder before appointment:
      <q-select :options="reminderTimes" v-model="reminderTime" />
    </p>
  </q-page>
</template>

<script>
// TODO: vuex problem with v-model
// TODO: implement vuex and store options long-term.
// TODO: should time picker just be start & end or whole table of allowed hours?
// TODO: remap holiday data
// TODO: style new holiday
// TODO: make holidays editable or deletable
// TODO: make new holiday form recursive

import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex";
const Holidays = require("date-holidays");
const hd = new Holidays("US");
const disabledHolidaays = hd.getHolidays(2021); // TODO: how to get next year too in case it's close to december...
// console.log(disabledHolidaays);

export default defineComponent({
  name: "Settings",

  setup() {
    const store = useStore();
    const options = store.state.settings.options;
    // TODO: is there an easier way to invert the arrays?
    const allowedWeekdays = computed({
      get() {
        const days = [0, 1, 2, 3, 4, 5, 6];
        return days.filter((day) => {
          if (!options.disabledWeekdays.includes(day)) {
            return day;
          }
        });
      },
      set(newValue) {
        const days = [0, 1, 2, 3, 4, 5, 6];
        const disabledWeekdays = days.filter((day) => {
          if (!newValue.includes(day)) {
            return day;
          }
        });
        store.dispatch("settings/updateOptions", {
          disabledWeekdays: disabledWeekdays,
        });
      },
    });
    const weekdays = ref([
      { label: "Sunday", value: 0 },
      { label: "Monday", value: 1 },
      { label: "Tuesday", value: 2 },
      { label: "Wednesday", value: 3 },
      { label: "Thursday", value: 4 },
      { label: "Friday", value: 5 },
      { label: "Saturday", value: 6 },
    ]);
    const startTime = computed({
      get() {
        return options.startTime;
      },
      set(newValue) {
        store.dispatch("settings/updateOptions", { startTime: newValue });
      },
    });
    const endTime = computed({
      get() {
        return options.endTime;
      },
      set(newValue) {
        store.dispatch("settings/updateOptions", { endTime: newValue });
      },
    });
    const dayRange = computed({
      get() {
        return options.dayRange;
      },
      set(newValue) {
        store.dispatch("settings/updateOptions", { dayRange: newValue });
      },
    });
    const reminderTimes = ref([
      "30 minutes before",
      "1 hour before",
      "2 hours before",
      "that morning",
      "1 day before",
      "2 days before",
      "1 week before",
    ]);
    const reminderTime = computed({
      get() {
        return options.reminderTime;
      },
      set(newValue) {
        store.dispatch("settings/updateOptions", { reminderTime: newValue });
      },
    });
    const badDates = [...disabledHolidaays];
    return {
      allowedWeekdays,
      weekdays,
      startTime,
      endTime,
      dayRange,
      badDates,
      reminderTimes,
      reminderTime,
    };
  },
});
</script>
