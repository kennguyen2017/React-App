function normalizeValues(values) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return values.map((value) => (value - min) / range);
}

function toPolylinePoints(values, width, height, padding) {
  const normalized = normalizeValues(values);
  const step = (width - padding * 2) / (values.length - 1);

  return normalized
    .map((value, index) => {
      const x = padding + step * index;
      const y = height - padding - value * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function LineChart({ data }) {
  const width = 940;
  const height = 240;
  const padding = 20;

  const weightPoints = toPolylinePoints(
    data.map((item) => item.weight),
    width,
    height,
    padding
  );

  const fatPoints = toPolylinePoints(
    data.map((item) => item.fat),
    width,
    height,
    padding
  );

  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span className="legend-item legend-item-weight">Weight</span>
        <span className="legend-item legend-item-fat">Body fat</span>
      </div>
      <svg
        className="line-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Weight and body fat monthly chart"
      >
        <polyline className="line line-weight" points={weightPoints}></polyline>
        <polyline className="line line-fat" points={fatPoints}></polyline>
      </svg>
    </div>
  );
}
