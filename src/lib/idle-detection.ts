/**
 * Idle Detection Utility
 * Detects when user is idle based on mouse, keyboard, and touch activity
 */

export interface IdleDetectionConfig {
  idleThreshold: number; // milliseconds of inactivity to consider idle
  checkInterval: number; // how often to check idle state
  onIdleStart?: () => void;
  onIdleEnd?: () => void;
}

export class IdleDetection {
  private lastActivity: number;
  private isIdle: boolean = false;
  private checkIntervalId: number | null = null;
  private config: IdleDetectionConfig;

  constructor(config: Partial<IdleDetectionConfig> = {}) {
    this.config = {
      idleThreshold: config.idleThreshold || 60000, // Default 60 seconds
      checkInterval: config.checkInterval || 5000, // Check every 5 seconds
      onIdleStart: config.onIdleStart,
      onIdleEnd: config.onIdleEnd,
    };
    
    this.lastActivity = Date.now();
    this.setupListeners();
  }

  private setupListeners() {
    // Track user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const activityHandler = () => {
      this.recordActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, activityHandler, { passive: true });
    });

    // Also track visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.recordActivity();
      }
    });
  }

  private recordActivity() {
    const wasIdle = this.isIdle;
    this.lastActivity = Date.now();
    
    if (wasIdle) {
      this.isIdle = false;
      this.config.onIdleEnd?.();
    }
  }

  private checkIdleState() {
    const now = Date.now();
    const timeSinceActivity = now - this.lastActivity;
    
    if (!this.isIdle && timeSinceActivity >= this.config.idleThreshold) {
      this.isIdle = true;
      this.config.onIdleStart?.();
    }
  }

  public start() {
    if (this.checkIntervalId !== null) return;
    
    this.checkIntervalId = window.setInterval(() => {
      this.checkIdleState();
    }, this.config.checkInterval);
  }

  public stop() {
    if (this.checkIntervalId !== null) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  public isCurrentlyIdle(): boolean {
    return this.isIdle;
  }

  public getTimeSinceActivity(): number {
    return Date.now() - this.lastActivity;
  }
}

// Singleton instance for app-wide use
let idleDetectionInstance: IdleDetection | null = null;

export function initIdleDetection(config?: Partial<IdleDetectionConfig>): IdleDetection {
  if (!idleDetectionInstance) {
    idleDetectionInstance = new IdleDetection(config);
    idleDetectionInstance.start();
  }
  return idleDetectionInstance;
}

export function getIdleDetection(): IdleDetection | null {
  return idleDetectionInstance;
}
