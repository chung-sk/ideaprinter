# Printer Sound Effects

This directory contains optional sound effects for the retro printer experience.

## Sound Files

The application expects the following sound files:

- **paper-feed.mp3** - Sound when paper feeds into the printer (0.2-0.5 seconds)
- **printing.mp3** - Continuous printing sound (0.8-1.5 seconds, can loop)
- **complete.mp3** - Success sound when printing completes (0.2-0.4 seconds)

## Format Specifications

- **Format**: MP3 or OGG (MP3 recommended for better browser support)
- **Bitrate**: 128-192 kbps
- **Sample Rate**: 44.1 kHz
- **Channels**: Mono (preferred) or Stereo

## Fallback Behavior

If sound files are not present, the application will automatically use synthesized sounds generated with the Web Audio API. These synthesized sounds provide a basic printer-like audio experience.

## Finding Sound Effects

You can obtain suitable printer sounds from:

1. **Free Sound Libraries**:
   - Freesound.org (CC-licensed sounds)
   - Zapsplat.com (free with attribution)
   - SoundBible.com (public domain)

2. **Search Terms**:
   - "dot matrix printer"
   - "thermal printer"
   - "printer mechanism"
   - "paper feed"
   - "printer beep"

3. **AI Sound Generation**:
   - ElevenLabs Sound Effects
   - Soundraw
   - AIVA

## Adding Custom Sounds

1. Place your sound files in this directory with the exact names listed above
2. Ensure files are properly formatted (MP3, reasonable size)
3. Restart the development server to preload new sounds
4. Test with different volume levels for optimal experience

## Accessibility

Sound effects automatically respect the user's `prefers-reduced-motion` setting and can be disabled in the application settings (when implemented).
