# Replicate the PRIVATE OS reference video

## Goal
Rebuild the visible PRIVATE OS experience to closely match the uploaded 25.5-second reference video, while excluding Netflix and retaining the requested working web apps.

## Build
- Replace the current presentation with the video’s dark graphite-and-gold desktop: full-screen ribbon wallpaper, small gold weekday centered near the top, and no large desktop clock.
- Match the video’s compact, icon-first bottom taskbar with tiny colorful app icons, subtle translucency, minimal chrome, and the same centered placement and proportions.
- Recreate the compact floating app/recommendation panel shown in the opening sequence, including its dark glass surface, gold headings, green actions, and thumbnail-led cards.
- Restyle application windows and PRIVATE Browser to the video’s nearly borderless black chrome, thin top controls, dark sidebar where shown, and full content area.
- Reproduce the desktop context/quick menu, right-edge vertical app strip, top-edge dock state, auto-hidden taskbar state, and horizontal floating dock state demonstrated in the video.
- Rebuild the launcher as the centered, frameless grid of colorful app icons and small labels shown at the end of the video.
- Keep the existing wallpaper choices, working PRIVATE Browser navigation, Cherrion, Figure Cloud, Files, Settings, and other non-Netflix apps available through the matching launcher and dock.
- Remove Netflix from every launcher, recommendation, dock, and shortcut surface.
- Keep the experience usable on narrow screens while preserving the video’s desktop composition on larger screens.

## Interaction sequence
- Desktop starts with the video wallpaper and compact bottom taskbar.
- Opening the featured content reproduces the small recommendation panel and browser-window progression.
- Desktop menus expose taskbar placement and visibility states matching the demonstrated bottom, right, top, hidden, and floating arrangements.
- The launcher opens into the same centered app grid shown in the final seconds.

## Technical details
- Keep all state local to the browser; no backend or accounts.
- Preserve `/wallpaper.mp4`, `/wallpaper-poster.jpg`, the existing image pointers, and `/api/proxy` unchanged.
- Use semantic design tokens for the graphite, gold, green, glass, border, and shadow roles.
- Retain reduced-motion behavior and existing external-site fallback behavior.

## Verification
- Compare captured desktop, recommendation panel, browser window, menus, each taskbar state, and launcher against representative video frames.
- Test PRIVATE Browser navigation, Cherrion, Figure Cloud, app launching/closing, taskbar controls, and launcher search.
- Check desktop and mobile layouts, then confirm the preview builds without errors.
