"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { BarElement, Plugin } from "chart.js";
import type { AgeGroupRow } from "@/lib/load-age-data";
import styles from "./age.module.css";

const chartColors = ["#4e79a7", "#f28e2b", "#59a14f", "#b07aa1", "#76b7b2"];

const valueLabels: Plugin<"bar"> = {
  id: "age-value-labels",
  afterDatasetsDraw(chart) {
    chart.ctx.save();
    chart.ctx.fillStyle = "#263b50";
    chart.ctx.font = "700 10px Arial, sans-serif";
    chart.ctx.textAlign = "center";
    chart.ctx.textBaseline = "bottom";

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);

      meta.data.forEach((element, index) => {
        const value = Number(dataset.data[index] ?? 0);
        if (value === 0) return;

        const bar = element as BarElement;
        if (bar.x === null || bar.y === null) return;
        chart.ctx.fillText(value.toLocaleString("th-TH"), bar.x, bar.y - 3);
      });
    });

    chart.ctx.restore();
  },
};

export function AgeBarChart({
  rows,
  activities,
}: {
  rows: AgeGroupRow[];
  activities: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const chart = new Chart(canvasRef.current, {
      type: "bar",
      data: {
        labels: rows.map((row) => row.label),
        datasets: activities.map((activity, index) => ({
          label: activity,
          data: rows.map((row) => row.activityCounts[activity] ?? 0),
          backgroundColor: chartColors[index % chartColors.length],
          borderRadius: 4,
          borderSkipped: false,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 550 },
        layout: { padding: { top: 18, right: 8, bottom: 0, left: 4 } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#4b4b4b", font: { family: "Arial", size: 10 } },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#4b4b4b",
              font: { family: "Arial", size: 10 },
              precision: 0,
            },
            grid: { color: "#d9d9d9" },
            border: { display: false },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              boxWidth: 7,
              boxHeight: 7,
              padding: 12,
              color: "#333333",
              font: { family: "Arial", size: 10 },
            },
          },
          tooltip: {
            callbacks: {
              label(context) {
                return ` ${context.dataset.label}: ${Number(context.raw ?? 0).toLocaleString("th-TH")} คน`;
              },
            },
          },
        },
      },
      plugins: [valueLabels],
    });

    return () => chart.destroy();
  }, [activities, rows]);

  return (
    <div className={styles.chartCanvas}>
      <canvas ref={canvasRef} aria-label="กราฟแท่งข้อมูลตามกลุ่มอายุ" role="img" />
    </div>
  );
}
