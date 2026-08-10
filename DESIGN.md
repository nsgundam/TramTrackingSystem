---
name: "RSU Operations — Signal Lens Workbench"
description: "Admin-only light Liquid Glass system for truthful, high-density transport operations."
colors:
  frost-canvas: "#f2f2f7"
  porcelain-content: "#ffffff"
  opaque-frost: "#f8f8fa"
  graphite-ink: "#1c1c1e"
  graphite-muted: "#5f5f66"
  graphite-placeholder: "#6e6e73"
  quiet-boundary: "#d1d1d6"
  content-boundary: "#d5d5da"
  functional-blue: "#075dc7"
  functional-blue-hover: "#064b9f"
  identity-graphite: "#2c2c2e"
  navigation-glass: "rgb(255 255 255 / 76%)"
  control-glass: "rgb(255 255 255 / 74%)"
  strong-glass: "rgb(255 255 255 / 86%)"
  luminous-glass-border: "rgb(255 255 255 / 90%)"
  positive: "#08714f"
  information: "#07549f"
  warning: "#765000"
  danger: "#a8271d"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 9vw, 2.625rem)"
    fontWeight: 780
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 750
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  compact: "0.375rem"
  control: "0.75rem"
  panel: "0.875rem"
  mobile-header: "1.125rem"
  modal: "1.25rem"
  navigation: "1.5rem"
  login-panel: "1.75rem"
  pill: "999px"
spacing:
  xs: "0.375rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  2xl: "2rem"
components:
  primary-action:
    backgroundColor: "{colors.functional-blue}"
    textColor: "{colors.porcelain-content}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.875rem"
    height: "2.75rem"
  contextual-control:
    backgroundColor: "{colors.control-glass}"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.875rem"
    height: "2.75rem"
  navigation-glass:
    backgroundColor: "{colors.navigation-glass}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.navigation}"
    width: "17.5rem"
  modal-glass:
    backgroundColor: "{colors.strong-glass}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.modal}"
    padding: "1.25rem"
    width: "min(100%, 30rem)"
  content-panel:
    backgroundColor: "{colors.porcelain-content}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.panel}"
    padding: "1rem"
  operational-record:
    backgroundColor: "{colors.porcelain-content}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.control}"
    padding: "1rem"
  form-field:
    backgroundColor: "{colors.porcelain-content}"
    textColor: "{colors.graphite-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.625rem 0.75rem"
    height: "2.75rem"
  status-positive:
    backgroundColor: "#e7f6f0"
    textColor: "{colors.positive}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.3rem 0.55rem"
  login-panel:
    backgroundColor: "{colors.strong-glass}"
    textColor: "{colors.graphite-ink}"
    rounded: "{rounded.login-panel}"
    padding: "clamp(1.5rem, 6vw, 2.25rem)"
    width: "min(100%, 29rem)"
---

# Design System: RSU Operations — Signal Lens Workbench

## Overview

**Creative North Star: "Signal Lens Workbench"**

Signal Lens Workbench puts operational truth on a quiet luminous plane. It is a deliberately light, minimal-premium, iOS-inspired Liquid Glass world for authenticated Admin routes, identified in source by `[data-admin-theme="signal-lens"]`. It does not govern the Public rider interface: Public retains its incumbent visual identity, layout authority, and separately approved change process.

Glass carries orientation and immediate interaction, while opaque porcelain carries evidence. The Sidebar, Mobile header and drawer, compact status/context controls, shared modal, and Login panel may refract the pale neutral canvas. Maps, tables, ledgers, resource panels, records, form fields, alerts, and long operational content remain opaque so density, contrast, and state never depend on transparency.

The system is locked to a bright white, porcelain, frost-gray, and graphite palette. Functional blue appears only for action, current selection, focus, and existing information meaning; semantic green, amber, and red retain their operational roles. The built direction contract and seed `7c756d3a` are preserved in a non-rendered Admin-root template.

**Key Characteristics:**

- Admin-only, explicitly light visual authority with no automatic dark appearance.
- Functional glass around stable opaque operational content.
- System UI typography and the incumbent Lucide icon set only.
- Concentric rounded geometry, quiet boundaries, and restrained luminous depth.
- Accessible opaque and high-contrast fallbacks for every glass-bearing surface.

## Colors

The palette reads as white porcelain over cool frost, anchored by graphite and interrupted only by functional or semantic state color. Frontmatter tokens are normative.

### Primary

- **Functional Blue** (`functional-blue`): primary actions, current navigation, keyboard focus, and existing informational meaning.
- **Functional Blue Hover** (`functional-blue-hover`): darker action confirmation on hover; it is not an ambient or decorative theme color.

### Neutral

- **Frost Canvas** (`frost-canvas`): the light Admin field beneath all material layers.
- **Porcelain Content** (`porcelain-content`): the stable reading surface for maps, tables, ledgers, forms, panels, and records.
- **Opaque Frost** (`opaque-frost`): the replacement for translucent material when transparency is reduced or unsupported.
- **Graphite Ink** (`graphite-ink`): primary text and critical operational values.
- **Graphite Muted** (`graphite-muted`): secondary labels and explanations while retaining tested normal-text contrast on porcelain.
- **Quiet Boundary** and **Content Boundary** (`quiet-boundary`, `content-boundary`): structural separation without turning every object into bright glass.
- **Navigation, Control, and Strong Glass** (`navigation-glass`, `control-glass`, `strong-glass`): distinct translucent white roles for navigation, compact context, and modal/Login layers.

### Semantic State

- **Positive, Information, Warning, and Danger** (`positive`, `information`, `warning`, `danger`): existing operational meanings. Each is paired in source with a light surface and visible boundary, plus text or labels, so hue is never the only signal.

**The Blue Means Work Rule.** Blue is reserved for action, current selection, focus, and existing information state; it never becomes ambient chrome.

**The Bright Lock Rule.** Admin declares a light color scheme and does not switch visual worlds in response to an operating-system dark preference.

## Typography

- **Display Font:** Apple-platform-aware system UI (`-apple-system`, with BlinkMacSystemFont, Segoe UI, and sans-serif fallbacks)
- **Body Font:** The same system UI stack
**Label/Mono Font:** System UI for labels; the incumbent platform monospace stack only for identifiers and coordinates

**Character:** Compact, calm, and operational. Weight and spacing establish hierarchy without adding a display font or branded type dependency.

### Hierarchy

- **Display** (weight 780, 2–2.625rem responsive, line-height 1.05, letter-spacing -0.035em): Reserved for the Login heading; large, tightly tracked, and balanced.
- **Headline** (weight 800, 1.75–2.5rem responsive, line-height 1.08, letter-spacing -0.035em): Admin route titles use strong weight and compact leading.
- **Title** (weight 750, 1.125rem, line-height 1.3, letter-spacing -0.015em): Panel and modal headings use this smaller role for scan-friendly grouping.
- **Body** (weight 400, 0.875rem, line-height 1.55): Operational copy and descriptions; descriptive blocks stay bounded around 34–44 rem where implemented.
- **Label** (weight 800, 0.6875rem, line-height 1.2, letter-spacing 0.08em, uppercase): Eyebrows, section labels, status chips, and fact labels.

**The Native Voice Rule.** Use the system UI stack and existing Lucide icons only; do not add a webfont, icon font, external image, or substitute illustration language.

## Layout

The shell is Mobile-first. Below the desktop breakpoint, a fixed glass header sits inside a three-quarter-rem viewport inset, the main content clears it with five rem of top padding, and the Sidebar becomes a bounded dialog drawer no wider than the viewport minus 1.5 rem. The 390 × 844 acceptance viewport has no horizontal overflow, and interactive shell controls retain at least 2.75 rem (44 CSS px) in both dimensions.

At the implemented 40 rem breakpoint, content padding increases from one rem to 1.5 rem and established form, header, card, and modal compositions gain room. At 64 rem, the Mobile header and drawer treatment yield to a fixed 17.5 rem floating Sidebar; the main column begins after 19.5 rem, the shared content region uses the desktop padding rhythm, and resource cards switch to the existing table presentation. The shared content wrapper remains capped at 100 rem.

Dense reading layouts stay on the opaque content tier at every width. The map workspace remains a bounded opaque canvas, tables scroll or switch to cards according to the incumbent breakpoint behavior, and Login stays centered within a full dynamic viewport.

**The Reading Plane Rule.** Responsive composition may change, but operational content never becomes glass to make a layout fit.

## Elevation & Depth

Depth is a restrained hybrid: pale radial and linear canvas gradients provide atmosphere, then blur and named shadows distinguish only functional glass and primary action layers. Opaque content panels and resource containers explicitly remove backdrop filters and shadows.

### Shadow Vocabulary

- **Navigation Ambient** (`box-shadow: 0 1.25rem 3.75rem rgb(28 28 30 / 13%)`): floating desktop Sidebar and Mobile drawer.
- **Modal Deep** (`box-shadow: 0 1.75rem 5rem rgb(28 28 30 / 18%)`): shared modal and Login glass panels.
- **Context Control** (`box-shadow: 0 0.5rem 1.5rem rgb(28 28 30 / 10%)`): Mobile header and compact contextual glass controls.
- **Primary Action** (`box-shadow: 0 0.625rem 1.5rem rgb(0 78 172 / 22%)`): opaque primary actions only.

Navigation blur ranges from 1.25 rem on the Mobile header to 1.5 rem on the Sidebar, with 145% saturation. Context controls use 0.875 rem blur at 135% saturation; modals use 1.5 rem at 145%; Login uses 1.75 rem at 150%. Backdrops use only a restrained 0.375 rem blur.

### Motion Behavior

- Control and navigation state transitions use 160 ms ease.
- Login fields and submit state use 180 ms with `cubic-bezier(0.16, 1, 0.3, 1)`; the Mobile drawer transform uses 220 ms ease.
- The 900 ms linear resource spinner is functional loading feedback, not decoration.
- Reduced motion collapses transitions and animations to 0.001 ms, limits animation to one iteration, disables spinner rotation, and preserves the final state.

### Material Fallbacks

- **Reduced transparency:** remove backdrop filters, flatten the ambient canvas, and replace glass controls, navigation, modal, and Login with opaque frost.
- **Increased contrast:** strengthen shared/content boundaries to `#8293a9`, resolve the glass boundary to current text color, remove blur, and use opaque frost.
- **Forced colors:** resolve surfaces and text to `Canvas`/`CanvasText`, functional emphasis to `LinkText`/`Highlight`, remove shadows and blur, and outline the current navigation item.
- **Unsupported backdrop filter:** replace every functional glass surface with its opaque navigation or control material.

**The Functional Glass Rule.** Glass belongs to navigation, context/control chrome, modal chrome, and the Login panel—never to maps, tables, ledgers, form content, alerts, or long text.

**The Opaque Truth Rule.** Content surfaces are flat, white, and shadowless because operational evidence must remain stable beneath moving chrome.

## Shapes

The form language is concentric rather than uniformly pill-shaped. Compact identifiers begin at the compact radius; fields, actions, records, and most controls share the control radius; content panels step up to the panel radius; the Mobile header, modal, Sidebar, and Login panel progressively widen their corners. Full pills are reserved for status and compact count treatments.

Borders remain visible even when blur disappears. Glass uses a luminous boundary over the neutral canvas, while opaque reading surfaces use the content boundary. In increased or forced contrast, these resolve to stronger or system-provided colors.

**The Nested Radius Rule.** Outer navigation and modal shells use larger curves than their controls and content, preserving a readable material hierarchy.

## Components

The following nine components are canonical for this implemented Admin foundation. Source selectors are included so future work can extend the existing authority instead of recreating it.

### Navigation Glass

- **Source selectors:** `.admin-sidebar`, `.admin-mobile-header`, `.admin-sidebar-backdrop`.
- **Material:** translucent navigation glass with the ambient/control shadow; the Mobile Sidebar is also the focus-managed dialog drawer.
- **State:** current links use a subtle functional-blue fill plus `aria-current="page"`; hover remains neutral; keyboard focus uses the shared two-pixel outline.
- **Responsive behavior:** header/drawer below 64 rem, fixed 17.5 rem Sidebar at and above 64 rem.

### Contextual Glass Control

- **Source selectors:** `.admin-dashboard__status`, `.admin-map-status-surface`, `.admin-secondary-action`, `.admin-button[data-tone="secondary"]`, `.admin-icon-action:not([data-tone])`.
- **Material:** compact control glass with restrained blur and shadow.
- **State:** neutral by default; hover strengthens the boundary/background, while error or semantic variants replace the neutral material with their established opaque state surfaces.

### Primary Action

- **Source selectors:** `.admin-primary-action`, `.admin-button[data-tone="primary"]`, `.admin-login__submit`.
- **Material:** opaque functional-blue fill with white text and a restrained blue action shadow; this is not a translucent glass layer.
- **State:** darker hover fill, visible focus outline, and reduced opacity plus a not-allowed cursor when disabled. Login prevents repeat submission while pending.

### Opaque Content Panel

- **Source selectors:** `.admin-panel`, `.admin-resource-panel`, `.admin-live-map`, `.admin-resource-table`.
- **Material:** porcelain content, content boundary, no backdrop filter, and no panel shadow in Signal Lens.
- **Behavior:** panels clip their own content; the map and table remain stable reading/working planes regardless of the surrounding glass chrome.

### Operational Record

- **Source selectors:** `.admin-resource-card`, `.admin-operation-record`, `.admin-feedback-recovery__item`, `.admin-route-stops__item`.
- **Material:** opaque porcelain with the control radius and visible boundary.
- **State:** online/resolved, stale/investigating, new/acknowledged, and disabled/rejected records use their semantic border family without making the record translucent.

### Status Badge

- **Source selector:** `.admin-status-badge[data-tone]`.
- **Shape:** full pill with compact uppercase label typography.
- **State:** positive, warning, neutral, information, and danger variants combine readable text, a light opaque fill, and a border.

### Form Field

- **Source selectors:** `.admin-form-control`, `.admin-login__control`.
- **Material:** opaque white input surface with the control radius; form content never uses backdrop blur.
- **State:** hover strengthens the boundary, focus uses a two-pixel functional-blue outline with offset, placeholders use dedicated graphite, and disabled fields remain visibly opaque.

### Shared Modal

- **Source selectors:** `.admin-modal`, `.admin-modal-backdrop`, `.admin-modal__close`.
- **Material:** strong glass with the modal shadow and radius over a restrained dimmed/blurred backdrop.
- **Behavior:** existing naming, focus containment, disabled-close behavior, action order, maximum widths, and scroll bounds remain authoritative.

### Login Glass Panel

- **Source selectors:** `.admin-login-shell`, `.admin-login__panel`, `.admin-login__mark`.
- **Material:** the strongest functional glass panel centered over the same frost canvas; the graphite identity mark, opaque fields, and single blue submit action establish the hierarchy.
- **Behavior:** the panel preserves exact username/password labels, autocomplete, inline error, pending, and request behavior; it introduces no hover scale.

## Do's and Don'ts

### Do:

- **Do** scope Signal Lens to authenticated Admin and Admin Login roots marked with `[data-admin-theme="signal-lens"]`.
- **Do** keep navigation, contextual controls, shared modals, and Login on the functional glass tier while maps, tables, ledgers, forms, records, alerts, and long text stay opaque.
- **Do** preserve visible focus, 44 CSS px targets, semantic text/boundaries, and the implemented reduced-transparency, increased/forced-contrast, unsupported-filter, and reduced-motion fallbacks.
- **Do** use the system UI type stack and existing Lucide icons for every extension.

### Don't:

- **Don't** apply this Admin visual world, its theme marker, or its glass hierarchy to the Public rider UI.
- **Don't** introduce automatic dark mode, navy/campus-sky chrome, cyan/violet ambience, or decorative blue.
- **Don't** apply backdrop blur to dense operational content or use translucency/color as the sole carrier of hierarchy or status.
- **Don't** add hover scale, parallax, spring simulation, looping decoration, new fonts, icon packs, external imagery, or Apple trademarks/assets.
