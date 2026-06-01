"use client";

import { useEffect, useRef, useState } from "react";
import { loadMapplsSDK } from "@/lib/mappls-loader";

interface Geofence {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius: number;
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

const MAP_CONTAINER_ID = "mappls-geofence-map";

export default function GeofenceMap({
  selectedEmployeeName,
  currentLocation,
  geofences,
}: Props) {
  const mapRef = useRef<any>(null);
  const layersRef = useRef<{
    markers: any[];
    circles: any[];
    activeMarker?: any;
  }>({ markers: [], circles: [] });
  const [sdkReady, setSdkReady] = useState(false);

  // Step 1: Load Mappls SDK once
  useEffect(() => {
    loadMapplsSDK()
      .then(() => setSdkReady(true))
      .catch((err) => console.error("Mappls SDK load error:", err));
  }, []);

  // Step 2: Initialize map and render layers after SDK is ready
  useEffect(() => {
    if (!sdkReady) return;

    const mappls = (window as any).mappls;

    // Initialize map using container ID string (required by Mappls SDK)
    if (!mapRef.current) {
      try {
        mapRef.current = new mappls.Map(MAP_CONTAINER_ID, {
          center: { lat: currentLocation.lat, lng: currentLocation.lng },
          zoom: 13,
          zoomControl: true,
          search: false,
        });

        // Wait for map to be ready before adding layers
        mapRef.current.on("load", () => {
          renderLayers();
        });

        // Fallback: also try rendering after a short delay
        setTimeout(() => {
          if (mapRef.current) renderLayers();
        }, 1000);

      } catch (e) {
        console.error("Map init error:", e);
      }
    } else {
      renderLayers();
    }

    function renderLayers() {
      const map = mapRef.current;
      if (!map) return;

      // Clear old layers
      layersRef.current.markers.forEach((m: any) => {
        try { mappls.remove({ map, layer: m }); } catch (_) {}
      });
      layersRef.current.circles.forEach((c: any) => {
        try { mappls.remove({ map, layer: c }); } catch (_) {}
      });
      if (layersRef.current.activeMarker) {
        try { mappls.remove({ map, layer: layersRef.current.activeMarker }); } catch (_) {}
      }
      layersRef.current.markers = [];
      layersRef.current.circles = [];

      // Draw Geofence circles
      geofences.forEach((gf) => {
        const R = 6371e3;
        const φ1 = (currentLocation.lat * Math.PI) / 180;
        const φ2 = (gf.lat * Math.PI) / 180;
        const Δφ = ((gf.lat - currentLocation.lat) * Math.PI) / 180;
        const Δλ = ((gf.lng - currentLocation.lng) * Math.PI) / 180;
        const a =
          Math.sin(Δφ / 2) ** 2 +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
        const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const isInside = distance <= gf.radius;

        const color = isInside ? "#22d3a5" : "#4f8ef7";
        const fillOpacity = isInside ? 0.25 : 0.1;

        try {
          const circle = new mappls.Circle({
            map: map,
            center: { lat: gf.lat, lng: gf.lng },
            radius: gf.radius,
            fillColor: color,
            fillOpacity: fillOpacity,
            strokeColor: color,
            strokeWeight: 2,
            popupHtml: `<div style="font-family:sans-serif;padding:4px;">
                <strong style="font-size:13px;">${gf.name}</strong><br/>
                <span style="font-size:11px;color:#777;">Radius: ${gf.radius}m</span><br/>
                <span style="font-size:12px;font-weight:600;color:${color};">
                  ${isInside ? "● Occupied" : "○ Clear"}
                </span>
              </div>`
          });
          layersRef.current.circles.push(circle);
        } catch (e) {
          console.error("Circle draw error:", e);
        }
      });

      // Draw active employee marker
      try {
        const activeMarker = new mappls.Marker({
          map: map,
          position: { lat: currentLocation.lat, lng: currentLocation.lng },
          html: `
            <div style="position:relative;width:42px;height:42px;transform:translate(-50%,-50%);">
              <div style="
                position:absolute;width:42px;height:42px;
                border-radius:50%;background:rgba(79,142,247,0.25);
                animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
              "></div>
              <div style="
                position:absolute;top:11px;left:11px;
                width:20px;height:20px;border-radius:50%;
                background:#4f8ef7;border:3px solid white;
                box-shadow:0 4px 10px rgba(0,0,0,0.3);
              "></div>
            </div>
            <style>@keyframes ping{75%,100%{transform:scale(2);opacity:0;}}</style>
          `,
          popupHtml: `<div style="font-family:sans-serif;min-width:140px;padding:5px;">
              <strong style="font-size:13px;">${selectedEmployeeName}</strong>
              <div style="font-size:11px;color:#777;margin-top:2px;">Status: ${currentLocation.status}</div>
              <div style="font-size:11px;color:#777;">Speed: ${currentLocation.speed}</div>
              <div style="font-size:11px;color:#777;">Last: ${currentLocation.time}</div>
            </div>`
        });

        layersRef.current.activeMarker = activeMarker;
      } catch (e) {
        console.error("Marker draw error:", e);
      }

      // Fit bounds (Mappls uses Mapbox format: [[minLng, minLat], [maxLng, maxLat]])
      try {
        let minLat = currentLocation.lat, maxLat = currentLocation.lat;
        let minLng = currentLocation.lng, maxLng = currentLocation.lng;
        
        geofences.forEach((gf) => {
          if (gf.lat < minLat) minLat = gf.lat;
          if (gf.lat > maxLat) maxLat = gf.lat;
          if (gf.lng < minLng) minLng = gf.lng;
          if (gf.lng > maxLng) maxLng = gf.lng;
        });

        map.fitBounds([
          [minLng, minLat],
          [maxLng, maxLat]
        ], { padding: 60 });
      } catch (e) {
        console.error("fitBounds error:", e);
      }
    }
  }, [sdkReady, currentLocation, geofences, selectedEmployeeName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (_) {}
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "450px", position: "relative" }}>
      {!sdkReady && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--bg-card)", zIndex: 10,
          fontSize: "14px", color: "var(--text-muted)",
          fontFamily: "monospace"
        }}>
          Loading Mappls Map...
        </div>
      )}
      {/* Mappls requires a string ID — DO NOT use ref here */}
      <div
        id={MAP_CONTAINER_ID}
        style={{ width: "100%", height: "100%", minHeight: "450px" }}
      />
    </div>
  );
}
