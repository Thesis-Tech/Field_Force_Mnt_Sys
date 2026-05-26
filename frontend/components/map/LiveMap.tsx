"use client";

import { useEffect, useRef } from "react";
import type { Employee } from "@/store/slices/employeeSlice";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  employees: Employee[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function LiveMap({
  employees,
  selectedId,
  onSelect,
}: Props) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Fix default icon
    delete (L.Icon.Default.prototype as any)._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Create map only once
    if (!mapRef.current && containerRef.current) {
      mapRef.current = L.map(containerRef.current).setView(
        [19.076, 72.877],
        10
      );

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
        }
      ).addTo(mapRef.current);
    }

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new markers
    employees.forEach((emp) => {
      const isSelected = emp.id === selectedId;

      const icon = L.divIcon({
        html: `
          <div style="
            width:${isSelected ? 44 : 36}px;
            height:${isSelected ? 44 : 36}px;
            border-radius:50%;
            background:linear-gradient(135deg,#22d3a5,#4f8ef7);
            border:${isSelected
            ? "3px solid #fff"
            : "2px solid rgba(255,255,255,0.6)"
          };
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:700;
            font-size:12px;
            color:white;
            box-shadow:0 4px 12px rgba(34,211,165,0.4);
            font-family:Inter,sans-serif;
          ">
            ${emp.avatar}
          </div>
        `,
        className: "",
        iconSize: [
          isSelected ? 44 : 36,
          isSelected ? 44 : 36,
        ],
        iconAnchor: [
          isSelected ? 22 : 18,
          isSelected ? 22 : 18,
        ],
      });

      const marker = L.marker([emp.lat, emp.lng], { icon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:160px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">
              ${emp.name}
            </div>

            <div style="font-size:12px;color:#666;">
              ${emp.role}
            </div>

            <div style="font-size:11px;color:#999;margin-top:6px;">
              📍 ${emp.territory}
            </div>
          </div>
        `)
        .on("click", () => onSelect(emp.id));

      if (isSelected) {
        marker.openPopup();
      }

      markersRef.current.push(marker);
    });

    // Focus selected employee
    if (selectedId) {
      const emp = employees.find(
        (e) => e.id === selectedId
      );

      if (emp) {
        mapRef.current.flyTo(
          [emp.lat, emp.lng],
          13,
          { duration: 1 }
        );
      }
    }

    // Cleanup
    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, [employees, selectedId, onSelect]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "0",
      }}
    />
  );
}