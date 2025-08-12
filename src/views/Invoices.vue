<template>
  <div class="container-fluid py-3">
    <!-- TOP BAR: Title + Search + Filters + Sort + New Invoice -->
    <div class="d-flex flex-wrap align-items-center gap-2 mb-3">
      <h3 class="m-0 me-auto fw-semibold">Invoices</h3>

      <!-- Search box -->
      <div class="position-relative">
        <input
          v-model="q"
          type="text"
          class="form-control ps-5"
          placeholder="Search invoices, clients, #INV..."
          style="min-width: 280px"
        />
        <i
          class="bi bi-search position-absolute top-50 translate-middle-y ms-3"
        />
      </div>

      <!-- Status filter -->
      <select v-model="filters.status" class="form-select" style="width: 140px">
        <option value="">All Status</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
        <option value="Overdue">Overdue</option>
        <option value="Draft">Draft</option>
      </select>

      <!-- Payment method filter -->
      <select v-model="filters.method" class="form-select" style="width: 140px">
        <option value="">All Methods</option>
        <option value="Master Card">Master Card</option>
        <option value="Visa">Visa</option>
        <option value="PayPal">PayPal</option>
        <option value="Bank">Bank</option>
      </select>

      <!-- Sorting dropdown -->
      <select v-model="sortBy" class="form-select" style="width: 140px">
        <option value="dateDesc">Newest</option>
        <option value="dateAsc">Oldest</option>
        <option value="amountDesc">Amount ↓</option>
        <option value="amountAsc">Amount ↑</option>
      </select>

      <!-- Add new invoice action -->
      <button
        class="btn btn-primary d-flex align-items-center gap-2"
        @click="createNew"
      >
        <i class="bi bi-plus-lg"></i> New Invoice
      </button>
    </div>

    <!-- OVERVIEW: Small top statistic cards -->
    <div class="card shadow-sm border mb-3">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-12">
            <div class="text-muted small fw-semibold">Overview</div>
          </div>

          <!-- Clients Added -->
          <div class="col-12 col-md-4">
            <div
              class="mini stat d-flex align-items-center justify-content-between p-3 rounded-3"
            >
              <div>
                <div class="h5 m-0">{{ stats.clients }}</div>
                <div class="text-muted small">Clients Added</div>
              </div>
              <i class="bi bi-bar-chart fs-4 text-primary opacity-75"></i>
            </div>
          </div>

          <!-- Contracts Signed -->
          <div class="col-12 col-md-4">
            <div
              class="mini stat d-flex align-items-center justify-content-between p-3 rounded-3"
            >
              <div>
                <div class="h5 m-0">{{ stats.contracts }}</div>
                <div class="text-muted small">Contracts Signed</div>
              </div>
              <i class="bi bi-graph-up fs-4 text-danger opacity-75"></i>
            </div>
          </div>

          <!-- Invoices Sent -->
          <div class="col-12 col-md-4">
            <div
              class="mini stat d-flex align-items-center justify-content-between p-3 rounded-3"
            >
              <div>
                <div class="h5 m-0">{{ stats.sent }}</div>
                <div class="text-muted small">Invoices Sent</div>
              </div>
              <i class="bi bi-activity fs-4 text-success opacity-75"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PAYMENT HISTORY: List of invoices with collapsible details -->
    <div class="card shadow-sm border">
      <div class="card-body pb-2">
        <div class="fw-semibold py-2">Payment History</div>

        <!-- Invoice list -->
        <div class="list-group">
          <div
            v-for="(inv, idx) in filteredSorted"
            :key="inv.id"
            class="list-group-item invoice-row border rounded-3 px-3 py-3 mb-2"
          >
            <!-- = Row content = -->
            <div class="row g-2 align-items-center">
              <!-- Left: Avatar + Client Name + Tag -->
              <div class="col-12 col-md-4 d-flex align-items-center gap-3">
                <span
                  class="avatar rounded-circle d-inline-flex align-items-center justify-content-center"
                >
                  {{ initials(inv.client) }}
                </span>
                <div class="me-auto">
                  <div class="fw-semibold">{{ inv.client }}</div>
                  <span
                    class="badge rounded-pill px-2 py-1 fw-semibold tag-badge"
                    :class="badgeClass(inv.tag)"
                  >
                    {{ inv.tag }}
                  </span>
                </div>
              </div>

              <!-- Status badge -->
              <div class="col-6 col-md-2">
                <span
                  class="badge rounded-pill px-3 py-2 fw-medium"
                  :class="statusClass(inv.status)"
                >
                  {{ inv.status }}
                </span>
              </div>

              <!-- Invoice date -->
              <div class="col-6 col-md-2 text-muted small">
                {{ inv.date }}
              </div>

              <!-- Payment method -->
              <div class="col-6 col-md-2 text-muted small">
                {{ inv.method }}
              </div>

              <!-- Amount + collapse toggle -->
              <div
                class="col-6 col-md-2 d-flex align-items-center justify-content-end gap-2"
              >
                <div class="fw-semibold">
                  ${{ inv.amount.toLocaleString() }}
                </div>
                <button
                  class="btn btn-sm btn-outline-secondary"
                  :aria-controls="'d' + idx"
                  data-bs-toggle="collapse"
                  :data-bs-target="'#d' + idx"
                >
                  <span class="bi bi-chevron-down">˅</span>
                </button>
              </div>
            </div>

            <!-- = Collapsible details = -->
            <div class="collapse mt-3" :id="'d' + idx">
              <div class="row g-3">
                <!-- Left: Billing plan list -->
                <div class="col-12 col-lg-7">
                  <div class="rounded-3 p-3 border bg-body-tertiary">
                    <div class="small text-muted mb-2">Billing plan</div>
                    <ul class="small m-0 ps-3">
                      <li v-for="(l, i) in inv.plan" :key="i">{{ l }}</li>
                    </ul>
                  </div>
                </div>

                <!-- Right: Key invoice info -->
                <div class="col-12 col-lg-5">
                  <div class="rounded-3 p-3 border bg-body-tertiary">
                    <div class="row small g-2">
                      <div class="col-6">
                        <div class="text-muted">Status</div>
                        <div class="fw-medium">{{ inv.status }}</div>
                      </div>
                      <div class="col-6">
                        <div class="text-muted">Invoiced</div>
                        <div class="fw-medium">{{ inv.date }}</div>
                      </div>
                      <div class="col-6">
                        <div class="text-muted">ID number</div>
                        <div class="fw-medium">#{{ inv.number }}</div>
                      </div>
                      <div class="col-6">
                        <div class="text-muted">Date paid</div>
                        <div class="fw-medium">{{ inv.paid || "—" }}</div>
                      </div>
                      <div class="col-12">
                        <hr class="my-2" />
                        <div
                          class="d-flex justify-content-between align-items-center"
                        >
                          <div class="text-muted">Total due</div>
                          <div class="h5 m-0">
                            ${{ inv.amount.toLocaleString() }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer: simple count + pagination placeholder -->
      <div
        class="card-footer bg-transparent d-flex justify-content-between align-items-center"
      >
        <small class="text-muted">
          Showing {{ filteredSorted.length }} of {{ invoices.length }} invoices
        </small>
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" disabled>Prev</button>
          <button class="btn btn-dark">1</button>
          <button class="btn btn-outline-secondary" disabled>Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// STATE & REFS
import { computed, ref } from "vue";

// Search / filter / sort state
const q = ref("");
const filters = ref({ status: "", method: "" });
const sortBy = ref("dateDesc");

// MOCK DATA (sample invoices)
const invoices = ref([
  {
    id: 1,
    client: "Digital Design Ocean",
    tag: "Pro",
    status: "Pending",
    date: "Aug 13, 2020",
    method: "Master Card",
    amount: 6400,
    number: "INV110218",
    paid: "",
    plan: [
      "5 team members ($5 / month each)",
      "+ 100 GB extra storage ($25.00)",
      "+ extra hours ($2 per hour)",
    ],
  },
  {
    id: 2,
    client: "Techcronus B",
    tag: "Pro",
    status: "Completed",
    date: "Jun 20, 2020",
    method: "PayPal",
    amount: 4500,
    number: "INV110212",
    paid: "Jun 20, 2020",
    plan: ["Custom enterprise plan", "Priority support", "SSO / SAML"],
  },
  {
    id: 3,
    client: "Ridho Tijan",
    tag: "RTI",
    status: "Completed",
    date: "May 10, 2020",
    method: "PayPal",
    amount: 1500,
    number: "INV109901",
    paid: "May 12, 2020",
    plan: ["Freelance monthly retainer", "Design & handoff"],
  },
  {
    id: 4,
    client: "Acme Industries",
    tag: "ENT",
    status: "Overdue",
    date: "Apr 08, 2020",
    method: "Bank",
    amount: 7200,
    number: "INV109455",
    paid: "",
    plan: ["Enterprise SLA", "Quarterly on-site workshop"],
  },
  {
    id: 5,
    client: "Blue Pixel Co.",
    tag: "Starter",
    status: "Draft",
    date: "Mar 27, 2020",
    method: "Visa",
    amount: 980,
    number: "INV108888",
    paid: "",
    plan: ["Starter bundle", "No add-ons"],
  },
]);

// DERIVED / COMPUTEDS
// Overview card stats
const stats = computed(() => ({
  clients: new Set(invoices.value.map((i) => i.client)).size,
  contracts: 65, // static sample
  sent: invoices.value.length,
}));

// Get initials from name for avatar
const initials = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// Status badge color
const statusClass = (s) => {
  switch (s) {
    case "Completed":
      return "bg-success text-white";
    case "Pending":
      return "bg-warning text-white";
    case "Overdue":
      return "bg-danger text-white";
    case "Draft":
      return "bg-secondary text-white";
    default:
      return "bg-light text-white";
  }
};

// Tag badge color
const badgeClass = (t) => {
  switch (t) {
    case "Pro":
      return "bg-primary text-white";
    case "ENT":
      return "bg-info text-white";
    case "Starter":
      return "bg-secondary text-white";
    case "RTI":
      return "bg-success text-white";
    default:
      return "bg-white text-white";
  }
};

// Filtered + sorted list
const filteredSorted = computed(() => {
  const term = q.value.trim().toLowerCase();

  let arr = invoices.value.filter((i) => {
    const matchesQ =
      !term ||
      i.client.toLowerCase().includes(term) ||
      i.number.toLowerCase().includes(term) ||
      i.method.toLowerCase().includes(term);

    const matchesStatus =
      !filters.value.status || i.status === filters.value.status;
    const matchesMethod =
      !filters.value.method || i.method === filters.value.method;

    return matchesQ && matchesStatus && matchesMethod;
  });

  // 2) sorting
  switch (sortBy.value) {
    case "dateAsc":
      arr = arr.slice().reverse(); // mock data is already newest -> oldest
      break;
    case "amountAsc":
      arr = arr.slice().sort((a, b) => a.amount - b.amount);
      break;
    case "amountDesc":
      arr = arr.slice().sort((a, b) => b.amount - a.amount);
      break;
    default:
      // dateDesc -> already sorted
      break;
  }
  return arr;
});
</script>

<style scoped>
.mini.stat {
  background: var(--bs-body-bg);
  border: 1px solid var(--bs-border-color);
}

.avatar {
  width: 40px;
  height: 40px;
  font-weight: 600;
  background: var(--bs-primary-bg-subtle);
  color: var(--bs-primary);
}

.bi-search {
  color: var(--bs-secondary-color);
}

.invoice-row {
  background: var(--bs-body-bg);
  border-color: var(--bs-border-color);
}

.badge {
  letter-spacing: 0.2px;
}

:deep([data-bs-theme="dark"] .tag-badge.bg-info) {
  color: #0b0c0d !important;
}
.user-card,
.btn-outline-secondary {
  border: 1px solid var(--border) !important;
}
</style>
