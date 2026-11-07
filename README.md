# Time is precious

A full-screen home page that shows how much of your day is left, over a changing background of nature photography and famous paintings, with a stoic quote about time.

**Live page:** https://aloe-andrea.github.io/New-/

![Desktop, nature photo](docs/screens/desktop-nature.jpg)
![Desktop, painting](docs/screens/desktop-art.jpg)

## What it does

- **Countdown to the end of your day.** Large, ultra-thin hours, minutes and seconds, with a progress line and the share of the day already behind you.
- **Switches automatically.** On weekdays it counts down to the end of the work day (09:00 to 18:00). Evenings and weekends it counts to 22:00. Between 22:00 and 05:00 it shows a calm "The day is done" screen.
- **Changing backgrounds.** 27 bundled images (16 nature photos, 11 masterpieces by Hokusai, Van Gogh, Monet, Turner and others) crossfade every five minutes. When online it also mixes in fresh featured nature photos from Wikimedia Commons.
- **Quotes about time.** 38 quotes from Seneca, Marcus Aurelius, Epictetus, Franklin, Thoreau and others, rotating with the pictures.
- **Works offline.** Fonts, bundled images and the app shell are cached, so it still opens without a connection.
- **Keyboard and touch.** Press Space or the right arrow, or tap the screen, for the next picture and quote.

## On iPhone

![Phone, nature photo](docs/screens/phone-nature.jpg) ![Phone, painting](docs/screens/phone-art.jpg)

- **Home Screen app:** open the live page in Safari, tap Share, then **Add to Home Screen**.
- **Home Screen and Lock Screen widget:** see `widget.html` (an install page) and `time-widget.js`, a script for the free Scriptable app. Tapping the widget opens the page.

## Settings

Times, darkness of the picture overlay and the rotation speed are set in the `CONFIG` block at the top of the script in `index.html`. The widget has its own `CONFIG` in `time-widget.js`.

## Files

| Path | Purpose |
|------|---------|
| `index.html` | The page: layout, countdown logic, quotes, background rotation |
| `images/`, `images.js` | Bundled backgrounds and their titles and credits |
| `fonts/` | Sora (numerals) and Instrument Serif italic (quotes), bundled for offline use |
| `manifest.webmanifest`, `sw.js`, `icons/` | iPhone and Android app install and offline caching |
| `time-widget.js`, `widget.html` | Scriptable widget and its install page |
| `docs/screens/` | Screenshots used in this README |

## Credits

Photos come from Wikimedia Commons featured pictures and paintings are in the public domain. The title and photographer, where given, appear in the bottom corner of the page.
