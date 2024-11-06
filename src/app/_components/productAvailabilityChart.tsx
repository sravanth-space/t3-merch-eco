"use client";

import { useEffect } from "react";
import * as d3 from "d3";
import { api } from "~/trpc/react";

export function ProductAvailabilityChart() {
  const { data: companies, isLoading, error } = api.company.getAll.useQuery();

  useEffect(() => {
    if (!companies) return;

    const productCounts = companies.reduce(
      (acc, company) => {
        company.products.forEach((product) => {
          acc[product.name] =
            (acc[product.name] || 0) + (product.available ? 1 : 0);
        });
        return acc;
      },
      {} as Record<string, number>,
    );

    const svg = d3
      .select("#productChart")
      .attr("width", 600)
      .attr("height", 400)
      .append("g")
      .attr("transform", "translate(50,50)");

    svg.selectAll("*").remove();

    const xScale = d3
      .scaleBand()
      .domain(Object.keys(productCounts))
      .range([0, 500])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(Object.values(productCounts))!])
      .range([300, 0]);

    svg
      .append("g")
      .attr("transform", "translate(0,300)")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(yScale));

    svg
      .selectAll(".bar")
      .data(Object.entries(productCounts))
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d[0])!)
      .attr("y", (d) => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => 300 - yScale(d[1]))
      .attr("fill", "#4CAF50");

    svg
      .append("text")
      .attr("x", 250)
      .attr("y", 350)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Products");

    svg
      .append("text")
      .attr("x", -150)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("transform", "rotate(-90)")
      .text("Number of Companies Offering Product");
  }, [companies]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div>
      <h2>Product Availability Across Companies</h2>
      <svg id="productChart"></svg>
    </div>
  );
}
