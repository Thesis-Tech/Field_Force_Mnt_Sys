"use client";

import { useEffect, useRef, useState } from "react";
import { loadMapplsSDK } from "@/lib/mappls-loader";

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

const MAP_CONTAINER_ID = "mappls-playback-map";

export default function PlaybackMap({
  selectedEmployeeName,
  route,
  activePointIndex,
}: Props) {
  const mapRef = useRef<any>(null);
  const layersRef = useRef<{
    polyline?: any;
    markers: any[];
    activeMarker?: any;
  }>({ markers: [] });
  const [sdkReady, setSdkReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Mappls SDK once
  useEffect(() => {
    loadMapplsSDK()
      .then(() => setSdkReady(true))
      .catch((err) => {
        console.error("Mappls SDK load error:", err);
        setLoadError(err.message || "Failed to load Mappls SDK");
      });
  }, []);

  useEffect(() => {
    if (!sdkReady) return;

    const mappls = (window as any).mappls;

    // Initialize map if not yet done
    if (!mapRef.current) {
      try {
        const container = document.getElementById(MAP_CONTAINER_ID);
        if (container) {
          container.innerHTML = ""; // Clear existing DOM to prevent Mappls destroy crash on HMR
        }

        mapRef.current = new mappls.Map(MAP_CONTAINER_ID, {
          center: [19.076, 72.877],
          zoom: 12,
          zoomControl: true,
          search: false,
        });

        mapRef.current.on("load", () => {
          renderLayers();
        });

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
      try {
        const map = mapRef.current;
        if (!map) return;

        // Clear old layers
        if (layersRef.current.polyline) {
          try { mappls.remove({ map, layer: layersRef.current.polyline }); } catch (_) {}
        }
        if (layersRef.current.directionPlugin) {
          try { mappls.remove({ map, layer: layersRef.current.directionPlugin }); } catch (_) {}
        }
        layersRef.current.markers.forEach((m) => {
          try { mappls.remove({ map, layer: m }); } catch (_) {}
        });
        if (layersRef.current.activeMarker) {
          try { mappls.remove({ map, layer: layersRef.current.activeMarker }); } catch (_) {}
        }

      layersRef.current.markers = [];

      // Draw full polyline
      const latLngs = route.map((pt) => ({ lat: pt.lat, lng: pt.lng }));
      if (latLngs.length > 0) {
        const polyline = mappls.Polyline({
          map: map,
          path: latLngs,
          strokeColor: "#0052ff",
          strokeWeight: 5,
          strokeOpacity: 0.85,
          fitbounds: false
        });

        layersRef.current.polyline = polyline;

        // Use Mappls Direction API to get accurate road-snapped route
        try {
          if (typeof mappls.direction === 'function') {
            const startPt = route[0];
            const endPt = route[route.length - 1];
            
            let viaPoints = "";
            if (route.length > 2) {
              // Extract up to 20 waypoints to prevent API rejection for too many vias
              const step = Math.ceil((route.length - 2) / 20);
              const vias = [];
              for (let i = 1; i < route.length - 1; i += step) {
                if (route[i].lat && route[i].lng) {
                  vias.push(`${route[i].lat},${route[i].lng}`);
                }
              }
              viaPoints = vias.join(";");
            }

            layersRef.current.directionPlugin = mappls.direction({
              map: map,
              start: `${startPt.lat},${startPt.lng}`,
              end: `${endPt.lat},${endPt.lng}`,
              via: viaPoints,
              profile: "driving",
              strokeWidth: 5,
              strokeColor: "#0052ff",
              fitBounds: false,
              hideMarkers: true // We draw our own markers
            });
          }
        } catch (dirErr) {
          console.warn("Mappls direction plugin failed, falling back to polyline", dirErr);
        }

        // Draw Start Marker
        const startPt = route[0];
        const startMarker = new mappls.Marker({
          map: map,
          position: { lat: startPt.lat, lng: startPt.lng },
          html: `<div style="
            width: 14px; height: 14px;
            border-radius: 50%;
            background: #4f8ef7;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transform: translate(-50%, -50%);
          "></div>`,
          popupHtml: `<div style="padding: 5px;"><strong>Start Position</strong><br/>Time: ${startPt.time}</div>`
        });
        layersRef.current.markers.push(startMarker);

        // Draw End Marker
        const endPt = route[route.length - 1];
        const endMarker = new mappls.Marker({
          map: map,
          position: { lat: endPt.lat, lng: endPt.lng },
          html: `<div style="
            width: 14px; height: 14px;
            border-radius: 50%;
            background: #ef4444;
            border: 3px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            transform: translate(-50%, -50%);
          "></div>`,
          popupHtml: `<div style="padding: 5px;"><strong>Destination</strong><br/>Time: ${endPt.time}</div>`
        });
        layersRef.current.markers.push(endMarker);
      }

      // Draw Active playback pointer marker
      if (route.length > 0 && activePointIndex < route.length) {
        const activePt = route[activePointIndex];

        const activeMarker = new mappls.Marker({
          map: map,
          position: { lat: activePt.lat, lng: activePt.lng },
          html: `
            <div style="position: relative; width: 44px; height: 44px; transform: translate(-50%, -50%);">
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
          popupHtml: `<div style="font-family:Inter,sans-serif;min-width:145px;padding:5px;">
              <strong style="font-size:13px;color:var(--text-primary);">${selectedEmployeeName}</strong>
              <div style="font-size:11px;color:#666;margin-top:4px;">⏱ Time: ${activePt.time}</div>
              <div style="font-size:11px;color:#666;">⚡ Speed: ${activePt.speed}</div>
              <div style="font-size:11px;color:#666;">📍 Status: ${activePt.status}</div>
            </div>`
        });
        
        layersRef.current.activeMarker = activeMarker;

        // Smooth pan to active point (Leaflet format: [lat, lng])
        map.panTo([activePt.lat, activePt.lng]);
      }

      // Auto-fit bounds if first load or path changes
      if (latLngs.length > 0) {
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        let validPoints = 0;
        latLngs.forEach(pt => {
          const lat = Number(pt.lat);
          const lng = Number(pt.lng);
          if (!isNaN(lat) && !isNaN(lng)) {
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            validPoints++;
          }
        });

        if (validPoints > 0 && minLat <= 90 && maxLat >= -90 && minLng <= 180 && maxLng >= -180) {
          try {
            const L = (window as any).L;
            if (L && typeof L.latLngBounds === 'function' && typeof L.latLng === 'function') {
              const bounds = L.latLngBounds(
                L.latLng(minLat, minLng),
                L.latLng(maxLat, maxLng)
              );
              map.fitBounds(bounds, { padding: [55, 55] });
            } else if (map.fitBounds) {
              map.fitBounds([
                [minLng, minLat],
                [maxLng, maxLat]
              ], { padding: 55 });
            }
          } catch (e) {
            console.error("PlaybackMap fitBounds error:", e);
          }
        }
      }
    } catch (err) {
        console.error("renderLayers caught an error:", err);
      }
    }
  }, [route, activePointIndex, selectedEmployeeName, sdkReady]);

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
    <div style={{ width: "100%", height: "100%", minHeight: "300px", position: "relative" }}>
      {loadError ? (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "var(--bg-card)", zIndex: 10,
          padding: "20px", textAlign: "center", gap: "10px"
        }}>
          <span style={{ fontSize: "24px" }}>⚠️</span>
          <div style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>Map Load Failed</div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", maxWidth: "260px" }}>{loadError}</div>
        </div>
      ) : !sdkReady ? (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--bg-card)", zIndex: 10,
          fontSize: "14px", color: "var(--text-muted)",
          fontFamily: "monospace"
        }}>
          Loading Mappls Map...
        </div>
      ) : null}
      <div
        id={MAP_CONTAINER_ID}
        style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
      />
    </div>
  );
}
