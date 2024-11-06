"use client";

import { useEffect } from "react";
import * as d3 from "d3";
import { api } from "~/trpc/react";

export function Visualizer() {
  const { data: companies, isLoading, error } = api.company.getAll.useQuery();

  useEffect(() => {
    if (!companies) return;

    const svg = d3.select("#chart").attr("width", 800).attr("height", 500);

    // Clear existing chart elements
    svg.selectAll("*").remove();

    const margin = { top: 40, right: 20, bottom: 100, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const xScale = d3
      .scaleBand()
      .domain(companies.map((d) => d.name))
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear().domain([0, 5]).range([height, 0]);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X axis
    chart
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    chart.append("g").call(d3.axisLeft(yScale));

    // Bars with labels
    chart
      .selectAll(".bar")
      .data(companies)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.name)!)
      .attr("y", (d) => yScale(d.ethics))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.ethics))
      .attr("fill", (d) =>
        d.ethics >= 4 ? "#4CAF50" : d.ethics >= 2 ? "#FFC107" : "#F44336",
      );

    // Add labels
    chart
      .selectAll(".label")
      .data(companies)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(d.name)! + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.ethics) - 5)
      .attr("text-anchor", "middle")
      .text((d) => d.ethics);

    // Titles
    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Company Ethics Ratings");

    // X-axis label
    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Company");

    // Y-axis label
    svg
      .append("text")
      .attr("x", -(height / 2) - margin.top)
      .attr("y", margin.left / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("transform", "rotate(-90)")
      .text("Ethics Rating");
  }, [companies]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div>
      <h2>Company Ethics Visualization</h2>
      <svg id="chart"></svg>
    </div>
  );
}
