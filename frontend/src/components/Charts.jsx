import React, { useState } from "react";

// 1. Line/Area Chart for "Alerts Over Time (Last 24 Hours)"
export function AlertsOverTimeChart({ data = [] }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Default points matching screenshot curve
  const points = data.length > 0 ? data : [
    { time: "12:00", count: 35 },
    { time: "14:00", count: 68 },
    { time: "16:00", count: 42 },
    { time: "18:00", count: 65 },
    { time: "21:00", count: 38 },
    { time: "00:00", count: 70 },
    { time: "03:00", count: 110 },
    { time: "06:00", count: 75 },
    { time: "09:00", count: 122 },
    { time: "12:00", count: 105 },
  ];

  const width = 500;
  const height = 210;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = 150;
  const minVal = 0;

  // Calculate coordinates
  const coords = points.map((p, idx) => {
    const x = paddingLeft + (idx / (points.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((p.count - minVal) / (maxVal - minVal)) * chartHeight;
    return { ...p, x, y };
  });

  // Build smooth bezier SVG path
  let pathD = "";
  if (coords.length > 0) {
    pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
  }

  // Build area fill under path
  const areaD = `${pathD} L ${coords[coords.length - 1].x} ${paddingTop + chartHeight} L ${coords[0].x} ${paddingTop + chartHeight} Z`;

  const yTicks = [150, 100, 50, 0];
  const xLabels = ["12:00", "18:00", "00:00", "06:00", "12:00"];

  return (
    <div className="chart-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="time-series-svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {yTicks.map((val) => {
          const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
          return (
            <g key={val}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#edf2f7"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="chart-axis-label"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area fill under curve */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Curved blue line */}
        <path
          d={pathD}
          fill="none"
          stroke="#2563eb"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {coords.map((pt, idx) => (
          <g
            key={idx}
            className="chart-point-group"
            onMouseEnter={() => setHoveredPoint(pt)}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.time === pt.time ? 5 : 3.5}
              fill="#2563eb"
              stroke="#ffffff"
              strokeWidth="2"
              className="chart-circle"
            />
          </g>
        ))}

        {/* X Axis labels */}
        {xLabels.map((lbl, idx) => {
          const x = paddingLeft + (idx / (xLabels.length - 1)) * chartWidth;
          return (
            <text
              key={lbl + idx}
              x={x}
              y={height - 8}
              textAnchor="middle"
              className="chart-axis-label"
            >
              {lbl}
            </text>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="chart-tooltip"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`,
          }}
        >
          <strong>{hoveredPoint.count} alerts</strong>
          <span>at {hoveredPoint.time}</span>
        </div>
      )}
    </div>
  );
}


// 2. Donut Chart for "Alerts by Severity"
export function SeverityDonutChart({ data = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const defaultSegments = [
    { label: "Critical", value: 23, color: "#ef4444" },
    { label: "High", value: 67, color: "#f97316" },
    { label: "Medium", value: 312, color: "#eab308" },
    { label: "Low", value: 846, color: "#3b82f6" },
  ];

  const segments = data.length > 0 ? data : defaultSegments;
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  const size = 180;
  const radius = 65;
  const strokeWidth = 26;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="donut-chart-wrapper">
      <div className="donut-svg-container">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, idx) => {
            const percent = seg.value / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -cumulativePercent * circumference;
            cumulativePercent += percent;

            const isHovered = hoveredIndex === idx;

            return (
              <circle
                key={seg.label}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${center} ${center})`}
                className="donut-segment"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>

        {/* Center label when hovering */}
        <div className="donut-center-info">
          {hoveredIndex !== null ? (
            <>
              <strong>{segments[hoveredIndex].value}</strong>
              <span>{segments[hoveredIndex].label}</span>
            </>
          ) : (
            <>
              <strong>{total.toLocaleString()}</strong>
              <span>Total</span>
            </>
          )}
        </div>
      </div>

      {/* Legend on Right (matches image 3) */}
      <div className="donut-legend">
        {segments.map((seg, idx) => (
          <div
            key={seg.label}
            className={`legend-item ${hoveredIndex === idx ? "active" : ""}`}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <span className="legend-dot" style={{ backgroundColor: seg.color }} />
            <span className="legend-label">
              {seg.label} ({seg.value.toLocaleString()})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


// 3. Horizontal Bar Chart for "Top Attack Categories"
export function TopAttackCategoriesChart({ data = [] }) {
  const defaultItems = [
    { category: "Scanning", count: 432 },
    { category: "Web Attack", count: 312 },
    { category: "Brute Force", count: 201 },
    { category: "Malware", count: 123 },
    { category: "Other", count: 180 },
  ];

  const items = data.length > 0 ? data : defaultItems;
  const maxVal = 500;
  const ticks = [0, 100, 200, 300, 400, 500];

  return (
    <div className="category-bars-wrapper">
      <div className="category-bars-list">
        {items.map((item) => {
          const percent = Math.min((item.count / maxVal) * 100, 100);
          return (
            <div className="category-bar-row" key={item.category}>
              <div className="bar-label-col">
                <span>{item.category}</span>
              </div>
              <div className="bar-track-col">
                <div
                  className="bar-fill-element"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="bar-value-col">
                <span>{item.count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom X-axis scale ticks (0, 100, 200, 300, 400, 500) */}
      <div className="bar-scale-axis">
        <div className="bar-scale-spacer" />
        <div className="bar-scale-ticks">
          {ticks.map((t) => (
            <span key={t} className="scale-tick">
              {t}
            </span>
          ))}
        </div>
        <div className="bar-scale-end-spacer" />
      </div>
    </div>
  );
}
