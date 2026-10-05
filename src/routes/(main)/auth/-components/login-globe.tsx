import { useEffect, useMemo, useState } from "react";
import {
  geoOrthographic,
  geoPath,
  geoInterpolate,
  type GeoPermissibleObjects,
  type GeoProjection,
} from "d3-geo";

type Position = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  order: number;
  arcAlt: number;
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: unknown;
    properties?: Record<string, unknown>;
  }>;
};

const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
const arcSeeds: Array<Omit<Position, "color">> = [
  { order: 1, startLat: 22.3193, startLng: 114.1694, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3 },
  { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2 },
  { order: 3, startLat: -33.8688, startLng: 151.2093, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.3 },
  { order: 4, startLat: 51.5072, startLng: -0.1276, endLat: 37.7749, endLng: -122.4194, arcAlt: 0.3 },
  { order: 5, startLat: 34.0522, startLng: -118.2437, endLat: 48.8566, endLng: 2.3522, arcAlt: 0.2 },
  { order: 6, startLat: 28.6139, startLng: 77.209, endLat: 3.139, endLng: 101.6869, arcAlt: 0.2 },
  { order: 7, startLat: -22.9068, startLng: -43.1729, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.5 },
  { order: 8, startLat: 52.3676, startLng: 4.9041, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2 },
];

function createArcs() {
  return arcSeeds.map((arc, index) => ({
    ...arc,
    color: colors[index % colors.length],
  })) as Position[];
}

function projectLatLng(projection: GeoProjection, lng: number, lat: number) {
  return projection([lng, lat]);
}

function arcPath(projection: GeoProjection, arc: Position) {
  const interpolate = geoInterpolate([arc.startLng, arc.startLat], [arc.endLng, arc.endLat]);
  const points: Array<[number, number]> = [];

  for (let index = 0; index <= 32; index += 1) {
    const t = index / 32;
    const [lng, lat] = interpolate(t);
    const lift = Math.sin(Math.PI * t) * (arc.order % 3 === 0 ? 18 : 12);
    points.push([lng, lat + lift]);
  }

  const projected = points
    .map(([lng, lat]) => projection([lng, lat]))
    .filter((point): point is [number, number] => Boolean(point));

  if (projected.length < 2) {
    return "";
  }

  return projected
    .map(([x, y], index) => (index === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `L ${x.toFixed(1)} ${y.toFixed(1)}`))
    .join(" ");
}

export function LoginGlobe() {
  const [world, setWorld] = useState<FeatureCollection | null>(null);
  const [rotation, setRotation] = useState(100);

  useEffect(() => {
    let active = true;

    fetch("/globe.json")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load globe data");
        return response.json() as Promise<FeatureCollection>;
      })
      .then((data) => {
        if (active) setWorld(data);
      })
      .catch(() => {
        if (active) setWorld(null);
      });

    let frame = 0;
    let last = 0;

    const animate = (time: number) => {
      if (time - last > 60) {
        last = time;
        setRotation((value) => (value + 0.12) % 360);
      }
      frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);

    return () => {
      active = false;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  const projection = useMemo(
    () =>
      geoOrthographic()
        .translate([310, 310])
        .scale(246)
        .rotate([-rotation, -12])
        .clipAngle(90),
    [rotation],
  );

  const path = useMemo(() => geoPath(projection), [projection]);
  const arcs = useMemo(() => createArcs(), []);

  return (
    <div className="relative h-[620px] w-[620px] shrink-0">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_34%_28%,rgba(59,130,246,0.3),transparent_40%,rgba(2,6,23,0)_70%)]" />

      <svg viewBox="0 0 620 620" className="relative h-full w-full" aria-hidden="true">
        <defs>
          <radialGradient id="login-globe-fill" cx="38%" cy="30%">
            <stop offset="0%" stopColor="#172554" />
            <stop offset="72%" stopColor="#07142b" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <filter id="login-glow">
            <feGaussianBlur stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="310" cy="310" r="247" fill="url(#login-globe-fill)" stroke="rgba(148,163,184,0.18)" />

        <g opacity="0.95">
          {world?.features.map((feature, index) => {
            const d = path(feature as GeoPermissibleObjects);
            if (!d) return null;

            return (
              <path
                key={feature.properties?.name ? String(feature.properties.name) : `country-${index}`}
                d={d}
                fill="rgba(148,163,184,0.035)"
                stroke="rgba(148,163,184,0.18)"
                strokeWidth="0.65"
              />
            );
          })}
        </g>

        <g fill="none" strokeLinecap="round" filter="url(#login-glow)">
          {arcs.map((arc) => {
            const d = arcPath(projection, arc);
            return d ? (
              <path
                key={`${arc.startLat}-${arc.startLng}-${arc.endLat}-${arc.endLng}`}
                d={d}
                stroke={arc.color}
                strokeWidth="1.4"
                strokeDasharray="2 7"
                opacity="0.9"
              />
            ) : null;
          })}
        </g>

        <g filter="url(#login-glow)">
          {arcs.map((arc) => {
            const start = projectLatLng(projection, arc.startLng, arc.startLat);
            const end = projectLatLng(projection, arc.endLng, arc.endLat);

            return (
              <g key={`${arc.startLng}-${arc.endLng}`}>
                {start ? <circle cx={start[0]} cy={start[1]} r="3" fill={arc.color} /> : null}
                {end ? <circle cx={end[0]} cy={end[1]} r="2.5" fill="#e0f2fe" /> : null}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
