import { useState } from "react";

const FAT_MIN = 20;
const FAT_MAX = 26;
const WEIGHT_MIN = 60;
const WEIGHT_MAX = 75;

function scaleValueToY(value, min, max, plotTop, plotBottom) {
  const ratio = (value - min) / (max - min);
  return plotBottom - ratio * (plotBottom - plotTop);
}

function toPolylinePoints(values, min, max, plotLeft, plotTop, plotRight, plotBottom) {
  const step = (plotRight - plotLeft) / (values.length - 1);

  return values
    .map((value, index) => {
      const x = plotLeft + step * index;
      const y = scaleValueToY(value, min, max, plotTop, plotBottom);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function LineChart({ data }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const width = 940;
  const height = 550;
  const plotTop = 40;
  const plotBottom = height - 56;
  const plotLeft = 52;
  const plotRight = width - 52;
  const step = (plotRight - plotLeft) / (data.length - 1);
  const fatTicks = [20, 21, 22, 23, 24, 25, 26];
  const weightTicks = [60, 62.5, 65, 67.5, 70, 72.5, 75];

  const weightPoints = toPolylinePoints(
    data.map((item) => item.weight),
    WEIGHT_MIN,
    WEIGHT_MAX,
    plotLeft,
    plotTop,
    plotRight,
    plotBottom
  );

  const fatPoints = toPolylinePoints(
    data.map((item) => item.fat),
    FAT_MIN,
    FAT_MAX,
    plotLeft,
    plotTop,
    plotRight,
    plotBottom
  );

  return (
    <div className="chart-wrap">
      {hoveredPoint ? (
        <div
          className="chart-tooltip"
          style={{
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${(hoveredPoint.y / height) * 100}%`,
            borderColor: hoveredPoint.tone,
          }}
        >
          <div className="chart-tooltip-month">{hoveredPoint.month}月</div>
          <div className="chart-tooltip-value" style={{ color: hoveredPoint.tone }}>
            {hoveredPoint.label}: {hoveredPoint.value}
          </div>
        </div>
      ) : null}

      <svg
        className="line-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Weight and body fat monthly chart"
      >
        <text className="chart-side-label chart-side-label-left" x={16} y={20}>
          Fat
        </text>
        <text className="chart-side-label chart-side-label-right" x={width - 16} y={20} textAnchor="end">
          Weight
        </text>

        {fatTicks.map((tick, index) => {
          const y = scaleValueToY(tick, FAT_MIN, FAT_MAX, plotTop, plotBottom);
          const weightLabel = weightTicks[index];

          return (
            <g key={tick}>
              <line className="chart-horizontal-grid-line" x1={plotLeft} y1={y} x2={plotRight} y2={y}></line>
              <text className="chart-axis-label chart-axis-label-left" x={16} y={y + 5}>
                {tick.toFixed(1)}
              </text>
              <text className="chart-axis-label chart-axis-label-right" x={width - 16} y={y + 5} textAnchor="end">
                {Number.isInteger(weightLabel) ? weightLabel : weightLabel.toFixed(1)}
              </text>
            </g>
          );
        })}

        {data.map((item, index) => {
          const x = plotLeft + step * index;
          return (
            <g key={item.month}>
              <line className="chart-grid-line" x1={x} y1={plotTop} x2={x} y2={plotBottom}></line>
              <text className="chart-month-label" x={x} y={height - 12} textAnchor="middle">
                {item.month}月
              </text>
            </g>
          );
        })}
        <polyline className="line line-weight" points={weightPoints}></polyline>
        <polyline className="line line-fat" points={fatPoints}></polyline>
        {data.map((item, index) => {
          const x = plotLeft + step * index;
          const weightY = scaleValueToY(item.weight, WEIGHT_MIN, WEIGHT_MAX, plotTop, plotBottom);
          const fatY = scaleValueToY(item.fat, FAT_MIN, FAT_MAX, plotTop, plotBottom);
          const weightKey = `${item.month}-weight`;
          const fatKey = `${item.month}-fat`;

          return (
            <g key={`${item.month}-points`}>
              <circle
                className={`line-point line-point-weight ${hoveredPoint?.key === weightKey ? "is-active" : ""}`}
                cx={x}
                cy={weightY}
                r={hoveredPoint?.key === weightKey ? 7 : 4.5}
                onMouseEnter={() =>
                  setHoveredPoint({
                    key: weightKey,
                    month: item.month,
                    label: "Weight",
                    value: item.weight,
                    x,
                    y: weightY,
                    tone: "#ffcc21",
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              ></circle>
              <circle
                className={`line-point line-point-fat ${hoveredPoint?.key === fatKey ? "is-active" : ""}`}
                cx={x}
                cy={fatY}
                r={hoveredPoint?.key === fatKey ? 7 : 4.5}
                onMouseEnter={() =>
                  setHoveredPoint({
                    key: fatKey,
                    month: item.month,
                    label: "Fat",
                    value: item.fat,
                    x,
                    y: fatY,
                    tone: "#8fe9d0",
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              ></circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
