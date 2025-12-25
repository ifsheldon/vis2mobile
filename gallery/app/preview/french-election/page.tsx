'use client';

import { FrenchElectionChart } from '@/components/FrenchElectionChart';

export default function Page() {
    return (
        <div className="w-full h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
            <FrenchElectionChart />
        </div>
    );
}
