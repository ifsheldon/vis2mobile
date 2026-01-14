"use client";

import { useEffect, useRef, useState } from "react";

interface LazyIframeProps {
	src: string;
	title: string;
	className?: string;
}

export function LazyIframe({ src, title, className }: LazyIframeProps) {
	const [isVisible, setIsVisible] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setIsVisible(true);
						observer.disconnect(); // Only load once
					}
				}
			},
			{
				rootMargin: "200px", // Start loading 200px before entering viewport
				threshold: 0,
			},
		);

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => observer.disconnect();
	}, []);

	return (
		<div ref={containerRef} className="w-full h-full">
			{isVisible ? (
				<iframe src={src} title={title} className={className} />
			) : (
				<div className="w-full h-full flex items-center justify-center bg-zinc-100">
					<div className="flex flex-col items-center gap-2 text-zinc-400">
						<div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-500 rounded-full animate-spin" />
						<span className="text-xs">Loading...</span>
					</div>
				</div>
			)}
		</div>
	);
}
