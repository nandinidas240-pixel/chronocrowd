const fs = require('fs');
const htmlPath = './index.html';
const cssPath = './styles.css';

let html = fs.readFileSync(htmlPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace Top Navbar
const newSidebar = `    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-brand">
        <i class="ph-fill ph-waveform"></i>
        <span>PromptPilot AI</span>
      </div>
      <ul class="nav-links" id="main-nav-links">
        <li class="nav-item active" data-target="view-dashboard">Dashboard</li>
        <li class="nav-item" data-target="view-schedule">Schedule</li>
        <li class="nav-item" data-target="view-crowd">Crowd Status</li>
        <li class="nav-item" data-target="view-map">Map</li>
        <li class="nav-item" data-target="view-profile">Profile</li>
      </ul>
      <div style="flex:1;"></div>
      <div class="nav-auth-sidebar" id="nav-auth-container">
        <!-- Populated by JS -->
      </div>
    </aside>`;
html = html.replace(/<nav class="top-navbar">([\s\S]*?)<\/nav>/, newSidebar);

// Add Google Button
const googleBtn = `      <button class="google-btn" id="btn-google-login">
         <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google G" width="20" />
         Continue with Google
      </button>
      <div class="auth-divider">or</div>
      <!-- Login Form section -->`;
html = html.replace('<!-- Login Form section -->', googleBtn);

// Populate Empty Views
const mapContent = `<!-- VIEW: MAP -->
      <div id="view-map" class="page-view">
         <div class="glass-panel" style="max-width: 900px; margin: 0 auto; min-height: 500px;">
            <div class="card-header" style="margin-bottom: 2rem;">
               <h2><i class="ph ph-map-trifold"></i> Festival Map</h2>
            </div>
            <div style="height:350px; background: rgba(0,0,0,0.02); border: 2px dashed rgba(0,0,0,0.1); border-radius: 12px; display:flex; align-items:center; justify-content:center; flex-direction:column; color:var(--text-secondary);">
               <i class="ph ph-map-pin" style="font-size:3rem; margin-bottom:10px; color:var(--accent-secondary);"></i>
               <p>Interactive Map rendering engine active. Geolocating structural zones...</p>
               <div style="display:flex; gap:10px; margin-top:20px;">
                  <span class="status green" style="background:#6BAF92; color:#fff;">Main Stage</span>
                  <span class="status orange" style="background:#D9A441; color:#fff;">Food Court</span>
                  <span class="status dark-red" style="background:#C65D5D; color:#fff;">Entry Gate</span>
               </div>
            </div>
         </div>
      </div>`;
html = html.replace(/<!-- VIEW: MAP -->([\s\S]*?)<\/div>\s*<\/div>/, mapContent);

const crowdContent = `<!-- VIEW: CROWD STATUS -->
      <div id="view-crowd" class="page-view">
         <div class="glass-panel" style="max-width: 900px; margin: 0 auto; min-height: 500px;">
          <h2><i class="ph ph-users-three"></i> Live Crowd Analytics</h2>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">Real-time zone capacity monitoring.</p>
          
          <div class="crowd-metrics" id="crowd-page-dynamic">
            <div class="metric zone-card" style="margin-bottom: 15px;">
              <div class="metric-info" style="display:flex; justify-content:space-between; margin-bottom:8px;"><span class="label">Main Stage</span><span class="value dark-red" style="color:var(--density-high); font-weight:bold;">92% Full</span></div>
              <div class="progress-bar" style="height:10px; background:rgba(0,0,0,0.05); border-radius:5px;"><div class="fill" style="width: 92%; height:100%; border-radius:5px; background: var(--density-high);"></div></div>
            </div>
            <div class="metric zone-card" style="margin-bottom: 15px;">
              <div class="metric-info" style="display:flex; justify-content:space-between; margin-bottom:8px;"><span class="label">Food Court</span><span class="value orange" style="color:var(--density-med); font-weight:bold;">65% Full</span></div>
              <div class="progress-bar" style="height:10px; background:rgba(0,0,0,0.05); border-radius:5px;"><div class="fill" style="width: 65%; height:100%; border-radius:5px; background: var(--density-med);"></div></div>
            </div>
            <div class="metric zone-card" style="margin-bottom: 15px;">
              <div class="metric-info" style="display:flex; justify-content:space-between; margin-bottom:8px;"><span class="label">Entry Gate</span><span class="value green" style="color:var(--density-low); font-weight:bold;">25% Full</span></div>
              <div class="progress-bar" style="height:10px; background:rgba(0,0,0,0.05); border-radius:5px;"><div class="fill" style="width: 25%; height:100%; border-radius:5px; background: var(--density-low);"></div></div>
            </div>
          </div>
        </div>
      </div>`;
html = html.replace(/<!-- VIEW: CROWD STATUS -->([\s\S]*?)<\/div>\s*<\/div>/, crowdContent);

fs.writeFileSync(htmlPath, html);


// CSS Update for Sidebar
const newLayoutCss = `
/* Layout */
.dashboard-container {
  display: flex;
  flex-direction: row;
  height: 100vh;
  overflow: hidden;
  max-width: 1600px;
  margin: 0 auto;
}

.sidebar {
  width: 260px;
  background: var(--accent-primary);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 2.5rem 1.5rem;
  box-shadow: 2px 0 20px rgba(0,0,0,0.1);
  z-index: 50;
}

.sidebar-brand {
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
  letter-spacing: 1px;
  margin-bottom: 3rem;
  color: #fff;
}
.sidebar-brand i { color: var(--accent-secondary); }

.sidebar .nav-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar .nav-item {
  color: rgba(255,255,255,0.7);
  font-weight: 500;
  cursor: pointer;
  padding: 12px 16px;
  transition: all 0.3s ease;
  border-radius: var(--radius-sm);
}

.sidebar .nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}

.sidebar .nav-item.active {
  background: rgba(197, 164, 109, 0.15); /* muted gold backdrop */
  color: #fff;
  border-left: 4px solid var(--accent-secondary);
}

.nav-auth-sidebar {
  margin-top: 2rem;
  display:flex;
  flex-direction:column;
  gap:12px;
}

.auth-divider {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 20px;
  position: relative;
}

.google-btn {
  background: #FFF;
  color: #3C4043;
  border: 1px solid #DADCE0;
  width: 100%;
  padding: 12px;
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 20px;
}
.google-btn:hover {
  background: #F8F9FA;
  box-shadow: 0 1px 2px rgba(60,64,67,0.3);
}

.main-content {
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
  background: var(--bg-deep);
}
`;

css = css.replace(/\/\* Layout \*\/([\s\S]*?)\/\* Main Content \*\//, newLayoutCss + '\n/* Main Content */');
fs.writeFileSync(cssPath, css);
console.log("DOM rewrite and Google Button injected successfully.");
