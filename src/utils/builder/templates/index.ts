// Registry Reload: 2026-05-06T11:15:29Z
import { NAV_COMPONENTS } from './nav';
import { HERO_COMPONENTS } from './hero';
import { FOOTER_COMPONENTS } from './footer';
import { SERVICES_COMPONENTS } from './services';
import { STATS_COMPONENTS } from './stats';
import { CTA_COMPONENTS } from './cta';
import { ABOUT_COMPONENTS } from './about';

export const COMPONENT_TEMPLATES = {
  ...NAV_COMPONENTS,
  ...HERO_COMPONENTS,
  ...SERVICES_COMPONENTS,
  ...STATS_COMPONENTS,
  ...CTA_COMPONENTS,
  ...ABOUT_COMPONENTS,
  ...FOOTER_COMPONENTS
};
