document.addEventListener('DOMContentLoaded', () => {
  const description = document.getElementById('description');
  const bubbleMap = document.getElementById('bubbleMap');
  const radialChart = document.getElementById('radialChart');
  const scatterplot = document.getElementById('scatterplot');

  if (description && window.renderDescription) {
    description.innerHTML = window.renderDescription();
  }

  if (bubbleMap && window.renderBubbleMap) {
    bubbleMap.innerHTML = window.renderBubbleMap();
  }

  if (radialChart && window.renderRadialChart) {
    radialChart.innerHTML = window.renderRadialChart();
  }

  if (scatterplot && window.renderScatterplot) {
    scatterplot.innerHTML = window.renderScatterplot();
  }
});
