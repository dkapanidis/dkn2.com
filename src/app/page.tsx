import Component from "@/components/widgets/mychart";
import Shows from "@/components/widgets/shows";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 gap-8">
      <Component />
      <Shows />
    </main>
  );
}
