<template>
  <div
    class="tracking-card rounded-4 shadow-sm p-4 d-flex flex-column flex-md-row justify-content-between align-items-start"
    @click.stop="handleClick"
  >
    <!-- Left -->
    <div class="flex-grow-1 w-100">
      <!-- Title + Badge + % -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div class="fw-semibold fs-6 title">
          {{ shipment.title }}
        </div>

        <div class="d-flex align-items-center gap-3">
          <span
            class="badge px-3 py-1 rounded-pill fw-medium"
            :class="getBadgeClass(shipment.status)"
          >
            {{ shipment.status }}
          </span>
          <div class="fs-3 fw-bold percent">{{ shipment.progress }}%</div>
        </div>
      </div>

      <!-- Etiketler -->
      <div class="d-flex flex-wrap gap-3 small meta mb-3">
        <span>💳 Prepaid</span>
        <span>📦 LTL</span>
        <span>📦 PB</span>
        <span>🚚 {{ shipment.transportType }}</span>
      </div>

      <!-- Route Line -->
      <div class="d-flex align-items-center justify-content-between route mb-2">
        <span>🚚</span>
        <hr class="flex-grow-1 mx-1 route-hr" />
        <span>✈️</span>
        <hr class="flex-grow-1 mx-1 route-hr" />
        <span>🏠</span>
      </div>

      <!-- Days + Progress -->
      <div
        class="d-flex justify-content-between align-items-center mb-1 fw-semibold"
      >
        <div>
          {{ shipment.from }}<br />
          <small class="muted">{{ shipment.startDate }}</small>
        </div>

        <div>{{ shipment.daysUsed }}/{{ shipment.totalDays }} Days</div>

        <div class="text-end">
          {{ shipment.to }}<br />
          <small class="muted">{{ shipment.endDate }}</small>
        </div>
      </div>

      <div class="progress mt-1" style="height: 4px">
        <div
          class="progress-bar"
          role="progressbar"
          :style="{
            width: shipment.progress + '%',
            backgroundColor: getBarColor(shipment.status),
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(["click"]);
function handleClick() {
  emit("click");
}

defineProps<{
  shipment: {
    id: number;
    title: string;
    status: string;
    progress: number;
    from: string;
    to: string;
    startDate: string;
    endDate: string;
    prepaid: boolean;
    transportType: string;
    daysUsed: number;
    totalDays: number;
  };
}>();

function getBadgeClass(status: string) {
  switch (status.toLowerCase()) {
    case "shipping":
    case "shipped":
      return "bg-primary text-white";
    case "planned":
      return "bg-secondary text-white";
    case "warning":
      return "bg-warning text-dark";
    case "canceled":
      return "bg-danger text-white";
    default:
      return "bg-light text-dark";
  }
}
function getBarColor(status: string) {
  switch (status.toLowerCase()) {
    case "shipping":
    case "shipped":
      return "#00C49F";
    case "warning":
      return "#FFA726";
    case "canceled":
      return "#F06292";
    default:
      return "#8884d8";
  }
}
</script>

<style scoped>
.tracking-card {
  background: var(--card-bg);
  color: var(--text);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
}
.tracking-card:hover {
  box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.08);
  cursor: pointer;
}

.title {
  color: var(--text);
}
.percent {
  color: var(--text);
}

/* etiket/metinler */
.meta {
  color: var(--muted);
}
.muted {
  color: var(--muted);
}

/* rota çizgisi */
.route {
  font-size: 1.1rem;
  color: var(--muted);
}
.route-hr {
  opacity: 1;
  border: none;
  border-top: 1px solid var(--border);
}
</style>
