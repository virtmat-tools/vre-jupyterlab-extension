# Package Statistics

This page tracks the download history of the VRE JupyterLab Extension directly from the Python Package Index (PyPI).

<div style="width: 100%; max-width: 800px; margin: 3rem auto; background: var(--md-default-bg-color); padding: 1rem; border-radius: 8px; box-shadow: var(--md-shadow-z1);">
  <canvas id="downloadsChart"></canvas>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  async function loadStats() {
    try {
      // Fetch overall downloads from pypistats API
      const res = await fetch('https://pypistats.org/api/packages/vre-jupyterlab-extension/overall');
      const json = await res.json();
      
      const labels = [];
      const dataset = [];
      
      let cumulativeDownloads = 0;
      
      // Filter out duplicate 'without_mirrors' entries and sort by date
      const stats = json.data
        .filter(entry => entry.category === 'with_mirrors')
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      stats.forEach(entry => {
        cumulativeDownloads += entry.downloads;
        labels.push(entry.date);
        dataset.push(cumulativeDownloads);
      });

      const ctx = document.getElementById('downloadsChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Cumulative Downloads',
            data: dataset,
            borderColor: '#5c6bc0',
            backgroundColor: 'rgba(92, 107, 192, 0.15)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3949ab',
            pointRadius: 0,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Cumulative Downloads on PyPI',
              font: { size: 18, family: 'sans-serif' },
              color: 'var(--md-default-fg-color)'
            },
            legend: { display: false },
            tooltip: {
              callbacks: {
                afterLabel: function(context) {
                  return `Date: ${context.label}`;
                }
              }
            }
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: { 
              grid: { color: 'var(--md-default-fg-color--lightest)' },
              ticks: { 
                color: 'var(--md-default-fg-color)',
                maxTicksLimit: 10
              }
            },
            y: { 
              beginAtZero: true, 
              ticks: { color: 'var(--md-default-fg-color)' },
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
