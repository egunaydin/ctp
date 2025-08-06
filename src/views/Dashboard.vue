<template>
  <div class="container-fluid py-3">
    <!-- Header Cards -->
    <div class="row g-3 mb-3">
      <div
        class="col-12 col-sm-6 col-lg-3"
        v-for="(card, index) in statsCardsWithTotal"
        :key="index"
      >
        <div class="card p-3 shadow-sm h-100">
          <h6 class="text-muted">{{ card.title }}</h6>
          <h4>{{ card.value }}</h4>
          <small class="text-muted">{{ card.subtitle }}</small>

          <div v-if="card.title === 'Total Shipments'" class="mt-3">
            <div v-for="(label, key, idx) in badgeData" :key="idx" class="mb-2">
              <div class="d-flex justify-content-between align-items-center">
                <small :class="`text-${label.color}`">
                  <i :class="`bi ${label.icon}`"></i> {{ key }}
                </small>
                <small>{{ label.count }}</small>
              </div>
              <div class="progress mb-0" style="height: 4px">
                <div
                  class="progress-bar"
                  :class="`bg-${label.color}`"
                  role="progressbar"
                  :style="{
                    width: (label.count / shipments.length) * 100 + '%',
                  }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="card p-3 mb-3 shadow-sm">
      <div class="row g-2 align-items-center">
        <div class="col-12 col-lg">
          <input
            v-model="search"
            type="text"
            class="form-control"
            placeholder="Search shipments by Nº, tracking number, customer, or location..."
          />
        </div>

        <div class="col-12 col-lg-auto d-flex flex-wrap gap-2 mt-2 mt-lg-2">
          <button
            class="btn btn-outline-dark d-flex align-items-center"
            @click="filtersVisible = !filtersVisible"
          >
            <i class="bi bi-funnel-fill me-1"></i> Filters
          </button>
          <button class="btn btn-outline-dark d-flex align-items-center">
            <i class="bi bi-download me-1"></i> Export
          </button>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div class="row mt-3 g-2" v-if="filtersVisible">
        <div class="col-sm-6 col-md">
          <select v-model="filters.status" class="form-select">
            <option value="">All Statuses</option>
            <option>Shipping</option>
            <option>Shipped</option>
            <option>Planned</option>
            <option>Canceled</option>
            <option>Warning</option>
          </select>
        </div>
        <div class="col-sm-6 col-md">
          <select v-model="filters.type" class="form-select">
            <option value="">All Types</option>
            <option>DAP</option>
            <option>DAT</option>
            <option>CIP</option>
          </select>
        </div>
        <div class="col-sm-6 col-md">
          <select v-model="filters.priority" class="form-select">
            <option value="">All Priorities</option>
            <option>Standard</option>
            <option>Express</option>
            <option>Economy</option>
          </select>
        </div>
        <div class="col-sm-6 col-md">
          <select v-model="filters.carrier" class="form-select">
            <option value="">All Carriers</option>
            <option>Carrier X</option>
            <option>Carrier Y</option>
          </select>
        </div>
        <div class="col-sm-6 col-md">
          <input type="date" class="form-control" v-model="filters.date" />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="card shadow-sm">
      <div class="table-responsive-sm">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th><input type="checkbox" @change="toggleAll($event)" /></th>
              <th>Order Nº</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Departure</th>
              <th>ETA</th>
              <th>Status</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shipment in paginatedShipments" :key="shipment.id">
              <td>
                <input
                  type="checkbox"
                  :value="shipment.id"
                  v-model="selectedShipments"
                />
              </td>
              <td>{{ shipment.title }}</td>
              <td>{{ shipment.from }}</td>
              <td>{{ shipment.to }}</td>
              <td>{{ shipment.startDate }}</td>
              <td>{{ shipment.endDate }}</td>
              <td>
                <span
                  class="badge"
                  :class="statusBadgeClass(shipment.status)"
                  >{{ shipment.status }}</span
                >
              </td>
              <td>{{ shipment.transportType }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center p-3">
        <small
          >Showing {{ startIndex + 1 }} to {{ endIndex }} of
          {{ shipments.length }} shipments</small
        >
        <div>
          <button
            class="btn btn-outline-secondary btn-sm me-2"
            @click="previousPage"
            :disabled="currentPage === 1"
          >
            Previous
          </button>
          <span class="btn btn-dark btn-sm">{{ currentPage }}</span>
          <button
            class="btn btn-outline-secondary btn-sm ms-2"
            @click="nextPage"
            :disabled="endIndex >= shipments.length"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div
      v-if="selectedShipments.length > 0"
      class="position-fixed bottom-0 start-50 translate-middle-x bg-white rounded-top shadow-lg px-4 py-3 d-flex align-items-center gap-3"
      style="z-index: 1050; width: auto; max-width: 95%; bottom: 2vh"
    >
      <span>{{ selectedShipments.length }} shipments selected</span>
      <button class="btn btn-outline-secondary btn-sm">Clear</button>
      <button class="btn btn-outline-secondary btn-sm">Print</button>
      <button class="btn btn-outline-secondary btn-sm">Export</button>
      <button class="btn btn-outline-secondary btn-sm">Edit</button>
      <button class="btn btn-danger btn-sm">Delete</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const filtersVisible = ref(false);
const search = ref("");
const currentPage = ref(1);
const perPage = 5;

const selectedShipments = ref([]);

const filters = ref({
  status: "",
  type: "",
  priority: "",
  carrier: "",
  date: "",
});

const shipments = ref([
  {
    id: 1,
    title: "2098 1178 9110",
    status: "Shipping",
    progress: 67,
    from: "Florida",
    to: "Washington",
    startDate: "05.12.2020",
    endDate: "17.12.2020",
    prepaid: true,
    transportType: "DAP",
    daysUsed: 8,
    totalDays: 12,
  },
  {
    id: 2,
    title: "2341 2312 3143",
    status: "Planned",
    progress: 0,
    from: "Oregon",
    to: "Maine",
    startDate: "12.12.2020",
    endDate: "24.12.2020",
    prepaid: true,
    transportType: "DAT",
    daysUsed: 0,
    totalDays: 20,
  },
  {
    id: 3,
    title: "2190 7859 9111",
    status: "Canceled",
    progress: 25,
    from: "Florida",
    to: "Nevada",
    startDate: "10.12.2020",
    endDate: "30.12.2021",
    prepaid: true,
    transportType: "CIP",
    daysUsed: 5,
    totalDays: 20,
  },
  {
    id: 4,
    title: "2476 1812 8911",
    status: "Shipping",
    progress: 35,
    from: "Florida",
    to: "Texas",
    startDate: "20.12.2020",
    endDate: "10.01.2020",
    prepaid: true,
    transportType: "DAP",
    daysUsed: 8,
    totalDays: 12,
  },
  {
    id: 5,
    title: "2199 4671 1657",
    status: "Shipped",
    progress: 100,
    from: "Hawaii",
    to: "Florida",
    startDate: "11.12.2020",
    endDate: "29.12.2020",
    prepaid: true,
    transportType: "DAT",
    daysUsed: 12,
    totalDays: 12,
  },
  {
    id: 6,
    title: "2210 1675 1345",
    status: "Warning",
    progress: 25,
    from: "Florida",
    to: "Washington",
    startDate: "12.12.2020",
    endDate: "24.12.2020",
    prepaid: true,
    transportType: "CIP",
    daysUsed: 5,
    totalDays: 20,
  },
  {
    id: 7,
    title: "2490 1419 4109",
    status: "Warning",
    progress: 25,
    from: "Nevada",
    to: "Washington",
    startDate: "22.12.2020",
    endDate: "12.01.2020",
    prepaid: true,
    transportType: "CIP",
    daysUsed: 5,
    totalDays: 20,
  },
  {
    id: 8,
    title: "2578 9098 1215",
    status: "Canceled",
    progress: 25,
    from: "Florida",
    to: "Oregon",
    startDate: "12.12.2020",
    endDate: "28.12.2020",
    prepaid: true,
    transportType: "DAT",
    daysUsed: 5,
    totalDays: 20,
  },
  {
    id: 9,
    title: "3001 5689 9999",
    status: "Shipping",
    progress: 45,
    from: "Arizona",
    to: "New York",
    startDate: "05.01.2021",
    endDate: "15.01.2021",
    prepaid: false,
    transportType: "DAP",
    daysUsed: 6,
    totalDays: 14,
  },
  {
    id: 10,
    title: "3012 4590 8888",
    status: "Planned",
    progress: 0,
    from: "Texas",
    to: "Nevada",
    startDate: "02.01.2021",
    endDate: "12.01.2021",
    prepaid: true,
    transportType: "CIP",
    daysUsed: 0,
    totalDays: 10,
  },
  {
    id: 11,
    title: "3200 7788 2211",
    status: "Shipping",
    progress: 60,
    from: "Georgia",
    to: "Illinois",
    startDate: "08.01.2021",
    endDate: "18.01.2021",
    prepaid: true,
    transportType: "DAT",
    daysUsed: 6,
    totalDays: 10,
  },
  {
    id: 12,
    title: "3300 1111 2222",
    status: "Warning",
    progress: 40,
    from: "Utah",
    to: "Montana",
    startDate: "07.01.2021",
    endDate: "17.01.2021",
    prepaid: false,
    transportType: "CIP",
    daysUsed: 4,
    totalDays: 10,
  },
  {
    id: 13,
    title: "3400 5555 6666",
    status: "Shipping",
    progress: 80,
    from: "Nevada",
    to: "Texas",
    startDate: "04.01.2021",
    endDate: "14.01.2021",
    prepaid: true,
    transportType: "DAP",
    daysUsed: 9,
    totalDays: 10,
  },
  {
    id: 14,
    title: "3500 7777 8888",
    status: "Shipped",
    progress: 100,
    from: "Colorado",
    to: "Kansas",
    startDate: "01.01.2021",
    endDate: "05.01.2021",
    prepaid: true,
    transportType: "DAT",
    daysUsed: 5,
    totalDays: 5,
  },
  {
    id: 15,
    title: "3600 9999 0000",
    status: "Canceled",
    progress: 15,
    from: "Ohio",
    to: "Florida",
    startDate: "06.01.2021",
    endDate: "12.01.2021",
    prepaid: false,
    transportType: "CIP",
    daysUsed: 2,
    totalDays: 14,
  },
]);

function toggleAll(event) {
  if (event.target.checked) {
    selectedShipments.value = paginatedShipments.value.map((s) => s.id);
  } else {
    selectedShipments.value = [];
  }
}

function previousPage() {
  if (currentPage.value > 1) currentPage.value--;
}

function nextPage() {
  if (endIndex.value < filteredShipments.value.length) currentPage.value++;
}

const startIndex = computed(() => (currentPage.value - 1) * perPage);
const endIndex = computed(() =>
  Math.min(startIndex.value + perPage, filteredShipments.value.length)
);

const filteredShipments = computed(() => {
  return shipments.value.filter((s) => {
    const searchMatch =
      s.title.toLowerCase().includes(search.value.toLowerCase()) ||
      s.from.toLowerCase().includes(search.value.toLowerCase()) ||
      s.to.toLowerCase().includes(search.value.toLowerCase());

    const statusMatch =
      filters.value.status === "" || s.status === filters.value.status;
    const typeMatch =
      filters.value.type === "" || s.transportType === filters.value.type;
    const priorityMatch =
      filters.value.priority === "" || s.priority === filters.value.priority;
    const carrierMatch =
      filters.value.carrier === "" || s.carrier === filters.value.carrier;
    const dateMatch =
      filters.value.date === "" || s.startDate === filters.value.date;

    return (
      searchMatch &&
      statusMatch &&
      typeMatch &&
      priorityMatch &&
      carrierMatch &&
      dateMatch
    );
  });
});

const paginatedShipments = computed(() =>
  filteredShipments.value.slice(startIndex.value, endIndex.value)
);

function statusBadgeClass(status) {
  switch (status) {
    case "Shipping":
      return "bg-primary";
    case "Shipped":
      return "bg-success";
    case "Planned":
      return "bg-info";
    case "Canceled":
      return "bg-danger";
    case "Warning":
      return "bg-warning";
    default:
      return "bg-secondary";
  }
}

const statsCards = [
  { title: "Total Weight", value: "15.800 kg", subtitle: "Average: 3.160 kg" },
  { title: "Total Value", value: "$139.450", subtitle: "Avg: $27.890" },
  { title: "Total Items", value: "443", subtitle: "Avg: 89" },
];

const statsCardsWithTotal = computed(() => [
  {
    title: "Total Shipments",
    value: shipments.value.length.toString(),
    subtitle: "Summary by status:",
  },
  ...statsCards,
]);

const badgeData = computed(() => ({
  Shipping: {
    count: shipments.value.filter((s) => s.status === "Shipping").length,
    color: "primary",
    icon: "bi-truck",
  },
  Shipped: {
    count: shipments.value.filter((s) => s.status === "Shipped").length,
    color: "success",
    icon: "bi-check-circle",
  },
  Planned: {
    count: shipments.value.filter((s) => s.status === "Planned").length,
    color: "info",
    icon: "bi-calendar",
  },
  Warning: {
    count: shipments.value.filter((s) => s.status === "Warning").length,
    color: "warning",
    icon: "bi-exclamation-triangle",
  },
  Canceled: {
    count: shipments.value.filter((s) => s.status === "Canceled").length,
    color: "danger",
    icon: "bi-x-circle",
  },
}));
</script>

<style scoped>
.table-responsive-sm {
  width: 100%;
  overflow-x: auto;
}

.table {
  white-space: nowrap;
}

.table th,
.table td {
  vertical-align: middle;
}

.badge {
  font-size: 0.75rem;
  padding: 0.4em 0.6em;
  border-radius: 0.5rem;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}

.table tbody tr {
  transition: background-color 0.2s ease-in-out;
}

.table thead th {
  border-bottom: 2px solid #dee2e6;
}
</style>
