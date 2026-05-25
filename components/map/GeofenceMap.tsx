"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Geofence {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number; // in meters
}

interface CurrentLocation {
  lat: number;
  lng: number;
  time: string;
  speed: string;
  status: string;
}

interface Props {
  selectedEmployeeName: string;
  currentLocation: CurrentLocation;
  geofences: Geofence[];
}

export default function GeofenceMap({
  selectedEmployeeName,
  currentLocation,
  geofences,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<{
    markers: L.Marker[];
    circles: L.Circle[];
    activeMarker?: L.Marker;
  }>({ markers: [], circles: [] });

  useEffect(() => {
    // Fix leaflet default marker icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Initialize map if not yet done
    if (!mapRef.current && containerRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
      }).setView([currentLocation.lat, currentLocation.lng], 13);

      L.control.zoom({ position: "topright" }).addTo(mapRef.current);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    if (!map) return;

    // Clear old layers
    layersRef.current.markers.forEach((m) => m.remove());
    layersRef.current.circles.forEach((c) => c.remove());
    if (layersRef.current.activeMarker) {
      layersRef.current.activeMarker.remove();
    }

    layersRef.current.markers = [];
    layersRef.current.circles = [];

    // Draw Geofences
    geofences.forEach((gf) => {
      // Determine if active route point is inside this geofence
      const distance = map.distance([currentLocation.lat, currentLocation.lng], [gf.lat, gf.lng]);
      const isInside = distance <= gf.radius;

      const color = isInside ? "#22d3a5" : "#4f8ef7"; // Green if inside, Blue if outside
      const fillOpacity = isInside ? 0.25 : 0.1;

      const circle = L.circle([gf.lat, gf.lng], {
        radius: gf.radius,
        color: color,
        weight: 2,
        fillColor: color,
        fillOpacity: fillOpacity,
        dashArray: isInside ? "none" : "5, 5",
      })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;padding:4px;">
            <strong style="color:var(--text-primary);font-size:13px;">${gf.name}</strong><br/>
            <span style="font-size:11px;color:#777;">Geofence Zone (${gf.radius}m Radius)</span><br/>
            <span style="font-size:12px;font-weight:600;color:${color};margin-top:4px;display:inline-block;">
              ${isInside ? "● Occupied" : "○ Clear"}
            </span>
          </div>`
        );

      layersRef.current.circles.push(circle);
    });

    // Draw active employee current marker
    const activeIcon = L.divIcon({
      html: `
        <div style="position: relative; width: 42px; height: 42px;">
          <div style="
            position: absolute;
            width: 42px; height: 42px;
            border-radius: 50%;
            background: rgba(79, 142, 247, 0.25);
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: absolute;
            top: 11px; left: 11px;
            width: 20px; height: 20px;
            border-radius: 50%;
            background: var(--accent-blue, #4f8ef7);
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
          </div>
        </div>
        <style>
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        </style>
      `,
      className: "",
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

    const activeMarker = L.marker([currentLocation.lat, currentLocation.lng], { icon: activeIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:Inter,sans-serif;min-width:140px;">
          <strong style="font-size:13px;color:var(--text-primary);">${selectedEmployeeName}</strong>
          <div style="font-size:11px;color:#777;margin-top:2px;">Status: ${currentLocation.status}</div>
          <div style="font-size:11px;color:#777;">Speed: ${currentLocation.speed}</div>
          <div style="font-size:11px;color:#777;">Last Logged: ${currentLocation.time}</div>
        </div>`
      );
    
    activeMarker.openPopup();
    layersRef.current.activeMarker = activeMarker;

    // Smooth pan and fit bounds
    const bounds = L.latLngBounds([[currentLocation.lat, currentLocation.lng]]);
    geofences.forEach((gf) => {
      bounds.extend([gf.lat, gf.lng]);
    });
    map.fitBounds(bounds, { padding: [60, 60] });
  }, [currentLocation, geofences, selectedEmployeeName]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "0",
        minHeight: "450px",
      }}
    />
  );
}
