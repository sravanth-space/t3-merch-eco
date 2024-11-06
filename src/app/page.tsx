import Link from "next/link";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { FileUpload } from "./_components/fileUpload";
import { Visualizer } from "./_components/visualizer";
import { EthicsPieChart } from "./_components/ethicsPieChart";
import { ProductAvailabilityChart } from "./_components/productAvailabilityChart";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    void api.company.getAll.prefetch();
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Merch <span className="text-[hsl(280,100%,70%)]">ECO</span> App
          </h1>

          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl">
                {session && <span>Hello, {session.user?.name}!</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>

          {session?.user && (
            <div className="mt-16 w-full max-w-5xl rounded-xl bg-white p-8 text-black shadow-lg">
              <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
                Company/Products Summary
              </h2>
              <div className="space-y-6 overflow-auto">
                <FileUpload />

                <div className="overflow-auto rounded-lg bg-gray-100 p-6 shadow-md">
                  <Visualizer />
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="overflow-auto rounded-lg bg-gray-100 p-4 shadow-md">
                    <EthicsPieChart />
                  </div>
                  <div className="overflow-auto rounded-lg bg-gray-100 p-4 shadow-md">
                    <ProductAvailabilityChart />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
