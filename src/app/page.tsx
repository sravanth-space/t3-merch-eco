import Link from "next/link";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { FileUpload } from "./_components/fileUpload";
import { Visualizer } from "./_components/visualizer";
import { EthicsPieChart } from "./_components/ethicsPieChart";
import { ProductAvailabilityChart } from "./_components/productAvailabilityChart";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Merch <span className="text-[hsl(280,100%,70%)]">ECO</span> App
          </h1>

          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Hello {session.user?.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>
          {session?.user && (
            <div className="mt-16 w-full max-w-3xl rounded-lg bg-white p-6 text-black shadow-lg">
              <h2 className="mb-6 text-center text-3xl font-bold">
                Company Management
              </h2>
              <FileUpload />
              <Visualizer />
              <EthicsPieChart />
              <ProductAvailabilityChart />
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
