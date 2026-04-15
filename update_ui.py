import re

html_path = r'C:\Users\xtrm0\.gemini\antigravity\scratch\festival-app\index.html'
css_path = r'C:\Users\xtrm0\.gemini\antigravity\scratch\festival-app\styles.css'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace Navbar block with Sidebar block
new_sidebar = """
    <!-- Sidebar / Navigation -->
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
        <!-- Manged by JS -->
      </div>
    </aside>
"""
html = re.sub(r'<nav class="top-navbar">.*?</nav>', new_sidebar, html, flags=re.DOTALL)

# Inject Google Auth Buttons inside auth-modal, right before <div id="form-login">
google_btn = """
      <button class="google-btn" id="btn-google-login">
         <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google G" width="20" />
         Continue with Google
      </button>
      <div class="auth-divider">or</div>
      <!-- Login Form section -->
"""
html = html.replace('<!-- Login Form section -->', google_btn)

# Make Map and Crowd full content pages
map_content = """
      <!-- VIEW: MAP -->
      <div id="view-map" class="page-view">
         <div class="glass-panel" style="max-width: 900px; margin: 0 auto;">
            <div class="card-header">
               <h2><i class="ph ph-map-trifold"></i> Festival Map</h2>
            </div>
            <div style="height:400px; background: rgba(0,0,0,0.02); border: 2px dashed rgba(0,0,0,0.1); border-radius: 12px; display:flex; align-items:center; justify-content:center; flex-direction:column; color:var(--text-secondary);">
               <i class="ph ph-map-pin" style="font-size:3rem; margin-bottom:10px; color:var(--accent-secondary);"></i>
               <p>Interactive Map rendering engine active. Geolocating structural zones...</p>
               <div style="display:flex; gap:10px; margin-top:20px;">
                  <span class="status green">Main Stage</span>
                  <span class="status orange">Food Court</span>
                  <span class="status dark-red">Entry Gate</span>
               </div>
            </div>
         </div>
      </div>
"""
html = re.sub(r'<!-- VIEW: MAP -->.*?</div>\s+</div>', map_content, html, flags=re.DOTALL)

crowd_content = """
      <!-- VIEW: CROWD STATUS -->
      <div id="view-crowd" class="page-view">
         <div class="glass-panel" style="max-width: 900px; margin: 0 auto;">
          <h2><i class="ph ph-users-three"></i> Live Crowd Analytics</h2>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">Real-time zone capacity monitoring.</p>
          
          <div class="crowd-metrics" id="crowd-page-dynamic">
            <div class="metric zone-card">
              <div class="metric-info"><span class="label">Main Stage</span><span class="value dark-red">92%</span></div>
              <div class="progress-bar"><div class="fill" style="width: 92%; background: var(--density-high);"></div></div>
            </div>
            <div class="metric zone-card">
              <div class="metric-info"><span class="label">Food Court</span><span class="value orange">65%</span></div>
              <div class="progress-bar"><div class="fill" style="width: 65%; background: var(--density-med);"></div></div>
            </div>
            <div class="metric zone-card">
              <div class="metric-info"><span class="label">Entry Gate</span><span class="value green">25%</span></div>
              <div class="progress-bar"><div class="fill" style="width: 25%; background: var(--density-low);"></div></div>
            </div>
            <div class="metric zone-card">
              <div class="metric-info"><span class="label">VIP Lounge</span><span class="value green">15%</span></div>
              <div class="progress-bar"><div class="fill" style="width: 15%; background: var(--density-low);"></div></div>
            </div>
          </div>
        </div>
      </div>
"""
html = re.sub(r'<!-- VIEW: CROWD STATUS -->.*?</div>\s+</div>', crowd_content, html, flags=re.DOTALL)


with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)


# ---------------- CSS REWRITE ----------------
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Replace Layout rules -> restoring dashboard flex row and sidebar CSS
new_layout_css = """
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
  width: 280px;
  background: var(--accent-primary);
  color: #fff;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.5rem;
  box-shadow: 2px 0 15px rgba(0,0,0,0.05);
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
}
.sidebar-brand i { color: var(--accent-secondary); }

.nav-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  color: rgba(255,255,255,0.7);
  font-weight: 500;
  cursor: pointer;
  padding: 12px 16px;
  transition: all 0.3s ease;
  border-radius: var(--radius-sm);
}

.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}

.nav-item.active {
  background: rgba(197, 164, 109, 0.15); /* muted gold backdrop */
  color: #fff;
  border-left: 4px solid var(--accent-secondary);
}

.nav-auth-sidebar {
  margin-top: 2rem;
  display:flex;
  flex-direction:column;
  gap:10px;
}

.main-content {
  flex: 1;
  padding: 2.5rem;
  overflow-y: auto;
  background: var(--bg-deep);
}

/* Google Button & Auth Elements */
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

.auth-divider {
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-bottom: 20px;
  position: relative;
}
"""
css = re.sub(r'/\* Layout \*/.*?\.main-content \{.*?\}', new_layout_css, css, flags=re.DOTALL)

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

print("UI Python Routine Finished.")
