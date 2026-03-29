// eslint-disable-next-line no-unused-vars
class BubbleMap {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      minRadius: 50, // meters
      maxRadius: 500, // meters
    };
    this.data = _data;
    this.initVis();
  }

  initVis() {
    const vis = this;
    // map container
    const parent = d3.select(vis.config.parentElement);
    parent.html('');
    parent.append('h3')
      .text('Cat Home Ranges')
      .style('margin', '8px')
      .style('font-size', '1.1em');
    parent.append('div')
      .attr('id', 'map-container');

    vis.map = L.map('map-container', {
      center: [0, 0],
      zoom: 2,
    });

    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(vis.map);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    const homeRanges = vis.data.features.map((d) => d.properties.home_range);
    const minHomeRange = d3.min(homeRanges);
    const maxHomeRange = d3.max(homeRanges);

    // Create linear scale from home_range to radius in meters
    vis.radiusScale = d3.scaleLinear()
      .domain([minHomeRange, maxHomeRange])
      .range([vis.config.minRadius, vis.config.maxRadius]);

    vis.renderVis();
  }

  renderVis() {
    const vis = this;
    const bounds = [];

    // Create circles for each cat
    vis.data.features.forEach((feature) => {
      const { coordinates } = feature.geometry;
      const { prey_p_month: preyPerMonth } = feature.properties;
      const lon = coordinates[0];
      const lat = coordinates[1];
      const { home_range: homeRange } = feature.properties;
      const radius = vis.radiusScale(homeRange);

      let preyCat;
      // eslint-disable-next-line no-param-reassign
      if (preyPerMonth <= 2) preyCat = '#ffd700';
      // eslint-disable-next-line no-param-reassign
      else if (preyPerMonth <= 5) preyCat = '#b060eb';
      // eslint-disable-next-line no-param-reassign
      else preyCat = '#5381ff';

      L.circle([lat, lon], {
        radius,
        color: preyCat,
        fillColor: preyCat,
        fillOpacity: 0.4,
        weight: 2,
      }).addTo(vis.map);

      bounds.push([lat, lon]);
    });

    // Fit map to show all circles
    if (bounds.length > 0) {
      vis.map.fitBounds(bounds, { padding: [20, 20] });
    }
  }
}
