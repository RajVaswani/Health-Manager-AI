import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    google: any;
  }
}

interface WalkMapProps {
  path: { lat: number; lng: number }[];
}

const WalkMap = ({ path }: WalkMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const initDoneRef = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const initMap = () => {
    if (!mapRef.current || !window.google?.maps || initDoneRef.current) return;
    initDoneRef.current = true;

    const center = path.length > 0 ? path[path.length - 1] : { lat: 0, lng: 0 };
    const gmaps = window.google.maps;

    googleMapRef.current = new gmaps.Map(mapRef.current, {
      center,
      zoom: 16,
      disableDefaultUI: true,
      zoomControl: true,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
      ],
    });

    polylineRef.current = new gmaps.Polyline({
      path: [],
      geodesic: true,
      strokeColor: "#4d7c65",
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map: googleMapRef.current,
    });
  };

  // Load Google Maps script via edge function key
  useEffect(() => {
    if (window.google?.maps) {
      initMap();
      return;
    }
    if (document.getElementById("google-maps-script")) return;

    const loadScript = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-maps-key");
        if (error || !data?.key) {
          setLoadError("Could not load map");
          return;
        }

        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.key}`;
        script.async = true;
        script.onload = () => initMap();
        document.head.appendChild(script);
      } catch {
        setLoadError("Could not load map");
      }
    };

    loadScript();
  }, []);

  // Update polyline and center
  useEffect(() => {
    if (!initDoneRef.current && window.google?.maps) initMap();
    if (!googleMapRef.current || !polylineRef.current) return;

    const gmaps = window.google.maps;
    const gPath = path.map((p) => new gmaps.LatLng(p.lat, p.lng));
    polylineRef.current.setPath(gPath);

    if (path.length > 0) {
      const last = path[path.length - 1];
      googleMapRef.current.panTo(last);

      if (!markerRef.current) {
        markerRef.current = new gmaps.Marker({
          position: last,
          map: googleMapRef.current,
          icon: {
            path: gmaps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4d7c65",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });
      } else {
        markerRef.current.setPosition(last);
      }
    }
  }, [path]);

  if (loadError) {
    return (
      <div className="w-full h-48 rounded-xl bg-muted flex items-center justify-center">
        <p className="text-xs text-muted-foreground font-body">{loadError}</p>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-48 rounded-xl overflow-hidden bg-muted"
      style={{ minHeight: "192px" }}
    />
  );
};

export default WalkMap;
