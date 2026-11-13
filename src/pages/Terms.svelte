<script lang="ts">
  // The TOS document is a large Word-exported HTML file with its own
  // embedded styles; an iframe keeps those styles isolated from the app.
  let { active = false }: { active?: boolean } = $props();

  const src = `${import.meta.env.BASE_URL}tos.html`;

  // Only set the iframe src once the page is first shown, so the 109KB
  // document isn't fetched on initial app load.
  let loaded = $state(false);

  $effect(() => {
    if (active) {
      loaded = true;
    }
  });
</script>

<div class="static-page">
  {#if loaded}
    <iframe class="tos-frame" {src} title="Terms of Service"></iframe>
  {/if}
</div>
