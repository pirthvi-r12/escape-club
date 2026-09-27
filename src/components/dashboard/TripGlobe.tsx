"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { formatDateRange, formatNumber } from "@/lib/utils";
import type { TripDTO } from "@/types";

/* three.js + globe.gl touch WebGL on import, so this must never run on the
   server and must not be part of the dashboard's initial JS. */
const Globe = dynamic(() => import("react-globe.gl"), {
  ssr: false,
  loading: () => <GlobeSkeleton />,
});

const HOME = { lat: 51.5072, lng: -0.1276, label: "London" };

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "#eb7d00",
  BOOKED: "#2c5745",
  DREAMING: "#c56800",
  CANCELLED: "#666d7e",
};

type MarkerDatum = {
  lat: number;
  lng: number;
  size: number;
  color: string;
  trip: TripDTO;
};

type ArcDatum = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: [string, string];
  dashAnimateTime: number;
};

function GlobeSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="relative h-52 w-52">
        <span className="absolute inset-0 animate-pulse rounded-full border border-white/10" />
        <span className="absolute inset-6 rounded-full border border-white/[0.06]" />
        <span className="absolute inset-0 flex items-center justify-center text-[0.62rem] tracking-[0.22em] text-mist-dim uppercase">
          Loading globe
        </span>
      </div>
    </div>
  );
}

export function TripGlobe({
  trips,
  height = 520,
}: {
  trips: TripDTO[];
  height?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const globeRef = useRef<any>(null);
  const [size, setSize] = useState({ width: 0, height });
  const [selected, setSelected] = useState<TripDTO | null>(null);
  const [ready, setReady] = useState(false);

  /* The canvas needs explicit pixel dimensions, so track the container. */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.round(entry.contentRect.width),
        height: Math.round(entry.contentRect.height),
      });
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const markers = useMemo<MarkerDatum[]>(
    () =>
      trips.map((trip) => ({
        lat: trip.destination.lat,
        lng: trip.destination.lng,
        size: trip.status === "COMPLETED" ? 0.42 : 0.55,
        color: STATUS_COLOR[trip.status] ?? "#eb7d00",
        trip,
      })),
    [trips],
  );

  const arcs = useMemo<ArcDatum[]>(
    () =>
      trips
        .filter((t) => t.status !== "CANCELLED")
        .map((trip) => ({
          startLat: HOME.lat,
          startLng: HOME.lng,
          endLat: trip.destination.lat,
          endLng: trip.destination.lng,
          color: [
            "rgba(217,185,137,0.05)",
            trip.status === "BOOKED"
              ? "rgba(134,173,196,0.75)"
              : "rgba(217,185,137,0.55)",
          ] as [string, string],
          dashAnimateTime:
            2600 + (trip.id.charCodeAt(0) % 12) * 180 + (trip.miles % 900),
        })),
    [trips],
  );

  /* Upcoming departures pulse. */
  const rings = useMemo(
    () =>
      trips
        .filter((t) => t.status === "BOOKED")
        .map((t) => ({
          lat: t.destination.lat,
          lng: t.destination.lng,
          maxR: 5,
          propagationSpeed: 1.6,
          repeatPeriod: 1100,
        })),
    [trips],
  );

  const handleReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;

    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.42;
    controls.enableZoom = true;
    controls.minDistance = 180;
    controls.maxDistance = 520;

    globe.pointOfView({ lat: 34, lng: 12, altitude: 2.1 }, 0);
    setReady(true);
  }, []);

  const focus = useCallback((trip: TripDTO) => {
    setSelected(trip);
    globeRef.current?.pointOfView(
      {
        lat: trip.destination.lat,
        lng: trip.destination.lng,
        altitude: 1.5,
      },
      1200,
    );
  }, []);

  /* Stop auto-rotating while a marker is being inspected. */
  useEffect(() => {
    const controls = globeRef.current?.controls?.();
    if (controls) controls.autoRotate = !selected;
  }, [selected]);

  return (
    <div className="glass glass-sheen relative overflow-hidden rounded-2xl">
      <header className="flex flex-wrap items-start justify-between gap-4 p-6 pb-0">
        <div>
          <h2 className="text-[0.92rem] text-bone">The world map</h2>
          <p className="mt-1.5 text-[0.72rem] text-mist-dim">
            Drag to rotate, scroll to zoom, tap a marker for the trip.
          </p>
        </div>

        <ul className="flex flex-wrap gap-4">
          {(
            [
              ["COMPLETED", "Been"],
              ["BOOKED", "Booked"],
              ["DREAMING", "On the list"],
            ] as const
          ).map(([status, label]) => (
            <li
              key={status}
              className="flex items-center gap-2 text-[0.62rem] tracking-[0.16em] text-mist-dim uppercase"
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: STATUS_COLOR[status] }}
              />
              {label}
            </li>
          ))}
        </ul>
      </header>

      <div
        ref={wrapRef}
        className="relative w-full"
        style={{ height }}
        /* The globe owns wheel + drag; keep Lenis out of it. */
        data-lenis-prevent
      >
        {size.width > 0 && (
          <Globe
            ref={globeRef}
            width={size.width}
            height={size.height}
            onGlobeReady={handleReady}
            backgroundColor="rgba(0,0,0,0)"
            globeImageUrl="/textures/earth-night.jpg"
            bumpImageUrl="/textures/earth-topology.png"
            atmosphereColor="#2c5745"
            atmosphereAltitude={0.19}
            pointsData={markers}
            pointLat="lat"
            pointLng="lng"
            pointColor={(d: object) => (d as MarkerDatum).color}
            pointAltitude={(d: object) => (d as MarkerDatum).size * 0.09}
            pointRadius={(d: object) => (d as MarkerDatum).size}
            pointsMerge={false}
            pointLabel={(d: object) => {
              const { trip } = d as MarkerDatum;
              return `<div style="
                font-family: var(--font-inter), sans-serif;
                background: rgba(9,11,20,0.92);
                border: 1px solid rgba(255,255,255,0.1);
                backdrop-filter: blur(12px);
                padding: 10px 14px;
                border-radius: 8px;
                color: #ebe3a7;
                font-size: 12px;
                letter-spacing: 0.01em;
              ">
                <div style="color:#eb7d00;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:5px">
                  ${trip.destination.country}
                </div>
                <div style="font-size:13px">${trip.destination.name}</div>
                <div style="color:#9aa1b1;font-size:11px;margin-top:3px">${trip.title}</div>
              </div>`;
            }}
            onPointClick={(d: object) => focus((d as MarkerDatum).trip)}
            arcsData={arcs}
            arcColor="color"
            arcAltitudeAutoScale={0.42}
            arcStroke={0.32}
            arcDashLength={0.42}
            arcDashGap={1.1}
            arcDashAnimateTime="dashAnimateTime"
            ringsData={rings}
            ringColor={() => "rgba(134,173,196,0.55)"}
            ringMaxRadius="maxR"
            ringPropagationSpeed="propagationSpeed"
            ringRepeatPeriod="repeatPeriod"
          />
        )}

        {/* Fade the canvas in — the first frame is unavoidably abrupt. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-ink-950 transition-opacity duration-1000"
          style={{ opacity: ready ? 0 : 1 }}
        />
      </div>

      {/* Selected trip detail */}
      {selected && (
        <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 sm:max-w-sm">
          <div className="glass-deep rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-[0.58rem] text-champagne/90">
                  {selected.destination.region} · {selected.destination.country}
                </p>
                <p className="font-display mt-2 text-2xl leading-none tracking-[-0.02em] text-bone">
                  {selected.destination.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close trip detail"
                className="-mt-1 -mr-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/12 text-mist transition-colors duration-300 hover:text-bone"
              >
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                  <path
                    d="M1 1l10 10M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <p className="mt-4 text-[0.82rem] text-bone-dim">{selected.title}</p>

            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-[0.68rem]">
              <div>
                <dt className="tracking-[0.14em] text-mist-dim uppercase">When</dt>
                <dd className="mt-1 text-bone">
                  {formatDateRange(selected.startDate, selected.endDate)}
                </dd>
              </div>
              <div>
                <dt className="tracking-[0.14em] text-mist-dim uppercase">Miles</dt>
                <dd className="mt-1 text-bone tabular-nums">
                  {formatNumber(selected.miles)}
                </dd>
              </div>
              <div>
                <dt className="tracking-[0.14em] text-mist-dim uppercase">
                  Status
                </dt>
                <dd
                  className="mt-1"
                  style={{ color: STATUS_COLOR[selected.status] }}
                >
                  {selected.status.charAt(0) +
                    selected.status.slice(1).toLowerCase()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
