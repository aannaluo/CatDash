/* global Scatterplot, CatMap, RadialChart, CatProfile, Title */
/* eslint-disable no-param-reassign */
document.addEventListener('DOMContentLoaded', () => {
  const modal = new bootstrap.Modal(document.getElementById('exampleModal'));
  modal.show();
});
let catMap;

renderGenderLegend();
renderNeuterLegend();

const title = new Title({
  parentElement: '#title',
});

d3.json('./data/cat_paths_all.geojson').then((pathsData) => {
  d3.json('./data/cat_paths_10_days.geojson').then((paths10DayData) => {
    // eslint-disable-next-line no-unused-vars, no-undef
    catMap = new CatMap({
      parentElement: '#cat-map',
    }, pathsData, paths10DayData);
  });
});

d3.csv('./data/Cleaned Cat Data.csv').then((data) => {
  // eslint-disable-next-line no-unused-vars, no-undef

  const dispatcher = d3.dispatch('selectedPreyCats', 'selectedCat', 'selectedAgeCat');

  d3.select('#random-cat-btn')
    .on('click', () => {
      const index = Math.floor(Math.random() * data.length);
      const selectedCat = data[index];
      dispatcher.call('selectedCat', selectedCat, selectedCat['unique-id']);
    });

  data.forEach((d) => {
    d.age = parseFloat(d.age);
    d['home-range'] = parseFloat(d['home-range']);
    d.prey_p_month = parseFloat(d.prey_p_month);
  });

  const allPreyGroups = d3.groups(data, (d) => d.prey_p_month).map((d) => d[0]);
  const initialCat = 'Abba_Pet Cats United Kingdom';

  const beeAll = new Beeswarm({
    parentElement: '#bee-chart',
  }, allPreyGroups, dispatcher, initialCat, data);

  beeAll.updateVis();

  function getPreyCats(bins) {
    let allPreyCats = [];
    bins.forEach((b) => {
      if (b[0] === 20) {
        allPreyCats = allPreyCats.concat(d3.range(b[0], b[1] + 1));
      } else {
        allPreyCats = allPreyCats.concat(d3.range(b[0], b[1]));
      }
    });
    return allPreyCats;
  }

  dispatcher.on('selectedPreyCats', (selectedPreyCategories) => {
    if (selectedPreyCategories.length === 0) {
      beeAll.selectedPreyCategories = allPreyGroups;
      beeAll.updateVis();
    } else {
      beeAll.selectedPreyCategories = getPreyCats(selectedPreyCategories);
      console.log(beeAll.selectedPreyCategories);
      beeAll.updateVis();
    }
  });

  const catProfile = new CatProfile({
    parentElement: '#cat-profile',
  }, data);

  // bin data for barChart

  function binData(bData) {
    const binGenerator = d3.bin().value((d) => d.prey_p_month).thresholds([1, 5, 10, 20, 30]);
    return binGenerator(bData);
  }

  const barChart = new BarChart(
    { parentElement: '#barchart' },
    dispatcher,
    binData(data),
  );

  let heatMap;
  let lineChart;

  d3.csv('./data/line_graph.csv').then((lineData) => {
    lineData.forEach((d) => {
      d.timestamp = new Date(d.timestamp);
    });

    lineChart = new LineChart({ parentElement: '#line-chart-container' }, dispatcher, 'Abba_Pet Cats United Kingdom', lineData);
    lineChart.updateVis();
  });

  d3.csv('./data/Distance_radial.csv').then((radialData) => {
    radialData.forEach((d) => {
      d.distance = +d.distance;
      d.curr_hour = +d.curr_hour;
    });

    const radial = new RadialChart({ parentElement: '#radialChart' }, radialData);

    d3.csv('./data/Distance_heatmap.csv').then((heatmapData) => {
      heatmapData.forEach((d) => {
        d.day_number = +d.day_number;
        d.distance = +d.distance;
      });

      const filteredTenDaysData = d3.filter(heatmapData, (d) => d.day_number <= 10);

      heatMap = new HeatMap({ parentElement: '#heatmap' }, filteredTenDaysData, radialData, data, dispatcher, initialCat);
      heatMap.updateVis();
    });
  }).catch((error) => console.error(error));

  dispatcher.on('selectedCat', (selectedCat) => {
    if (!selectedCat) {
      catMap.selectedCat = 'Abba_Pet Cats United Kingdom';
      catMap.updateVis();
      beeAll.selectedCat = 'Abba_Pet Cats United Kingdom';
      beeAll.updateVis();
      catProfile.selectedCat = 'Abba_Pet Cats United Kingdom';
      catProfile.updateVis();
      heatMap.selectedCat = 'Abba_Pet Cats United Kingdom';
      heatMap.updateVis();
      lineChart.selectedCat = 'Abba_Pet Cats United Kingdom';
      lineChart.updateVis();
    } else {
      catMap.selectedCat = selectedCat;
      catMap.updateVis();
      catProfile.selectedCat = selectedCat;
      catProfile.updateVis();
      beeAll.selectedCat = selectedCat;
      beeAll.updateVis();
      heatMap.selectedCat = selectedCat;
      heatMap.updateVis();
      lineChart.selectedCat = selectedCat;
      lineChart.updateVis();
    }
  });

  dispatcher.on('selectedAgeCat', (selectedAgeCat) => {
    if (!selectedAgeCat) {
      barChart.data = binData(data);
      barChart.updateVis();
    } if (selectedAgeCat === 0) {
      barChart.data = binData(data.filter((d) => d.age <= 2));
      barChart.updateVis();
    } if (selectedAgeCat === 3) {
      barChart.data = binData(data.filter((d) => d.age > 2 && d.age <= 5));
      barChart.updateVis();
    } if (selectedAgeCat === 6) {
      barChart.data = binData(data.filter((d) => d.age > 5 && d.age <= 8));
      barChart.updateVis();
    } if (selectedAgeCat === 9) {
      barChart.data = binData(data.filter((d) => d.age > 8));
      barChart.updateVis();
    }
  });
});
