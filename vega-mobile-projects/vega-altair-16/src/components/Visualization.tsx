import { useEffect, useMemo, useState } from "react";
import type { ComponentType, SVGProps } from "react";
import {
    Activity,
    Biohazard,
    CloudLightning,
    DropletOff,
    Flame,
    Mountain,
    MountainSnow,
    ThermometerSun,
    TreePine,
    Waves,
} from "lucide-react";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type DisasterPoint = {
    entity: string;
    year: number;
    deaths: number;
    color: string;
    icon: IconType;
};

const DATA_URL =
    "https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/disasters.csv";

const CATEGORY_CONFIG: Record<
    string,
    { label: string; color: string; icon: IconType }
> = {
    Earthquake: { label: "Earthquake", color: "#f97316", icon: Activity },
    Flood: { label: "Flood", color: "#38bdf8", icon: Waves },
    Epidemic: { label: "Epidemic", color: "#f43f5e", icon: Biohazard },
    Drought: { label: "Drought", color: "#facc15", icon: DropletOff },
    "Extreme temperature": {
        label: "Extreme temp",
        color: "#fb7185",
        icon: ThermometerSun,
    },
    "Extreme weather": {
        label: "Extreme weather",
        color: "#60a5fa",
        icon: CloudLightning,
    },
    Landslide: { label: "Landslide", color: "#a3a3a3", icon: Mountain },
    "Mass movement (dry)": {
        label: "Mass movement",
        color: "#c4b5fd",
        icon: MountainSnow,
    },
    "Volcanic activity": {
        label: "Volcanic",
        color: "#f97316",
        icon: Flame,
    },
    Wildfire: { label: "Wildfire", color: "#fb923c", icon: TreePine },
};

const CATEGORY_ORDER = [
    "Earthquake",
    "Flood",
    "Epidemic",
    "Drought",
    "Extreme temperature",
    "Extreme weather",
    "Landslide",
    "Mass movement (dry)",
    "Volcanic activity",
    "Wildfire",
];

const parseCsv = (text: string) => {
    const lines = text.trim().split(/\r?\n/);
    const header = lines[0]?.split(",") ?? [];
    return lines.slice(1).map((line) => {
        const values = line.split(",");
        const row: Record<string, string> = {};
        header.forEach((key, index) => {
            row[key] = values[index] ?? "";
        });
        return row;
    });
};

const formatDeaths = (value: number) =>
    new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(value);

export function Visualization() {
    const [data, setData] = useState<DisasterPoint[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [maxDeaths, setMaxDeaths] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<DisasterPoint | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const SelectedIcon = selected?.icon;

    useEffect(() => {
        const controller = new AbortController();
        const load = async () => {
            try {
                setLoading(true);
                const response = await fetch(DATA_URL, {
                    signal: controller.signal,
                });
                if (!response.ok) {
                    throw new Error("Failed to load data.");
                }
                const text = await response.text();
                const rows = parseCsv(text)
                    .filter((row) => row.Entity !== "All natural disasters")
                    .map((row) => ({
                        entity: row.Entity,
                        year: Number(row.Year),
                        deaths: Number(row.Deaths),
                    }))
                    .filter((row) => !Number.isNaN(row.year));
                const points: DisasterPoint[] = rows
                    .filter((row) => row.entity in CATEGORY_CONFIG)
                    .map((row) => ({
                        ...row,
                        color: CATEGORY_CONFIG[row.entity].color,
                        icon: CATEGORY_CONFIG[row.entity].icon,
                    }));
                const minYear = Math.min(...points.map((point) => point.year));
                const maxYear = Math.max(...points.map((point) => point.year));
                const yearRange = [];
                for (let year = maxYear; year >= minYear; year -= 1) {
                    yearRange.push(year);
                }
                setYears(yearRange);
                setData(points);
                setMaxDeaths(
                    Math.max(1, ...points.map((point) => point.deaths)),
                );
                setError(null);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") {
                    return;
                }
                setError("Data unavailable. Please retry.");
            } finally {
                setLoading(false);
            }
        };
        load();
        return () => controller.abort();
    }, []);

    const dataMap = useMemo(() => {
        const map = new Map<string, DisasterPoint>();
        data.forEach((point) => {
            map.set(`${point.year}-${point.entity}`, point);
        });
        return map;
    }, [data]);

    const categories = useMemo(
        () => CATEGORY_ORDER.filter((entity) => entity in CATEGORY_CONFIG),
        [],
    );

    const bubbleSize = (value: number) => {
        const min = 20;
        const max = 44;
        const normalized = Math.sqrt(value) / Math.sqrt(maxDeaths);
        return Math.round(min + normalized * (max - min));
    };

    return (
        <div className="h-full w-full overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom,_rgba(248,113,113,0.14),_transparent_50%),linear-gradient(180deg,_#0f172a,_#0b1120)] text-white">
            <div className="flex h-full flex-col overflow-y-auto">
                <div className="px-4 pt-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                                Disaster Timeline
                            </p>
                            <h1 className="text-2xl font-semibold">
                                Disaster History
                            </h1>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowInfo((prev) => !prev)}
                            className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-white/10"
                        >
                            {showInfo ? "Hide info" : "Info"}
                        </button>
                    </div>
                    {showInfo ? (
                        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                            Tap a bubble to see deaths by disaster type. Scroll
                            vertically through years and horizontally across
                            categories.
                        </div>
                    ) : null}
                </div>

                <div className="px-2 pb-10 pt-4">
                    <div className="overflow-x-auto">
                        <div className="min-w-[720px]">
                            <div className="sticky top-0 z-20 mb-2 rounded-2xl border border-white/10 bg-[#0f172a]/80 px-4 py-2 backdrop-blur">
                                <div className="grid grid-cols-[72px_repeat(10,56px)] items-center gap-x-2 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                                    <div className="text-left">Year</div>
                                    {categories.map((entity) => {
                                        const config =
                                            CATEGORY_CONFIG[entity];
                                        const Icon = config.icon;
                                        return (
                                            <div
                                                key={entity}
                                                className="flex flex-col items-center gap-1 text-center"
                                            >
                                                <Icon
                                                    className="h-4 w-4"
                                                    style={{
                                                        color: config.color,
                                                    }}
                                                />
                                                <span className="text-[9px] uppercase tracking-[0.2em] text-white/60">
                                                    {config.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1 pb-24">
                                {loading ? (
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                                        Loading disaster records…
                                    </div>
                                ) : null}
                                {error ? (
                                    <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-100">
                                        {error}
                                    </div>
                                ) : null}
                                {!loading && !error
                                    ? years.map((year, index) => (
                                            <div
                                                key={year}
                                                className="grid grid-cols-[72px_repeat(10,56px)] items-center gap-x-2 rounded-2xl border border-white/5 px-3 py-2"
                                                style={{
                                                    background:
                                                        index % 2 === 0
                                                            ? "rgba(15, 23, 42, 0.55)"
                                                            : "rgba(15, 23, 42, 0.35)",
                                                }}
                                            >
                                                <div className="text-sm font-semibold text-white/80">
                                                    {year}
                                                </div>
                                                {categories.map((entity) => {
                                                    const point =
                                                        dataMap.get(
                                                            `${year}-${entity}`,
                                                        );
                                                    if (!point) {
                                                        return (
                                                            <div
                                                                key={`${year}-${entity}`}
                                                                className="flex h-12 items-center justify-center"
                                                            >
                                                                <div className="h-2 w-2 rounded-full bg-white/10" />
                                                            </div>
                                                        );
                                                    }
                                                    const size = bubbleSize(
                                                        point.deaths,
                                                    );
                                                    return (
                                                        <button
                                                            key={`${year}-${entity}`}
                                                            type="button"
                                                            onClick={() =>
                                                                setSelected(
                                                                    point,
                                                                )
                                                            }
                                                            className="relative flex h-12 items-center justify-center"
                                                            aria-label={`${point.entity} in ${point.year}`}
                                                        >
                                                            <span
                                                                className="rounded-full shadow-[0_0_18px_rgba(255,255,255,0.15)]"
                                                                style={{
                                                                    width: size,
                                                                    height: size,
                                                                    background:
                                                                        point.color,
                                                                    opacity:
                                                                        0.85,
                                                                    boxShadow:
                                                                        selected &&
                                                                        selected
                                                                            .year ===
                                                                            point.year &&
                                                                        selected
                                                                            .entity ===
                                                                            point.entity
                                                                            ? "0 0 0 3px rgba(255,255,255,0.65)"
                                                                            : "0 0 12px rgba(15, 23, 42, 0.6)",
                                                                }}
                                                            />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        ))
                                    : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-30 p-4">
                <div className="pointer-events-auto mx-auto flex max-w-md flex-col gap-2 rounded-3xl border border-white/10 bg-white/10 p-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.55)] backdrop-blur">
                    {selected ? (
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span
                                    className="flex h-10 w-10 items-center justify-center rounded-2xl"
                                    style={{ background: selected.color }}
                                >
                                    {SelectedIcon ? (
                                        <SelectedIcon className="h-5 w-5 text-white" />
                                    ) : null}
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">
                                        {selected.entity}
                                    </p>
                                    <p className="text-xs text-white/70">
                                        {selected.year} ·{" "}
                                        {formatDeaths(selected.deaths)} deaths
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="text-xs text-white/70"
                                onClick={() => setSelected(null)}
                            >
                                Clear
                            </button>
                        </div>
                    ) : (
                        <p className="text-xs text-white/70">
                            Tap any bubble to reveal disaster details.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
