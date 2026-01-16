import DisasterCostBarChart from "@/components/cicero/cost/DisasterCostBarChart";

export default function Page() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 pb-20">
			<div className="w-full max-w-md">
				<DisasterCostBarChart />
			</div>
		</div>
	);
}
