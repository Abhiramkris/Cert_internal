# Studio Architect v3.0 // Context Vector

This document serves as the high-fidelity persistent context for the **Studio Architect v3.0** re-architecture. It tracks core design protocols, state schemas, and future interaction ideas to maintain a single source of truth for the production engine.

---

## 1. Core Design Protocol: "Industrial Luxe"
- **Geometry**: `rounded-[2.5rem]` cards. `rounded-none` action buttons (Sharp Zero).
- **Typography**: Header-first breadcrumb hierarchy (`Portal > Studio`).
- **Borders**: 1px Zinc-100/200 protocol for technical "Blueprint" aesthetic.
- **Shadows**: `0_8px_30px_rgb(0,0,0,0.04)` (Clean Float).

---

## 2. Global State Schema (StudioProvider)
All architectural data is managed via the `StudioContext`. Key fields:

```typescript
  primary_color: string;           // Solid Foundation
  accent_color: string;            // Interaction Vector
  font_family_heading: string;      // Current Headline Vector
  font_family_body: string;         // Current Copy Vector
  font_head_cdn_url: string;        // Headline CDN Vector (Dynamic)
  font_body_cdn_url: string;        // Sub-head/Body CDN Vector (Dynamic)
  custom_font_family_heading: string; // Precise Headline override
  custom_font_family_body: string;    // Precise Body override
  button_radius: 'none' | 'sm' | 'md' | 'full';
  button_style: 'solid' | 'glass' | 'ghost';
  button_icon_id: string;           // Lucide Reference
}

interface ComponentConfig {
  selected_components: string[]; // Sequential module stream
  component_settings: Record<string, any>; // Local module overrides
  content_overrides: Record<string, any>;  // Global data injection (H1, Email, etc.)
}
```

---

## 3. Physical Architecture (Module Registry)

| Component Area | Physical Location | Description |
| :--- | :--- | :--- |
| **Shell Engine** | `src/components/studio/studio-shell.tsx` | Staged workflow, layout, and tab orchestration. |
| **Provider** | `src/components/studio/context/studio-provider.tsx` | Central data vector, saving, and font injection. |
| **Brand Panel** | `src/components/studio/panels/brand-panel.tsx` | Typography Trio, Matrix Modal, and CDN Tool. |
| **CTA Panel** | `src/components/studio/panels/cta-panel.tsx` | Button presets and icon manifest. |
| **Preview Canvas**| `src/components/studio/canvas/site-preview.tsx` | Technical Blueprint frame and module projection. |
| **Module Assets** | `src/utils/builder/templates/` | Physical React components (Hero, Services, Grid). |

---

## 4. Staged Workflow Logic
1. **Architecture (Stage 1)**: Locked focus on module selection. Identity panels are blurred/disabled.
2. **Identity (Stage 2)**: Unlocked after `isArchitectureVerified` is true. Enables deep design tools.

---

## 5. Idea Buffer / Roadmap (User & AI Dump)

> [!TIP]
> Use this section to dump any "Half-baked" ideas or future requirements.

- [ ] **Module Marketplace**: Add a modal for exploring NEW section templates graphically.
- [ ] **AI-driven Color Schemes**: Use OpenRouter to generate harmonious primary/accent pairs from a descriptive keyword.
- [ ] **Interactive Grid Canvas**: Allow drag-and-drop reordering directly on the preview canvas using `framer-motion`.
- [ ] **Code Export Settings**: Option to choose between Next.js/Tailwind or static HTML/CSS on eject.
- [ ] **Responsive Switcher**: Fine-tune the "Mobile" view in the Blueprint frame with a specific device-sized container.
- [ ] **Hover Effects Library**: Add a panel for global hover logic (Zap, Pulse, Slide).

---
*Last Vector Sync: 2026-04-04 // Studio Architect v3.0 Production*
