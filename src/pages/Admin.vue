<template>
  <q-page padding>
    <div v-if="appointments">
      <q-table
        title="Booked Appointments"
        :rows="appointments"
        :columns="columns"
        row-key="name + time"
        :pagination="initialPagination"
      >
        <template v-slot:top>
          <div class="col-2 q-table__title">Booked Appointments</div>

          <q-space />

          <q-toggle
            v-model="pastAppointments"
            checked-icon="check"
            unchecked-icon="clear"
            color="green"
            label="show past appointments?"
          />
        </template>
        <template v-slot:body-cell-delete="props">
          <q-td :props="props">
            <q-btn flat icon="delete" @click="deleteAppointment(props.row)" />
          </q-td>
        </template>
      </q-table>
    </div>
    <div class="row" v-else>
      <h6 class="text-center">No appointments in data</h6>
    </div>
    <q-card>
      <h5 class="text-left q-pa-md">Users:</h5>
      <q-list>
        <q-item
          v-for="user in users"
          :key="user.uid"
          class="q-my-sm"
          clickable
          v-ripple
        >
          <q-item-section>
            <q-item-label>{{ user.email }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              icon="autorenew"
              label="reset password"
              @click="resetPassword(user.email)"
            />
          </q-item-section>
          <q-item-section side>
            <q-btn flat icon="delete" @click="deleteUser(user.uid)" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-input filled label="Email" v-model="newUserEmail">
              <template v-slot:prepend>
                <q-icon name="face" />
              </template>
            </q-input>
          </q-item-section>

          <q-item-section side>
            <q-btn flat icon="add" @click="addUser(newUserEmail)" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script>
// TODO: add forgot password and/or send password reset button
import { date, useQuasar } from "quasar";
import { defineComponent, ref, computed, onBeforeMount } from "vue";
import { auth, db } from "src/boot/firebase";

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

async function getUsers() {
  console.log("fetching users");
  const allUsers = [];
  await db
    .collection("users")
    .get()
    .then((querySnapshot) => {
      console.log("got users", querySnapshot);
      querySnapshot.docs.forEach((doc) => {
        allUsers.push({ ...doc.data(), id: doc.id });
      });
    });
  return allUsers;
}

export default defineComponent({
  // TODO: pull data from localStore too?
  name: "Admin",
  setup() {
    const $q = useQuasar();
    let data = ref([]);
    let users = ref([]);
    onBeforeMount(async () => {
      data.value = await getAppointments();
      users.value = await getUsers();
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
    const newUserEmail = ref(null);

    function addUser(email) {
      auth
        .createUserWithEmailAndPassword(
          email,
          Math.random().toString(36).substr(2, 8)
        )
        .then((userCredential) => {
          console.log("user created", userCredential.user);
          resetPassword(email);
          users.value.push(userCredential.user);
          newUserEmail.value = null;
          // show notification
          $q.notify({
            message: "New user created",
            caption: "The will receive an email to set their password.",
            icon: "account_circle",
          });
        })
        .catch((error) => {
          console.log("error with adding new user", error);
        });
    }
    function resetPassword(email) {
      const actionCodeSettings = {
        url: `${location.origin}/register/?email=${email}`,
        handleCodeInApp: true,
      };
      auth
        .sendPasswordResetEmail(email, actionCodeSettings)
        .then(() => {
          console.log("sending email link now...");
        })
        .catch((error) => {
          console.log("error sending email", error);
        });
    }

    function deleteUser(uid) {
      db.collection("users").doc(uid).delete();
    }

    return {
      pastAppointments,
      initialPagination,
      columns,
      appointments,
      deleteAppointment,
      users,
      newUserEmail,
      addUser,
      resetPassword,
      deleteUser,
    };
  },
});
</script>
