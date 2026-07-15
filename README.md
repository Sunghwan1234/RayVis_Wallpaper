<h1>RayVis Audio Visualizer Wallpaper by Sunghwan1234</h1>

How to use this wallpaper:

1. Get Lively Wallpaper from the Microsoft Store
2. Download the release (.zip) or zip every file in the source code
3. Drag the .zip into Lively Wallpaper

Disclaimers:

- This project may be unstable or buggy. Please feel free to open issues, and I or others may help you fix your problem!
- I have used Gemeni and ChatGPT for general code optimization and some features. However, this project was not generated entirely by AI.

With this out of the way, have fun using this wallpaper/making your own! I'm happy to help anyone.
Credits are in LICENSE

<h1>Version Changelogs</h1>
<h3>V3.3.1</h3>

- Small Optimization on color and math
- Caching into arrays:
    - Math sine and cosine
    - Color calculation
    - HSL Hue strings

This may improve CPU/GPU performance, but I'm not sure

The only way to get this patch is to zip the files yourself, or copy/paste the index.js file.
I've made a constant inside script.js that reports the version, I'm not sure if this will help or not but its here now (probably wont be updated often)

<h2>V3.3</h2>

- Moved "Visualizer" image inside of Canvas
    - Uses the same preloaded canvas as "thumbnail" image
    - Currently does not support unique filters
- More performance additions (Untested)
    - More caching
    - Moved everything out of the try catch
- 30 FPS Lock Finally Implemented!

Current CPU/GPU Usage:
- CPU: 9~22% (i5)
- GPU: 6% (1050ti)
- FPS: Stable 60
30FPS Lock Enabled
- CPU: 7~15%
- GPU: 3%

<h2>V3.2</h2>

- Moved "thumbnail" image inside of Canvas
    - thumbnail is now preloaded inside a preloader canvas to reduce filter calculations (increase performance i hope)
    - May be slightly bugged, sometimes fails to load image?
    - If the image is big enough it doesnt apply blur, gonna make that a checkbox setting
    - Currently the "circle" might be off, needs more testing
- Added background & foreground Blur Settings
- Proper LICENSE (except forever.mp3)
- Added performance labels on Filters
    - From my task manager testing it seems the blur value of 4 is the laggiest (by like 2%)
    - From my testing it seems the "performance" setting barely does anything (i think thats fine)

<h2>V3.1 (Move to Canvas)</h2>

- "y"
- "finally works"
- QOL Fixes in properties and cleanup
- More changes to fit
- Fixed typo
- Added draggable ZIP

<h3>V3.0.1</h3>

- Slight change & info update
- Fix null thumbail & add property contrast

<h2>V3.0</h2>
Added Wallpaper Support
<h2>V2.1</h2>
Optimized CPU Usage by 30%
<h2>V0.8</h2>
Final Beta Version
<h2>V0.6.1</h2>
First public beta version