class CatProfile {
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
    };
    this.data = _data;
    this.selectedCat = 'Abba_Pet Cats United Kingdom';
    this.initVis();
  }

  initVis() {
    const vis = this;
    const parent = d3.select(vis.config.parentElement);
    parent.html('');
    vis.updateVis();
  }

  updateVis() {
    const vis = this;

    // Find the selected cat in the data
    const catData = vis.data.find((d) => d['unique-id'] === vis.selectedCat);

    if (!catData) {
      console.warn(`Cat "${vis.selectedCat}" not found`);
      return;
    }

    vis.renderVis(catData);
  }

  static formatNumber(num) {
    const parsed = parseFloat(num);
    return Number.isInteger(parsed) ? Math.round(parsed) : parsed;
  }

  static getFlagImage(studySite) {
    const flagMap = {
      UK: 'images/UK_cat.png',
      'United States': 'images/US_cat.png',
      Australia: 'images/AU_cat.png',
      'New Zealand': 'images/NZ_cat.png',
    };
    return flagMap[studySite] || null;
  }

  static formatDate(dateString) {
    if (!dateString) return '';
    return dateString.replace(/-/g, '/');
  }

  renderVis(catData) {
    const vis = this;
    const container = d3.select(vis.config.parentElement).node();
    const flagImage = CatProfile.getFlagImage(catData['study-site']);

    container.innerHTML = `
<div class="card">
  <div class="card-header d-flex justify-content-between align-items-center">
    <h5 class="mb-0" style="color: #C88A38;">${catData['animal-name']}</h5>
    <span style="color: #C88A38;">${CatProfile.formatNumber(catData.age)} years, ${catData.sex}</span>
  </div>
  <div class="card-body profile-info" style="color: #C88A38;">
    <div class="container">
      <div class="row">
        <div class="col">
        <ul style="margin: 0; flex: 1;">
          <li>Prey per Month: ${CatProfile.formatNumber(catData.prey_p_month)}</li>
          <li>Home Range: ${CatProfile.formatNumber(catData['home-range'])} km²</li>
          <li>Days Tracked: ${catData.days_tracked}</li>
          <li>Tracked Date Range: ${CatProfile.formatDate(catData.start_date)} - ${CatProfile.formatDate(catData.end_date)} </li>
        </ul>
        </div>
        <div class="col">
        ${flagImage ? `<img src="${flagImage}" alt="${catData['study-site']}" class="profile-flag">` : ''}
        </div>
        </div>
    </div>
  </div>
</div>
`;
  }
}
