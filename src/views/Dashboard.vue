<template>
  <div class="orders-page">
    <div class="toolbar">
      <button class="btn" @click="fitAll">Tümünü Göster</button>
    </div>
    <div class="map" ref="mapEl">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <div class="loading-text">Rotalar hesaplanıyor…</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import L from "leaflet";

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
  meta: { startDate: string; endDate: string; transportType: string };
};
type OrderWithProgress = Order & { progress: number };

const TR: Record<string, LatLng> = {
  "İstanbul (Hadımköy)": { lat: 41.112, lng: 28.683 },
  "Kocaeli (Gebze)": { lat: 40.802, lng: 29.438 },
  "Bursa (Nilüfer)": { lat: 40.232, lng: 28.889 },
  "İzmir (Kemalpaşa)": { lat: 38.436, lng: 27.428 },
  "Ankara (Sincan)": { lat: 39.958, lng: 32.584 },
  "Mersin (Tarsus)": { lat: 36.917, lng: 34.895 },
  "Adana (Hacı Sabancı)": { lat: 37.0, lng: 35.321 },
  "Antalya (Döşemealtı)": { lat: 36.975, lng: 30.65 },
  "Gaziantep (Başpınar)": { lat: 37.069, lng: 37.379 },
  "Samsun (Tekkeköy)": { lat: 41.199, lng: 36.497 },
  Trabzon: { lat: 41.002, lng: 39.717 },
  Erzurum: { lat: 39.905, lng: 41.265 },
  Malatya: { lat: 38.355, lng: 38.333 },
  Diyarbakır: { lat: 37.915, lng: 40.23 },
  Şanlıurfa: { lat: 37.16, lng: 38.795 },
  Kayseri: { lat: 38.731, lng: 35.478 },
  Konya: { lat: 37.871, lng: 32.484 },
  Eskişehir: { lat: 39.779, lng: 30.52 },
  Denizli: { lat: 37.776, lng: 29.086 },
  Muğla: { lat: 37.214, lng: 28.363 },
  Hatay: { lat: 36.204, lng: 36.154 },
  Zonguldak: { lat: 41.456, lng: 31.798 },
};

const orders: OrderWithProgress[] = [
  {
    id: "AL-TR-0001",
    title: "Order Nº AL-TR-0001",
    status: "Shipping",
    origin: { ...TR["İstanbul (Hadımköy)"], name: "İstanbul (Hadımköy) Depo" },
    destination: { ...TR.Trabzon, name: "Trabzon Müşteri" },
    vehicle: {
      lat: 0,
      lng: 0,
      plate: "34 AL 001",
      driver: "M. Kaya",
      speedKph: 82,
    },
    meta: {
      startDate: "01.09.2025",
      endDate: "03.09.2025",
      transportType: "DAP",
    },
    progress: 0.55,
  },
  {
    id: "AL-TR-0002",
    title: "Order Nº AL-TR-0002",
    status: "Planned",
    origin: { ...TR["Kocaeli (Gebze)"], name: "Kocaeli (Gebze) Depo" },
    destination: { ...TR.Erzurum, name: "Erzurum Müşteri" },
    vehicle: {
      lat: 0,
      lng: 0,
      plate: "41 AL 002",
      driver: "E. Demir",
      speedKph: 0,
    },
    meta: {
      startDate: "02.09.2025",
      endDate: "05.09.2025",
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
      startDate: "01.09.2025",
      endDate: "04.09.2025",
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
      startDate: "01.09.2025",
      endDate: "02.09.2025",
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
      startDate: "30.08.2025",
      endDate: "31.08.2025",
      transportType: "DAT",
    },
    progress: 1.0,
  },
];

const mapEl = ref<HTMLDivElement | null>(null);
let map: L.Map | null = null;
let overlay: L.LayerGroup | null = null;
const loading = ref(false);
let destroyed = false;

const colorByStatus = (s: Status) =>
  s === "Shipping"
    ? "#198754"
    : s === "Planned"
    ? "#0d6efd"
    : s === "Warning"
    ? "#fd7e14"
    : s === "Shipped"
    ? "#6c757d"
    : "#dc3545";

const icon = (emoji: string) =>
  L.divIcon({
    html: `<div class="pin">${emoji}</div>`,
    className: "pin-wrapper",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });

async function roadRoute(points: [number, number][]) {
  const coordStr = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("OSRM route failed");
  const json = await res.json();
  const coords = json?.routes?.[0]?.geometry?.coordinates as [number, number][];
  return coords.map(([lng, lat]) => [lat, lng]) as [number, number][];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function interpolatePoint(
  path: [number, number][],
  t: number
): [number, number] {
  if (path.length === 0) return [0, 0];
  if (t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];
  const segLens: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const dx = path[i][0] - path[i - 1][0],
      dy = path[i][1] - path[i - 1][1];
    const d = Math.hypot(dx, dy);
    segLens.push(d);
    total += d;
  }
  let target = t * total;
  for (let i = 1; i < path.length; i++) {
    if (target <= segLens[i - 1]) {
      const r = target / segLens[i - 1];
      return [
        path[i - 1][0] + (path[i][0] - path[i - 1][0]) * r,
        path[i - 1][1] + (path[i][1] - path[i - 1][1]) * r,
      ];
    }
    target -= segLens[i - 1];
  }
  return path[path.length - 1];
}

function attachFocusBehavior(opts: {
  past: L.Polyline;
  future: L.Polyline;
  vehicleMarker: L.Marker;
}) {
  const { past, future, vehicleMarker } = opts;
  const highlight = () => {
    past.setStyle({ weight: 8 });
    future.setStyle({ weight: 8 });
    past.bringToFront();
    future.bringToFront();
  };
  const unhighlight = () => {
    past.setStyle({ weight: 5, opacity: 0.95 });
    future.setStyle({ weight: 5, opacity: 0.35 });
  };
  const zoomTo = () => {
    const b = past.getBounds().extend(future.getBounds());
    map!.fitBounds(b, { padding: [60, 60] });
  };
  [past, future, vehicleMarker].forEach((it) => {
    it.on("mouseover", highlight);
    it.on("mouseout", unhighlight);
    it.on("click", () => {
      highlight();
      zoomTo();
      vehicleMarker.openPopup();
    });
  });
}

async function drawAll() {
  if (!map) return;
  loading.value = true;

  if (overlay) overlay.removeFrom(map);
  overlay = L.layerGroup().addTo(map);

  const allBounds: [number, number][] = [];

  for (const [idx, o] of orders.entries()) {
    if (destroyed) return;

    const color = colorByStatus(o.status);
    const seq: [number, number][] = [
      [o.origin.lat, o.origin.lng],
      [o.destination.lat, o.destination.lng],
    ];

    try {
      const snapped = await roadRoute(seq);

      const veh = interpolatePoint(snapped, o.progress);
      o.vehicle.lat = veh[0];
      o.vehicle.lng = veh[1];

      const vi = Math.max(1, Math.floor(snapped.length * o.progress));
      const past = snapped.slice(0, vi + 1);
      const future = snapped.slice(vi);

      L.polyline(past, {
        color: "#fff",
        weight: 8,
        opacity: 0.9,
        lineCap: "round",
      }).addTo(overlay);
      L.polyline(future, {
        color: "#fff",
        weight: 8,
        opacity: 0.5,
        lineCap: "round",
      }).addTo(overlay);

      const pastLine = L.polyline(past, {
        color,
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
      }).addTo(overlay);
      const futureLine = L.polyline(future, {
        color,
        weight: 5,
        opacity: 0.35,
        dashArray: "6,8",
        lineCap: "round",
      }).addTo(overlay);

      const mOrigin = L.marker([o.origin.lat, o.origin.lng], {
        icon: icon("📦"),
      }).addTo(overlay);
      const mDest = L.marker([o.destination.lat, o.destination.lng], {
        icon: icon("🏁"),
      }).addTo(overlay);
      const mVeh = L.marker([o.vehicle.lat, o.vehicle.lng], {
        icon: icon("🚚"),
      })
        .bindPopup(
          `
          <div style="min-width: 220px">
            <div style="font-weight:700;margin-bottom:4px">${o.title}</div>
            <div><b>Durum:</b> ${o.status}</div>
            <div><b>Çıkış:</b> ${o.origin.name}</div>
            <div><b>Varış:</b> ${o.destination.name}</div>
            <div><b>Plaka:</b> ${o.vehicle.plate}</div>
            <div><b>Sürücü:</b> ${o.vehicle.driver ?? "-"}</div>
            <div><b>Hız:</b> ${o.vehicle.speedKph ?? 0} km/sa</div>
            <div style="margin-top:6px"><b>Taşıma:</b> ${
              o.meta.transportType
            }</div>
            <div><b>Başlangıç:</b> ${o.meta.startDate}</div>
            <div><b>Bitiş:</b> ${o.meta.endDate}</div>
          </div>
        `
        )
        .addTo(overlay);

      attachFocusBehavior({
        past: pastLine,
        future: futureLine,
        vehicleMarker: mVeh,
      });
      mOrigin.on("click", () => pastLine.fire("click"));
      mDest.on("click", () => pastLine.fire("click"));

      allBounds.push(...snapped);
    } catch {
      const line = L.polyline(seq, {
        color,
        weight: 5,
        opacity: 0.85,
        dashArray: "6,6",
      }).addTo(overlay);
      const mOrigin = L.marker([o.origin.lat, o.origin.lng], {
        icon: icon("📦"),
      }).addTo(overlay);
      const mDest = L.marker([o.destination.lat, o.destination.lng], {
        icon: icon("🏁"),
      }).addTo(overlay);
      const flatVeh = interpolatePoint(seq, o.progress);
      const mVeh = L.marker(flatVeh, { icon: icon("🚚") })
        .bindPopup(
          `<b>${o.title}</b><br/>Durum: ${o.status}<br/>Çıkış: ${o.origin.name}<br/>Varış: ${o.destination.name}`
        )
        .addTo(overlay);

      line.on("click", () => {
        line.setStyle({ weight: 8 });
        map!.fitBounds(line.getBounds(), { padding: [60, 60] });
        mVeh.openPopup();
        setTimeout(() => line.setStyle({ weight: 5 }), 800);
      });
      mOrigin.on("click", () => line.fire("click"));
      mDest.on("click", () => line.fire("click"));
      allBounds.push(...seq);
    }

    if (idx < orders.length - 1) await sleep(200);
  }

  if (allBounds.length)
    map!.fitBounds(L.latLngBounds(allBounds), { padding: [50, 50] });
  loading.value = false;
}

function fitAll() {
  if (!map) return;
  const pts: [number, number][] = [];
  orders.forEach((o) =>
    pts.push(
      [o.origin.lat, o.origin.lng],
      [o.destination.lat, o.destination.lng]
    )
  );
  map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] });
}

onMounted(() => {
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

  drawAll();
});

onBeforeUnmount(() => {
  destroyed = true;
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.orders-page {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 80vh;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 4px 8px;
}

.btn {
  border: 1px solid #d0d7de;
  padding: 6px 10px;
  border-radius: 10px;
  background: #ffffff;
  cursor: pointer;
  font-weight: 600;
}
.btn:hover {
  background: #f6f8fa;
}

.map {
  position: relative;
  width: 100%;
  min-height: calc(89vh - 120px);
  border-radius: 8px;
  overflow: hidden;
}

/* Emoji marker */
.pin {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  font-size: 20px;
  line-height: 1;
}

.loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  background: rgba(58, 58, 58, 0.379);
  color: #222; /* daha koyu ve net */
  font-weight: 700;
  z-index: 9999;
  pointer-events: none;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e5e7eb;
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-text {
  font-size: 14px;
  letter-spacing: 0.2px;
  color: #ffffff;
  text-shadow: #222;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
