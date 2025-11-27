/**
 * Honeypot field for bot detection
 * Invisible to humans but bots will fill it out
 */

export function createHoneypotField(): HTMLInputElement {
  const field = document.createElement('input');
  field.type = 'text';
  field.name = 'website'; // Common field name bots look for
  field.id = 'website-field';
  field.tabIndex = -1;
  field.autocomplete = 'off';
  field.setAttribute('aria-hidden', 'true');
  
  // Hide using multiple methods to catch different bot types
  field.style.cssText = `
    position: absolute !important;
    left: -9999px !important;
    width: 1px !important;
    height: 1px !important;
    opacity: 0 !important;
    pointer-events: none !important;
  `;
  
  return field;
}

export function isHoneypotFilled(formData: FormData): boolean {
  const honeypotValue = formData.get('website');
  return honeypotValue !== null && honeypotValue !== '';
}

export function addHoneypotToForm(formElement: HTMLFormElement) {
  const honeypot = createHoneypotField();
  formElement.appendChild(honeypot);
}

/**
 * Additional bot detection checks
 */
export function detectBotBehavior(): {
  isBot: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let isBot = false;

  // Check for webdriver
  if ((navigator as any).webdriver) {
    reasons.push('webdriver_detected');
    isBot = true;
  }

  // Check for automated browser plugins
  if (window.document.documentElement.getAttribute('webdriver')) {
    reasons.push('webdriver_attribute');
    isBot = true;
  }

  // Check for phantom/headless browser
  if ((window as any)._phantom || (window as any).callPhantom) {
    reasons.push('phantom_detected');
    isBot = true;
  }

  // Check for selenium
  if ((window as any).__webdriver_script_fn) {
    reasons.push('selenium_detected');
    isBot = true;
  }

  // Check for abnormal timing (form filled too fast)
  const formStartTime = sessionStorage.getItem('form_start_time');
  if (formStartTime) {
    const elapsed = Date.now() - parseInt(formStartTime);
    if (elapsed < 1000) { // Less than 1 second
      reasons.push('form_filled_too_fast');
      isBot = true;
    }
  }

  // Check for mouse movement (humans move mouse, bots don't)
  const mouseMovements = sessionStorage.getItem('mouse_movements');
  if (!mouseMovements || parseInt(mouseMovements) < 3) {
    reasons.push('no_mouse_activity');
    isBot = true;
  }

  return { isBot, reasons };
}

/**
 * Track user interactions to distinguish bots
 */
export function initBotDetection() {
  // Track form start time
  document.addEventListener('focusin', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
      if (!sessionStorage.getItem('form_start_time')) {
        sessionStorage.setItem('form_start_time', Date.now().toString());
      }
    }
  });

  // Track mouse movements
  let movementCount = 0;
  document.addEventListener('mousemove', () => {
    movementCount++;
    if (movementCount <= 10) { // Only track first 10 movements to save resources
      sessionStorage.setItem('mouse_movements', movementCount.toString());
    }
  });

  // Track keyboard events
  let keypressCount = 0;
  document.addEventListener('keypress', () => {
    keypressCount++;
    sessionStorage.setItem('keypress_count', keypressCount.toString());
  });
}

// Initialize on load
if (typeof window !== 'undefined') {
  initBotDetection();
}