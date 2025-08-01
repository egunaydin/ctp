<template>
  <div class="order-panel">
    <!-- Header -->
    <div class="p-4 border-bottom d-flex justify-content-between align-items-center">
      <h5 style="color: black;" class="m-0">{{ shipment.title }}</h5>
      <button class="btn btn-sm btn-outline-dark" @click="$emit('close')">
        Close
      </button>
    </div>

    <!-- Map placeholder -->
    <div class="bg-secondary bg-opacity-25" style="height: 200px;">
      <div class="d-flex align-items-center justify-content-center h-100 text-muted">
        Map Placeholder
      </div>
    </div>

    <!-- Tabs -->
    <div class="p-4">
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <a class="nav-link active" href="#">General</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Tracking</a>
        </li>
      </ul>

      <!-- Shipment Info -->
      <div class="row">
        <div class="col-6">
          <label class="text-muted small">From</label>
          <div style="color: black;">{{ shipment.from }}<br /><small>{{ shipment.startDate }}</small></div>
        </div>
        <div class="col-6 text-end">
          <label class="text-muted small">To</label>
          <div style="color: black;">{{ shipment.to }}<br /><small>{{ shipment.endDate }}</small></div>
        </div>
      </div>

      <!-- Progress -->
      <div style="color: black;" class="mt-4">
        <div class="d-flex justify-content-between fw-medium mb-1">
          <span>{{ shipment.daysUsed }}/{{ shipment.totalDays }} Days</span>
          <span>{{ shipment.progress }}%</span>
        </div>
        <div class="progress" style="height: 6px;">
          <div class="progress-bar" role="progressbar"
            :style="{ width: shipment.progress + '%', backgroundColor: getBarColor(shipment.status) }"></div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
defineProps<{
  shipment: {
    id: number
    title: string
    from: string
    to: string
    startDate: string
    endDate: string
    progress: number
    status: string
    prepaid: boolean
    transportType: string
    daysUsed: number
    totalDays: number
  }
}>()

defineEmits(['close'])
function getBarColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'shipping':
    case 'shipped':
      return '#00C49F'
    case 'warning':
      return '#FFA726'
    case 'canceled':
      return '#F06292'
    default:
      return '#8884d8'
  }
}

</script>

<style scoped>
.order-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  background-color: #fff;
  z-index: 999;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}
</style>
