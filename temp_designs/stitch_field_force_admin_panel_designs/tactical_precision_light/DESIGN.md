---
name: Tactical Precision Light
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434656'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737688'
  outline-variant: '#c3c5d9'
  surface-tint: '#004ced'
  primary: '#003ec7'
  on-primary: '#ffffff'
  primary-container: '#0052ff'
  on-primary-container: '#dfe3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#952200'
  on-tertiary: '#ffffff'
  tertiary-container: '#bf3003'
  on-tertiary-container: '#ffddd5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001452'
  on-primary-fixed-variant: '#0038b6'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbd2'
  tertiary-fixed-dim: '#ffb4a1'
  on-tertiary-fixed: '#3c0800'
  on-tertiary-fixed-variant: '#891e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1440px
---

## Brand & Style
The design system is a high-density, enterprise-grade framework engineered for mission-critical applications. It prioritizes clarity, data density, and immediate scanability. The aesthetic is rooted in **Minimalism** with a **Corporate/Modern** edge, utilizing a stark, clinical white-and-gray palette to ensure that primary actions and status indicators remain the focal point. 

The target audience consists of operators, analysts, and administrators who require a tool that feels like a precision instrument. The UI evokes a sense of reliability and authoritative control, avoiding decorative flourishes in favor of structural integrity and functional transparency.

## Colors
The palette is dominated by **Operation Blue (#0052FF)**, used exclusively for primary actions, active states, and critical navigation markers. Surfaces leverage a layered approach: `#FFFFFF` for primary content containers and `#F8FAFC` for background canvases and structural sidebars.

Typography utilizes a high-contrast Slate scale to maintain legibility in data-dense views:
- **Headings:** Slate-900 (#0F172A) for maximum authority.
- **Body:** Slate-800 (#1E293B) for comfortable extended reading.
- **Support Text:** Slate-500 (#64748B) for metadata and labels.

Status tokens are calibrated for high visibility against light surfaces, using semi-bold weights and specific icon pairings to ensure accessibility without the need for heavy background fills.

## Typography
The typography system uses a tri-font approach to categorize information by function:
- **Hanken Grotesk** is used for headlines and display text, providing a sharp, contemporary professional feel.
- **Inter** serves as the primary workhorse for body copy and UI controls, chosen for its exceptional readability at small sizes.
- **JetBrains Mono** is utilized for labels, data values, and technical metadata, reinforcing the "precision instrument" narrative.

Hierarchy is enforced through strict vertical rhythm. All-caps treatments are reserved for **Label-caps** to denote system categories or table headers.

## Layout & Spacing
This design system employs a **Fixed Grid** model for desktop and a **Fluid Grid** for mobile. The layout is built on a 4px baseline grid to support high-density information display.

- **Desktop:** 12-column grid, 1440px max-width, 16px gutters, 32px external margins.
- **Tablet:** 8-column grid, 16px gutters, 24px margins.
- **Mobile:** 4-column grid, 12px gutters, 16px margins.

Spacing is aggressive; vertical padding in lists and tables is minimized to maximize the amount of visible data on a single screen. Use `16px` (4 units) for standard component spacing and `8px` (2 units) for internal element grouping.

## Elevation & Depth
In line with the tactical aesthetic, this design system eschews traditional shadows in favor of **Low-Contrast Outlines** and **Tonal Layers**. 

Depth is communicated through 1px solid borders using `#E2E8F0`. When an element requires focus (like a modal or a floating menu), use a "hard" 2px border in Operation Blue or a very tight, low-opacity neutral shadow (0px 2px 4px rgba(15, 23, 42, 0.08)). Surfaces stack logic:
- **Level 0 (Background):** #F8FAFC
- **Level 1 (Cards/Content):** #FFFFFF (with 1px border)
- **Level 2 (Popovers/Modals):** #FFFFFF (with 1px darker border or subtle shadow)

## Shapes
The shape language is strictly **Sharp (0px roundedness)**. This reinforces the technical, engineered feel of the system. Every button, input field, card, and modal must utilize 90-degree corners. 

The only exception to the sharp-corner rule is for status indicators (dots) or specific circular avatars, though square avatars are preferred to maintain the system's structural consistency.

## Components
- **Buttons:** Primary buttons use a solid `#0052FF` fill with white text. Secondary buttons use a 1px border of Slate-200 with Slate-900 text. All buttons are sharp-edged.
- **Input Fields:** 1px Slate-200 border, white background. Focus state switches border to 2px Operation Blue. Labels use `label-sm` in Slate-700.
- **Cards:** White background, 1px `#E2E8F0` border. No shadow. Card headers should have a subtle bottom border.
- **Chips/Badges:** Rectangular with 0px radius. Status-based chips use a light tint background (e.g., 10% opacity of the status color) with a solid 2px left-edge border of the primary status color.
- **Lists & Tables:** Use alternating row stripes (Zebra striping) with `#F8FAFC`. Table headers are `label-caps` with a 2px Slate-900 bottom border.
- **Data Grids:** High-density cells with 8px horizontal padding. Borders between cells are optional; preferred method is subtle row dividers only.