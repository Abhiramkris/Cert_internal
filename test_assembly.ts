import { COMPONENT_TEMPLATES } from './src/utils/builder/templates';
const component = COMPONENT_TEMPLATES['HERO_CINEMATIC_VIDEO'];
const styles = {font_family_heading: 'Inter'};
const content = {h1: 'Test'};
const settings = {blur_intensity: 50, enable_blur_div: false, hero_text_size: 'text-2xl', show_scroll_indicator: false};
console.log(component.code(styles, content, settings));
