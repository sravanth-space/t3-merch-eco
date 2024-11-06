"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { api } from "~/trpc/react";

export function CompanyChart() {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const { data: companies } = api.company.getAll.useQuery();

  useEffect(() => {
    if (!companies || !chartRef.current) return;

    const svg = d3.select(chartRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 40 };

    const x = d3
      .scaleBand()
      .domain(companies.map((d) => d.name))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(companies, (d) => d.products.length) ?? 0])
      .nice()
      .range([height - margin.bottom, margin.top]);

    svg
      .append("g")
      .selectAll("rect")
      .data(companies)
      .join("rect")
      .attr("x", (d) => x(d.name) ?? 0)
      .attr("y", (d) => y(d.products.length))
      .attr("height", (d) => y(0) - y(d.products.length))
      .attr("width", x.bandwidth())
      .attr("fill", "steelblue");

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));
  }, [companies]);

  return (
    <svg
      ref={chartRef}
      width="600"
      height="400"
      className="mx-auto mt-8 rounded border border-gray-200"
    />
  );
}
