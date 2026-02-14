"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { FlavorPrint } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  flavorprint: FlavorPrint;
  size?: number;
}

interface TooltipData {
  name: string;
  count: number;
  molecules: string[];
  color: string;
  x: number;
  y: number;
}

export default function RadialChart({ flavorprint, size = 380 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  useEffect(() => {
    if (!svgRef.current || flavorprint.categories.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = 60;
    const radius = size / 2 - margin;
    const center = size / 2;
    const categories = flavorprint.categories.filter((c) => c.count > 0);
    if (categories.length === 0) return;

    const maxCount = Math.max(...categories.map((c) => c.count));
    const angleSlice = (2 * Math.PI) / categories.length;

    const g = svg
      .append("g")
      .attr("transform", `translate(${center},${center})`);

    // Background circles with labels
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      const r = (radius / levels) * i;
      g.append("circle")
        .attr("r", r)
        .attr("fill", "none")
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1)
        .attr("stroke-width", 0.8)
        .attr("stroke-dasharray", "4,4");

      // Level labels
      if (i === levels) {
        g.append("text")
          .attr("x", 4)
          .attr("y", -r - 2)
          .attr("font-size", "9px")
          .attr("fill", "currentColor")
          .attr("fill-opacity", 0.4)
          .text(`${maxCount}`);
      }
    }

    // Axis lines and labels
    categories.forEach((cat, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      g.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", y)
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.08)
        .attr("stroke-width", 0.8);

      const labelRadius = radius + 22;
      const labelX = Math.cos(angle) * labelRadius;
      const labelY = Math.sin(angle) * labelRadius;

      g.append("text")
        .attr("x", labelX)
        .attr("y", labelY)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", size >= 380 ? "10px" : "8px")
        .attr("font-weight", "600")
        .attr("fill", cat.color)
        .text(cat.name);
    });

    // Gradient fill area
    const rScale = d3.scaleLinear().domain([0, maxCount]).range([0, radius]);

    const lineGen = d3
      .lineRadial<(typeof categories)[0]>()
      .angle((_, i) => angleSlice * i)
      .radius((d) => rScale(d.count))
      .curve(d3.curveCardinalClosed.tension(0.5));

    // Filled area with gradient
    const defs = svg.append("defs");
    const gradient = defs
      .append("radialGradient")
      .attr("id", "flavorGradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#FF6F00").attr("stop-opacity", 0.4);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#E91E63").attr("stop-opacity", 0.08);

    // Glow filter
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Animated area path
    g.append("path")
      .datum(categories)
      .attr("d", lineGen as unknown as string)
      .attr("fill", "url(#flavorGradient)")
      .attr("stroke", "#FF6F00")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0)
      .attr("filter", "url(#glow)")
      .transition()
      .duration(1000)
      .attr("stroke-opacity", 0.8);

    // Second outline for depth
    g.append("path")
      .datum(categories)
      .attr("d", lineGen as unknown as string)
      .attr("fill", "none")
      .attr("stroke", "#E91E63")
      .attr("stroke-width", 1)
      .attr("stroke-opacity", 0)
      .attr("stroke-dasharray", "2,4")
      .transition()
      .delay(500)
      .duration(800)
      .attr("stroke-opacity", 0.3);

    // Interactive data points
    categories.forEach((cat, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const r = rScale(cat.count);
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;

      // Pulse ring
      g.append("circle")
        .attr("cx", px)
        .attr("cy", py)
        .attr("r", 0)
        .attr("fill", "none")
        .attr("stroke", cat.color)
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0)
        .transition()
        .delay(800)
        .duration(600)
        .attr("r", 10)
        .attr("stroke-opacity", 0.3);

      // Main point
      const point = g
        .append("circle")
        .attr("cx", px)
        .attr("cy", py)
        .attr("r", 0)
        .attr("fill", cat.color)
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("cursor", "pointer")
        .attr("filter", "url(#glow)")
        .transition()
        .delay(500 + i * 50)
        .duration(500)
        .attr("r", 5);

      // Invisible larger hit area for hover
      g.append("circle")
        .attr("cx", px)
        .attr("cy", py)
        .attr("r", 20)
        .attr("fill", "transparent")
        .attr("cursor", "pointer")
        .on("mouseenter", () => {
          // Enlarge the data point
          g.selectAll("circle")
            .filter(function () {
              return (
                +d3.select(this).attr("cx") === px &&
                +d3.select(this).attr("cy") === py &&
                d3.select(this).attr("fill") === cat.color
              );
            })
            .transition()
            .duration(200)
            .attr("r", 8);

          if (containerRef.current) {
            setTooltip({
              name: cat.name,
              count: cat.count,
              molecules: cat.molecules.slice(0, 5),
              color: cat.color,
              x: px + center,
              y: py + center,
            });
          }
        })
        .on("mouseleave", () => {
          g.selectAll("circle")
            .filter(function () {
              return (
                +d3.select(this).attr("cx") === px &&
                +d3.select(this).attr("cy") === py &&
                d3.select(this).attr("fill") === cat.color
              );
            })
            .transition()
            .duration(200)
            .attr("r", 5);

          setTooltip(null);
        });
    });

    // Center text
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "24px")
      .attr("font-weight", "700")
      .attr("fill", "#FF6F00")
      .attr("opacity", 0)
      .text(flavorprint.totalMolecules)
      .transition()
      .delay(600)
      .duration(500)
      .attr("opacity", 1);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 20)
      .attr("font-size", "10px")
      .attr("fill", "currentColor")
      .attr("fill-opacity", 0.5)
      .attr("opacity", 0)
      .text("molecules")
      .transition()
      .delay(700)
      .duration(500)
      .attr("opacity", 1);
  }, [flavorprint, size]);

  if (flavorprint.categories.length === 0) {
    return (
      <div className="flex h-[380px] items-center justify-center text-muted-foreground">
        No flavor data available for this recipe
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative flex items-center justify-center"
    >
      <svg ref={svgRef} width={size} height={size} className="text-foreground" />

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute z-10 w-48 rounded-lg border border-border bg-popover p-3 shadow-xl"
            style={{
              left: tooltip.x,
              top: tooltip.y - 10,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: tooltip.color }}
              />
              <span className="text-sm font-semibold capitalize">
                {tooltip.name}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {tooltip.count} molecule{tooltip.count !== 1 ? "s" : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {tooltip.molecules.map((m) => (
                <span
                  key={m}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono"
                >
                  {m}
                </span>
              ))}
              {tooltip.count > 5 && (
                <span className="text-[10px] text-muted-foreground">
                  +{tooltip.count - 5} more
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
