<script lang="ts">
  let {
    columns,
    rows,
  }: {
    columns: string[];
    rows: (string | number)[][];
  } = $props();

  // The Percentile column gets the bold firebrick styling that
  // formatStyle() applied in the Shiny DT tables.
  let percentileIndex = $derived(columns.indexOf('Percentile'));
</script>

<table class="cf-table">
  <thead>
    <tr>
      {#each columns as column (column)}
        <th>{column}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each rows as row, i (i)}
      <tr>
        {#each row as cell, j (j)}
          <td class:percentile-cell={j === percentileIndex}>{cell}</td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
