<template>
  <q-page padding>
    <div v-if="appointments">
      <q-toggle
        v-model="pastAppointments"
        checked-icon="check"
        unchecked-icon="clear"
        color="green"
        label="show past appointments?"
      />
      <q-table
        title="Booked Appointments"
        :rows="appointments"
        :columns="columns"
        row-key="name + time"
        :pagination="initialPagination"
      >
        <template v-slot:body-cell-delete="props">
          <q-td :props="props">
            <q-btn flat icon="delete" @click="deleteAppointment(props.row)" />
          </q-td>
        </template>
      </q-table>
    </div>
    <div class="row" v-else>
      <h4 class="text-center">No appointments in data</h4>
    </div>
  </q-page>
</template>

<script>
// TODO: pull data from firestore instead of local...

import { date } from "quasar";
import { defineComponent, ref, computed, onBeforeMount } from "vue";
import { db } from "boot/firestore";

async function getAppointments() {
  const appts = [];
  await db
    .collection("appointments")
    .get()
    .then((querySnapshot) => {
      querySnapshot.docs.forEach((doc) => {
        appts.push({ ...doc.data(), id: doc.id });
      });
    });
  return appts;
}

export default defineComponent({
  name: "Admin",
  setup() {
    let data = ref([]);
    onBeforeMount(async () => {
      data.value = await getAppointments();
      console.log(data);
    });
    const pastAppointments = ref(false);
    const initialPagination = {
      sortBy: "date",
      descending: false,
      page: 1,
      rowsPerPage: 20,
    };
    const columns = [
      {
        name: "name",
        required: true,
        label: "Name",
        align: "left",
        field: (row) => row.name,
        format: (val) => `${val}`,
        sortable: true,
      },
      {
        name: "business",
        align: "center",
        label: "Business",
        field: "business",
        sortable: true,
      },
      {
        name: "email",
        align: "center",
        label: "Email",
        field: "email",
        sortable: true,
      },
      {
        name: "phone",
        align: "center",
        label: "Phone",
        field: "phone",
        sortable: true,
      },
      {
        name: "date",
        label: "Date",
        field: "date",
        sortable: true,
        sort: (a, b, rowA, rowB) => (rowA.datetime > rowB.datetime ? 1 : -1),
      },
      {
        name: "time",
        label: "Time",
        field: "time",
        sortable: true,
        sort: (a, b, rowA, rowB) => (rowA.datetime > rowB.datetime ? 1 : -1),
      },
      {
        name: "confirmation",
        label: "Email Reminder?",
        field: (row) => (row.reminder ? "yes" : "no"),
        sortable: false,
      },
      { name: "delete", label: "", field: "", sortable: false },
      // {
      //   name: "time",
      //   label: "Date & Time",
      //   field: "datetime",
      //   sortable: true,
      // },
    ];

    const today = date.formatDate(Date.now(), "YYYY/MM/DD");

    const appointments = computed(() => {
      if (data.value.length > 0) {
        let tmp = [...data.value];
        if (pastAppointments.value === false) {
          tmp = tmp.filter((appt) => {
            if (appt.datetime >= today) {
              return appt;
            }
          });
        }

        return tmp.sort((a, b) => {
          if (a.time < b.time) return -1;
          else return 1;
        });
      } else return null;
    });

    // const appointments = computed(() => {
    //   if ($q.localStorage.getItem("offlineAppointments")) {
    //     let tmp = [...$q.localStorage.getItem("offlineAppointments")];
    //     if (pastAppointments.value === false) {
    //       tmp = tmp.filter((appt) => {
    //         if (appt.datetime >= today) {
    //           return appt;
    //         }
    //       });
    //     }

    //     return tmp.sort((a, b) => {
    //       if (a.time < b.time) return -1;
    //       else return 1;
    //     });
    //   } else return null;
    // });

    // function clearData() {
    //   $q.localStorage.remove("offlineAppointments");
    // }
    const deleteAppointment = (appointment) => {
      db.collection("appointments")
        .doc(appointment.id)
        .delete()
        .then(() => {
          // also remove from data.value
          data.value = data.value.filter((obj) => {
            return obj.id !== appointment.id;
          });
        })
        .catch((error) => {
          console.error("Error removing document: ", error);
        });
    };

    return {
      pastAppointments,
      initialPagination,
      columns,
      appointments,
      deleteAppointment,
    };
  },
});
</script>
