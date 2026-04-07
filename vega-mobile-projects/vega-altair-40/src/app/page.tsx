// DO NOT MODIFY THIS FILE
import { PhoneFrame } from "@/components/PhoneFrame";
import { Visualization } from "@/components/Visualization";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 font-sans flex flex-col items-center justify-center">
      <div className="space-y-4">
        <PhoneFrame>
          <Visualization />
        </PhoneFrame>
      </div>
    </main>
  );
}
