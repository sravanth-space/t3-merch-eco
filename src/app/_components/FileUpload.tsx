"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { api } from "~/trpc/react";

export function FileUpload() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState("");
  //   const router = useRouter();
  const utils = api.useUtils();
  const uploadFile = api.company.uploadData.useMutation({
    onSuccess: async () => {
      //   router.refresh();
      await utils.company.getAll.invalidate();
      setStatus("File uploaded successfully!");
    },
    onError: (error) => {
      setStatus(`Error: ${error.message}`);
    },
  });

  const handleFileUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    const file = fileInputRef.current.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      // Assuming data is in the first sheet
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const formattedData = parseExcelData(jsonData);
      uploadFile.mutate(formattedData);
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to parse and transform the Excel data
  function parseExcelData(data: any[][]) {
    const [header, ...rows] = data;
    return rows.map((row) => {
      const [companyName, ethics, price, quality, ...products] = row;

      const productNames = header.slice(4); // Get product names from header

      // Transform row data into desired format
      return {
        name: companyName,
        ethics: ethics === "Q" ? null : Number(ethics),
        price: price === "Q" ? null : Number(price),
        quality: quality === "Q" ? null : Number(quality),
        products: productNames.map((product, index) => ({
          name: product,
          available: products[index] === "Y" ? true : false,
        })),
      };
    });
  }

  return (
    <div className="my-4">
      <input type="file" ref={fileInputRef} />
      <button
        onClick={handleFileUpload}
        className="mt-2 rounded bg-blue-500 px-4 py-2 text-white"
      >
        Upload
      </button>
      {status && <p className="mt-2 text-sm text-green-500">{status}</p>}
    </div>
  );
}
