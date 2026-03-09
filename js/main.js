d3.csv('./data/Cleaned Cat Data.csv').then((data) => {
  // eslint-disable-next-line no-unused-vars, no-undef
  const splot = new Scatterplot({
    parentElement: '#scatterplot .vis',
  }, data);
});

d3.json('./data/cat_bubbles_all.json').then((data) => {
  // eslint-disable-next-line no-unused-vars, no-undef
  const bubbleMap = new BubbleMap({
    parentElement: '#bubbleMap',
  }, data);
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
