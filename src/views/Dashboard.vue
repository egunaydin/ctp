<template>
  <div class="container-fluid py-3">
    <!-- Section: Header Cards -->
    <div class="row g-3 mb-3">
      <div class="col-md-3 d-flex" v-for="(card, index) in statsCardsWithTotal" :key="index">
        <div class="card p-3 shadow-sm h-100 w-100">
          <h6 class="text-muted">{{ card.title }}</h6>
          <h4>{{ card.value }}</h4>
          <small class="text-muted">{{ card.subtitle }}</small>

          <div v-if="card.title === 'Total Shipments'" class="mt-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-primary">
                <i class="bi bi-truck"></i> Shipping
              </small>
              <small>{{ shippingCount }}</small>
            </div>
            <div class="progress mb-0" style="height: 4px;">
              <div class="progress-bar bg-primary" role="progressbar"
                :style="{ width: (shippingCount / shipments.length * 150) + '%' }"></div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-success">
                <i class="bi bi-check-circle"></i> Shipped
              </small>
              <small>{{ shippedCount }}</small>
            </div>
            <div class="progress mb-0" style="height: 4px;">
              <div class="progress-bar bg-success" role="progressbar"
                :style="{ width: (shippedCount / shipments.length * 150) + '%' }"></div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-info">
                <i class="bi bi-calendar-check"></i> Planned
              </small>
              <small>{{ plannedCount }}</small>
            </div>
            <div class="progress mb-0" style="height: 4px;">
              <div class="progress-bar bg-info" role="progressbar"
                :style="{ width: (plannedCount / shipments.length * 150) + '%' }"></div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-danger">
                <i class="bi bi-x-circle"></i> Canceled
              </small>
              <small>{{ canceledCount }}</small>
            </div>
            <div class="progress mb-0" style="height: 4px;">
              <div class="progress-bar bg-danger" role="progressbar"
                :style="{ width: (canceledCount / shipments.length * 150) + '%' }"></div>
            </div>

            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-warning">
                <i class="bi bi-exclamation-triangle"></i> Warning
              </small>
              <small>{{ warningCount }}</small>
            </div>
            <div class="progress" style="height: 4px;">
              <div class="progress-bar bg-warning" role="progressbar"
                :style="{ width: (warningCount / shipments.length * 150) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Section: Filter Controls -->
    <div class="card p-3 mb-3 shadow-sm">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <input v-model="search" type="text" class="form-control flex-grow-1"
          placeholder="Search shipments by ID, tracking number, customer, or location..." />

        <div class="d-flex gap-2">
          <button class="btn btn-outline-dark d-flex align-items-center">
            <i class="bi bi-funnel-fill me-1"></i> Filters
          </button>
          <button class="btn btn-outline-dark d-flex align-items-center">
            <i class="bi bi-download me-1"></i> Export
          </button>
          <button class="btn btn-outline-dark">
            <i class="bi bi-grid"></i>
          </button>
          <button class="btn btn-outline-dark">
            <i class="bi bi-geo-alt"></i>
          </button>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div class="row mt-3 g-2">
        <div class="col-md">
          <select v-model="filters.status" class="form-select">
            <option value="">All Statuses</option>
            <option value="In-transit">In-transit</option>
            <option value="Shipped">Shipped</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div class="col-md">
          <select v-model="filters.type" class="form-select">
            <option value="">All Types</option>
            <option>Road</option>
            <option>Air</option>
            <option>Sea</option>
          </select>
        </div>
        <div class="col-md">
          <select v-model="filters.priority" class="form-select">
            <option value="">All Priorities</option>
            <option>Standard</option>
            <option>Express</option>
            <option>Economy</option>
          </select>
        </div>
        <div class="col-md">
          <select v-model="filters.carrier" class="form-select">
            <option value="">All Carriers</option>
            <option>Carrier X</option>
            <option>Carrier Y</option>
          </select>
        </div>
        <div class="col-md">
          <input type="date" class="form-control" v-model="filters.date" />
        </div>
      </div>
    </div>

    <!-- Section: Shipment List -->
    <div class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th><input type="checkbox" /></th>
              <th>ID</th>
              <th>Customer</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Departure</th>
              <th>ETA</th>
              <th>Status</th>
              <th>Type</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shipment in shipments" :key="shipment.id">
              <td><input type="checkbox" /></td>
              <td>{{ shipment.title }}</td>
              <td>{{ shipment.customer || '—' }}</td>
              <td>{{ shipment.from }}</td>
              <td>{{ shipment.to }}</td>
              <td>{{ shipment.startDate }}</td>
              <td>{{ shipment.endDate }}</td>
              <td>
                <span :class="['badge', statusBadgeClass(shipment.status)]">
                  {{ shipment.status }}
                </span>
              </td>

              <td>{{ shipment.transportType }}</td>
              <td><span class="badge bg-primary">{{ shipment.priority || 'Standard' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')
const filters = ref({ status: '', type: '', priority: '', carrier: '', date: '' })

const statsCards = [
  { title: 'Total Weight', value: '15.800 kg', subtitle: 'Average weight per shipment: 3.160 kg' },
  { title: 'Total Value', value: '$139.450', subtitle: 'Average value per shipment: $27.890' },
  { title: 'Total Items', value: '443', subtitle: 'Average items per shipment: 89' },
]


const shipments = ref([
  {
    id: 1,
    title: 'Order Nº 2098 1178 9110',
    status: 'Shipping',
    progress: 67,
    from: 'Florida',
    to: 'Washington',
    startDate: '05.12.2020',
    endDate: '17.12.2020',
    prepaid: true,
    transportType: 'DAP',
    daysUsed: 8,
    totalDays: 12
  },
  {
    id: 2,
    title: 'Order Nº 2341 2312 3143',
    status: 'Planned',
    progress: 0,
    from: 'Oregon',
    to: 'Maine',
    startDate: '12.12.2020',
    endDate: '24.12.2020',
    prepaid: true,
    transportType: 'DAT',
    daysUsed: 0,
    totalDays: 20
  },
  {
    id: 3,
    title: 'Order Nº 2190 7859 9111',
    status: 'Canceled',
    progress: 25,
    from: 'Florida',
    to: 'Nevada',
    startDate: '10.12.2020',
    endDate: '30.12.2021',
    prepaid: true,
    transportType: 'CIP',
    daysUsed: 5,
    totalDays: 20
  },
  {
    id: 4,
    title: 'Order Nº 2476 1812 8911',
    status: 'Shipping',
    progress: 35,
    from: 'Florida',
    to: 'Texas',
    startDate: '20.12.2020',
    endDate: '10.01.2020',
    prepaid: true,
    transportType: 'DAP',
    daysUsed: 8,
    totalDays: 12
  },
  {
    id: 5,
    title: 'Order Nº 2199 4671 1657',
    status: 'Shipped',
    progress: 100,
    from: 'Hawaii',
    to: 'Florida',
    startDate: '11.12.2020',
    endDate: '29.12.2020',
    prepaid: true,
    transportType: 'DAT',
    daysUsed: 12,
    totalDays: 12
  },
  {
    id: 6,
    title: 'Order Nº 2210 1675 1345',
    status: 'Warning',
    progress: 25,
    from: 'Florida',
    to: 'Washington',
    startDate: '12.12.2020',
    endDate: '24.12.2020',
    prepaid: true,
    transportType: 'CIP',
    daysUsed: 5,
    totalDays: 20
  },
  {
    id: 7,
    title: 'Order Nº 2490 1419 4109',
    status: 'Warning',
    progress: 25,
    from: 'Nevada',
    to: 'Washington',
    startDate: '22.12.2020',
    endDate: '12.01.2020',
    prepaid: true,
    transportType: 'CIP',
    daysUsed: 5,
    totalDays: 20
  },
  {
    id: 8,
    title: 'Order Nº 2578 9098 1215',
    status: 'Canceled',
    progress: 25,
    from: 'Florida',
    to: 'Oregon',
    startDate: '12.12.2020',
    endDate: '28.12.2020',
    prepaid: true,
    transportType: 'DAT',
    daysUsed: 5,
    totalDays: 20
  },
  {
    id: 9,
    title: 'Order Nº 3001 5689 9999',
    status: 'Shipping',
    progress: 45,
    from: 'Arizona',
    to: 'New York',
    startDate: '05.01.2021',
    endDate: '15.01.2021',
    prepaid: false,
    transportType: 'DAP',
    daysUsed: 6,
    totalDays: 14
  },
  {
    id: 10,
    title: 'Order Nº 3012 4590 8888',
    status: 'Planned',
    progress: 0,
    from: 'Texas',
    to: 'Nevada',
    startDate: '02.01.2021',
    endDate: '12.01.2021',
    prepaid: true,
    transportType: 'CIP',
    daysUsed: 0,
    totalDays: 10
  },
  {
    id: 11,
    title: 'Order Nº 3200 7788 2211',
    status: 'Shipping',
    progress: 60,
    from: 'Georgia',
    to: 'Illinois',
    startDate: '08.01.2021',
    endDate: '18.01.2021',
    prepaid: true,
    transportType: 'DAT',
    daysUsed: 6,
    totalDays: 10
  },
  {
    id: 12,
    title: 'Order Nº 3300 1111 2222',
    status: 'Warning',
    progress: 40,
    from: 'Utah',
    to: 'Montana',
    startDate: '07.01.2021',
    endDate: '17.01.2021',
    prepaid: false,
    transportType: 'CIP',
    daysUsed: 4,
    totalDays: 10
  },
  {
    id: 13,
    title: 'Order Nº 3400 5555 6666',
    status: 'Shipping',
    progress: 80,
    from: 'Nevada',
    to: 'Texas',
    startDate: '04.01.2021',
    endDate: '14.01.2021',
    prepaid: true,
    transportType: 'DAP',
    daysUsed: 9,
    totalDays: 10
  },
  {
    id: 14,
    title: 'Order Nº 3500 7777 8888',
    status: 'Shipped',
    progress: 100,
    from: 'Colorado',
    to: 'Kansas',
    startDate: '01.01.2021',
    endDate: '05.01.2021',
    prepaid: true,
    transportType: 'DAT',
    daysUsed: 5,
    totalDays: 5
  },
  {
    id: 15,
    title: 'Order Nº 3600 9999 0000',
    status: 'Canceled',
    progress: 15,
    from: 'Ohio',
    to: 'Florida',
    startDate: '06.01.2021',
    endDate: '12.01.2021',
    prepaid: false,
    transportType: 'CIP',
    daysUsed: 2,
    totalDays: 14
  }
])

const shippingCount = computed(() =>
  shipments.value.filter(s => s.status === 'Shipping').length
)
const shippedCount = computed(() =>
  shipments.value.filter(s => s.status === 'Shipped').length
)
const plannedCount = computed(() =>
  shipments.value.filter(s => s.status === 'Planned').length
)
const warningCount = computed(() =>
  shipments.value.filter(s => s.status === 'Warning').length
)
const canceledCount = computed(() =>
  shipments.value.filter(s => s.status === 'Canceled').length
)

const statsCardsWithTotal = computed(() => [
  {
    title: 'Total Shipments',
    value: shipments.value.length.toString(),
    subtitle: 'Summary by status:'
  },
  ...statsCards
])

function statusBadgeClass(status) {
  switch (status) {
    case 'Shipping':
      return 'bg-primary'
    case 'Shipped':
      return 'bg-success'
    case 'Planned':
      return 'bg-info'
    case 'Canceled':
      return 'bg-danger'
    case 'Warning':
      return 'bg-warning'
    default:
      return 'bg-secondary'
  }
}


</script>

<style scoped>
.table th,
.table td {
  vertical-align: middle;
}
</style>