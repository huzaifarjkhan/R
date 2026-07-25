# Solarist Brand Strategy & Digital System — Volume 02

Approved production release · July 2026

This directory extends the Solarist visual identity into a working brand strategy and digital implementation system for solarist.in.

## Contents

- `BRAND_STRATEGY_AND_DIGITAL_SYSTEM.md` — implementation-ready strategy and UI guidance
- `WEBSITE_IMPLEMENTATION_BRIEF.md` — authoritative prompt for rebuilding solarist.in
- `assets/Solarist_Logo_Primary.svg` — canonical horizontal logo
- `assets/Solarist_Symbol_Primary.svg` — full 16-ray symbol
- `assets/Solarist_Symbol_Micro.svg` — simplified small-format symbol
- `tokens/solarist-tokens.css` — CSS custom properties
- `tokens/solarist-tokens.json` — platform-neutral design tokens

## Canonical decisions

1. `#D85A1A` is the display Sun colour used for the symbol, large accents and decorative graphics.
2. `#A8400D` is Deep Sun, used for accessible normal-size accent text, links and appropriate action backgrounds.
3. `#ED7A3F` is decorative Ember and must not be used for ordinary text on light surfaces.
4. Use the full 16-ray symbol in normal and large applications; use the micro symbol for favicons and very small digital contexts.
5. Founder metrics must remain framed as founder-led experience until Solarist builds a separate corporate delivery history.
6. Canela Deck is licensed commercial typography. Do not add or redistribute font files unless the appropriate web and organisational licence has been confirmed.
7. Placeholder imagery must be generic, properly licensed and non-client-specific.
8. All website work must target WCAG 2.2 AA and respect reduced-motion preferences.

## Typography

- Display: Canela Deck, with Georgia and Times New Roman fallbacks
- Body and UI: Inter
- Data and technical metadata: JetBrains Mono

Recommended website balance: approximately 10% display serif, 80% Inter and 10% monospaced technical typography.

## Full review document

The approved 40-page PDF remains the visual presentation edition. The Markdown strategy in this directory is the implementation source of truth for repository-based development, while the CSS/JSON tokens and SVG files are the production source of truth for code.
