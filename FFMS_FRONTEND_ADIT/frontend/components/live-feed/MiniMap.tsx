"use client";

import { useEffect, useRef, useState } from "react";
import { Employee } from "@/types/live-feed";
import { loadMapplsSDK } from "@/lib/mappls-loader";

interface MiniMapProps {
  employee: Employee;
  isPastFeed?: boolean;
}

export default function MiniMap({ employee, isPastFeed }: MiniMapProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const containerId = `mappls-mini-map-${employee.id}`;

  // Load SDK
  useEffect(() => {
    loadMapplsSDK()
      .then(() => setSdkReady(true))
      .catch((err) => {
        console.error("Mappls SDK load error in MiniMap:", err);
      });
  }, []);

  useEffect(() => {
    if (!sdkReady) return;

    const mappls = (window as any).mappls;

    if (!mapRef.current) {
      try {
        const container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = ""; // Clear existing DOM
        }

        // Create map
        mapRef.current = new mappls.Map(containerId, {
          center: [employee.lat || 19.076, employee.lng || 72.877],
          zoom: isPastFeed ? 12 : 14,
          zoomControl: isPastFeed,
          search: false,
          interactive: !!isPastFeed, // Disable interaction in grid view
        });

        mapRef.current.on("load", () => {
          renderMarker();
          if (isPastFeed) {
            renderAuditTrail();
          }
        });
      } catch (e) {
        console.error("Map init error:", e);
      }
    } else {
      renderMarker();
      if (isPastFeed) {
        renderAuditTrail();
      }
    }

    function renderMarker() {
      const map = mapRef.current;
      if (!map) return;

      if (markerRef.current) {
        try { mappls.remove({ map, layer: markerRef.current }); } catch (_) {}
      }

      const isOnline = employee.status === "online";
      
      const html = `
        <div style="
          width:36px;
          height:36px;
          border-radius:50%;
          background:linear-gradient(135deg, ${isOnline ? '#22d3a5, #4f8ef7' : '#9e9e9e, #616161'});
          border:2px solid white;
          display:flex;
          align-items:center;
          justify-content:center;
          font-weight:700;
          font-size:14px;
          color:white;
          box-shadow:0 4px 12px rgba(0,0,0,0.2);
          font-family:Inter,sans-serif;
        ">
          ${employee.avatar}
        </div>
      `;

      markerRef.current = new mappls.Marker({
        map: map,
        position: { lat: employee.lat, lng: employee.lng },
        html: html,
        offset: [0, 18]
      });

      // Recenter map
      if (!isPastFeed) {
        try {
          if (typeof map.setCenter === 'function') {
            map.setCenter({ lat: employee.lat, lng: employee.lng });
          } else if (typeof map.setView === 'function') {
            map.setView([employee.lat, employee.lng], 14);
          }
        } catch (_) {}
      }
    }

    function renderAuditTrail() {
      const map = mapRef.current;
      if (!map) return;
      
      // Mock past trail
      const pts = [
        { lat: employee.lat - 0.01, lng: employee.lng - 0.01 },
        { lat: employee.lat - 0.005, lng: employee.lng - 0.002 },
        { lat: employee.lat, lng: employee.lng }
      ];

      try {
        new mappls.Polyline({
          map: map,
          path: pts,
          strokeColor: "#4f8ef7",
          strokeOpacity: 0.8,
          strokeWeight: 4,
          fitbounds: true
        });
      } catch(e) {
        console.error("Polyline error", e);
      }
    }
  }, [employee, sdkReady, isPastFeed, containerId]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        try { mapRef.current.remove(); } catch (_) {}
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {!sdkReady && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--bg-elevated)", zIndex: 1,
          fontSize: "12px", color: "var(--text-muted)",
        }}>
          Loading Map...
        </div>
      )}
      <div
        id={containerId}
        style={{ width: "100%", height: "100%", zIndex: 0 }}
      />
    </div>
  );
}
