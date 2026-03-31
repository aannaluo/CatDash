// eslint-disable-next-line no-unused-vars
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
      UK: 'images/uk.png',
      'United States': 'images/usa.png',
      Australia: 'images/australia.png',
      'New Zealand': 'images/new_zealand.png',
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
      <div class="profile-container">
        <div class="profile-image">
          <img src="images/cat.png" alt="Cat silhouette">
        </div>
        <div class="profile-info">
          <h3>${catData['animal-name']}</h3>
          <br>
          <ul>
            <li>Age: ${CatProfile.formatNumber(catData.age)} years</li>
            <li>Sex: ${catData.sex}</li>
            <li>Neutered: ${catData.neutered}</li>
            <li>Home Range: ${CatProfile.formatNumber(catData['home-range'])} km²</li>
            <li>Prey per Month: ${CatProfile.formatNumber(catData.prey_p_month)}</li>
            <li>No. of days Tracked: ${catData.days_tracked} </li>
            <li>Tracked Date Range: ${CatProfile.formatDate(catData.start_date)} - ${CatProfile.formatDate(catData.end_date)} </li>
          </ul>
        </div>
        <div class="profile-flag-section">
          ${flagImage ? `<img src="${flagImage}" alt="${catData['study-site']}" class="profile-flag">` : ''}
        </div>
      </div>
    `;
  }
}
