import React, { useEffect, useRef } from "react";
import { Network } from "vis-network";
import type {
  NetworkNode,
  NetworkEdge,
} from "../services/duplicateContentService";

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  height?: string;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  nodes,
  edges,
  height = "600px",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    // Transform nodes and edges for vis-network
    const visNodes = nodes.map((node) => ({
      id: node.id,
      label: node.label,
      title: node.title,
      group: node.group,
      value: node.value,
      font: {
        size: 14,
        color: "#374151",
      },
      borderWidth: 2,
      borderWidthSelected: 3,
    }));

    const visEdges = edges.map((edge) => ({
      from: edge.from,
      to: edge.to,
      value: edge.value,
      title: edge.title,
      color: {
        color: edge.color,
        highlight: edge.color,
        hover: edge.color,
      },
      width: Math.max(1, edge.value * 3), // Scale edge width by similarity
      smooth: {
        enabled: true,
        type: "continuous",
        roundness: 0.5,
      } as any,
    }));

    const data = {
      nodes: visNodes,
      edges: visEdges,
    };

    const options = {
      nodes: {
        shape: "dot",
        size: 16,
        font: {
          size: 14,
          face: "Inter, sans-serif",
        },
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: "rgba(0,0,0,0.2)",
          size: 5,
          x: 2,
          y: 2,
        },
      },
      edges: {
        color: {
          inherit: false,
        },
        smooth: {
          enabled: true,
          type: "continuous",
          roundness: 0.5,
        },
        arrows: {
          to: {
            enabled: false,
          },
        },
      },
      physics: {
        enabled: true,
        stabilization: {
          enabled: true,
          iterations: 200,
          updateInterval: 25,
        },
        barnesHut: {
          gravitationalConstant: -2000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04,
          damping: 0.95,
          avoidOverlap: 0.5,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        hideEdgesOnDrag: true,
        navigationButtons: true,
        keyboard: {
          enabled: true,
          bindToWindow: false,
        },
      },
      groups: {
        unique: {
          color: {
            background: "#10b981",
            border: "#059669",
            highlight: {
              background: "#34d399",
              border: "#059669",
            },
          },
        },
        exact: {
          color: {
            background: "#ef4444",
            border: "#dc2626",
            highlight: {
              background: "#f87171",
              border: "#dc2626",
            },
          },
        },
        near: {
          color: {
            background: "#f59e0b",
            border: "#d97706",
            highlight: {
              background: "#fbbf24",
              border: "#d97706",
            },
          },
        },
        similar: {
          color: {
            background: "#3b82f6",
            border: "#2563eb",
            highlight: {
              background: "#60a5fa",
              border: "#2563eb",
            },
          },
        },
      },
    };

    // Destroy existing network if any
    if (networkRef.current) {
      networkRef.current.destroy();
    }

    // Create new network
    networkRef.current = new Network(containerRef.current, data, options);

    // Add event listeners
    networkRef.current.on("click", (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.find((n) => n.id === nodeId);
        if (node && node.title) {
          console.log("Clicked node:", node);
        }
      }
    });

    networkRef.current.on("hoverNode", () => {
      containerRef.current!.style.cursor = "pointer";
    });

    networkRef.current.on("blurNode", () => {
      containerRef.current!.style.cursor = "default";
    });

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [nodes, edges]);

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width: "100%",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        backgroundColor: "#f9fafb",
      }}
    />
  );
};

export default NetworkGraph;
