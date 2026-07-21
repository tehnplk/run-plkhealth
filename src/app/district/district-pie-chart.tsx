"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { ArcElement, Plugin } from "chart.js";
import styles from "./district.module.css";

export type DistrictChartRow = {
  label: string;
  value: number;
  color: string;
};

function getValueLabelColor(backgroundColor: unknown) {
  if (typeof backgroundColor !== "string") return "#172033";

  const hex = backgroundColor.replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) return "#172033";

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = red * 0.299 + green * 0.587 + blue * 0.114;

  return luminance > 155 ? "#172033" : "#ffffff";
}

const valueLabels: Plugin<"pie"> = {
  id: "district-value-labels",
  afterDatasetsDraw(chart) {
    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);

    chart.ctx.save();
    chart.ctx.font = "700 11px Arial, sans-serif";
    chart.ctx.textAlign = "center";
    chart.ctx.textBaseline = "middle";

    meta.data.forEach((element, index) => {
      const value = Number(dataset.data[index] ?? 0);
      if (value === 0) return;

      const colors = dataset.backgroundColor;
      const sliceColor = Array.isArray(colors) ? colors[index] : colors;
      chart.ctx.fillStyle = getValueLabelColor(sliceColor);
      const point = (element as ArcElement).tooltipPosition(true);
      chart.ctx.fillText(value.toLocaleString("th-TH"), point.x, point.y);
    });

    chart.ctx.restore();
  },
};

export function DistrictPieChart({ rows }: { rows: DistrictChartRow[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: "pie",
      data: {
        labels: rows.map((row) => row.label),
        datasets: [
          {
            data: rows.map((row) => row.value),
            backgroundColor: rows.map((row) => row.color),
            borderColor: "#ffffff",
            borderWidth: 2,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 550,
        },
        layout: {
          padding: 10,
        },
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              padding: 10,
              color: "#111111",
              font: {
                family: "Arial, sans-serif",
                size: 11,
              },
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                const value = Number(context.raw ?? 0);
                return ` ${context.label}: ${value.toLocaleString("th-TH")} คน`;
              },
            },
          },
        },
      },
      plugins: [valueLabels],
    });

    return () => chart.destroy();
  }, [rows]);

  return (
    <div className={styles.chartCanvas}>
      <canvas ref={canvasRef} aria-label="กราฟวงกลมยอดสมัครรายอำเภอ" role="img" />
    </div>
  );
}
