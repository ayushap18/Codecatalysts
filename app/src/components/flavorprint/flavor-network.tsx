"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import type { FlavorPrint, RecipeIngredient } from "@/types";
import {
  getMoleculesForIngredient,
  FLAVOR_CATEGORIES,
  classifyFlavor,
} from "@/lib/algorithms/flavorprint";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: "ingredient" | "molecule";
  color: string;
  radius: number;
  shared: boolean;
  flavorCategory?: string;
  ingredientSources?: string[];
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface TooltipData {
  name: string;
  details: string;
  x: number;
  y: number;
  color: string;
}

interface Props {
  flavorprint: FlavorPrint;
  ingredients: RecipeIngredient[];
  width?: number;
  height?: number;
}

export default function FlavorNetwork({
  flavorprint,
  ingredients,
  width = 700,
  height = 500,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const { nodes, links } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const linkList: GraphLink[] = [];
    const moleculeSources: Record<string, string[]> = {};

    for (const ing of ingredients) {
      const ingId = `ing:${ing.ingredient}`;
      if (!nodeMap.has(ingId)) {
        nodeMap.set(ingId, {
          id: ingId,
          name: ing.ingredient,
          type: "ingredient",
          color: "#FF6F00",
          radius: 18,
          shared: false,
        });
      }

      const mols = getMoleculesForIngredient(ing.ingredient);
      for (const mol of mols) {
        const molId = `mol:${mol.common_name}`;
        if (!moleculeSources[molId]) moleculeSources[molId] = [];
        if (!moleculeSources[molId].includes(ing.ingredient)) {
          moleculeSources[molId].push(ing.ingredient);
        }

        if (!nodeMap.has(molId)) {
          const cat = classifyFlavor(mol.flavor_profile);
          nodeMap.set(molId, {
            id: molId,
            name: mol.common_name,
            type: "molecule",
            color: FLAVOR_CATEGORIES[cat] || "#90A4AE",
            radius: 7,
            shared: false,
            flavorCategory: cat,
            ingredientSources: [],
          });
        }

        linkList.push({ source: ingId, target: molId });
      }
    }

    // Mark shared molecules
    for (const [molId, sources] of Object.entries(moleculeSources)) {
      const node = nodeMap.get(molId);
      if (node) {
        node.ingredientSources = sources;
        if (sources.length > 1) {
          node.shared = true;
          node.radius = 12;
        }
      }
    }

    // Deduplicate links
    const linkSet = new Set<string>();
    const uniqueLinks = linkList.filter((l) => {
      const key = `${l.source}-${l.target}`;
      if (linkSet.has(key)) return false;
      linkSet.add(key);
      return true;
    });

    return { nodes: Array.from(nodeMap.values()), links: uniqueLinks };
  }, [ingredients]);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Defs
    const defs = svg.append("defs");
    const glowFilter = defs.append("filter").attr("id", "glow-network");
    glowFilter
      .append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g");

    // Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    svg.call(zoom);

    // Force simulation
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(50)
      )
      .force("charge", d3.forceManyBody().strength(-80))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collide",
        d3.forceCollide<GraphNode>().radius((d) => d.radius + 3)
      );

    // Links
    const link = g
      .append("g")
      .selectAll<SVGLineElement, GraphLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.15)
      .attr("stroke-width", 1);

    // Nodes
    const node = g
      .append("g")
      .selectAll<SVGCircleElement, GraphNode>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => d.color)
      .attr("stroke", (d) =>
        d.type === "ingredient" ? "#fff" : d.shared ? "#fff" : "none"
      )
      .attr("stroke-width", (d) =>
        d.type === "ingredient" ? 2.5 : d.shared ? 1.5 : 0
      )
      .attr("filter", (d) => (d.shared ? "url(#glow-network)" : "none"))
      .attr("cursor", "pointer")
      .attr("opacity", 0)
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Animate nodes in
    node
      .transition()
      .delay((_, i) => i * 20)
      .duration(400)
      .attr("opacity", 1);

    // Labels for ingredient nodes
    const labels = g
      .append("g")
      .selectAll<SVGTextElement, GraphNode>("text")
      .data(nodes.filter((n) => n.type === "ingredient"))
      .join("text")
      .text((d) => d.name)
      .attr("font-size", "10px")
      .attr("font-weight", "700")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.radius + 14)
      .attr("fill", "currentColor")
      .attr("fill-opacity", 0.8)
      .attr("pointer-events", "none")
      .attr("text-transform", "capitalize");

    // Hover interactions
    node
      .on("mouseenter", (event, d) => {
        const connectedIds = new Set<string>();
        connectedIds.add(d.id);
        links.forEach((l) => {
          const sid = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
          const tid = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
          if (sid === d.id) connectedIds.add(tid);
          if (tid === d.id) connectedIds.add(sid);
        });

        node.attr("opacity", (n) => (connectedIds.has(n.id) ? 1 : 0.12));
        link.attr("stroke-opacity", (l) => {
          const sid = typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
          const tid = typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
          return sid === d.id || tid === d.id ? 0.5 : 0.03;
        });
        labels.attr("fill-opacity", (n) => (connectedIds.has(n.id) ? 0.9 : 0.1));

        const details =
          d.type === "ingredient"
            ? `${getMoleculesForIngredient(d.name).length} molecules`
            : `${d.flavorCategory} | ${(d.ingredientSources || []).join(", ")}`;

        setTooltip({
          name: d.name,
          details,
          x: event.pageX - (containerRef.current?.getBoundingClientRect().left || 0),
          y: event.pageY - (containerRef.current?.getBoundingClientRect().top || 0),
          color: d.color,
        });
      })
      .on("mouseleave", () => {
        node.attr("opacity", 1);
        link.attr("stroke-opacity", 0.15);
        labels.attr("fill-opacity", 0.8);
        setTooltip(null);
      });

    // Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

      labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height]);

  if (nodes.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        No flavor network data available
      </div>
    );
  }

  // Legend
  const sharedCount = nodes.filter((n) => n.shared).length;
  const ingCount = nodes.filter((n) => n.type === "ingredient").length;
  const molCount = nodes.filter((n) => n.type === "molecule").length;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#FF6F00]" />
          Ingredients ({ingCount})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-full bg-[#90A4AE]" />
          Molecules ({molCount})
        </span>
        {sharedCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-full border-2 border-white bg-[#FFD54F] shadow" />
            Shared ({sharedCount})
          </span>
        )}
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="mx-auto rounded-lg border border-border/30 text-foreground"
      />

      <AnimatePresence>
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none absolute z-10 w-52 rounded-lg border border-border bg-popover p-3 shadow-xl"
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
              {tooltip.details}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
