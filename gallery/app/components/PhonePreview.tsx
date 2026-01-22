"use client";

import { ExternalLink } from "lucide-react";
import { LazyIframe } from "./LazyIframe";

interface PhonePreviewProps {
	title: string;
	previewSrc: string;
	originalSrc?: string;
	originalLabel?: string; // e.g., "Original HTML", "Original SVG"
	phoneWidth: number;
	phoneHeight: number;
	phoneScale: number;
}

export function PhonePreview({
	title,
	previewSrc,
	originalSrc,
	originalLabel = "Original HTML",
	phoneWidth,
	phoneHeight,
	phoneScale,
}: PhonePreviewProps) {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 shrink-0">
					{title}
				</h2>
				<div className="flex flex-wrap justify-end gap-2">
					<a
						href={`/mobile-view?src=${encodeURIComponent(previewSrc)}&width=${phoneWidth}&height=${phoneHeight}&title=${encodeURIComponent(title)}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
					>
						Mobile
						<ExternalLink className="w-3 h-3" />
					</a>
					{originalSrc && (
						<a
							href={originalSrc}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
						>
							{originalLabel}
							<ExternalLink className="w-3 h-3" />
						</a>
					)}
				</div>
			</div>

			<div className="flex justify-center bg-zinc-100 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2 md:p-8 overflow-hidden">
				<div
					className="bg-white dark:bg-black shadow-2xl rounded-[2rem] md:rounded-[3rem] border-[4px] md:border-[8px] border-zinc-900 overflow-hidden relative"
					style={{
						width: phoneWidth * phoneScale,
						height: phoneHeight * phoneScale,
					}}
				>
					<LazyIframe
						src={previewSrc}
						className="w-full h-full border-none bg-white dark:bg-black"
						title={`${title} Preview`}
					/>
				</div>
			</div>
		</div>
	);
}
