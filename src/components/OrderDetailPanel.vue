<template>
  <aside class="order-panel" role="dialog" aria-modal="true">
    <!-- Header -->
    <header
      class="p-4 border-bottom d-flex justify-content-between align-items-center"
    >
      <h5 class="m-0">{{ shipment.title }}</h5>
      <button class="btn btn-sm btn-outline-dark" @click="$emit('close')">
        Close
      </button>
    </header>

    <!-- Map placeholder -->
    <div class="map-ph bg-secondary bg-opacity-25">
      <div
        class="d-flex align-items-center justify-content-center h-100 text-muted"
      >
        Map Placeholder
      </div>
    </div>

    <!-- Body -->
    <section class="p-4">
      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item" role="presentation">
          <a
            href="#"
            class="nav-link"
            :class="{ active: activeTab === 'general' }"
            @click.prevent="activeTab = 'general'"
            role="tab"
            aria-selected="activeTab === 'general'"
          >
            General
          </a>
        </li>
        <li class="nav-item" role="presentation">
          <a
            href="#"
            class="nav-link"
            :class="{ active: activeTab === 'tracking' }"
            @click.prevent="activeTab = 'tracking'"
            role="tab"
            aria-selected="activeTab === 'tracking'"
          >
            Tracking
          </a>
        </li>
      </ul>

      <!-- General Tab -->
      <div v-if="activeTab === 'general'" role="tabpanel">
        <div class="row g-3">
          <div class="col-6">
            <label class="text-muted small">From</label>
            <div class="fw-semibold">
              {{ shipment.from }}
              <br />
              <small class="text-muted">{{ shipment.startDate }}</small>
            </div>
          </div>
          <div class="col-6 text-end">
            <label class="text-muted small">To</label>
            <div class="fw-semibold">
              {{ shipment.to }}
              <br />
              <small class="text-muted">{{ shipment.endDate }}</small>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="mt-4">
          <div class="d-flex justify-content-between fw-medium mb-1">
            <span>{{ shipment.daysUsed }}/{{ shipment.totalDays }} Days</span>
            <span>{{ shipment.progress }}%</span>
          </div>
          <div class="progress" style="height: 6px">
            <div
              class="progress-bar"
              role="progressbar"
              :style="{
                width: shipment.progress + '%',
                backgroundColor: barColor,
              }"
            />
          </div>
        </div>
      </div>

      <!-- Tracking Tab -->
      <div v-else role="tabpanel">
        <div class="border rounded p-3">
          <div class="d-flex flex-wrap gap-3 text-muted small">
            <span>💳 Prepaid</span>
            <span>📦 LTL</span>
            <span>📦 PB</span>
            <span>🚚 {{ shipment.transportType }}</span>
            <span class="ms-auto">
              <span class="badge bg-secondary-subtle text-secondary border">
                {{ shipment.status }}
              </span>
            </span>
          </div>

          <hr class="my-3" />

          <div class="timeline">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span>🚚</span>
              <hr class="flex-grow-1 mx-2 opacity-25" />
              <span>✈️</span>
              <hr class="flex-grow-1 mx-2 opacity-25" />
              <span>🏠</span>
            </div>

            <div class="progress" style="height: 6px">
              <div
                class="progress-bar"
                role="progressbar"
                :style="{
                  width: shipment.progress + '%',
                  backgroundColor: barColor,
                }"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{
  shipment: {
    id: number;
    title: string;
    from: string;
    to: string;
    startDate: string;
    endDate: string;
    progress: number;
    status: string;
    prepaid: boolean;
    transportType: string;
    daysUsed: number;
    totalDays: number;
  };
}>();

defineEmits(["close"]);

const activeTab = ref<"general" | "tracking">("general");

const barColor = computed(() => {
  const s = props.shipment.status.toLowerCase();
  if (s === "shipping" || s === "shipped") return "#00C49F";
  if (s === "warning") return "#FFA726";
  if (s === "canceled") return "#F06292";
  return "#8884d8";
});
</script>

<style scoped>
/* Panel */
.order-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: min(720px, 100%);
  max-width: 50vw;
  height: 100dvh;
  background-color: var(--card-bg, #fff);
  color: var(--text, #212529);
  z-index: 1050;
  box-shadow: -8px 0 24px rgba(0, 0, 0, 0.25);
  border-left: 1px solid var(--border, #dee2e6);
  overflow-y: auto;
}

@media (max-width: 992px) {
  .order-panel {
    max-width: 100vw;
    width: 100%;
  }
}

.map-ph {
  height: 200px;
}

/* Tabs – daha belirgin aktif durum */
.nav-tabs {
  border-bottom: 1px solid var(--border, #dee2e6);
}

.nav-tabs .nav-link {
  color: var(--text, #212529);
  border: 1px solid transparent;
  border-radius: 0.5rem 0.5rem 0 0;
  padding: 0.5rem 1rem;
  background: transparent;
  opacity: 0.75;
  transition: all 0.15s ease-in-out;
}

.nav-tabs .nav-link:hover {
  opacity: 1;
  background: color-mix(in srgb, var(--text, #000) 6%, transparent);
}

.nav-tabs .nav-link.active {
  opacity: 1;
  font-weight: 700;
  background: color-mix(in srgb, var(--text, #000) 12%, transparent);
  border-color: var(--border, #dee2e6) var(--border, #dee2e6) transparent;
  border-bottom: 3px solid var(--accent, #4dabf7);
  color: var(--text, #212529);
}

/* Tema değişkenleri */
:global([data-bs-theme="dark"]) {
  --accent: #4dabf7;
  --border: #3a3f44;
  --card-bg: #212529;
  --text: #f1f3f5;
}

:global([data-bs-theme="light"]) {
  --accent: #1971c2;
  --border: #dee2e6;
  --card-bg: #ffffff;
  --text: #212529;
}
</style>
