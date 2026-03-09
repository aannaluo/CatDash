d3.csv('Cleaned Cat Data.csv').then((data) => {
  // eslint-disable-next-line no-unused-vars, no-undef
  const splot = new Scatterplot({
    parentElement: '#scatterplot .vis',
  }, data);
});
