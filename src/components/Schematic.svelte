<script lang="ts">
  import type { TraitsMeta } from '../lib/traits';

  let {
    meta,
    trait,
  }: {
    meta: TraitsMeta | null;
    trait: string;
  } = $props();

  const imgSrc = `${import.meta.env.BASE_URL}img/Craniometric_tracing.png`;

  // Raw landmark coordinates are top-left-origin pixels, which is also
  // the SVG coordinate system (the R app flips y for ggplot only).
  let points = $derived.by(() => {
    if (!meta) {
      return [];
    }
    const info = meta.traits.find((t) => t.name === trait);
    if (!info) {
      return [];
    }
    return info.landmarks
      .filter((name) => name in meta.landmarks)
      .map((name) => ({ name, ...meta.landmarks[name] }));
  });

  function labelAnchor(x: number): { x: number; anchor: string } {
    // Keep labels inside the 400px-wide image.
    if (x > 300) {
      return { x: x - 10, anchor: 'end' };
    }
    return { x: x + 10, anchor: 'start' };
  }
</script>

<div class="schematic">
  <img src={imgSrc} alt="Craniometric tracing with landmarks" />
  {#if meta && points.length === 2}
    <svg
      viewBox="0 0 {meta.image.width} {meta.image.height}"
      role="img"
      aria-label="Landmarks for {trait}"
    >
      <line
        x1={points[0].x}
        y1={points[0].y}
        x2={points[1].x}
        y2={points[1].y}
        stroke="red"
        stroke-width="2.5"
      />
      {#each points as point (point.name)}
        <circle cx={point.x} cy={point.y} r="5" fill="red" />
        <text
          x={labelAnchor(point.x).x}
          y={point.y - 10}
          text-anchor={labelAnchor(point.x).anchor}
          font-size="15"
          font-weight="600"
          fill="red"
          stroke="white"
          stroke-width="3"
          paint-order="stroke"
        >
          {point.name}
        </text>
      {/each}
    </svg>
  {/if}
</div>
