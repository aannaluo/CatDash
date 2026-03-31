/* global Scatterplot, CatMap, RadialChart, CatProfile */
/* eslint-disable no-param-reassign */

d3.csv('./data/Cleaned Cat Data.csv').then((data) => {
  // eslint-disable-next-line no-unused-vars, no-undef

  const dispatcher = d3.dispatch('selectedPreyCats', 'selectedCat');

  data.forEach((d) => {
    d.age = parseFloat(d.age);
    d['home-range'] = parseFloat(d['home-range']);
    d.prey_p_month = parseFloat(d.prey_p_month);
  });

  const allPreyGroups = d3.groups(data, (d) => d.prey_p_month).map((d) => d[0]);
  const beeOne = new Beeswarm({
    parentElement: '#bee1',
  }, allPreyGroups, dispatcher, data.filter((d) => d.age < 2));
  const beeTwo = new Beeswarm({
    parentElement: '#bee2',
  }, allPreyGroups, dispatcher, data.filter((d) => d.age > 2 && d.age <= 5));
  const beeThree = new Beeswarm({
    parentElement: '#bee3',
  }, allPreyGroups, dispatcher, data.filter((d) => d.age > 5 && d.age <= 9));
  const beeFour = new Beeswarm({
    parentElement: '#bee4',
  }, allPreyGroups, dispatcher, data.filter((d) => d.age > 9));

  beeOne.updateVis();
  beeTwo.updateVis();
  beeThree.updateVis();
  beeFour.updateVis();

  dispatcher.on('selectedPreyCats', (selectedPreyCategories) => {
    if (selectedPreyCategories.length === 0) {
      beeOne.selectedPreyCategories = allPreyGroups;
      beeOne.updateVis();
      beeTwo.selectedPreyCategories = allPreyGroups;
      beeTwo.updateVis();
      beeThree.selectedPreyCategories = allPreyGroups;
      beeThree.updateVis();
      beeFour.selectedPreyCategories = allPreyGroups;
      beeFour.updateVis();
    } else {
      beeOne.selectedPreyCategories = selectedPreyCategories;
      beeOne.updateVis();
      beeTwo.selectedPreyCategories = selectedPreyCategories;
      beeTwo.updateVis();
      beeThree.selectedPreyCategories = selectedPreyCategories;
      beeThree.updateVis();
      beeFour.selectedPreyCategories = selectedPreyCategories;
      beeFour.updateVis();
    }
  });

  dispatcher.on('selectedCat', (selectedCat) => {
    if (!selectedCat) {

    } else {
      ca
    }
  });

  const barChart = new BarChart(
    { parentElement: '#barchart' },
    dispatcher,
    data,
  );

  const catProfile = new CatProfile({
    parentElement: '#cat-profile',
  }, data);

  // const splot = new Scatterplot({
  //   parentElement: '#scatterplot .vis',
  // }, data);
  // const chosenCategories = [];
  // d3.selectAll('.radio-button-group').on(
  //   'click',
  //   (event) => {
  //     const clickedCategory = event.currentTarget.classList[1];
  //     if (chosenCategories.includes(clickedCategory)) {
  //       chosenCategories.splice(chosenCategories.indexOf(clickedCategory), 1);
  //       d3.select(`.radio-button-label.${clickedCategory}`)
  //         .classed('active', false);
  //     } else {
  //       chosenCategories.push(clickedCategory);
  //       d3.select(`.radio-button-label.${clickedCategory}`)
  //         .classed('active', true);
  //     }
  //     if (chosenCategories.length !== 0) {
  //       const filteredData = data.filter((d) => chosenCategories.includes(d.Sex));
  //       splot.data = filteredData;
  //     } else {
  //       splot.data = data;
  //     }
  //     splot.updateVis();
  //     },
  //   );

  d3.csv('./data/Distance_radial.csv').then((radialData) => {
    radialData.forEach((d) => {
      d.avg_distance = +d.avg_distance;
      d.curr_hour = +d.curr_hour;
    });

    const radial = new RadialChart({ parentElement: '#radialChart' }, radialData);

    d3.csv('./data/Distance_heatmap.csv').then((heatmapData) => {
      heatmapData.forEach((d) => {
        d.day_number = +d.day_number;
        d.distance = +d.distance;
      });

      const heatMap = new HeatMap({ parentElement: '#heatmap' }, heatmapData, radialData);
      heatMap.updateVis();
    });
}).catch((error) => console.error(error));
});

d3.json('./data/cat_bubbles_all.geojson').then((data) => {
  d3.json('./data/cat_paths_all.geojson').then((pathsData) => {
    // eslint-disable-next-line no-unused-vars, no-undef
    const catMap = new CatMap({
      parentElement: '#cat-map',
    }, data, pathsData);
  });
});




