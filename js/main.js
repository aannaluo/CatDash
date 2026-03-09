// const Scatterplot = require('./components/scatterplot');

// document.addEventListener('DOMContentLoaded', () => {
//   const description = document.getElementById('description');
//   const bubbleMap = document.getElementById('bubbleMap');
//   const radialChart = document.getElementById('radialChart');
//   const scatterplot = document.getElementById('scatterplot');
//   if (description && window.renderDescription) {
//     description.innerHTML = window.renderDescription();
//     // load data, create a ne scatterplot and call initVis
//   }
//   if (bubbleMap && window.renderBubbleMap) {
//     bubbleMap.innerHTML = window.renderBubbleMap();
//   }

//   if (radialChart && window.renderRadialChart) {
//     radialChart.innerHTML = window.renderRadialChart();
//   }

//   if (scatterplot && window.renderScatterplot) {
//     scatterplot.innerHTML = window.renderScatterplot();
//   }
// });
d3.csv('Cleaned Cat Data.csv').then((data) => {
  // eslint-disable-next-line no-unused-vars, no-undef
  const splot = new Scatterplot({
    parentElement: '#scatterplot .vis',
  }, data);
});
