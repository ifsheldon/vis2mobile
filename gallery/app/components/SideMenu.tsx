"use client";

import { Grip } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
	{
		id: "cicero",
		label: "Cicero Examples",
		initial: "C",
		href: "#cicero",
	},
	{
		id: "vega",
		label: "Vega Examples",
		initial: "V",
		href: "#vega",
	},
	{
		id: "vega-altair",
		label: "Vega Altair Examples",
		initial: "VA",
		href: "#vega-altair",
	},
	{
		id: "vega-lite",
		label: "Vega Lite Examples",
		initial: "VL",
		href: "#vega-lite",
	},
];

export function SideMenu() {
	const [activeSection, setActiveSection] = useState("");

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				});
			},
			{
				rootMargin: "-20% 0px -50% 0px",
			},
		);

		NAV_ITEMS.forEach((item) => {
			const element = document.getElementById(item.id);
			if (element) observer.observe(element);
		});

		return () => observer.disconnect();
	}, []);

	return (
		<nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50">
			<div className="group flex flex-col gap-2 bg-white dark:bg-zinc-900 shadow-xl shadow-zinc-200/50 dark:shadow-black/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] w-12 hover:w-56 overflow-hidden">
				{/* Menu Indicator / Header */}
				<div className="flex items-center gap-3 py-2 px-1.5 rounded-xl text-zinc-400 dark:text-zinc-600 mb-1">
					<Grip className="w-5 h-5 shrink-0" />
					<span className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
						Navigation
					</span>
				</div>

				{NAV_ITEMS.map((item) => (
					<a
						key={item.id}
						href={item.href}
						className={`flex items-center gap-3 py-2 px-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
							activeSection === item.id
								? "text-zinc-900 dark:text-zinc-50"
								: "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
						}`}
						title={item.label}
					>
						<span
							className={`w-5 h-5 shrink-0 flex items-center justify-center text-[10px] font-bold border rounded transition-colors ${
								activeSection === item.id
									? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
									: "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 group-hover:border-zinc-300 dark:group-hover:border-zinc-600"
							}`}
						>
							{item.initial}
						</span>
						<span className="whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
							{item.label}
						</span>
					</a>
				))}
			</div>
		</nav>
	);
}
