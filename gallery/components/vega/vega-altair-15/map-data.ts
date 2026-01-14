import type { Feature, GeoJsonProperties, Geometry } from "geojson";
import { feature } from "topojson-client";

export interface Capital {
	city: string;
	state: string;
	lat: number;
	lon: number;
}

export interface MapData {
	features: Feature<Geometry, GeoJsonProperties>[];
	capitals: Capital[];
}

export async function fetchMapData(): Promise<MapData> {
	const [us, capitals] = await Promise.all([
		fetch(
			"https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-10m.json",
		).then((res) => res.json()),
		fetch(
			"https://cdn.jsdelivr.net/npm/vega-datasets@v3.2.1/data/us-state-capitals.json",
		).then((res) => res.json()),
	]);

	// The TopoJSON file structure for 'us-10m.json' typically has 'objects.states'
	// feature() returns a FeatureCollection if the input is a GeometryCollection
	// biome-ignore lint/suspicious/noExplicitAny: TopoJSON types are complex
	const featureCollection = feature(us as any, us.objects.states as any);

	// We assume it returns a FeatureCollection with features property
	// biome-ignore lint/suspicious/noExplicitAny: We know the structure
	const features = (featureCollection as any).features;

	return { features, capitals };
}
