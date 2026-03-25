/* global Scatterplot, CatMap, RadialChart, CatProfile */
/* eslint-disable no-param-reassign */

d3.csv('./data/Cleaned Cat Data.csv').then((data) => {
  // eslint-disable-next-line no-unused-vars, no-undef
  data.forEach((d) => {
    d.Age = parseFloat(d.Age);
    d['Home Range Area (km2)'] = parseFloat(d['Home Range Area (km2)']);
  });
  const splot = new Scatterplot({
    parentElement: '#scatterplot .vis',
  }, data);
  const chosenCategories = [];
  d3.selectAll('.radio-button-group').on(
    'click',
    (event) => {
      const clickedCategory = event.currentTarget.classList[1];
      if (chosenCategories.includes(clickedCategory)) {
        chosenCategories.splice(chosenCategories.indexOf(clickedCategory), 1);
        d3.select(`.radio-button-label.${clickedCategory}`)
          .classed('active', false);
      } else {
        chosenCategories.push(clickedCategory);
        d3.select(`.radio-button-label.${clickedCategory}`)
          .classed('active', true);
      }
      if (chosenCategories.length !== 0) {
        const filteredData = data.filter((d) => chosenCategories.includes(d.Sex));
        splot.data = filteredData;
      } else {
        splot.data = data;
      }
      splot.updateVis();
    },
  );
});
d3.csv('./data/Cleaned Cat Data new.csv').then((data) => {
  // eslint-disable-next-line no-unused-vars, no-undef
  const catProfile = new CatProfile({
    parentElement: '#cat-profile',
  }, data);
});
d3.json('./data/cat_bubbles_all.geojson').then((data) => {
  d3.json('./data/cat_paths_all.geojson').then((pathsData) => {
    // eslint-disable-next-line no-unused-vars, no-undef
    const catMap = new CatMap({
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
