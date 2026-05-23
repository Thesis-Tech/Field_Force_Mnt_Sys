"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RoutePoint {
  lat: number;
  lng: number;
  time: string;
  speed: string;
  status: string;
}

interface Props {
  selectedEmployeeName: string;
  route: RoutePoint[];
  activePointIndex: number;
}

export default function PlaybackMap({
  selectedEmployeeName,
  route,
  activePointIndex,
}: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<{
    polyline?: L.Polyline;
    markers: L.Marker[];
    activeMarker?: L.Marker;
  }>({ markers: [] });

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
      }).setView([19.076, 72.877], 12);

      L.control.zoom({ position: "topright" }).addTo(mapRef.current);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;
    if (!map) return;

    // Clear old layers
    if (layersRef.current.polyline) {
      layersRef.current.polyline.remove();
    }
    layersRef.current.markers.forEach((m) => m.remove());
    if (layersRef.current.activeMarker) {
      layersRef.current.activeMarker.remove();
    }

    layersRef.current.markers = [];

    // Draw full polyline
    const latLngs = route.map((pt) => [pt.lat, pt.lng] as [number, number]);
    if (latLngs.length > 0) {
      const polyline = L.polyline(latLngs, {
        color: "#0052ff", // Sleek Blue path for Selected employee
        weight: 5,
        opacity: 0.85,
        dashArray: "10, 5",
      }).addTo(map);

      layersRef.current.polyline = polyline;

      // Draw Start Marker
      const startPt = route[0];
      const startIcon = L.divIcon({
        html: `<div style="
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #4f8ef7;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const startMarker = L.marker([startPt.lat, startPt.lng], { icon: startIcon })
        .addTo(map)
        .bindPopup(`<strong>Start Position</strong><br/>Time: ${startPt.time}`);
      layersRef.current.markers.push(startMarker);

      // Draw End Marker
      const endPt = route[route.length - 1];
      const endIcon = L.divIcon({
        html: `<div style="
          width: 14px; height: 14px;
          border-radius: 50%;
          background: #ef4444;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        className: "",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const endMarker = L.marker([endPt.lat, endPt.lng], { icon: endIcon })
        .addTo(map)
        .bindPopup(`<strong>Destination</strong><br/>Time: ${endPt.time}`);
      layersRef.current.markers.push(endMarker);
    }

    // Draw Active playback pointer marker
    if (route.length > 0 && activePointIndex < route.length) {
      const activePt = route[activePointIndex];

      const activeIcon = L.divIcon({
        html: `
          <div style="position: relative; width: 44px; height: 44px;">
            <div style="
              position: absolute;
              width: 44px; height: 44px;
              border-radius: 50%;
              background: rgba(0, 82, 255, 0.25);
              animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: absolute;
              top: 12px; left: 12px;
              width: 20px; height: 20px;
              border-radius: 50%;
              background: #0052ff;
              border: 3.5px solid white;
              box-shadow: 0 4px 10px rgba(0,0,0,0.35);
              display: flex;
              align-items: center;
              justify-content: center;
            ">
            </div>
          </div>
          <style>
            @keyframes ping {
              75%, 100% {
                transform: scale(2.2);
                opacity: 0;
              }
            }
          </style>
        `,
        className: "",
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const activeMarker = L.marker([activePt.lat, activePt.lng], { icon: activeIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:Inter,sans-serif;min-width:145px;padding:2px;">
            <strong style="font-size:13px;color:var(--text-primary);">${selectedEmployeeName}</strong>
            <div style="font-size:11px;color:#666;margin-top:4px;">⏱ Time: ${activePt.time}</div>
            <div style="font-size:11px;color:#666;">⚡ Speed: ${activePt.speed}</div>
            <div style="font-size:11px;color:#666;">📍 Status: ${activePt.status}</div>
          </div>`
        );
      
      activeMarker.openPopup();
      layersRef.current.activeMarker = activeMarker;

      // Smooth pan to active point
      map.panTo([activePt.lat, activePt.lng]);
    }

    // Auto-fit bounds if first load or path changes
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [55, 55] });
    }
  }, [route, activePointIndex, selectedEmployeeName]);

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
