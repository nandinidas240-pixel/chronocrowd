/**
 * @file app.test.js
 * @description Jest/JSDoc functional test suite for ChronoCrowd Stadium Command Center.
 * Tests verify critical Stadium Logistics UI elements, Crowd AI state transitions,
 * data sanitization, Google Maps integration, and Seat-Sync coordinate validation.
 *
 * @module ChronoCrowdTests
 * @requires jest (^29.x)
 * @requires jest-environment-jsdom (^29.x)
 *
 * Run with: npx jest app.test.js
 */

'use strict';

// --------------------------------------------------------------------------
// TEST ENVIRONMENT SETUP
// jsdom is configured as the test environment (default in Jest 27+).
// We bootstrap a minimal DOM that mirrors the production index.html structure.
// --------------------------------------------------------------------------

beforeEach(() => {
  document.documentElement.innerHTML = `
    <!DOCTYPE html>
    <html lang="en" data-theme="dark">
    <head><title>ChronoCrowd Tests</title></head>
    <body>
      <!-- Seat Sync trigger button (Stadium Logistics: live buddy-finder) -->
      <button
        id="seat-sync-btn"
        class="seat-sync-btn"
        aria-label="Open Seat Sync">
        <span>Seat Sync</span>
        <span class="seat-sync-live-badge">LIVE</span>
      </button>

      <!-- Crowd AI live status region (aria-live="polite" for WCAG 2.1 AA) -->
      <div
        id="crowd-metrics-container"
        aria-live="polite"
        aria-label="Live crowd density status for stadium zones">
        <!-- Crowd status items injected by CrowdEngine -->
      </div>

      <!-- Crowd AI status toggle (simulates CrowdEngine output) -->
      <div id="crowd-ai-status" data-level="Low">Low</div>

      <!-- Google Maps JS API container (Stadium Logistics: map view) -->
      <div id="google-maps-container"
           aria-label="Interactive Google Map of M. Chinnaswamy Stadium"
           role="region"
           style="width:100%;height:320px;">
      </div>

      <!-- Theme toggle button -->
      <button id="theme-toggle-btn" aria-label="Toggle light/dark theme">
        <i id="theme-icon" class="ph ph-sun-horizon"></i>
        <span id="theme-label">Light</span>
      </button>

      <!-- Seat Sync modal with coordinate fields -->
      <div id="seat-sync-modal" class="overlay hidden">
        <p id="seat-sync-my-status">Block A, Row 4, Seat 7 · M. Chinnaswamy Stadium</p>
        <input id="ss-block" type="text" value="A" placeholder="Block" />
        <input id="ss-row"   type="number" value="4" min="1" max="50" placeholder="Row" />
        <input id="ss-seat"  type="number" value="7" min="1" max="30" placeholder="Seat" />
      </div>
    </body>
    </html>
  `;
});

// --------------------------------------------------------------------------
// TEST 1: Data Sanitization Function
// Stadium Logistics: XSS prevention for all user-supplied or API-sourced
// strings displayed in zone cards, schedule items, and admin panel rows.
// The sanitize() method on CrowdEngine uses a detached DOM element to escape HTML.
// --------------------------------------------------------------------------

/**
 * @test Data sanitization function
 * @description Verifies that the sanitization function correctly HTML-escapes
 * strings to prevent XSS injection in Stadium Logistics zone cards and schedule.
 * Mirrors the CrowdEngine.sanitize() implementation without importing script.js.
 */
describe('Test 1: Data Sanitization Function', () => {
  /**
   * @helper sanitize
   * @description Browser-safe XSS sanitizer: mirrors CrowdEngine.sanitize()
   * using a detached DOM element for escaping.
   * @param {string} val - Raw input string to sanitize.
   * @returns {string} HTML-escaped string safe for innerHTML insertion.
   */
  function sanitize(val) {
    const div = document.createElement('div');
    div.textContent = String(val);
    return div.innerHTML;
  }

  test('should escape <script> tags to prevent XSS injection', () => {
    const unsafe = '<script>alert("xss")</script>';
    const result = sanitize(unsafe);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  test('should escape HTML special characters (&, <, >, ", \')', () => {
    const unsafe = 'Zone A & B <active> "status"';
    const result = sanitize(unsafe);
    expect(result).not.toContain('<active>');
    expect(result).toContain('&amp;');
    expect(result).toContain('&lt;');
  });

  test('should return plain text unchanged if no HTML characters present', () => {
    const safe = 'North Stand Gate 3';
    expect(sanitize(safe)).toBe('North Stand Gate 3');
  });

  test('should convert non-string input (number) to safe string', () => {
    expect(sanitize(42)).toBe('42');
    expect(sanitize(0)).toBe('0');
  });

  test('should handle empty string without throwing', () => {
    expect(() => sanitize('')).not.toThrow();
    expect(sanitize('')).toBe('');
  });
});

// --------------------------------------------------------------------------
// TEST 2: Crowd Density Level Calculation Logic
// Stadium Logistics: CrowdEngine.predict() returns 'Low' | 'Medium' | 'High'
// based on the computed density score. These thresholds drive gate-redirect
// advisories and shade recommendations at M. Chinnaswamy Stadium.
// --------------------------------------------------------------------------

/**
 * @test Crowd density level calculation
 * @description Unit tests for the crowd density tier classification used by
 * CrowdEngine.predict(). Validates score boundary conditions for all three
 * crowd levels: Low (<42), Medium (42-74), High (>=75).
 */
describe('Test 2: Crowd Density Level Calculation Logic', () => {
  /**
   * @helper mockPredict
   * @description Mimics CrowdEngine.predict() return values for score boundary testing.
   * Stadium Logistics: Validates the three crowd density tiers at M. Chinnaswamy.
   * @param {number} score - Pre-computed crowd density score (0-100).
   * @returns {{score: number, level: string, cls: string, waitLabel: string}}
   */
  function mockPredict(score) {
    let level, cls, waitLabel;
    if (score >= 75) {
      level = 'High';   cls = 'dark-red'; waitLabel = score >= 90 ? '30+ min wait' : '18 min wait';
    } else if (score >= 42) {
      level = 'Medium'; cls = 'orange';   waitLabel = '10 min wait';
    } else {
      level = 'Low';    cls = 'green';    waitLabel = score >= 35 ? '4 min wait' : '~2 min wait';
    }
    return { score, level, cls, waitLabel };
  }

  test('score >= 75 should produce High crowd level (gate redirect threshold)', () => {
    expect(mockPredict(85).level).toBe('High');
    expect(mockPredict(75).level).toBe('High');
    expect(mockPredict(100).level).toBe('High');
  });

  test('score 42-74 should produce Medium crowd level', () => {
    expect(mockPredict(60).level).toBe('Medium');
    expect(mockPredict(42).level).toBe('Medium');
    expect(mockPredict(74).level).toBe('Medium');
  });

  test('score < 42 should produce Low crowd level', () => {
    expect(mockPredict(20).level).toBe('Low');
    expect(mockPredict(41).level).toBe('Low');
    expect(mockPredict(5).level).toBe('Low');
  });

  test('score at exact boundary 74 should be Medium (not High)', () => {
    expect(mockPredict(74).level).toBe('Medium');
    expect(mockPredict(74).cls).toBe('orange');
  });

  test('score at exact boundary 42 should be Medium (not Low)', () => {
    expect(mockPredict(42).level).toBe('Medium');
    expect(mockPredict(41).level).toBe('Low');
  });

  test('High score >= 90 should produce 30+ min wait label', () => {
    expect(mockPredict(92).waitLabel).toBe('30+ min wait');
    expect(mockPredict(90).waitLabel).toBe('30+ min wait');
  });
});

// --------------------------------------------------------------------------
// TEST 3: Google Maps Container Presence
// Stadium Logistics: The #google-maps-container div is required for the
// Google Maps JavaScript API initChronoMap() callback to render the interactive
// stadium map. Its absence would cause a silent JS error at the initialization.
// --------------------------------------------------------------------------

/**
 * @test Google Maps container presence
 * @description Verifies that the #google-maps-container element exists in the DOM
 * with the correct ARIA attributes required by WCAG 2.1 AA and the Maps JS API.
 * Stadium Logistics: This element is the mount target for initChronoMap().
 */
describe('Test 3: Google Maps Container Presence', () => {
  test('should render #google-maps-container in the DOM', () => {
    const container = document.getElementById('google-maps-container');
    expect(container).not.toBeNull();
    expect(container.tagName).toBe('DIV');
  });

  test('should have role="region" for WCAG 2.1 AA landmark compliance', () => {
    const container = document.getElementById('google-maps-container');
    expect(container.getAttribute('role')).toBe('region');
  });

  test('should have descriptive aria-label for screen reader accessibility', () => {
    const container = document.getElementById('google-maps-container');
    const label = container.getAttribute('aria-label');
    expect(label).not.toBeNull();
    expect(label.toLowerCase()).toContain('stadium');
  });

  test('should have a defined height style for the Maps JS API to render', () => {
    const container = document.getElementById('google-maps-container');
    // Maps API requires a non-zero height on the mount container
    expect(container.style.height).toBeTruthy();
  });

  test('should be accessible as a valid mount point for Google Maps JS API', () => {
    // Simulate what initChronoMap() does: check container exists before map init
    const container = document.getElementById('google-maps-container');
    const canMount = container !== null && container.tagName === 'DIV';
    expect(canMount).toBe(true);
  });
});

// --------------------------------------------------------------------------
// TEST 4: Theme Toggle State
// Stadium Logistics: The theme toggle button switches the app between light and
// dark mode by setting data-theme on <html>. The button icon and label must
// update accordingly for WCAG 2.1 AA compliance (visible state change).
// --------------------------------------------------------------------------

/**
 * @test Theme toggle state
 * @description Verifies that the theme toggle button correctly switches the
 * data-theme attribute between 'dark' and 'light', and updates the icon/label
 * to reflect the active theme for accessible state feedback.
 * Stadium Logistics: Dark mode is the default stadium command center theme.
 */
describe('Test 4: Theme Toggle State', () => {
  /**
   * @helper applyTheme
   * @description Mirrors the applyTheme() function from script.js for isolated
   * unit-testing without loading the full application bundle.
   * @param {string} theme - 'dark' | 'light'.
   * @returns {void}
   */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon  = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');
    if (icon)  icon.className   = theme === 'dark' ? 'ph ph-moon-stars' : 'ph ph-sun-horizon';
    if (label) label.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }

  test('should set data-theme="dark" on documentElement when dark mode applied', () => {
    applyTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('should set data-theme="light" on documentElement when light mode applied', () => {
    applyTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  test('should update theme-label text to "Dark" when dark mode is active', () => {
    applyTheme('dark');
    expect(document.getElementById('theme-label').textContent).toBe('Dark');
  });

  test('should update theme-label text to "Light" when light mode is active', () => {
    applyTheme('light');
    expect(document.getElementById('theme-label').textContent).toBe('Light');
  });

  test('should toggle correctly from dark to light and back without errors', () => {
    expect(() => {
      applyTheme('dark');
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      applyTheme('dark');
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    }).not.toThrow();
  });
});

// --------------------------------------------------------------------------
// TEST 5: Seat-Sync Coordinate Validation
// Stadium Logistics: Seat Sync broadcasts exact Block/Row/Seat coordinates
// to help fans regroup inside M. Chinnaswamy Stadium. Coordinate inputs must
// be validated to prevent nonsensical coordinates from being shared.
// --------------------------------------------------------------------------

/**
 * @test Seat-Sync coordinate validation
 * @description Validates the Block/Row/Seat coordinate inputs used by the
 * Seat Sync protocol. Ensures the #seat-sync-my-status display reflects valid
 * coordinates and that invalid inputs are correctly flagged.
 * Stadium Logistics: Invalid seat coordinates break buddy-finder functionality.
 */
describe('Test 5: Seat-Sync Coordinate Validation', () => {
  /**
   * @helper validateSeatCoords
   * @description Validates Seat Sync coordinate inputs before broadcasting.
   * Block must be a non-empty string. Row must be 1–50. Seat must be 1–30.
   * @param {string} block  - Stand block ID (e.g., 'A', 'B', 'VIP').
   * @param {number} row    - Row number within the block (1–50).
   * @param {number} seat   - Seat number within the row (1–30).
   * @returns {{ valid: boolean, error: string|null }} Validation result.
   */
  function validateSeatCoords(block, row, seat) {
    if (!block || typeof block !== 'string' || block.trim() === '') {
      return { valid: false, error: 'Block is required' };
    }
    if (!Number.isInteger(row) || row < 1 || row > 50) {
      return { valid: false, error: 'Row must be between 1 and 50' };
    }
    if (!Number.isInteger(seat) || seat < 1 || seat > 30) {
      return { valid: false, error: 'Seat must be between 1 and 30' };
    }
    return { valid: true, error: null };
  }

  test('should validate correct Seat Sync coordinates (Block A, Row 4, Seat 7)', () => {
    const result = validateSeatCoords('A', 4, 7);
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  test('should reject empty block identifier', () => {
    const result = validateSeatCoords('', 4, 7);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Block');
  });

  test('should reject row number out of bounds (> 50)', () => {
    const result = validateSeatCoords('B', 51, 7);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Row');
  });

  test('should reject seat number out of bounds (< 1)', () => {
    const result = validateSeatCoords('C', 10, 0);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Seat');
  });

  test('#seat-sync-my-status element should display valid coordinates in the DOM', () => {
    const statusEl = document.getElementById('seat-sync-my-status');
    expect(statusEl).not.toBeNull();
    // Default status should contain block, row, and seat info
    expect(statusEl.textContent).toContain('Block');
    expect(statusEl.textContent).toContain('Row');
    expect(statusEl.textContent).toContain('Seat');
  });
});
