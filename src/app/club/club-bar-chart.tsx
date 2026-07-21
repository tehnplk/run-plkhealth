"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { BarElement, Plugin } from "chart.js";
import type { ClubRow } from "@/lib/load-club-data";
import styles from "./club.module.css";

const valueLabels: Plugin<"bar"> = {
  id: "club-value-labels",
  afterDatasetsDraw(chart) {
    const dataset = chart.data.datasets[0];
    const meta = chart.getDatasetMeta(0);

    chart.ctx.save();
    chart.ctx.fillStyle = "#263b50";
    chart.ctx.font = "700 11px Arial, sans-serif";
    chart.ctx.textAlign = "left";
    chart.ctx.textBaseline = "middle";

    meta.data.forEach((element, index) => {
      const value = Number(dataset.data[index] ?? 0);
      const point = (element as BarElement).tooltipPosition(true);
      if (point.x === null || point.y === null) return;
      chart.ctx.fillText(value.toLocaleString("th-TH"), point.x + 8, point.y);
    });

    chart.ctx.restore();
  },
};

function truncateLabel(value: string) {
  return value.length > 34 ? `${value.slice(0, 34)}…` : value;
}

export function ClubBarChart({ rows }: { rows: ClubRow[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: rows.map((row) => row.label),
        datasets: [
          {
            data: rows.map((row) => row.registered),
            backgroundColor: "#4e79a7",
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 18,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 550,
        },
        layout: {
          padding: { right: 40 },
        },
        scales: {
          x: {
            beginAtZero: true,
            border: { display: false },
            grid: { color: "#e8edf2" },
            ticks: {
              color: "#718295",
              font: { family: "Arial, sans-serif", size: 10 },
              precision: 0,
            },
          },
          y: {
            border: { display: false },
            grid: { display: false },
            ticks: {
              color: "#34495e",
              font: { family: "Arial, sans-serif", size: 11 },
              callback(value) {
                return truncateLabel(String(this.getLabelForValue(Number(value))));
              },
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label(context) {
                return ` ${Number(context.raw ?? 0).toLocaleString("th-TH")} คน`;
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
      <canvas ref={canvasRef} aria-label="กราฟแท่งจำนวนผู้สมัครตามชมรม" role="img" />
    </div>
  );
}
