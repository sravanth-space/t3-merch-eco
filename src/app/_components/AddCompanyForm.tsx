"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function AddCompanyForm() {
  const [name, setName] = useState("");
  const [ethics, setEthics] = useState(0);
  const [price, setPrice] = useState(0);
  const [quality, setQuality] = useState(0);
  const [products, setProducts] = useState([{ name: "", available: false }]);

  const utils = api.useUtils();
  const createCompany = api.company.addCompany.useMutation({
    onSuccess: async () => {
      await utils.company.invalidate(); // Refresh the company list
      setName("");
      setEthics(0);
      setPrice(0);
      setQuality(0);
      setProducts([{ name: "", available: false }]);
    },
  });

  const handleProductChange = (index: number, field: string, value: any) => {
    const newProducts = [...products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setProducts(newProducts);
  };

  const addProductField = () => {
    setProducts([...products, { name: "", available: false }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCompany.mutate({ name, ethics, price, quality, products });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
      <h2 className="mb-4 text-2xl font-semibold">Add New Company</h2>

      <input
        type="text"
        placeholder="Company Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-full px-4 py-2 text-black"
        required
      />
      <input
        type="number"
        placeholder="Ethics Score"
        value={ethics}
        onChange={(e) => setEthics(Number(e.target.value))}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <input
        type="number"
        placeholder="Price Score"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="w-full rounded-full px-4 py-2 text-black"
      />
      <input
        type="number"
        placeholder="Quality Score"
        value={quality}
        onChange={(e) => setQuality(Number(e.target.value))}
        className="w-full rounded-full px-4 py-2 text-black"
      />

      <h3 className="text-lg font-semibold">Products</h3>
      {products.map((product, index) => (
        <div key={index} className="space-y-2">
          <input
            type="text"
            placeholder="Product Name"
            value={product.name}
            onChange={(e) => handleProductChange(index, "name", e.target.value)}
            className="w-full rounded-full px-4 py-2 text-black"
          />
          <label className="flex items-center">
            Available
            <input
              type="checkbox"
              checked={product.available}
              onChange={(e) =>
                handleProductChange(index, "available", e.target.checked)
              }
              className="ml-2"
            />
          </label>
        </div>
      ))}
      <button
        type="button"
        onClick={addProductField}
        className="w-full rounded-full bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
      >
        Add Another Product
      </button>

      <button
        type="submit"
        className="w-full rounded-full bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20"
        disabled={createCompany.isPending}
      >
        {createCompany.isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
