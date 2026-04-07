// eslint-disable-next-line no-unused-vars
class CatMap {
  constructor(_config, _pathsData, _paths10Data) {
    this.config = {
      parentElement: _config.parentElement,
      minRadius: 50, // meters
      maxRadius: 500, // meters
    };
    this.pathsData = _pathsData;
    this.paths10DayData = _paths10Data;
    this.selectedCat = 'Abba_Pet Cats United Kingdom';
    this.showFirst10Days = true;
    this.initVis();
  }

  initVis() {
    const vis = this;

    // map container
    const parent = d3.select(vis.config.parentElement);
    parent.html('');

    parent.append('div')
      .attr('id', 'map-container');

    vis.map = L.map('map-container', {
      center: [0, 0],
      zoom: 2,
      attributionControl: false,
    });

    // Add recentre to layer button
    const RecentreControl = L.Control.extend({
      options: {
        position: 'topleft',
      },
      onAdd() {
        const btn = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const recentreBtn = L.DomUtil.create('a', 'leaflet-control-recentre', btn);
        recentreBtn.href = '#';
        recentreBtn.title = 'Recentre';
        recentreBtn.innerHTML = '<strong style="font-size: 18px;">⌖</strong>';
        L.DomEvent.on(recentreBtn, 'click', (e) => {
          L.DomEvent.preventDefault(e);
          vis.recentreMap();
        });
        return btn;
      },
    });

    vis.map.addControl(new RecentreControl());

    const PathToggleControl = L.Control.extend({
      options: {
        position: 'topright',
      },
      onAdd() {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const toggleLabel = L.DomUtil.create('label', 'path-toggle-label', container);
        const checkbox = L.DomUtil.create('input', '', toggleLabel);
        checkbox.type = 'checkbox';
        checkbox.id = 'path-toggle';
        checkbox.checked = true;

        const labelText = L.DomUtil.create('span', '', toggleLabel);
        labelText.textContent = ' First 10 Days only';

        L.DomEvent.on(checkbox, 'change', (e) => {
          vis.showFirst10Days = e.target.checked;
          vis.renderVis();
        });

        return container;
      },
    });

    vis.map.addControl(new PathToggleControl());

    // CartoDB Positron (light) tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(vis.map);

    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    const homeRanges = vis.paths10DayData.features.map((d) => d.properties.home_range);
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

    // Find the selected cat's feature
    const selectedFeature = vis.paths10DayData.features.find(
      (feature) => feature.properties['unique-id'] === vis.selectedCat,
    );

    if (!selectedFeature) {
      console.warn(`Cat "${vis.selectedCat}" not found`);
      return;
    }

    // Clear existing circles and paths
    vis.map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.Polyline) {
        vis.map.removeLayer(layer);
      }
    });

    // Add the cat path if available
    let pathCoords = null;
    if (vis.pathsData) {
      const pathDataToUse = vis.showFirst10Days ? vis.paths10DayData : vis.pathsData;

      if (pathDataToUse) {
        const selectedPath = pathDataToUse.features.find(
          (feature) => feature.properties['unique-id'] === vis.selectedCat,
        );

        if (selectedPath) {
          L.geoJSON(selectedPath, {
            style: {
              color: '#ED7A53',
              weight: 2,
              opacity: 1,
            },
          }).addTo(vis.map);

          // Calculate bounds from path coordinates
          pathCoords = selectedPath.geometry.coordinates;
          if (pathCoords.length > 0) {
            const bounds = L.latLngBounds(
              pathCoords.map((coord) => [coord[1], coord[0]]),
            );
            vis.bounds = bounds;
          }
        }
      }
    }

    const { coordinates } = selectedFeature.geometry;
    const { home_range: homeRange } = selectedFeature.properties;
    let circleCenter = [coordinates[1], coordinates[0]];
    circleCenter = [pathCoords[0][1], pathCoords[0][0]];
    const radius = vis.radiusScale(homeRange);

    L.circle(circleCenter, {
      radius,
      color: '#b060eb',
      fillColor: '#b060eb',
      fillOpacity: 0.4,
      weight: 2,
    }).addTo(vis.map);

    // Calculate dynamic bounds for the circle and zoom to fit
    const latOffset = radius / 111000;
    const lonOffset = radius / (111000 * Math.cos(circleCenter[0] * (Math.PI / 180)));
    const circleBounds = L.latLngBounds(
      [circleCenter[0] - latOffset, circleCenter[1] - lonOffset],
      [circleCenter[0] + latOffset, circleCenter[1] + lonOffset],
    );

    // Use path bounds if available, otherwise use circle bounds
    if (!vis.bounds) {
      vis.bounds = circleBounds;
    }

    vis.map.fitBounds(vis.bounds, { padding: [20, 20] });
  }

  recentreMap() {
    const vis = this;

    if (!vis.bounds) {
      return;
    }

    vis.map.fitBounds(vis.bounds, { padding: [20, 20] });
  }
}
