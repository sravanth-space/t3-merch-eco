"use client";

import { useEffect } from "react";
import * as d3 from "d3";
import { api } from "~/trpc/react";

export function EthicsPieChart() {
  const { data: companies, isLoading, error } = api.company.getAll.useQuery();

  useEffect(() => {
    if (!companies) return;

    const svg = d3
      .select("#pieChart")
      .attr("width", 400)
      .attr("height", 400)
      .append("g")
      .attr("transform", "translate(200,200)");

    // Clear existing elements
    svg.selectAll("*").remove();

    const ethicsCounts = companies.reduce(
      (acc, company) => {
        acc[company.ethics] = (acc[company.ethics] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    const pie = d3.pie<number>().value((d) => d[1]);
    const data = Object.entries(ethicsCounts);
    const arc = d3.arc().innerRadius(0).outerRadius(150);

    svg
      .selectAll("path")
      .data(
        pie(
          data.map(
            ([ethics, count]) => [parseInt(ethics), count] as [number, number],
          ),
        ),
      )
      .enter()
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (d) => d3.schemeTableau10[d.index])
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    svg
      .selectAll("text")
      .data(pie(data))
      .enter()
      .append("text")
      .text((d) => `Ethics ${d.data[0]}: ${d.data[1]}`)
      .attr("transform", (d) => `translate(${arc.centroid(d as any)})`)
      .style("text-anchor", "middle")
      .style("font-size", "12px");
  }, [companies]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div>
      <h2>Company Ethics Distribution</h2>
      <svg id="pieChart"></svg>
    </div>
  );
}
