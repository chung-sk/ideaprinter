/**
 * Sound Effects Manager for Retro Printer
 * Sound effects disabled per user preference
 */

export type SoundType = 'paperFeed' | 'printing' | 'complete';

class SoundManager {
  private enabled: boolean = false;

  constructor() {
    // Sound effects disabled
  }

  /**
   * Sound effects disabled - no-op
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async play(_type: SoundType, _volume: number = 0.5) {
    // Sound effects disabled
    return;
  }

  /**
   * Enable or disable sound effects
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Resume audio context (no-op)
   */
  async resume() {
    // Sound effects disabled
  }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Utility function for easy access
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const playSound = (_type: SoundType, _volume?: number) => {
  soundManager.play(_type, _volume);
};
