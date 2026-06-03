/**
 * Global type declarations for the Mappls SDK.
 * The SDK injects `mappls` and `L` (Leaflet) onto `window`.
 */

interface MapplsMapOptions {
  center?: [number, number];
  zoom?: number;
  zoomControl?: boolean;
  search?: boolean;
  location?: boolean;
  hybrid?: boolean;
}

interface MapplsSDK {
  Map: new (container: string | HTMLElement, options?: MapplsMapOptions) => any;
}

declare global {
  interface Window {
    mappls: MapplsSDK;
    L: typeof import("leaflet");
  }
  var mappls: MapplsSDK;
}

export {};
