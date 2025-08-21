<template>
  <div class="container-fluid py-2">
    <!-- Filter Dropdown -->
    <div class="mb-2 text-start">
      <div class="dropdown d-inline-block">
        <button
          class="btn btn-outline-primary dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {{ filter || "All Statuses" }}
        </button>
        <ul class="dropdown-menu">
          <li>
            <a
              class="dropdown-item"
              :class="{ active: filter === '' }"
              @click.prevent="setFilter('')"
              >All</a
            >
          </li>
          <li v-for="status in availableStatuses" :key="status">
            <a
              class="dropdown-item"
              :class="{ active: filter === status }"
              @click.prevent="setFilter(status)"
            >
              {{ status }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Cards -->
    <div class="row gy-3">
      <div
        class="col-12 col-md-12 col-xl-4 tracking-col"
        v-for="shipment in visibleShipments"
        :key="shipment.id"
      >
        <div class="themed-card card shadow-sm border h-80">
          <TrackingCard
            :shipment="shipment"
            class="p-2 p-sm-4"
            @click="openDetail(shipment.id)"
          />
        </div>
      </div>
    </div>

    <!-- Load More -->
    <div
      class="text-center mt-4"
      v-if="visibleCount < filteredShipments.length"
    >
      <button class="btn btn-outline-secondary" @click="loadMore">
        Load More
      </button>
    </div>

    <!-- Overlay -->
    <div
      v-if="panelVisible"
      class="overlay-backdrop"
      @click="panelVisible = false"
    ></div>

    <!-- Slide panel -->
    <transition name="slide-panel">
      <OrderDetailPanel
        v-if="panelVisible"
        :orderId="selectedShipmentId"
        :shipment="selectedShipment"
        @close="panelVisible = false"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import TrackingCard from "@/components/TrackingCard.vue";
import OrderDetailPanel from "@/components/OrderDetailPanel.vue";

const panelVisible = ref(false);
const selectedShipmentId = ref<number | null>(null);

/* Desktop algısı (Bootstrap xl >= 1200px) */
const isDesktop = ref(false);
const updateDesktop = () => (isDesktop.value = window.innerWidth >= 1200);

/* Görünecek kart sayacı */
const visibleCount = ref(0);
const baseCount = () => (isDesktop.value ? 9 : 5);
const stepCount = () => (isDesktop.value ? 6 : 5);

/* Filtre */
const filter = ref("");

const setFilter = (status: string) => {
  filter.value = status;
  visibleCount.value = baseCount();
};

const loadMore = () => {
  visibleCount.value += stepCount();
};

const availableStatuses = [
  "Shipping",
  "Shipped",
  "Planned",
  "Canceled",
  "Warning",
];

const filteredShipments = computed(() => {
  return filter.value
    ? shipments.filter((s) => s.status === filter.value)
    : shipments;
});

const visibleShipments = computed(() => {
  return filteredShipments.value.slice(0, visibleCount.value);
});

const selectedShipment = computed(() => {
  return shipments.find((s) => s.id === selectedShipmentId.value) || null;
});

function openDetail(id: number) {
  selectedShipmentId.value = id;
  panelVisible.value = true;
}

/* Init / resize */
onMounted(() => {
  updateDesktop();
  visibleCount.value = baseCount(); // başlangıç: 9 (desktop) / 5 (mobil)
  window.addEventListener("resize", handleResize);
});
onBeforeUnmount(() => window.removeEventListener("resize", handleResize));

function handleResize() {
  const prevDesktop = isDesktop.value;
  updateDesktop();
  // breakpoint değiştiyse base'e resetle (UI tutarlı kalsın)
  if (prevDesktop !== isDesktop.value) {
    visibleCount.value = baseCount();
  }
}

/* Mock data */
const shipments = [
  {
    id: 1,
    title: "Order Nº 2098 1178 9110",
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
    title: "Order Nº 2341 2312 3143",
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
    title: "Order Nº 2190 7859 9111",
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
    title: "Order Nº 2476 1812 8911",
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
    title: "Order Nº 2199 4671 1657",
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
    title: "Order Nº 2210 1675 1345",
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
    title: "Order Nº 2490 1419 4109",
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
    title: "Order Nº 2578 9098 1215",
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
    title: "Order Nº 3001 5689 9999",
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
    title: "Order Nº 3012 4590 8888",
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
    title: "Order Nº 3200 7788 2211",
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
    title: "Order Nº 3300 1111 2222",
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
    title: "Order Nº 3400 5555 6666",
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
    title: "Order Nº 3500 7777 8888",
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
    title: "Order Nº 3600 9999 0000",
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
];
</script>

<style scoped>
/* Make cards pop in both themes */
.themed-card {
  background-color: var(--bs-body-bg) !important;
  border-color: var(--bs-border-color-translucent) !important;
  box-shadow: var(--bs-box-shadow-sm) !important;
  border-radius: 0.75rem;
}

/* Ensure EVERYTHING inside the TrackingCard is readable */
.tracking-col :deep(*) {
  color: var(--bs-body-color);
}

/* Force the title readable */
.tracking-col :deep(.order-title),
.tracking-col :deep(.card-title),
.tracking-col :deep(.fw-semibold),
.tracking-col :deep(h5),
.tracking-col :deep(h6),
.tracking-col :deep(a.order-link),
.tracking-col :deep(.order-number) {
  color: var(--bs-body-color) !important;
  opacity: 1 !important;
}

/* Links */
.tracking-col :deep(a),
.tracking-col :deep(a:hover),
.tracking-col :deep(a:focus) {
  color: var(--bs-link-color) !important;
  text-decoration: none;
}

/* Muted */
.tracking-col :deep(.text-muted),
.tracking-col :deep(.small.text-muted) {
  color: var(--bs-secondary-color) !important;
}

/* Inner cards */
.tracking-col :deep(.card) {
  background-color: var(--bs-body-bg) !important;
  border-color: var(--bs-border-color-translucent) !important;
  box-shadow: var(--bs-box-shadow-sm) !important;
}

/* Details */
.tracking-col :deep(hr) {
  border-color: var(--bs-border-color);
  opacity: 1;
}
.tracking-col :deep(.badge) {
  font-weight: 600;
}
</style>
