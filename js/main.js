/* global Scatterplot, CatMap, RadialChart, CatProfile */
/* eslint-disable no-param-reassign */

let catMap;

d3.json('./data/cat_bubbles_all.geojson').then((data) => {
  d3.json('./data/cat_paths_all.geojson').then((pathsData) => {
    // eslint-disable-next-line no-unused-vars, no-undef
    catMap = new CatMap({
      parentElement: '#cat-map',
    }, data, pathsData);
  });
});
d3.csv('./data/Distance_Travelled.csv').then((data) => {
  data.forEach((d) => {
    // eslint-disable-next-line no-param-reassign
    d.avg_distance_p_hour = +d.avg_distance_p_hour;
    // eslint-disable-next-line no-param-reassign
    d.hour = +d.hour;
    // eslint-disable-next-line no-param-reassign
    d.prey_p_month = +d.prey_p_month;
  });
  // eslint-disable-next-line no-unused-vars, no-undef
  const radial = new RadialChart({
    parentElement: '#radialChart',
  }, data);
  radial.updateVis();
}).catch((error) => console.error(error));

d3.csv('./data/Distance_heatmap.csv').then((data) => {
  data.forEach((d) => {
    d.day_number = +d.day_number;
    d.distance = +d.distance;
  });
  const heatMap = new HeatMap({
    parentElement: '#heatmap',
  }, data);
  heatMap.updateVis();
});

d3.csv('./data/Cleaned Cat Data.csv').then((data) => {
  // eslint-disable-next-line no-unused-vars, no-undef

  const dispatcher = d3.dispatch('selectedPreyCats', 'selectedCat', 'selectedAgeCat');

  data.forEach((d) => {
    d.age = parseFloat(d.age);
    d['home-range'] = parseFloat(d['home-range']);
    d.prey_p_month = parseFloat(d.prey_p_month);
  });

  const allPreyGroups = d3.groups(data, (d) => d.prey_p_month).map((d) => d[0]);

  const beeAll = new Beeswarm({
    parentElement: '#bee1',
  }, allPreyGroups, dispatcher, 'Adele_Pet Cats Australia', data);

  beeAll.updateVis();

  dispatcher.on('selectedPreyCats', (selectedPreyCategories) => {
    if (selectedPreyCategories.length === 0) {
      beeAll.selectedPreyCategories = allPreyGroups;
      beeAll.updateVis();
    } else {
      beeAll.selectedPreyCategories = selectedPreyCategories;
      beeAll.updateVis();
    }
  });

  const catProfile = new CatProfile({
    parentElement: '#cat-profile',
  }, data);

  dispatcher.on('selectedCat', (selectedCat) => {
    if (!selectedCat) {
      catMap.selectedCat = 'Abba_Pet Cats United Kingdom';
      catMap.updateVis();
      catProfile.selectedCat = 'Abba_Pet Cats United Kingdom';
      catProfile.updateVis();
    } else {
      catMap.selectedCat = selectedCat;
      catMap.updateVis();
      catProfile.selectedCat = selectedCat;
      catProfile.updateVis();
    }
  });

  const barChart = new BarChart(
    { parentElement: '#barchart' },
    dispatcher,
    data,
  );

  dispatcher.on('selectedAgeCat', (selectedAgeCat) => {
    if (!selectedAgeCat) {
      barChart.data = data;
      barChart.updateVis();
    } if (selectedAgeCat === 0) {
      barChart.data = data.filter((d) => d.age <= 2);
      barChart.updateVis();
    } if (selectedAgeCat === 3) {
      barChart.data = data.filter((d) => d.age > 2 && d.age <= 5);
      barChart.updateVis();
    } if (selectedAgeCat === 6) {
      barChart.data = data.filter((d) => d.age > 5 && d.age <= 8);
      barChart.updateVis();
    } if (selectedAgeCat === 9) {
      barChart.data = data.filter((d) => d.age > 8);
      barChart.updateVis();
    }
  });
});
