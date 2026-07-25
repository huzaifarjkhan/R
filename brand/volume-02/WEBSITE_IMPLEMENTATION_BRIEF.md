# Solarist.in Website Rebuild — Authoritative Implementation Brief

Use this document as the opening prompt in the website-creation guide chat.

---

Act as a senior UI/UX designer, brand-systems designer, frontend architect, accessibility specialist and production website engineer.

You have GitHub access to the existing Solarist website repository, `huzaifarjkhan/R`, which publishes `solarist.in`. Your task is to thoroughly audit, redesign and update the existing website so that it follows the approved Solarist identity and digital system.

## Mandatory first step

Before editing any file, inspect the entire repository and report:

- Current framework, architecture and dependencies
- Existing pages, navigation and content
- Build scripts and deployment workflow
- GitHub Pages configuration, CNAME and custom-domain setup
- Current visual system and asset usage
- Responsive behaviour
- Accessibility issues
- SEO and structured-data status
- Performance risks
- Broken links, missing assets and technical debt
- Content worth preserving

Read these repository assets completely before making design decisions:

- `brand/volume-02/README.md`
- `brand/volume-02/BRAND_STRATEGY_AND_DIGITAL_SYSTEM.md`
- `brand/volume-02/tokens/solarist-tokens.css`
- `brand/volume-02/tokens/solarist-tokens.json`
- `brand/volume-02/assets/Solarist_Logo_Primary.svg`
- `brand/volume-02/assets/Solarist_Symbol_Primary.svg`
- `brand/volume-02/assets/Solarist_Symbol_Micro.svg`
- Any existing Volume 01 guideline or original brand assets in the repository

Treat Volume 01 as the authority for original identity principles and Volume 02 as the authority for strategy, messaging, accessibility and digital implementation. Production SVGs and tokens are the source of truth for code.

Do not merely reskin the current website. Improve its information architecture, content hierarchy, usability, responsiveness, accessibility, performance and technical maintainability.

## Brand position

Solarist is a premium engineering agency serving established companies that need dependable outsourced technical capacity.

Solarist provides:

- Commercial solar photovoltaic design
- Solar thermal design
- Battery Energy Storage System engineering
- Autodesk Revit family creation for manufacturers
- Conversion of SolidWorks, STEP, SAT, DWG and other source files into efficient Revit families
- Engineering automation
- AI workflow automation and controlled AI deployment for company processes

Core brand statement:

**Engineering expertise. Practical automation.**

Supporting proposition:

**Engineering systems for energy, buildings and better workflows.**

Solarist must feel precise, intelligent, refined, technical, calm, reliable, methodical and premium.

It must not feel like a generic AI startup, SaaS landing page, marketing agency, residential solar installer, freelancer portfolio or trendy technology company.

## Primary customers

Design and write for established medium-sized organisations that can invest in specialist external engineering capability, including:

- Commercial solar developers, EPCs and contractors
- Engineering consultancies
- Energy-service companies
- Solar, battery and mechanical-equipment manufacturers
- Architecture, MEP and BIM teams
- Manufacturers needing production-ready Revit content
- Companies seeking process automation or AI deployment

## Founder-led credibility

Use these as founder-experience metrics unless repository evidence explicitly supports a corporate claim:

- 8+ years of total engineering experience
- 65+ commercial projects delivered
- Lead Engineer on 39 projects
- Experience across 20+ California cities
- 7.1 MW of photovoltaic capacity designed
- 10,875 photovoltaic modules specified
- 800 kWh of BESS capacity designed
- Four California utility territories
- Three proprietary engineering calculators adopted by teams

Never imply that Solarist as a company completed work undertaken before the company existed. Use wording such as “Founder experience includes…” or “Led by experience across…”.

## Service content

Create clear, indexable destinations for the following.

### Solar photovoltaic engineering

Cover system sizing, module and inverter selection, string configuration, DC/AC calculations, single-line diagrams, site and roof plans, racking layouts, electrical schedules, NEC 690 and AHJ permit packages, BOM/BOQ production, voltage-drop analysis and SCCR analysis.

### Solar thermal engineering

Cover commercial system design, collector layouts, equipment coordination, mechanical documentation and permit support.

### BESS engineering

Cover battery sizing, inverter and system selection, hybrid PV+BESS design, protection coordination, equipment integration, NFPA 855 documentation and system-integration drawings.

### Revit and BIM manufacturer services

Emphasise that the primary market is product manufacturers. Cover native Revit-family creation, SolidWorks-to-Revit conversion, STEP/SAT/DWG conversion, geometry optimisation, parameters, connectors, type catalogues, schedules, documentation quality and BIM performance.

### AI automation and deployment

Cover process discovery, workflow mapping, document processing, engineering-calculation automation, internal knowledge assistants, data transformation, reporting, controlled integrations, human review, permissions, auditability and governance.

Do not describe AI as magic. Show the input, rules, human review and measurable outcome.

## Recommended information architecture

Evaluate and implement a clear structure using the best fit for the current codebase:

- Home
- Services
  - Solar PV
  - Solar Thermal
  - BESS
  - Revit & BIM
  - AI Automation
- Experience or Work
- Engineering Tools
- About
- Contact

Services may be grouped in navigation, but every major service must be discoverable and have meaningful search-indexable content.

## Homepage narrative

The homepage should answer within the first screen:

- What Solarist does
- Who it serves
- Why it is credible
- What the visitor should do next

Recommended sequence:

1. Precise hero proposition
2. Primary service categories
3. Founder-experience metrics
4. Detailed capability blocks for solar, BESS, Revit and automation
5. Selected non-confidential examples or anonymised case-study patterns
6. Working process
7. Engineering tools
8. Founder/about module
9. Final contact call to action

Suggested hero:

**Engineering systems for energy, buildings and better workflows.**

Solarist provides commercial solar, thermal and BESS design; manufacturer-ready Revit content; and practical AI automation for established companies that need dependable external engineering capacity.

Primary CTA: **Discuss a project**

Secondary CTA: **Explore services**

## Content style

Write like engineers who care about design.

Use specific outputs, constraints and proof. Avoid inflated claims and words such as revolutionary, disruptive, game-changing, cutting-edge, world-class and best-in-class.

Prefer:

- Short, direct sentences
- Exact deliverables
- Real numbers
- Clear process descriptions
- Measured confidence
- One deliberate warm note per section

## Visual system

Use the repository tokens. Do not scatter raw hex values throughout components.

Canonical roles:

- Sun `#D85A1A`: logo symbol, large accents and decorative graphics
- Deep Sun `#A8400D`: accessible ordinary-sized accent text, links and appropriate action backgrounds
- Ember `#ED7A3F`: decorative only
- Ink `#11100F`: primary text and dark surfaces
- Paper `#EBE3D6`: warm branded surface
- Canvas `#F7F4EF`: main page background

Never use small Sun or Ember text on white or Paper.

Typography:

- Canela Deck for selected display moments only
- Inter for body copy, navigation, forms, buttons and most interface text
- JetBrains Mono for metrics, units, codes and technical metadata

Do not add or redistribute Canela font files unless the correct licence and approved WOFF2 files already exist. Otherwise use the documented fallback stack.

Use the supplied SVG files directly. Do not redraw, distort, tilt, recolour, duplicate or animate the logo. Use the micro symbol for favicon-scale contexts.

## UI design requirements

Create a coherent production system for:

- Responsive header and navigation
- Buttons and text links
- Service cards
- Metric and proof cards
- Case-study cards
- Contact forms
- Tables and technical-data displays
- Tabs and accordions where useful
- Breadcrumbs
- Validation and status messages
- Loading, empty and error states
- Footer and legal navigation

Define default, hover, keyboard-focus, pressed, disabled and error states where applicable.

The site should feel premium through proportion, typography, spacing and precision—not through excessive animation, glass effects, gradients or oversized decorative elements.

## Imagery

Do not publish client-specific photographs, addresses, plans, drawings or technical information without explicit authorisation.

Use properly licensed generic placeholders where needed for:

- Commercial rooftop photovoltaic systems
- Solar canopies
- BESS equipment
- Revit models and family-editor contexts
- Product geometry and technical diagrams
- Workflow automation and document processing
- Engineers working with credible drawings, models or equipment

For Revit, show clean geometry, parameter structures, connectors, type catalogues and before/after optimisation.

For automation, show controlled workflows with inputs, validation, processing, human review and outputs.

Avoid generic smiling hard-hat teams, leaves over solar panels, glowing AI brains, holographic blue interfaces and confidential client imagery.

Keep source and licence records for every external image. Optimise images and use responsive formats.

## Founder module

Prepare an accessible founder component that can later accept the founder’s photograph.

A restrained dark overlay may appear on hover or keyboard focus with the founder’s name, role and concise credential statement. The same information must be visible or reachable on touch devices. Hover must never be the only interaction.

## Accessibility

Target WCAG 2.2 AA.

Mandatory requirements:

- 4.5:1 contrast for normal text
- 3:1 for large text and essential interface graphics
- Complete keyboard navigation
- Visible focus styles
- Semantic landmarks and headings
- Accessible form labels, descriptions and errors
- No information communicated by colour alone
- Meaningful alternative text
- Minimum 44 px practical touch targets
- Reduced-motion support
- Skip navigation link
- Logical focus order
- No horizontal overflow at 320 px

## Responsive testing

Test at minimum:

- 320 px
- 375 px
- 768 px
- 1024 px
- 1440 px
- A large desktop width

Use mobile-first CSS, controlled line lengths, responsive type with `clamp()`, flexible grids and stable image aspect ratios.

## Engineering tools

Preserve or prepare an extensible route and component architecture for future tools such as:

- Voltage-drop calculator
- SCCR or fault-current calculator
- PV string-sizing tools
- BESS sizing tools
- Revit-family requirement intake

Tools must follow the same token, accessibility and data-display system.

## SEO and trust

Implement appropriate:

- Unique page titles and descriptions
- Canonical URLs
- Open Graph metadata
- Sitemap and robots configuration
- Organisation or ProfessionalService structured data where accurate
- Service structured data only where valid
- Clear contact details
- Privacy and legal pages as required
- Descriptive internal links

Do not fabricate testimonials, certifications, office locations, client names or project outcomes.

## Performance and engineering quality

- Preserve a simple, maintainable architecture
- Avoid unnecessary dependencies
- Optimise images and SVG delivery
- Prevent layout shift
- Use lazy loading below the fold
- Keep JavaScript proportional to the site’s needs
- Maintain or improve GitHub Pages compatibility
- Do not break the existing CNAME or deployment workflow
- Remove dead code only after confirming it is unused
- Add comments only where they clarify non-obvious decisions

## Workflow

1. Audit the repository and present the findings.
2. Propose the final information architecture and implementation plan.
3. Implement the design system and core components.
4. Rewrite and restructure the content.
5. Build all agreed pages.
6. Test responsive behaviour, keyboard use, accessibility and build output.
7. Verify domain and deployment configuration.
8. Show a concise change summary and any unresolved content placeholders.
9. Commit the work on a dedicated branch and open a pull request rather than overwriting production without review.

Do not stop after producing recommendations. Complete the website implementation, run available checks and prepare the pull request for review.
