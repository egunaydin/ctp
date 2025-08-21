<template>
  <div class="orders-page container-fluid">
    <!-- TOP TOOLBAR: Search (long) + Theme (square) + Filters (short) -->
    <div class="toolbar d-flex align-items-center">
      <!-- Search -->
      <div class="search-wrap me-3" style="flex: 0 0 280px">
        <i class="bi bi-search"></i>
        <input
          v-model="search"
          type="text"
          class="form-control form-control-sm"
          placeholder="Search by Nº, origin, destination…"
        />
      </div>

      <!-- Sağ grup: filtre + tema -->
      <div class="d-flex align-items-center gap-2 ms-auto">
        <!-- Filters -->
        <button
          class="btn btn-outline-secondary btn-sm px-3"
          style="min-width: 140px"
          @click="
            filtersVisible = !filtersVisible;
            nextTick(() => map?.invalidateSize());
          "
        >
          <i class="bi bi-funnel-fill me-1"></i> Filters
        </button>
        <!-- Theme toggle -->
        <button
          class="btn btn-outline-secondary square-btn"
          @click="toggleTheme"
          :aria-pressed="theme === 'dark'"
          aria-label="Toggle dark mode"
        >
          <Sun v-if="theme !== 'dark'" :size="18" />
          <Moon v-else :size="18" />
        </button>
      </div>
    </div>

    <!-- FILTERS AREA (keeps DOM; no redraw) -->
    <div v-show="filtersVisible" class="col-12 mt-2">
      <div class="row g-2">
        <div class="col-sm-4 col-md-3">
          <select v-model="filters.status" class="form-select form-select-sm">
            <option value="">All Statuses</option>
            <option>Shipping</option>
            <option>Shipped</option>
            <option>Planned</option>
            <option>Canceled</option>
            <option>Warning</option>
          </select>
        </div>
        <div class="col-sm-4 col-md-3">
          <select v-model="filters.type" class="form-select form-select-sm">
            <option value="">All Types</option>
            <option>DAP</option>
            <option>DAT</option>
            <option>CIP</option>
          </select>
        </div>
        <div class="col-sm-4 col-md-3">
          <input
            v-model="filters.date"
            type="date"
            class="form-control form-control-sm"
          />
        </div>
        <div class="col-md-3 d-flex gap-2">
          <button
            class="btn btn-light btn-sm flex-grow-1"
            @click="clearFilters"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- KPI CARDS (compact) -->
    <div class="row g-2 cards-row mt-1">
      <div
        v-for="(card, i) in kpiCards"
        :key="i"
        class="col-12 col-sm-6 col-lg-4"
      >
        <div class="card metric h-100">
          <div class="metric-body">
            <div class="metric-left">
              <div class="metric-value">{{ card.value }}</div>
              <div class="metric-title">{{ card.title }}</div>
              <div class="metric-sub">{{ card.subtitle }}</div>
            </div>
            <div class="metric-right">
              <div class="mini-bars" aria-hidden="true">
                <span
                  v-for="(h, idx) in card.bars"
                  :key="idx"
                  :style="{ height: h + 'px' }"
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAP -->
    <div class="map chrome card shadow-sm position-relative overflow-hidden">
      <div ref="mapEl" class="map-inner">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <div class="loading-text">Rotalar hesaplanıyor…</div>
        </div>
      </div>

      <!-- FLOATING DETAIL CARD -->
      <transition name="pop">
        <aside
          v-if="panelVisible && selectedOrder"
          class="detail-card"
          role="dialog"
          aria-label="Shipment details"
        >
          <div class="dc-head">
            <button
              class="icon-btn"
              @click="panelVisible = false"
              aria-label="Close"
            >
              <X :size="16" />
            </button>
            <span class="pill" :class="onTimePillClass(selectedOrder.status)">
              {{ onTimeText(selectedOrder.status) }}
            </span>
          </div>

          <!-- Üstte sadece özel ID -->
          <div class="dc-route mt-1 justify-between">
            <div class="id-badge">#{{ displayIdForSelected }}</div>
          </div>

          <!-- ETA kutuları -->
          <div class="dc-eta">
            <div
              class="eta-item"
              v-for="(lbl, idx) in ['Current', 'Predictive', 'Original']"
              :key="idx"
            >
              <div class="eta-title">{{ lbl }}</div>
              <div class="eta-date">
                {{ fmtDate(selectedOrder.meta.endDate) }}
              </div>
            </div>
          </div>

          <!-- Bilgi bölümleri -->
          <div class="dc-list">
            <button
              class="list-row"
              type="button"
              :aria-expanded="openSection === 'shipment'"
              @click="toggleSection('shipment')"
            >
              <span
                ><i class="bi bi-box-seam me-2"></i>Shipment Information</span
              >
              <i
                :class="[
                  'bi',
                  openSection === 'shipment'
                    ? 'bi-chevron-down'
                    : 'bi-chevron-right',
                ]"
              ></i>
            </button>
            <div v-if="openSection === 'shipment'" class="section">
              <dl class="kv">
                <div>
                  <dt>Order Nº</dt>
                  <dd>{{ selectedOrder.id }}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{{ selectedOrder.status }}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{{ selectedOrder.meta.transportType }}</dd>
                </div>
                <div>
                  <dt>Start</dt>
                  <dd>{{ fmtDate(selectedOrder.meta.startDate) }}</dd>
                </div>
                <div>
                  <dt>ETA</dt>
                  <dd>{{ fmtDate(selectedOrder.meta.endDate) }}</dd>
                </div>
                <div>
                  <dt>Vehicle</dt>
                  <dd>{{ selectedOrder.vehicle.plate }}</dd>
                </div>
                <div>
                  <dt>Driver</dt>
                  <dd>{{ selectedOrder.vehicle.driver || "-" }}</dd>
                </div>
                <div>
                  <dt>Speed</dt>
                  <dd>
                    {{
                      selectedOrder.vehicle.speedKph
                        ? selectedOrder.vehicle.speedKph + " km/h"
                        : "-"
                    }}
                  </dd>
                </div>
              </dl>
            </div>

            <button
              class="list-row"
              type="button"
              :aria-expanded="openSection === 'route'"
              @click="toggleSection('route')"
            >
              <span
                ><i class="bi bi-signpost-2 me-2"></i>Route Information</span
              >
              <i
                :class="[
                  'bi',
                  openSection === 'route'
                    ? 'bi-chevron-down'
                    : 'bi-chevron-right',
                ]"
              ></i>
            </button>
            <div v-if="openSection === 'route'" class="section">
              <dl class="kv">
                <div>
                  <dt>Origin</dt>
                  <dd>{{ selectedOrder.origin.name }}</dd>
                </div>
                <div>
                  <dt>Destination</dt>
                  <dd>{{ selectedOrder.destination.name }}</dd>
                </div>
                <div>
                  <dt>Distance</dt>
                  <dd>{{ distanceForSelected.toFixed(1) }} km</dd>
                </div>
                <div>
                  <dt>Progress</dt>
                  <dd>{{ Math.round(selectedOrder.progress * 100) }}%</dd>
                </div>
              </dl>
              <div class="d-flex gap-2">
                <button
                  class="btn btn-outline-secondary btn-sm"
                  @click="zoomToSelected"
                >
                  <i class="bi bi-zoom-in me-1"></i>Zoom to route
                </button>
              </div>
            </div>
          </div>
        </aside>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  onBeforeUnmount,
  ref,
  computed,
  watch,
  nextTick,
} from "vue";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import { X, Sun, Moon } from "lucide-vue-next";

/* ==== Types ==== */
type LatLng = { lat: number; lng: number };
type Place = LatLng & { name: string };
type Vehicle = LatLng & { plate: string; driver?: string; speedKph?: number };
type Status = "Planned" | "Shipping" | "Warning" | "Shipped" | "Canceled";
type Order = {
  id: string;
  title: string;
  status: Status;
  origin: Place;
  destination: Place;
  vehicle: Vehicle;
  meta: {
    startDate: string;
    endDate: string;
    transportType: "DAP" | "DAT" | "CIP";
  };
};
type OrderWithProgress = Order & { progress: number };

/* helper */
const tup = (lat: number, lng: number): LatLngTuple => [lat, lng];

/* Dark/Light theme */
const theme = ref<"light" | "dark">(
  (localStorage.getItem("theme") as "light" | "dark") ||
    (document.documentElement.getAttribute("data-bs-theme") as
      | "light"
      | "dark") ||
    "light"
);
function applyTheme() {
  document.documentElement.setAttribute("data-bs-theme", theme.value);
}
function toggleTheme() {
  theme.value = theme.value === "dark" ? "light" : "dark";
  localStorage.setItem("theme", theme.value);
  applyTheme();
}

/* ==== Points (Hadımköy→Eskişehir, Gebze→Adana) ==== */
const TR: Record<string, LatLng> = {
  Eskişehir: { lat: 39.766, lng: 30.525 },
  Adana: { lat: 36.991, lng: 35.33 },
  "Bursa (Nilüfer)": { lat: 40.232, lng: 28.889 },
  "İzmir (Kemalpaşa)": { lat: 38.436, lng: 27.428 },
  "Ankara (Sincan)": { lat: 39.958, lng: 32.584 },
  Denizli: { lat: 37.776, lng: 29.086 },
  Trabzon: { lat: 41.002, lng: 39.717 },
  Erzurum: { lat: 39.905, lng: 41.265 },
  Malatya: { lat: 38.355, lng: 38.333 },
  Konya: { lat: 37.871, lng: 32.484 },
};

/* ==== Data ==== */
const orders = ref<OrderWithProgress[]>([
  {
    id: "AL-TR-0001",
    title: "Order Nº AL-TR-0001",
    status: "Shipping",
    origin: { ...TR.Eskişehir, name: "Eskişehir Depo" },
    destination: { ...TR.Trabzon, name: "Trabzon Müşteri" },
    vehicle: {
      lat: 0,
      lng: 0,
      plate: "34 AL 001",
      driver: "M. Kaya",
      speedKph: 82,
    },
    meta: {
      startDate: "2025-09-01",
      endDate: "2025-09-03",
      transportType: "DAP",
    },
    progress: 0.55,
  },
  {
    id: "AL-TR-0002",
    title: "Order Nº AL-TR-0002",
    status: "Planned",
    origin: { ...TR.Adana, name: "Adana Depo" },
    destination: { ...TR.Erzurum, name: "Erzurum Müşteri" },
    vehicle: {
      lat: 0,
      lng: 0,
      plate: "41 AL 002",
      driver: "E. Demir",
      speedKph: 0,
    },
    meta: {
      startDate: "2025-09-02",
      endDate: "2025-09-05",
      transportType: "DAT",
    },
    progress: 0.0,
  },
  {
    id: "AL-TR-0003",
    title: "Order Nº AL-TR-0003",
    status: "Warning",
    origin: { ...TR["Bursa (Nilüfer)"], name: "Bursa (Nilüfer) Depo" },
    destination: { ...TR.Malatya, name: "Malatya Müşteri" },
    vehicle: {
      lat: 0,
      lng: 0,
      plate: "16 AL 003",
      driver: "S. Arınç",
      speedKph: 68,
    },
    meta: {
      startDate: "2025-09-01",
      endDate: "2025-09-04",
      transportType: "CIP",
    },
    progress: 0.4,
  },
  {
    id: "AL-TR-0004",
    title: "Order Nº AL-TR-0004",
    status: "Shipping",
    origin: { ...TR["İzmir (Kemalpaşa)"], name: "İzmir (Kemalpaşa) Depo" },
    destination: { ...TR.Denizli, name: "Denizli Müşteri" },
    vehicle: {
      lat: 0,
      lng: 0,
      plate: "35 AL 004",
      driver: "A. Yıldız",
      speedKph: 76,
    },
    meta: {
      startDate: "2025-09-01",
      endDate: "2025-09-02",
      transportType: "DAP",
    },
    progress: 0.65,
  },
  {
    id: "AL-TR-0005",
    title: "Order Nº AL-TR-0005",
    status: "Shipped",
    origin: { ...TR["Ankara (Sincan)"], name: "Ankara (Sincan) Depo" },
    destination: { ...TR.Konya, name: "Konya Müşteri" },
    vehicle: {
      lat: 0,
      lng: 0,
      plate: "06 AL 005",
      driver: "D. Çetin",
      speedKph: 0,
    },
    meta: {
      startDate: "2025-08-30",
      endDate: "2025-08-31",
      transportType: "DAT",
    },
    progress: 1.0,
  },
]);

/* Özel 5 ID */
const customIds = [1, 2, 3, 4, 5];

/* Panel & seçili sipariş */
const selectedOrder = ref<OrderWithProgress | null>(null);
const displayIdForSelected = computed(() => {
  if (!selectedOrder.value) return "";
  const idx = orders.value.findIndex((o) => o.id === selectedOrder.value!.id);
  return idx >= 0 && idx < customIds.length
    ? customIds[idx]
    : selectedOrder.value.id;
});

/* Filters & Search */
const filtersVisible = ref(false);
const search = ref("");
const filters = ref<{ status: string; type: string; date: string }>({
  status: "",
  type: "",
  date: "",
});

function toKey(d: string) {
  if (d.includes(".")) {
    const [dd, mm, yyyy] = d.split(".");
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  return d.slice(0, 10);
}

const visibleOrders = computed(() =>
  orders.value.filter((o) => {
    const q = search.value.trim().toLowerCase();
    const qOk =
      !q ||
      [o.id, o.title, o.origin.name, o.destination.name].some((x) =>
        x.toLowerCase().includes(q)
      );
    const sOk =
      !filters.value.status || o.status === (filters.value.status as Status);
    const tOk =
      !filters.value.type || o.meta.transportType === filters.value.type;
    const dOk =
      !filters.value.date ||
      toKey(o.meta.startDate) === filters.value.date ||
      toKey(o.meta.endDate) === filters.value.date;
    return qOk && sOk && tOk && dOk;
  })
);
function clearFilters() {
  filters.value = { status: "", type: "", date: "" };
  search.value = "";
}

/* KPI */
function seedBars(seed = 7, n = 12, min = 6, max = 22) {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    out.push(Math.round(min + r * (max - min)));
  }
  return out;
}
const now = new Date();
const inNext24h = (iso: string) => {
  const d = new Date(iso).getTime();
  const diff = d - now.getTime();
  return diff >= 0 && diff <= 24 * 60 * 60 * 1000;
};
const kpiCards = computed(() => {
  const inTransit = visibleOrders.value.filter(
    (o) => o.status === "Shipping" || o.status === "Warning"
  ).length;
  const departures = visibleOrders.value.filter((o) =>
    inNext24h(o.meta.startDate)
  ).length;
  const arrivals = visibleOrders.value.filter((o) =>
    inNext24h(o.meta.endDate)
  ).length;
  const transship = 0;
  return [
    {
      value: String(inTransit),
      title: "In Transit Shipments",
      subtitle: undefined,
      bars: seedBars(3),
    },
    {
      title: "Upcoming Departures",
      value: String(departures),
      subtitle: undefined,
      bars: seedBars(5),
    },
    {
      title: "Upcoming Transshipments",
      value: String(transship),
      subtitle: undefined,
      bars: seedBars(9),
    },
  ];
});

/* ==== Map ==== */
const mapEl = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let overlay: L.LayerGroup | null = null;
const loading = ref(false);

const panelVisible = ref(false);
const openSection = ref<"shipment" | "route" | "emission" | null>("shipment");

const statusColor = (s: Status) =>
  s === "Shipping"
    ? "#198754"
    : s === "Planned"
    ? "#0d6efd"
    : s === "Warning"
    ? "#fd7e14"
    : s === "Shipped"
    ? "#6c757d"
    : "#dc3545";

const onTimeText = (s: Status) =>
  s === "Warning" || s === "Canceled" ? "Delayed" : "On Time";
const onTimePillClass = (s: Status) =>
  s === "Warning" || s === "Canceled" ? "pill-danger" : "pill-success";

const icon = (emoji: string) =>
  L.divIcon({
    html: `<div class="pin">${emoji}</div>`,
    className: "pin-wrapper",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

async function roadRoute(points: LatLngTuple[]): Promise<LatLngTuple[]> {
  const coordStr = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("OSRM route failed");
  const json = await res.json();
  const coords = json?.routes?.[0]?.geometry?.coordinates as [number, number][];
  return coords.map(([lng, lat]) => [lat, lng] as LatLngTuple);
}

function interpolatePoint(path: LatLngTuple[], t: number): LatLngTuple {
  if (!path.length) return [0, 0];
  if (t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];
  const seg: number[] = [];
  let T = 0;
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(
      path[i][0] - path[i - 1][0],
      path[i][1] - path[i - 1][1]
    );
    seg.push(d);
    T += d;
  }
  let a = t * T;
  for (let i = 1; i < path.length; i++) {
    if (a <= seg[i - 1]) {
      const r = a / seg[i - 1];
      return [
        path[i - 1][0] + (path[i][0] - path[i - 1][0]) * r,
        path[i - 1][1] + (path[i][1] - path[i - 1][1]) * r,
      ] as LatLngTuple;
    }
    a -= seg[i - 1];
  }
  return path[path.length - 1];
}

/* güzergâh saklama + mesafe */
const pathsByOrder = new Map<string, LatLngTuple[]>();
function pathDistanceKm(path: LatLngTuple[]) {
  let km = 0;
  for (let i = 1; i < path.length; i++) {
    const a = L.latLng(path[i - 1][0], path[i - 1][1]);
    const b = L.latLng(path[i][0], path[i][1]);
    km += a.distanceTo(b) / 1000;
  }
  return km;
}
const distanceForSelected = computed(() => {
  if (!selectedOrder.value) return 0;
  const p = pathsByOrder.get(selectedOrder.value.id);
  if (p && p.length > 1) return pathDistanceKm(p);
  const o = selectedOrder.value.origin,
    d = selectedOrder.value.destination;
  return L.latLng(o.lat, o.lng).distanceTo(L.latLng(d.lat, d.lng)) / 1000;
});

function attachFocusBehavior(
  o: OrderWithProgress,
  past: L.Polyline,
  future: L.Polyline
) {
  const hi = () => {
    past.setStyle({ weight: 7 });
    future.setStyle({ weight: 7 });
    past.bringToFront();
    future.bringToFront();
  };
  const un = () => {
    past.setStyle({ weight: 5, opacity: 0.95 });
    future.setStyle({ weight: 5, opacity: 0.35 });
  };
  const zoom = () => {
    const b = past.getBounds().extend(future.getBounds());
    map!.fitBounds(b, { padding: [60, 60] });
  };
  [past, future].forEach((pl) => {
    pl.on("mouseover", hi);
    pl.on("mouseout", un);
    pl.on("click", () => {
      hi();
      zoom();
      selectedOrder.value = o;
      panelVisible.value = true;
      openSection.value = "shipment";
    });
  });
}

/* daha görünür çizim presetleri */
async function drawAll() {
  if (!map) return;
  loading.value = true;
  overlay?.remove();
  overlay = L.layerGroup().addTo(map);
  pathsByOrder.clear();
  const allBounds: LatLngTuple[] = [];

  const styleMap: Record<
    Status,
    {
      casingPastW: number;
      casingFutureW: number;
      casingFutureO: number;
      pastW: number;
      pastO: number;
      futureW: number;
      futureO: number;
      dash: string;
    }
  > = {
    Shipping: {
      casingPastW: 10,
      casingFutureW: 11,
      casingFutureO: 0.7,
      pastW: 6,
      pastO: 0.95,
      futureW: 6,
      futureO: 0.7,
      dash: "6,8",
    },
    Planned: {
      casingPastW: 10,
      casingFutureW: 12,
      casingFutureO: 0.8,
      pastW: 6,
      pastO: 0.95,
      futureW: 7,
      futureO: 0.75,
      dash: "2,10",
    },
    Warning: {
      casingPastW: 11,
      casingFutureW: 12,
      casingFutureO: 0.85,
      pastW: 7,
      pastO: 0.98,
      futureW: 7,
      futureO: 0.85,
      dash: "4,8",
    },
    Shipped: {
      casingPastW: 9,
      casingFutureW: 9,
      casingFutureO: 0.55,
      pastW: 6,
      pastO: 0.9,
      futureW: 5,
      futureO: 0.55,
      dash: "6,8",
    },
    Canceled: {
      casingPastW: 11,
      casingFutureW: 12,
      casingFutureO: 0.85,
      pastW: 7,
      pastO: 0.95,
      futureW: 7,
      futureO: 0.85,
      dash: "1,8",
    },
  };

  for (const o of visibleOrders.value) {
    const color = statusColor(o.status);
    const S = styleMap[o.status];
    const seq: LatLngTuple[] = [
      tup(o.origin.lat, o.origin.lng),
      tup(o.destination.lat, o.destination.lng),
    ];

    try {
      const snapped = await roadRoute(seq);
      pathsByOrder.set(o.id, snapped);
      const vi = Math.max(1, Math.floor(snapped.length * o.progress));
      const past = snapped.slice(0, vi + 1) as LatLngTuple[];
      const future = snapped.slice(vi) as LatLngTuple[];

      // Beyaz casing
      L.polyline(past, {
        color: "#fff",
        weight: S.casingPastW,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(overlay!);
      L.polyline(future, {
        color: "#fff",
        weight: S.casingFutureW,
        opacity: S.casingFutureO,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(overlay!);

      // Renkli çizgiler
      const pastLine = L.polyline(past, {
        color,
        weight: S.pastW,
        opacity: S.pastO,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(overlay!);
      const futureLine = L.polyline(future, {
        color,
        weight: S.futureW,
        opacity: S.futureO,
        dashArray: S.dash,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(overlay!);

      // Markerlar
      const mOrigin = L.marker(tup(o.origin.lat, o.origin.lng), {
        icon: icon("📦"),
      }).addTo(overlay!);
      const mDest = L.marker(tup(o.destination.lat, o.destination.lng), {
        icon: icon("🏁"),
      }).addTo(overlay!);

      attachFocusBehavior(o, pastLine, futureLine);
      [mOrigin, mDest].forEach((m) =>
        m.on("click", () => {
          selectedOrder.value = o;
          panelVisible.value = true;
          openSection.value = "shipment";
          const b = pastLine.getBounds().extend(futureLine.getBounds());
          map!.fitBounds(b, { padding: [60, 60] });
        })
      );
      futureLine.bringToFront();
      pastLine.bringToFront();

      allBounds.push(...snapped);
    } catch {
      const viPt = interpolatePoint(seq, o.progress);

      L.polyline([seq[0], viPt] as LatLngTuple[], {
        color: "#fff",
        weight: S.casingPastW,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(overlay!);
      L.polyline([viPt, seq[1]] as LatLngTuple[], {
        color: "#fff",
        weight: S.casingFutureW,
        opacity: S.casingFutureO,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(overlay!);

      const pastLine = L.polyline([seq[0], viPt] as LatLngTuple[], {
        color,
        weight: S.pastW,
        opacity: S.pastO,
      }).addTo(overlay!);
      const futureLine = L.polyline([viPt, seq[1]] as LatLngTuple[], {
        color,
        weight: S.futureW,
        opacity: S.futureO,
        dashArray: S.dash,
      }).addTo(overlay!);

      const mOrigin = L.marker(tup(o.origin.lat, o.origin.lng), {
        icon: icon("📦"),
      }).addTo(overlay!);
      const mDest = L.marker(tup(o.destination.lat, o.destination.lng), {
        icon: icon("🏁"),
      }).addTo(overlay!);

      attachFocusBehavior(o, pastLine, futureLine);
      [mOrigin, mDest].forEach((m) =>
        m.on("click", () => {
          selectedOrder.value = o;
          panelVisible.value = true;
          openSection.value = "shipment";
        })
      );
      futureLine.bringToFront();
      pastLine.bringToFront();

      pathsByOrder.set(o.id, [seq[0], seq[1]]);
      allBounds.push(...seq);
    }
  }

  if (allBounds.length)
    map!.fitBounds(L.latLngBounds(allBounds), { padding: [50, 50] });
  loading.value = false;
}

onMounted(async () => {
  applyTheme();
  if (!mapEl.value) return;
  const osm = L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    { maxZoom: 19 }
  );
  const hot = L.tileLayer(
    "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    { maxZoom: 20 }
  );
  map = L.map(mapEl.value, { center: [39, 35], zoom: 6, layers: [osm] });
  L.control
    .layers({ OSM: osm, Humanitarian: hot }, {}, { position: "topleft" })
    .addTo(map);
  L.control.scale({ imperial: false }).addTo(map);
  await nextTick();
  drawAll();
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  map?.remove();
  map = null;
  window.removeEventListener("resize", onResize);
});

/* sadece görünür siparişler değişince çiz */
watch(visibleOrders, async () => {
  await nextTick();
  drawAll();
});

function onResize() {
  map?.invalidateSize();
}
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* Detail card actions */
function toggleSection(s: "shipment" | "route" | "emission") {
  openSection.value = openSection.value === s ? null : s;
}
function zoomToSelected() {
  if (!map || !selectedOrder.value || !overlay) return;
  const path = pathsByOrder.get(selectedOrder.value.id);
  if (!path || path.length < 2) return;
  map!.fitBounds(L.latLngBounds(path), { padding: [60, 60] });
}
</script>

<style scoped>
/* Layout */
.orders-page {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.5rem;
  overflow: hidden;
  min-height: 0;
}
.toolbar,
.cards-row {
  margin: 0;
}

/* Search (longer) */
.search-wrap {
  position: relative;
  width: 100%;
  max-width: 600px;
  min-width: 675px;
}
.search-wrap i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.55;
}
.search-wrap .form-control {
  padding-left: 34px;
}

/* Square theme button */
.square-btn {
  height: 36px;
  width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--bs-border-color);
}

/* KPI */
.card.metric {
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  background: var(--bs-body-bg);
  box-shadow: 0 6px 14px rgba(16, 24, 40, 0.06);
  min-height: 60px;
}
.metric-body {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 10px;
  align-items: center;
  padding: 16px 10px;
}
.metric-title {
  font-size: 0.72rem;
  color: #6c757d;
  letter-spacing: 0.2px;
  margin-bottom: 2px;
}
.metric-value {
  font-size: 1.25rem;
  font-weight: 800;
  line-height: 1.05;
}
.metric-sub {
  font-size: 0.7rem;
  color: #98a2b3;
}
.mini-bars {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 4px;
  height: 24px;
}
.mini-bars span {
  width: 6px;
  border-radius: 3px;
  background: rgba(13, 110, 253, 0.28);
}

/* Map */
.map.chrome {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4),
    0 10px 20px rgba(16, 24, 40, 0.06);
  height: var(--map-h, 73vh);
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.map-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Floating detail card */
.detail-card {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: clamp(320px, 32vw, 440px);
  background: var(--surface, rgba(255, 255, 255, 0.96));
  backdrop-filter: blur(6px);
  border: 1px solid var(--border-weak, rgba(0, 0, 0, 0.08));
  border-radius: 14px;
  box-shadow: 0 14px 30px var(--shadow-elev, rgba(16, 24, 40, 0.18));
  z-index: 1040;
  padding: 12px;
  color: var(--text-strong, #0f172a);
}
.dc-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.icon-btn {
  border: 1px solid var(--bs-border-color);
  background: transparent;
  border-radius: 8px;
  height: 28px;
  width: 28px;
  display: grid;
  place-items: center;
}

/* ID rozeti */
.dc-route {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 6px;
}
.id-badge {
  font-weight: 800;
  letter-spacing: 0.4px;
  border: 1px solid var(--border-weak, rgba(0, 0, 0, 0.08));
  border-radius: 999px;
  padding: 4px 10px;
  background: var(--surface-2, #f8fafc);
  color: var(--text-strong, #0f172a);
}

/* Pill */
.pill {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  border: 1px solid;
}
.pill-success {
  background: #e8f7ef;
  color: #198754;
  border-color: #c6f0d5;
}
.pill-danger {
  background: #fff2f0;
  color: #d63335;
  border-color: #ffd0cc;
}

/* ETA, list, vs. */
.dc-eta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 8px;
}
.eta-item {
  background: var(--surface-2, #f8fafc);
  border: 1px solid var(--border-weak, rgba(0, 0, 0, 0.05));
  border-radius: 10px;
  padding: 8px;
}
.eta-title {
  font-size: 0.72rem;
  color: var(--text-muted, #6b7280);
}
.eta-date {
  font-weight: 700;
  font-size: 0.9rem;
}
.dc-list {
  padding-top: 8px;
}
.list-row {
  width: 100%;
  border: 1px solid var(--border-weak, rgba(0, 0, 0, 0.08));
  background: var(--surface, #fff);
  border-radius: 10px;
  padding: 10px 12px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-strong, #0f172a);
}
.list-row:hover {
  background: var(--surface-2, #f8fafc);
}
.section {
  border: 1px dashed var(--border-weak, var(--bs-border-color));
  border-radius: 10px;
  padding: 10px;
  margin-top: 8px;
}
.kv {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 6px 10px;
  margin: 0;
}
.kv dt {
  font-size: 0.78rem;
  color: var(--text-muted, #6b7280);
  font-weight: 600;
}
.kv dd {
  margin: 0;
  font-weight: 600;
}

/* Pins & loading */
.pin {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  font-size: 20px;
}
.loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(58, 58, 58, 0.35);
  color: #fff;
  z-index: 9999;
  pointer-events: none;
}
.spinner {
  width: 26px;
  height: 26px;
  border: 3px solid #e5e7eb;
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.loading-text {
  font-size: 13px;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Animations */
.pop-enter-from,
.pop-leave-to {
  transform: translateY(-50%) scale(0.96);
  opacity: 0;
}
.pop-enter-active,
.pop-leave-active {
  transition: all 0.15s ease;
}

/* ==== Dark theme vars ==== */
:root[data-bs-theme="dark"] {
  --surface: rgba(33, 37, 41, 0.92);
  --surface-2: rgba(45, 49, 58, 0.6);
  --border-weak: rgba(255, 255, 255, 0.14);
  --text-strong: #e9ecef;
  --text-muted: #94a3b8;
  --shadow-elev: rgba(0, 0, 0, 0.42);
}

/* KPI overrides for dark */
:root[data-bs-theme="dark"] .card.metric {
  background: var(--surface);
  border-color: var(--border-weak);
  box-shadow: 0 10px 20px var(--shadow-elev);
}
:root[data-bs-theme="dark"] .metric-title,
:root[data-bs-theme="dark"] .metric-sub {
  color: var(--text-muted);
}
:root[data-bs-theme="dark"] .mini-bars span {
  background: rgba(13, 110, 253, 0.45);
}
</style>
