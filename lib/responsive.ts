/**
 * Tablet and phone versions of the page styles.
 *
 * The page styles in content/css/ come from Elementor and were written for desktop: sections with
 * 80px side padding, cards with 50px side margins and 48px titles. On a phone those values leave a
 * column of text 150px wide, push cards off the right edge and break words in half.
 *
 * This takes each page stylesheet and appends tablet and phone overrides for spacing and large
 * font sizes, scaled down from the desktop values. Desktop styles are not touched. Where Elementor
 * already had its own tablet or phone value for a property, that value is kept.
 */

type Breakpoint = { media: string; key: 'tablet' | 'mobile' };

const TABLET: Breakpoint = { media: '@media (max-width:1024px)', key: 'tablet' };
const MOBILE: Breakpoint = { media: '@media (max-width:767px)', key: 'mobile' };

// Upper limits per breakpoint, in px.
const LIMITS = {
  tablet: { padX: 40, padY: 60, marginX: 20 },
  mobile: { padX: 20, padY: 40, marginX: 0 },
};

function scaleFont(px: number, bp: Breakpoint['key']): number {
  // 48px -> 40px on tablets, 32px on phones; sizes up to ~26px are left as they are.
  const scaled = bp === 'tablet' ? 16 + px * 0.5 : 18 + px * 0.3;
  return Math.round(Math.min(px, scaled));
}

type Rule = { selector: string; decls: Map<string, string> };

function parseDecls(body: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const part of body.split(';')) {
    const i = part.indexOf(':');
    if (i > 0) out.set(part.slice(0, i).trim(), part.slice(i + 1).trim());
  }
  return out;
}

/** Splits a stylesheet into top-level rules and the rules inside each max-width media query. */
function parse(css: string) {
  const top: Rule[] = [];
  const tablet = new Map<string, Map<string, string>>();
  const mobile = new Map<string, Map<string, string>>();
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) break;
    const head = css.slice(i, open).trim();
    if (head.startsWith('@')) {
      // Find the end of the block.
      let depth = 1;
      let j = open + 1;
      while (j < css.length && depth) {
        if (css[j] === '{') depth++;
        else if (css[j] === '}') depth--;
        j++;
      }
      const inner = css.slice(open + 1, j - 1);
      const media = head.replace(/\s+/g, '');
      const target = media.includes('max-width:767px') ? mobile : media.includes('max-width:1024px') ? tablet : null;
      if (target) {
        for (const r of parse(inner).top) {
          for (const sel of r.selector.split(',')) {
            const key = sel.trim();
            const m = target.get(key) ?? new Map<string, string>();
            r.decls.forEach((v, k) => m.set(k, v));
            target.set(key, m);
          }
        }
      }
      i = j;
    } else {
      const close = css.indexOf('}', open);
      if (close < 0) break;
      top.push({ selector: head, decls: parseDecls(css.slice(open + 1, close)) });
      i = close + 1;
    }
  }
  return { top, tablet, mobile };
}

const px = (v: string) => (/^-?[\d.]+px$/.test(v) ? parseFloat(v) : v === '0' ? 0 : null);
const fmt = (n: number) => (n === 0 ? '0' : `${n}px`);

/** Expands a 1-4 value box shorthand to [top, right, bottom, left] numbers, or null if not plain px. */
function box(value: string): number[] | null {
  const parts = value.split(/\s+/).map(px);
  if (parts.some((p) => p === null) || parts.length < 1 || parts.length > 4) return null;
  const [t, r = t, b = t, l = r] = parts as number[];
  return [t, r, b, l];
}

function shrinkBox(prop: 'padding' | 'margin', value: string, bp: Breakpoint['key']): string | null {
  const v = box(value);
  if (!v) return null;
  const lim = LIMITS[bp];
  const [t, r, b, l] = v;
  const next =
    prop === 'padding'
      ? [Math.min(t, lim.padY), Math.min(r, lim.padX), Math.min(b, lim.padY), Math.min(l, lim.padX)]
      : [t, r > 0 ? Math.min(r, lim.marginX) : r, b, l > 0 ? Math.min(l, lim.marginX) : l];
  if (next.every((n, i) => n === v[i])) return null;
  return next.map(fmt).join(' ');
}

function shrinkSide(prop: string, value: string, bp: Breakpoint['key']): string | null {
  const n = px(value);
  if (n === null || n <= 0) return null;
  const lim = LIMITS[bp];
  const max = prop.startsWith('padding') ? lim.padX : lim.marginX;
  return n > max ? fmt(max) : null;
}

/** The declarations to override on one selector at one breakpoint. */
function overrides(base: Map<string, string>, existing: Map<string, string> | undefined, bp: Breakpoint['key']) {
  const out: string[] = [];
  base.forEach((value, prop) => {
    if (existing?.has(prop)) return; // Elementor already set a value for this screen size.
    let next: string | null = null;
    if (prop === 'padding' || prop === 'margin') next = shrinkBox(prop, value, bp);
    else if (/^(padding|margin)-(left|right)$/.test(prop) || /^--e-column-margin-(left|right)$/.test(prop))
      next = shrinkSide(prop.replace(/^--e-column-/, ''), value, bp);
    else if (prop === 'font-size') {
      const n = px(value);
      if (n !== null && n > 26) {
        const s = scaleFont(n, bp);
        if (s !== n) next = fmt(s);
      }
    }
    if (next !== null) out.push(`${prop}:${next}`);
  });
  return out;
}

export function addResponsiveCss(css: string): string {
  if (!css) return css;
  const { top, tablet, mobile } = parse(css);
  const blocks: Record<Breakpoint['key'], string[]> = { tablet: [], mobile: [] };

  for (const rule of top) {
    for (const raw of rule.selector.split(',')) {
      const sel = raw.trim();
      if (!sel) continue;
      // Tablet: start from the desktop values.
      const t = overrides(rule.decls, tablet.get(sel), 'tablet');
      if (t.length) blocks.tablet.push(`${sel}{${t.join(';')}}`);
      // Phone: start from Elementor's tablet values where it had them, else desktop.
      const merged = new Map(rule.decls);
      tablet.get(sel)?.forEach((v, k) => merged.set(k, v));
      const m = overrides(merged, mobile.get(sel), 'mobile');
      if (m.length) blocks.mobile.push(`${sel}{${m.join(';')}}`);
    }
  }

  let out = css;
  for (const bp of [TABLET, MOBILE]) {
    if (blocks[bp.key].length) out += `\n/* ${bp.key} sizes, generated by lib/responsive.ts */\n${bp.media}{${blocks[bp.key].join('')}}`;
  }
  return out;
}
