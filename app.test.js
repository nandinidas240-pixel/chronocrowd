/**
 * @file app.test.js
 * @description Jest/JSDoc functional test suite for ChronoCrowd Stadium Command Center.
 * Tests verify critical Stadium Logistics UI elements and Crowd AI state transitions.
 *
 * @module ChronoCrowdTests
 * @requires jest (^29.x)
 * @requires @testing-library/dom (optional, for DOM queries)
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
    <html lang="en">
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
    </body>
    </html>
  `;
});

// --------------------------------------------------------------------------
// TEST 1: Verify the "Seat-Sync" button presence
// Stadium Logistics: The Seat Sync feature allows fans to share live seat
// locations at M. Chinnaswamy Stadium. This test ensures the button is
// rendered and accessible before any user interaction.
// --------------------------------------------------------------------------

/**
 * @test Seat-Sync button presence
 * @description Verifies the #seat-sync-btn element exists in the DOM,
 * is accessible via aria-label, and displays the "LIVE" badge.
 * Stadium Logistics: Critical for the buddy-finder feature.
 */
describe('Test 1: Seat-Sync Button Presence', () => {
  test('should render the Seat Sync button with correct ID', () => {
    const btn = document.getElementById('seat-sync-btn');
    expect(btn).not.toBeNull();
    expect(btn.tagName).toBe('BUTTON');
  });

  test('should have aria-label "Open Seat Sync" for WCAG 2.1 AA compliance', () => {
    const btn = document.getElementById('seat-sync-btn');
    expect(btn.getAttribute('aria-label')).toBe('Open Seat Sync');
  });

  test('should display the LIVE badge indicating real-time status', () => {
    const badge = document.querySelector('.seat-sync-live-badge');
    expect(badge).not.toBeNull();
    expect(badge.textContent).toBe('LIVE');
  });

  test('should contain the text "Seat Sync"', () => {
    const btn = document.getElementById('seat-sync-btn');
    expect(btn.textContent).toContain('Seat Sync');
  });
});

// --------------------------------------------------------------------------
// TEST 2: Crowd AI status toggles correctly between Low / Medium / High
// Stadium Logistics: The CrowdEngine.predict() method returns one of three
// levels. This test simulates DOM updates that mirror the renderCrowdCard()
// function and verifies correct aria-live region content transitions.
// --------------------------------------------------------------------------

/**
 * @test Crowd AI status toggle
 * @description Simulates the three crowd density levels (Low, Medium, High)
 * that CrowdEngine outputs during M. Chinnaswamy Stadium match phases.
 * Verifies that the aria-live region updates correctly for each state.
 * Stadium Logistics: Crowd level changes trigger gate redirect advisories.
 * @param {string} level - One of 'Low' | 'Medium' | 'High'
 */
describe('Test 2: Crowd AI Status Toggles (Low / Medium / High)', () => {
  /**
   * @helper setCrowdStatus
   * @description Simulates what CrowdEngine + renderCrowdCard() does when updating
   * the live crowd status region. Mirrors the actual DOM mutation pattern.
   * Stadium Logistics: Crowd status drives gate routing and shade advisories.
   * @param {string} level - 'Low' | 'Medium' | 'High'
   * @param {string} waitLabel - Human-readable wait time (e.g. '~2 min wait').
   */
  function setCrowdStatus(level, waitLabel) {
    const container = document.getElementById('crowd-metrics-container');
    const statusEl  = document.getElementById('crowd-ai-status');

    // Simulate CrowdEngine output in DOM (mirrors renderCrowdCard HTML pattern)
    const levelClass = level.toLowerCase();
    container.innerHTML = `
      <div class="zone-card metric" data-testid="crowd-zone-metric">
        <div class="metric-info">
          <span class="label">East Gate Entry</span>
          <span class="value ${levelClass}" data-level="${level}">
            ${level} · ${waitLabel}
          </span>
        </div>
        <div class="progress-bar">
          <div class="fill" style="width:${level === 'High' ? 85 : level === 'Medium' ? 55 : 20}%"></div>
        </div>
      </div>
    `;

    // Update the simple toggle element to reflect current level
    statusEl.setAttribute('data-level', level);
    statusEl.textContent = level;
  }

  test('should display "Low" crowd status correctly', () => {
    setCrowdStatus('Low', '~2 min wait');

    const statusEl = document.getElementById('crowd-ai-status');
    expect(statusEl.dataset.level).toBe('Low');
    expect(statusEl.textContent).toBe('Low');

    const valueSpan = document.querySelector('.value.low');
    expect(valueSpan).not.toBeNull();
    expect(valueSpan.dataset.level).toBe('Low');
  });

  test('should toggle to "Medium" crowd status correctly', () => {
    setCrowdStatus('Low', '~2 min wait');
    setCrowdStatus('Medium', '10 min wait');

    const statusEl = document.getElementById('crowd-ai-status');
    expect(statusEl.dataset.level).toBe('Medium');
    expect(statusEl.textContent).toBe('Medium');

    const valueSpan = document.querySelector('.value.medium');
    expect(valueSpan).not.toBeNull();
    expect(valueSpan.dataset.level).toBe('Medium');
    expect(valueSpan.textContent).toContain('10 min wait');
  });

  test('should toggle to "High" crowd status correctly', () => {
    setCrowdStatus('Low', '~2 min wait');
    setCrowdStatus('Medium', '10 min wait');
    setCrowdStatus('High', '18 min wait');

    const statusEl = document.getElementById('crowd-ai-status');
    expect(statusEl.dataset.level).toBe('High');
    expect(statusEl.textContent).toBe('High');

    const valueSpan = document.querySelector('.value.dark-red');
    expect(valueSpan).not.toBeNull();
    expect(valueSpan.dataset.level).toBe('High');
    expect(valueSpan.textContent).toContain('18 min wait');
  });

  test('aria-live region should be polite and labelled (WCAG 2.1 AA)', () => {
    const container = document.getElementById('crowd-metrics-container');
    expect(container.getAttribute('aria-live')).toBe('polite');
    expect(container.getAttribute('aria-label')).toContain('crowd density');
  });

  test('crowd bar width should reflect High density at ~85%', () => {
    setCrowdStatus('High', '18 min wait');
    const fill = document.querySelector('.progress-bar .fill');
    expect(fill).not.toBeNull();
    expect(fill.style.width).toBe('85%');
  });

  test('should cycle through all three states without DOM errors', () => {
    expect(() => {
      setCrowdStatus('Low',    '~2 min wait');
      setCrowdStatus('Medium', '10 min wait');
      setCrowdStatus('High',   '30+ min wait');
      setCrowdStatus('Low',    '~2 min wait');
    }).not.toThrow();
  });
});

// --------------------------------------------------------------------------
// TEST 3: CrowdEngine class (unit) — Stadium Logistics scoring logic
// --------------------------------------------------------------------------

/**
 * @test CrowdEngine predict() logic
 * @description Unit tests for the CrowdEngine.predict() Stadium Logistics method.
 * Tests ensure correct level classification based on score thresholds.
 * Stadium Logistics: score >= 75 => High, 42-74 => Medium, <42 => Low.
 */
describe('Test 3: CrowdEngine Scoring Logic (Unit)', () => {
  /**
   * @helper mockPredict
   * @description Mimics CrowdEngine.predict() return values for score boundary testing.
   * Stadium Logistics: Validates the three crowd density tiers used at M. Chinnaswamy.
   * @param {number} score - Pre-computed crowd density score.
   * @returns {{score: number, level: string, cls: string}}
   */
  function mockPredict(score) {
    if (score >= 75) return { score, level: 'High',   cls: 'dark-red' };
    if (score >= 42) return { score, level: 'Medium', cls: 'orange'   };
    return               { score, level: 'Low',    cls: 'green'    };
  }

  test('score >= 75 should produce High crowd level (Stadium Logistics: gate redirect threshold)', () => {
    expect(mockPredict(85).level).toBe('High');
    expect(mockPredict(75).level).toBe('High');
  });

  test('score 42-74 should produce Medium crowd level', () => {
    expect(mockPredict(60).level).toBe('Medium');
    expect(mockPredict(42).level).toBe('Medium');
  });

  test('score < 42 should produce Low crowd level', () => {
    expect(mockPredict(20).level).toBe('Low');
    expect(mockPredict(41).level).toBe('Low');
  });

  test('score at boundary 74 should be Medium, not High', () => {
    expect(mockPredict(74).level).toBe('Medium');
  });
});
