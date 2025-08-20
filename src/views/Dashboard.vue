<template>
  <div class="orders-page container-fluid">
    <!-- TOP TOOLBAR: Search + Filters -->
    <div class="toolbar row g-2 align-items-center">
      <div class="col-12 col-lg">
        <div class="search-wrap">
          <i class="bi bi-search"></i>
          <input v-model="search" type="text" class="form-control form-control-sm"
            placeholder="Search by Nº, origin, destination…" />
        </div>
      </div>
      <div class="col-12 col-lg-auto d-flex gap-2 justify-content-end">
        <button class="btn btn-outline-secondary btn-sm" @click="filtersVisible = !filtersVisible">
          <i class="bi bi-funnel-fill me-1"></i> Filters
        </button>
      </div>
      <div v-if="filtersVisible" class="col-12">
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
            <input v-model="filters.date" type="date" class="form-control form-control-sm" />
          </div>
          <div class="col-md-3 d-flex gap-2">
            <button class="btn btn-light btn-sm flex-grow-1" @click="clearFilters">Clear</button>
          </div>
        </div>
      </div>
    </div>

    <!-- COMPACT HEADER CARDS -->
    <div class="row g-2 cards-row">
      <div class="col-12 col-sm-6 col-lg-3" v-for="(card, i) in statsCardsWithTotal" :key="i">
        <div class="card metric h-100">
          <div class="card-body p-2">
            <div class="metric-title">{{ card.title }}</div>
            <div class="metric-value">{{ card.value }}</div>
            <div class="metric-sub">{{ card.subtitle }}</div>

            <div v-if="card.title === 'In Transit Shipments'" class="mt-1">
              <div v-for="(label, key, idx) in badgeData" :key="idx" class="mb-1">
                <div class="d-flex justify-content-between align-items-center">
                  <small :class="`text-${label.color}`"><i :class="`bi ${label.icon}`"></i> {{ key }}</small>
                  <small class="text-muted">{{ label.count }}</small>
                </div>
                <div class="progress progress-thin">
                  <div class="progress-bar" :class="`bg-${label.color}`"
                    :style="{ width: (visibleOrders.length ? (label.count / visibleOrders.length) * 100 : 0) + '%' }" />
                </div>
              </div>
            </div>

            <div v-else class="mini-bars mt-1" aria-hidden="true">
              <span v-for="n in 8" :key="n" :style="{ height: (8 + Math.random() * 18) + 'px' }"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MAP + RIGHT PANEL (flex:1 fills remaining to make full 100vh) -->
    <div class="map chrome card shadow-sm position-relative overflow-hidden flex-fill">
      <div ref="mapEl" class="map-inner">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <div class="loading-text">Rotalar hesaplanıyor…</div>
        </div>
      </div>

      <transition name="slide-right">
        <aside v-if="panelVisible && selectedOrder" class="detail-panel border-start" role="dialog"
          aria-label="Shipment details">
          <div class="panel-head">
            <div class="dot"></div>
            <div class="panel-tools">
              <span class="pill pill-success">On Time</span>
              <button class="icon-btn" @click="panelVisible = false" aria-label="Close"><i
                  class="bi bi-x-lg"></i></button>
            </div>
          </div>

          <div class="panel-route">
            <div class="code">{{ codeFrom(selectedOrder.origin.name) }}</div>
            <div class="arrow"><i class="bi bi-arrow-right"></i></div>
            <div class="code">{{ codeFrom(selectedOrder.destination.name) }}</div>
          </div>

          <div class="panel-eta">
            <div class="eta-item">
              <div class="eta-title">Current</div>
              <div class="eta-date">{{ selectedOrder.meta.endDate }}</div>
            </div>
            <div class="eta-item">
              <div class="eta-title">Predictive</div>
              <div class="eta-date">{{ selectedOrder.meta.endDate }}</div>
            </div>
            <div class="eta-item">
              <div class="eta-title">Original</div>
              <div class="eta-date">{{ selectedOrder.meta.endDate }}</div>
            </div>
          </div>

          <div class="panel-list">
            <button class="list-row" type="button"><span><i class="bi bi-box-seam me-2"></i>Shipment
                Information</span><i class="bi bi-chevron-right"></i></button>
            <button class="list-row" type="button"><span><i class="bi bi-signpost-2 me-2"></i>Route Information</span><i
                class="bi bi-chevron-right"></i></button>
            <button class="list-row" type="button"><span><i class="bi bi-wind me-2"></i>CO₂ Emission</span><i
                class="bi bi-chevron-right"></i></button>
          </div>
        </aside>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, watch, nextTick } from "vue";
import L from "leaflet";

/* ==== types/data as before (shortened here) ==== */
type LatLng = { lat: number; lng: number };
type Place = LatLng & { name: string };
type Vehicle = LatLng & { plate: string; driver?: string; speedKph?: number };
type Status = "Planned" | "Shipping" | "Warning" | "Shipped" | "Canceled";
type Order = { id: string; title: string; status: Status; origin: Place; destination: Place; vehicle: Vehicle; meta: { startDate: string; endDate: string; transportType: string } };
type OrderWithProgress = Order & { progress: number };

const TR: Record<string, LatLng> = {
  "İstanbul (Hadımköy)": { lat: 41.112, lng: 28.683 },
  "Kocaeli (Gebze)": { lat: 40.802, lng: 29.438 },
  "Bursa (Nilüfer)": { lat: 40.232, lng: 28.889 },
  "İzmir (Kemalpaşa)": { lat: 38.436, lng: 27.428 },
  "Ankara (Sincan)": { lat: 39.958, lng: 32.584 },
  Denizli: { lat: 37.776, lng: 29.086 },
  Trabzon: { lat: 41.002, lng: 39.717 },
  Erzurum: { lat: 39.905, lng: 41.265 },
  Malatya: { lat: 38.355, lng: 38.333 },
  Konya: { lat: 37.871, lng: 32.484 },
};

const orders = ref<OrderWithProgress[]>([
  { id: "AL-TR-0001", title: "Order Nº AL-TR-0001", status: "Shipping", origin: { ...TR["İstanbul (Hadımköy)"], name: "İstanbul (Hadımköy) Depo" }, destination: { ...TR.Trabzon, name: "Trabzon Müşteri" }, vehicle: { lat: 0, lng: 0, plate: "34 AL 001", driver: "M. Kaya", speedKph: 82 }, meta: { startDate: "01.09.2025", endDate: "03.09.2025", transportType: "DAP" }, progress: 0.55 },
  { id: "AL-TR-0002", title: "Order Nº AL-TR-0002", status: "Planned", origin: { ...TR["Kocaeli (Gebze)"], name: "Kocaeli (Gebze) Depo" }, destination: { ...TR.Erzurum, name: "Erzurum Müşteri" }, vehicle: { lat: 0, lng: 0, plate: "41 AL 002", driver: "E. Demir", speedKph: 0 }, meta: { startDate: "02.09.2025", endDate: "05.09.2025", transportType: "DAT" }, progress: 0.0 },
  { id: "AL-TR-0003", title: "Order Nº AL-TR-0003", status: "Warning", origin: { ...TR["Bursa (Nilüfer)"], name: "Bursa (Nilüfer) Depo" }, destination: { ...TR.Malatya, name: "Malatya Müşteri" }, vehicle: { lat: 0, lng: 0, plate: "16 AL 003", driver: "S. Arınç", speedKph: 68 }, meta: { startDate: "01.09.2025", endDate: "04.09.2025", transportType: "CIP" }, progress: 0.4 },
  { id: "AL-TR-0004", title: "Order Nº AL-TR-0004", status: "Shipping", origin: { ...TR["İzmir (Kemalpaşa)"], name: "İzmir (Kemalpaşa) Depo" }, destination: { ...TR.Denizli, name: "Denizli Müşteri" }, vehicle: { lat: 0, lng: 0, plate: "35 AL 004", driver: "A. Yıldız", speedKph: 76 }, meta: { startDate: "01.09.2025", endDate: "02.09.2025", transportType: "DAP" }, progress: 0.65 },
  { id: "AL-TR-0005", title: "Order Nº AL-TR-0005", status: "Shipped", origin: { ...TR["Ankara (Sincan)"], name: "Ankara (Sincan) Depo" }, destination: { ...TR.Konya, name: "Konya Müşteri" }, vehicle: { lat: 0, lng: 0, plate: "06 AL 005", driver: "D. Çetin", speedKph: 0 }, meta: { startDate: "30.08.2025", endDate: "31.08.2025", transportType: "DAT" }, progress: 1.0 },
]);

/* ===== search & filters ===== */
const filtersVisible = ref(false);
const search = ref("");
const filters = ref<{ status: string; type: string; date: string }>({ status: "", type: "", date: "" });

const visibleOrders = computed(() =>
  orders.value.filter(o => {
    const q = search.value.trim().toLowerCase();
    const qOk = !q || [o.id, o.title, o.origin.name, o.destination.name].some(x => x.toLowerCase().includes(q));
    const sOk = !filters.value.status || o.status === filters.value.status;
    const tOk = !filters.value.type || o.meta.transportType === filters.value.type;
    const dOk = !filters.value.date || o.meta.startDate === filters.value.date || o.meta.endDate === filters.value.date;
    return qOk && sOk && tOk && dOk;
  })
);
function clearFilters() { filters.value = { status: "", type: "", date: "" }; search.value = ""; }

/* ===== header cards fed by visibleOrders ===== */
const statsCardsWithTotal = computed(() => [
  {
    title: "In Transit Shipments",
    value: String(visibleOrders.value.filter(o => o.status !== "Shipped" && o.status !== "Canceled").length),
    subtitle: "Live overview"
  },
  { title: "Upcoming Departures", value: "5", subtitle: "Next 24h" },
  { title: "Upcoming Transshipments", value: "1", subtitle: "Next 24h" },
  { title: "Upcoming Arrivals", value: "0", subtitle: "Next 24h" },
]);

const badgeData = computed(() => {
  const count = (s: Status) => visibleOrders.value.filter(o => o.status === s).length;
  return {
    Shipping: { count: count("Shipping"), color: "primary", icon: "bi-truck" },
    Shipped: { count: count("Shipped"), color: "success", icon: "bi-check-circle" },
    Planned: { count: count("Planned"), color: "info", icon: "bi-calendar" },
    Warning: { count: count("Warning"), color: "warning", icon: "bi-exclamation-triangle" },
    Canceled: { count: count("Canceled"), color: "danger", icon: "bi-x-circle" },
  };
});

/* ===== Map logic (same as before, but draws visibleOrders) ===== */
const mapEl = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let overlay: L.LayerGroup | null = null;
const loading = ref(false);
let destroyed = false;
const panelVisible = ref(false);
const selectedOrder = ref<OrderWithProgress | null>(null);

const colorByStatus = (s: Status) =>
  s === "Shipping" ? "#198754" : s === "Planned" ? "#0d6efd" : s === "Warning" ? "#fd7e14" : s === "Shipped" ? "#6c757d" : "#dc3545";

const icon = (emoji: string) => L.divIcon({ html: `<div class="pin">${emoji}</div>`, className: "pin-wrapper", iconSize: [36, 36], iconAnchor: [18, 18] });

async function roadRoute(points: [number, number][]) {
  const coordStr = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
  const res = await fetch(url); if (!res.ok) throw new Error("OSRM route failed");
  const json = await res.json(); const coords = json?.routes?.[0]?.geometry?.coordinates as [number, number][];
  return coords.map(([lng, lat]) => [lat, lng]) as [number, number][];
}
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
function interpolatePoint(path: [number, number][], t: number) {
  if (!path.length) return [0, 0]; if (t <= 0) return path[0]; if (t >= 1) return path[path.length - 1];
  const seg: number[] = []; let T = 0; for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seg.push(d); T += d; }
  let a = t * T; for (let i = 1; i < path.length; i++) { if (a <= seg[i - 1]) { const r = a / seg[i - 1]; return [path[i - 1][0] + (path[i][0] - path[i - 1][0]) * r, path[i - 1][1] + (path[i][1] - path[i - 1][1]) * r]; } a -= seg[i - 1]; }
  return path[path.length - 1];
}
function attachFocusBehavior(o: OrderWithProgress, past: L.Polyline, future: L.Polyline) {
  const hi = () => { past.setStyle({ weight: 8 }); future.setStyle({ weight: 8 }); past.bringToFront(); future.bringToFront(); };
  const un = () => { past.setStyle({ weight: 5, opacity: 0.95 }); future.setStyle({ weight: 5, opacity: 0.35 }); };
  const zoom = () => { const b = past.getBounds().extend(future.getBounds()); map!.fitBounds(b, { padding: [60, 60] }); };
  [past, future].forEach(pl => { pl.on("mouseover", hi); pl.on("mouseout", un); pl.on("click", () => { hi(); zoom(); selectedOrder.value = o; panelVisible.value = true; }); });
}

async function drawAll() {
  if (!map) return;
  loading.value = true;
  if (overlay) overlay.removeFrom(map);
  overlay = L.layerGroup().addTo(map);
  const allBounds: [number, number][] = [];

  for (const [idx, o] of visibleOrders.value.entries()) {
    if (destroyed) return;
    const color = colorByStatus(o.status);
    const seq: [number, number][] = [[o.origin.lat, o.origin.lng], [o.destination.lat, o.destination.lng]];

    try {
      const snapped = await roadRoute(seq);
      const vi = Math.max(1, Math.floor(snapped.length * o.progress));
      const past = snapped.slice(0, vi + 1);
      const future = snapped.slice(vi);
      L.polyline(past, { color: "#fff", weight: 9, opacity: 0.95, lineCap: "round" }).addTo(overlay);
      L.polyline(future, { color: "#fff", weight: 9, opacity: 0.5, lineCap: "round" }).addTo(overlay);
      const pastLine = L.polyline(past, { color, weight: 5, opacity: 0.95, lineCap: "round" }).addTo(overlay);
      const futureLine = L.polyline(future, { color, weight: 5, opacity: 0.35, dashArray: "6,8", lineCap: "round" }).addTo(overlay);
      const mOrigin = L.marker([o.origin.lat, o.origin.lng], { icon: icon("📦") }).addTo(overlay);
      const mDest = L.marker([o.destination.lat, o.destination.lng], { icon: icon("🏁") }).addTo(overlay);
      attachFocusBehavior(o, pastLine, futureLine);
      ;[mOrigin, mDest].forEach(m => m.on("click", () => { selectedOrder.value = o; panelVisible.value = true; const b = pastLine.getBounds().extend(futureLine.getBounds()); map!.fitBounds(b, { padding: [60, 60] }); }));
      allBounds.push(...snapped);
    } catch {
      const viPt = interpolatePoint(seq, o.progress);
      const pastLine = L.polyline([seq[0], viPt], { color, weight: 5, opacity: 0.95 }).addTo(overlay);
      const futureLine = L.polyline([viPt, seq[1]], { color, weight: 5, opacity: 0.35, dashArray: "6,8" }).addTo(overlay);
      const mOrigin = L.marker([o.origin.lat, o.origin.lng], { icon: icon("📦") }).addTo(overlay);
      const mDest = L.marker([o.destination.lat, o.destination.lng], { icon: icon("🏁") }).addTo(overlay);
      attachFocusBehavior(o, pastLine, futureLine);
      ;[mOrigin, mDest].forEach(m => m.on("click", () => { selectedOrder.value = o; panelVisible.value = true; }));
      allBounds.push(...seq);
    }
    if (idx < visibleOrders.value.length - 1) await sleep(120);
  }

  if (allBounds.length) map!.fitBounds(L.latLngBounds(allBounds), { padding: [50, 50] });
  loading.value = false;
}

onMounted(async () => {
  if (!mapEl.value) return;
  const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 });
  const hot = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", { maxZoom: 20 });
  map = L.map(mapEl.value, { center: [39, 35], zoom: 6, layers: [osm] });
  L.control.layers({ OSM: osm, Humanitarian: hot }, {}, { position: "topleft" }).addTo(map);
  L.control.scale({ imperial: false }).addTo(map);
  await nextTick(); drawAll();
  window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => { destroyed = true; if (map) { map.remove(); map = null; } window.removeEventListener("resize", onResize); });

watch([visibleOrders, () => filtersVisible.value], async () => {
  await nextTick();
  if (map) { map.invalidateSize(); }
  drawAll();
});

function onResize() { if (map) map.invalidateSize(); }
const codeFrom = (name: string) => name.split(" ").map(s => s[0]).join("").toUpperCase().slice(0, 5);
</script>

<style scoped>
/* Layout -> full viewport height */
.orders-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding-top: .5rem;
  gap: .5rem;
}

.toolbar {
  margin: 0;
}

.cards-row {
  margin: 0;
}

/* toolbar */
.search-wrap {
  position: relative;
}

.search-wrap i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  opacity: .55;
}

.search-wrap .form-control {
  padding-left: 34px;
}

/* Cards */
.card.metric {
  border: 1px solid rgba(0, 0, 0, .05);
  border-radius: 12px;
  background: var(--bs-body-bg);
  box-shadow: 0 6px 14px rgba(16, 24, 40, .06);
  min-height: 74px;
}

.metric-title {
  font-size: .75rem;
  color: #6c757d;
  letter-spacing: .2px;
}

.metric-value {
  font-size: 1.35rem;
  font-weight: 700;
  line-height: 1.05;
}

.metric-sub {
  font-size: .72rem;
  color: #98a2b3;
}

.mini-bars {
  display: flex;
  gap: 4px;
  align-items: flex-end;
  height: 24px;
}

.mini-bars span {
  width: 6px;
  border-radius: 3px;
  background: rgba(13, 110, 253, .25);
}

.progress-thin {
  height: 3px;
  background: var(--bs-secondary-bg);
}

/* Map must fill rest of viewport */
.map.chrome {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, .06);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .4), 0 10px 20px rgba(16, 24, 40, .06);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.map-inner {
  position: relative;
  width: 100%;
  height: 100%;
}

/* Right panel */
.detail-panel {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  width: clamp(280px, 30vw, 360px);
  background: rgba(255, 255, 255, .92);
  backdrop-filter: blur(6px);
  border-left: 1px solid rgba(0, 0, 0, .06);
  z-index: 1040;
  display: flex;
  flex-direction: column;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, .06);
}

.dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e8f1ff;
  border: 1px solid #cfe2ff;
  box-shadow: inset 0 0 0 4px #0d6efd33;
}

.panel-tools {
  display: flex;
  align-items: center;
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

.pill {
  padding: 2px 8px;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 600;
}

.pill-success {
  background: #e8f7ef;
  color: #198754;
  border: 1px solid #c6f0d5;
}

.panel-route {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, .06);
}

.panel-route .code {
  font-weight: 700;
  letter-spacing: .4px;
}

.panel-route .arrow {
  color: #6b7280;
}

.panel-eta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 12px;
}

.eta-item {
  background: #f8fafc;
  border: 1px solid rgba(0, 0, 0, .05);
  border-radius: 10px;
  padding: 10px;
}

.eta-title {
  font-size: .72rem;
  color: #6b7280;
}

.eta-date {
  font-weight: 700;
  font-size: .9rem;
}

.panel-list {
  padding: 4px 8px 12px;
}

.list-row {
  width: 100%;
  border: 1px solid rgba(0, 0, 0, .06);
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: .9rem;
}

.list-row:hover {
  background: #f8fafc;
}

/* Slide anim */
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all .2s ease;
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
  background: rgba(58, 58, 58, .35);
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
  animation: spin .8s linear infinite;
}

.loading-text {
  font-size: 13px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
