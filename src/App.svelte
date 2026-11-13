<script lang="ts">
  import About from './pages/About.svelte';
  import Background from './pages/Background.svelte';
  import SingleMeasurement from './pages/SingleMeasurement.svelte';
  import MultipleTraits from './pages/MultipleTraits.svelte';
  import TimeSeries from './pages/TimeSeries.svelte';
  import Terms from './pages/Terms.svelte';

  const pages = [
    { id: 'about', label: 'About' },
    { id: 'background', label: 'Background' },
    { id: 'single', label: 'Single Measurement' },
    { id: 'multi', label: 'Multiple Traits' },
    { id: 'time', label: 'Time Series' },
    { id: 'tos', label: 'Terms of Service' },
  ] as const;

  type PageId = (typeof pages)[number]['id'];

  function routeFromHash(): PageId {
    const hash = window.location.hash.replace(/^#\/?/, '');
    const found = pages.find((p) => p.id === hash);
    return found ? found.id : 'about';
  }

  let route = $state<PageId>(routeFromHash());

  $effect(() => {
    const onHashChange = () => {
      route = routeFromHash();
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });

  function navigate(id: PageId) {
    window.location.hash = `#/${id}`;
  }

  // Dark mode (port of www/dark-mode.js); index.html applies the saved
  // theme before first paint.
  let theme = $state(localStorage.getItem('cf-theme') ?? 'light');

  $effect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cf-theme', theme);
  });

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
  }

  // Disclaimer modal (port of www/disclaimer-popup.js): acknowledgment
  // stored in localStorage and expires after 24 hours.
  const ACKNOWLEDGMENT_TIMEOUT = 24 * 60 * 60 * 1000;

  function checkAcknowledged(): boolean {
    const acknowledged =
      localStorage.getItem('cf-disclaimer-acknowledged') === 'true';
    const timestamp = parseInt(
      localStorage.getItem('cf-disclaimer-timestamp') ?? '',
      10,
    );
    return (
      acknowledged &&
      Number.isFinite(timestamp) &&
      Date.now() - timestamp <= ACKNOWLEDGMENT_TIMEOUT
    );
  }

  let acknowledged = $state(checkAcknowledged());

  function acknowledgeDisclaimer() {
    localStorage.setItem('cf-disclaimer-acknowledged', 'true');
    localStorage.setItem('cf-disclaimer-timestamp', Date.now().toString());
    acknowledged = true;
  }

  $effect(() => {
    document.body.style.overflow = acknowledged ? '' : 'hidden';
  });
</script>

<header class="app-header">
  <h1 class="app-title">Craniofacial Growth</h1>
  <button class="theme-toggle" onclick={toggleTheme}>
    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
  </button>
</header>

<div class="app-layout">
  <aside class="app-sidebar">
    <nav>
      {#each pages as page (page.id)}
        <button
          class="nav-item"
          class:active={route === page.id}
          class:disabled-until-ack={!acknowledged && page.id !== 'about'}
          disabled={!acknowledged && page.id !== 'about'}
          onclick={() => navigate(page.id)}
        >
          {page.label}
        </button>
      {/each}
    </nav>
  </aside>

  <main class="app-content">
    <div style:display={route === 'about' ? '' : 'none'}>
      <About />
    </div>
    <div style:display={route === 'background' ? '' : 'none'}>
      <Background />
    </div>
    <div style:display={route === 'single' ? '' : 'none'}>
      <SingleMeasurement />
    </div>
    <div style:display={route === 'multi' ? '' : 'none'}>
      <MultipleTraits />
    </div>
    <div style:display={route === 'time' ? '' : 'none'}>
      <TimeSeries />
    </div>
    <div style:display={route === 'tos' ? '' : 'none'}>
      <Terms active={route === 'tos'} />
    </div>
  </main>
</div>

{#if !acknowledged}
  <div id="disclaimer-modal" class="modal-overlay">
    <div class="modal-content" role="dialog" aria-modal="true">
      <div class="modal-header">
        <h2 class="modal-title">Notice</h2>
        <p class="modal-subtitle">
          Please read and acknowledge the following before proceeding:
        </p>
      </div>
      <div class="modal-body">
        <div class="disclaimer-section">
          <h4>Disclaimer</h4>
          <p>
            Craniofacial growth can be affected by many factors. This
            software is not intended for use for medical diagnostic or
            treatment purposes. The authors and their affiliated
            institutions are not liable for any damages to users or third
            parties arising from the use of this software.
          </p>
        </div>
        <div class="disclaimer-section">
          <h4>Copyright Notice</h4>
          <p>
            This software is protected under international copyright law.
            Unauthorized duplication or distribution is a violation of
            copyright.
          </p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-acknowledge" onclick={acknowledgeDisclaimer}>
          I Understand and Agree to These Terms
        </button>
      </div>
    </div>
  </div>
{/if}
