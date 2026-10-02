"use client";

import { useEffect, useRef, useState } from "react";
import type { ServiceCardItem } from "@/lib/services/businesses";

type ServicesMapProps = {
  services: ServiceCardItem[];
  cityName?: string;
  cityId?: string;
};

// Known coordinates for MVP cities
const CITY_COORDINATES: Record<string, [number, number]> = {
  zarate: [-34.0958, -59.0243],
  "1": [-34.0958, -59.0243],
  campana: [-34.1687, -58.9591],
  "2": [-34.1687, -58.9591],
  escobar: [-34.3494, -58.7944],
  "3": [-34.3494, -58.7944],
  pilar: [-34.4587, -58.9142],
  "4": [-34.4587, -58.9142],
};

// Deterministic coordinate generator based on service address / name
function getServiceCoordinates(
  service: ServiceCardItem,
  baseCenter: [number, number],
  index: number
): [number, number] {
  // Known street coordinates for Zárate
  const addr = (service.address || "").toLowerCase();
  if (addr.includes("ituzaingó 640")) return [-34.0982, -59.021];
  if (addr.includes("almirante brown 280")) return [-34.0935, -59.0265];
  if (addr.includes("rivadavia 530")) return [-34.097, -59.0235];
  if (addr.includes("19 de marzo 415")) return [-34.095, -59.025];
  if (addr.includes("rivadavia 920")) return [-34.101, -59.0205];
  if (addr.includes("yrigoyen 1120")) return [-34.1025, -59.019];
  if (addr.includes("lavalle 850")) return [-34.0995, -59.0295];
  if (addr.includes("ituzaingó 210")) return [-34.0945, -59.0245];
  if (addr.includes("san martín 184")) return [-34.094, -59.0238];
  if (addr.includes("justa lima 342")) return [-34.0965, -59.026];

  // Deterministic scatter around city center
  const str = String(service.id || service.name || index);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180);
  const radius = 0.003 + (Math.abs(hash >> 3) % 15) * 0.0008;

  return [
    baseCenter[0] + Math.sin(angle) * radius,
    baseCenter[1] + Math.cos(angle) * radius,
  ];
}

export default function ServicesMap({
  services,
  cityId,
}: ServicesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedService, setSelectedService] = useState<ServiceCardItem | null>(null);
  const [isLeafletReady, setIsLeafletReady] = useState(false);

  // Load Leaflet CSS and JS dynamically on the client
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if Leaflet CSS is already injected
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Check if Leaflet JS is already loaded
    if ((window as any).L) {
      setIsLeafletReady(true);
      return;
    }

    if (!document.getElementById("leaflet-js")) {
      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        setIsLeafletReady(true);
      };
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if ((window as any).L) {
          setIsLeafletReady(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Initialize and update the map once Leaflet is ready
  useEffect(() => {
    if (!isLeafletReady || !mapContainerRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const centerKey = (cityId || "1").toLowerCase();
    const cityCenter: [number, number] =
      CITY_COORDINATES[centerKey] || CITY_COORDINATES["1"];

    // Cleanup previous map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(cityCenter, 14);

    mapInstanceRef.current = map;

    // 100% Free OpenStreetMap tile layer (No API key required)
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    // Custom pulse icon marker
    const createCustomIcon = (name: string, isPaid: boolean) => {
      return L.divIcon({
        className: "custom-map-marker",
        html: `
          <div class="marker-pin ${isPaid ? "marker-paid" : "marker-regular"}">
            <i class="fa-solid fa-location-dot"></i>
          </div>
          <div class="marker-pulse"></div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
      });
    };

    const markersGroup = L.featureGroup();

    services.forEach((service, idx) => {
      const coords = getServiceCoordinates(service, cityCenter, idx);
      const isPaid = Boolean(service.paid);

      const marker = L.marker(coords, {
        icon: createCustomIcon(service.name, isPaid),
        title: service.name,
      });

      const popupContent = `
        <div class="map-popup-card">
          ${
            service.image
              ? `<div class="map-popup-image" style="background-image: url('${service.image}')"></div>`
              : ""
          }
          <div class="map-popup-body">
            <h4 class="map-popup-title">${service.name}</h4>
            ${
              service.label
                ? `<span class="map-popup-label">${service.label}</span>`
                : ""
            }
            <p class="map-popup-address"><i class="fa-solid fa-map-pin me-1"></i>${
              service.address || "Location in city"
            }</p>
            ${
              service.phone
                ? `<a href="tel:${service.phone}" class="map-popup-phone"><i class="fa-solid fa-phone me-1"></i>${service.phone}</a>`
                : ""
            }
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "custom-leaflet-popup",
        maxWidth: 280,
      });

      marker.on("click", () => {
        setSelectedService(service);
      });

      marker.addTo(markersGroup);
    });

    markersGroup.addTo(map);

    if (services.length > 0) {
      map.fitBounds(markersGroup.getBounds().pad(0.12));
    }

    // Ensure map tiles layout properly on mount
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLeafletReady, services, cityId]);

  return (
    <div className="services-map-wrapper">
      <div className="map-top-bar">
        <div className="map-top-info">
          <i className="fa-solid fa-map-location-dot map-title-icon"></i>
          <div>
            <h4 className="map-title-heading">Service Map Locations</h4>
            <p className="map-subtitle-text">
              Showing <strong>{services.length}</strong> located points on the map
            </p>
          </div>
        </div>
        <div className="map-legend">
          <span className="legend-item">
            <span className="legend-dot dot-verified"></span> Active Coverage
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-regular"></span> Standard
          </span>
        </div>
      </div>

      <div className="map-frame-container">
        {!isLeafletReady && (
          <div className="map-loading-overlay">
            <div className="spinner-border text-primary" role="status"></div>
            <span className="mt-2 text-white">Loading interactive map...</span>
          </div>
        )}
        <div ref={mapContainerRef} className="leaflet-map-element" />
      </div>
    </div>
  );
}
