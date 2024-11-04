"use client";

import { api } from "~/trpc/react";

export function CompanyList() {
  const [companies] = api.company.getAll.useSuspenseQuery();

  return (
    <div className="w-full max-w-xs">
      <h2 className="mb-4 text-2xl font-semibold">Company List</h2>
      {companies && companies.length > 0 ? (
        <ul className="ml-4 list-disc space-y-2">
          {companies.map((company) => (
            <li key={company.id} className="truncate">
              <strong>{company.name}</strong> - Ethics: {company.ethics}, Price:{" "}
              {company.price}, Quality: {company.quality}
              <ul className="list-circle ml-4 space-y-1">
                {company.products.map((product) => (
                  <li key={product.id}>
                    {product.name} -{" "}
                    {product.available ? "Available" : "Out of Stock"}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>No companies found.</p>
      )}
    </div>
  );
}
