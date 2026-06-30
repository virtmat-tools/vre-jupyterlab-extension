# Package Statistics

This page tracks the release cadence and version history of the VRE JupyterLab Extension directly from the Python Package Index (PyPI).

<div style="width: 100%; max-width: 800px; margin: 3rem auto; background: var(--md-default-bg-color); padding: 1rem; border-radius: 8px; box-shadow: var(--md-shadow-z1);">
  <canvas id="releasesChart"></canvas>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  async function loadStats() {
    try {
      const res = await fetch('https://pypi.org/pypi/vre-jupyterlab-extension/json');
      const data = await res.json();
      const releases = data.releases;
      
      const labels = [];
      const dataset = [];
      
      let totalReleases = 0;
      
      // Sort versions by upload time
      const sortedReleases = Object.entries(releases)
        .filter(([version, files]) => files.length > 0)
        .sort((a, b) => new Date(a[1][0].upload_time) - new Date(b[1][0].upload_time));

      sortedReleases.forEach(([version, files]) => {
        totalReleases++;
        // Use version for X axis
        labels.push(version);
        // Use cumulative count for Y axis
        dataset.push(totalReleases);
      });

      const ctx = document.getElementById('releasesChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cumulative Versions Published',
            data: dataset,
            borderColor: '#5c6bc0',
            backgroundColor: 'rgba(92, 107, 192, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3949ab',
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Cumulative Releases on PyPI',
              font: { size: 18, family: 'sans-serif' },
              color: 'var(--md-default-fg-color)'
            },
            legend: { display: false },
            tooltip: {
              callbacks: {
                afterLabel: function(context) {
                  const version = context.label;
                  const uploadTime = new Date(releases[version][0].upload_time).toLocaleDateString();
                  return `Published: ${uploadTime}`;
                }
              }
            }
          },
          scales: {
            x: { 
              grid: { color: 'var(--md-default-fg-color--lightest)' },
              ticks: { color: 'var(--md-default-fg-color)' }
            },
            y: { 
              beginAtZero: true, 
              ticks: { stepSize: 1, color: 'var(--md-default-fg-color)' },
              grid: { color: 'var(--md-default-fg-color--lightest)' }
            }
          }
        }
      });
    } catch (e) {
      console.error('Failed to load PyPI stats:', e);
    }
  }
  
  // Wait for DOM to load before executing chart logic
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStats);
  } else {
    loadStats();
  }
</script>

---

## 📊 External Metrics

<div class="grid cards" markdown>

-   :material-chart-line: **Download Statistics (PePy)**

    View detailed download metrics, including weekly trends and OS distribution, via PePy.
    
    [View Downloads :octicons-arrow-right-24:](https://pepy.tech/project/vre-jupyterlab-extension)

-   :material-github: **Source Code**

    View issues, PRs, and repository analytics on GitHub.
    
    [View GitHub :octicons-arrow-right-24:](https://github.com/virtmat-tools/vre-jupyterlab-extension)

</div>
