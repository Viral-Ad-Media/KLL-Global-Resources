#!/usr/bin/env python3
"""
Turn the page bodies imported from WordPress (content/html/*.html, Elementor markup)
into structured page files (content/pages/*.json) that the React block components render.

This was a one-off migration step; it is kept so the conversion can be re-run or audited.
Usage: python3 scripts/html-to-blocks.py <html-dir> <css-dir> <out-dir>

Needs: beautifulsoup4, lxml.
"""
import json
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

STD_SECTION = {'elementor-section', 'elementor-top-section', 'elementor-inner-section', 'elementor-element'}


def inner_html(el: Tag) -> str:
    return el.decode_contents().strip(' \t\r\n')


def kids(el: Tag):
    return [c for c in el.children if isinstance(c, Tag)]


def has_bg(el: Tag) -> bool:
    return el.get('data-settings') == '{"background_background":"classic"}'


def extra_classes(el: Tag, wtype: str):
    out = []
    for c in el['class']:
        if c in ('elementor-element', 'elementor-widget') or c.startswith('elementor-element-'):
            continue
        if c == f'elementor-widget-{wtype}':
            continue
        out.append(c)
    return out


def img_attrs(img: Tag) -> dict:
    a = dict(img.attrs)
    if isinstance(a.get('class'), list):
        a['class'] = ' '.join(a['class'])
    return a


def convert_widget(w: Tag) -> dict:
    wtype = w['data-widget_type'].split('.')[0]
    box = w.find('div', class_='elementor-widget-container', recursive=False)
    node = {'type': wtype, 'id': w['data-id']}
    cls = extra_classes(w, wtype)
    if cls:
        node['classes'] = cls

    if wtype == 'heading':
        h = kids(box)[0]
        node['tag'] = h.name
        size = [c for c in h['class'] if c.startswith('elementor-size-')][0].replace('elementor-size-', '')
        if size != 'default':
            node['size'] = size
        node['text'] = inner_html(h)
    elif wtype == 'text-editor':
        node['type'] = 'text'
        node['html'] = inner_html(box)
    elif wtype == 'spacer':
        pass
    elif wtype == 'html':
        node['html'] = inner_html(box)
    elif wtype == 'button':
        a = box.find('a')
        node['text'] = a.find(class_='elementor-button-text').get_text()
        node['href'] = a.get('href', '#')
        node['size'] = [c for c in a['class'] if c.startswith('elementor-size-')][0].replace('elementor-size-', '')
    elif wtype == 'image':
        node['image'] = img_attrs(box.find('img'))
    elif wtype == 'image-box':
        node['type'] = 'image-box'
        img = box.find('img')
        if img:
            node['image'] = img_attrs(img)
        t = box.find(class_='elementor-image-box-title')
        node['titleTag'] = t.name
        node['title'] = inner_html(t)
        d = box.find(class_='elementor-image-box-description')
        node['description'] = inner_html(d) if d else None
    elif wtype == 'icon-box':
        node['icon'] = ' '.join(box.find('i')['class'])
        t = box.find(class_='elementor-icon-box-title')
        node['titleTag'] = t.name
        node['title'] = t.get_text().strip()
        node['description'] = box.find(class_='elementor-icon-box-description').get_text().strip()
    elif wtype == 'icon-list':
        node['items'] = [
            {'icon': ' '.join(li.find('i')['class']), 'text': inner_html(li.find(class_='elementor-icon-list-text'))}
            for li in box.select('li.elementor-icon-list-item')
        ]
    elif wtype == 'tabs':
        titles = box.select('.elementor-tab-desktop-title')
        contents = box.select('.elementor-tab-content')
        node['tabIdBase'] = titles[0]['id'].replace('elementor-tab-title-', '')[:-1]
        node['tabs'] = [{'title': t.get_text(), 'html': inner_html(c)} for t, c in zip(titles, contents)]
    else:
        raise ValueError(f'unknown widget {wtype}')
    return node


def convert_column(col: Tag) -> dict:
    size = [c for c in col['class'] if c.startswith('elementor-col-')][0].replace('elementor-col-', '')
    node = {'type': 'column', 'id': col['data-id'], 'size': size}
    if has_bg(col):
        node['background'] = True
    wrap = col.find('div', class_='elementor-widget-wrap', recursive=False)
    elements = []
    for c in kids(wrap):
        if 'elementor-background-overlay' in c.get('class', []):
            node['overlay'] = True
        elif c.name == 'section':
            elements.append(convert_section(c))
        else:
            elements.append(convert_widget(c))
    node['elements'] = elements
    return node


def convert_section(sec: Tag) -> dict:
    cls = [c for c in sec['class'] if c not in STD_SECTION and not c.startswith('elementor-element-')]
    node = {'type': 'section', 'id': sec['data-id']}
    if 'elementor-inner-section' in sec['class']:
        node['inner'] = True
    if 'elementor-section-content-middle' in cls:
        node['contentMiddle'] = True
    if 'elementor-section-height-min-height' in cls:
        node['minHeight'] = True
    assert 'elementor-section-boxed' in cls, cls
    if has_bg(sec):
        node['background'] = True
    container = None
    for c in kids(sec):
        if 'elementor-background-overlay' in c['class']:
            node['overlay'] = True
        else:
            container = c
    gap = [c for c in container['class'] if c.startswith('elementor-column-gap-')][0].replace('elementor-column-gap-', '')
    if gap != 'default':
        node['gap'] = gap
    node['columns'] = [convert_column(c) for c in kids(container)]
    return node


HERO_BG = re.compile(
    r'(\.elementor-(\d+) \.elementor-element\.elementor-element-(\w+):not\(\.elementor-motion-effects-element-type-background\),'
    r'[^{]*\{)background-image:url\(([^)]*)\);?'
)


def hero_text(card: dict):
    """eyebrow text + h2 title + optional intro text, with no custom classes."""
    if card.get('overlay'):
        return None
    ws = card['elements']
    types = [w['type'] for w in ws]
    if types not in (['text', 'heading'], ['text', 'heading', 'text']) or any('classes' in w for w in ws):
        return None
    if ws[1]['tag'] != 'h2' or 'size' in ws[1]:
        return None
    return ws


def as_hero(node: dict, css: str):
    """The banner that opens most pages: a photo with a white card holding eyebrow, title and intro.

    Layouts found on the site: 'split' (card in the left half of a photo), 'boxed' (card centred in a
    full-width photo row, followed by a spacer) and 'plain' (the same text with no photo).
    """
    if node.get('inner') or node.get('contentMiddle') or node.get('minHeight') or node.get('gap'):
        return None, css
    cols = node['columns']
    ids = {}
    photo = node.get('background') and node.get('overlay')
    if photo and len(cols) == 2 and [c['size'] for c in cols] == ['50', '50'] and not cols[1]['elements'] \
            and cols[0].get('background') and not cols[1].get('background') and not cols[1].get('overlay'):
        layout = 'split'
        ws = hero_text(cols[0])
        ids.update(card=cols[0]['id'], side=cols[1]['id'])
    elif photo and len(cols) == 1 and cols[0]['size'] == '100' and not cols[0].get('background') and not cols[0].get('overlay') \
            and [e['type'] for e in cols[0]['elements']] == ['section', 'spacer'] and 'classes' not in cols[0]['elements'][1]:
        layout = 'boxed'
        inner = cols[0]['elements'][0]
        icols = inner['columns']
        if inner.get('overlay') or not inner.get('background') or inner.get('contentMiddle') or inner.get('minHeight') \
                or inner.get('gap') or len(icols) != 1 or icols[0]['size'] != '100' or icols[0].get('background'):
            return None, css
        ws = hero_text(icols[0])
        ids.update(column=cols[0]['id'], inner=inner['id'], card=icols[0]['id'], spacer=cols[0]['elements'][1]['id'])
    elif len(cols) == 1 and cols[0]['size'] == '100' and not node.get('background') and not node.get('overlay') \
            and not cols[0].get('background') and len(cols[0]['elements']) == 3:
        layout = 'plain'
        ws = hero_text(cols[0])
        ids.update(card=cols[0]['id'])
    else:
        return None, css
    if not ws:
        return None, css
    ids.update(eyebrow=ws[0]['id'], title=ws[1]['id'])
    hero = {'type': 'hero', 'layout': layout, 'id': node['id'], 'ids': ids,
            'eyebrow': ws[0]['html'], 'title': ws[1]['text']}
    if len(ws) == 3:
        ids['intro'] = ws[2]['id']
        hero['intro'] = ws[2]['html']
    m = [m for m in HERO_BG.finditer(css) if m.group(3) == node['id']]
    if m:
        hero['image'] = m[0].group(4)
        css = css.replace(m[0].group(0), m[0].group(1))
    return hero, css


def convert_page(html: str, css: str):
    soup = BeautifulSoup(html, 'lxml')
    root = soup.select_one('div.elementor')
    article = soup.find('article')
    page = {'elementorId': root['data-elementor-id']}
    if article is None:
        page['template'] = 'full-width'
    else:
        assert article['id'] == f"post-{root['data-elementor-id']}"
    blocks = []
    for i, sec in enumerate(kids(root)):
        node = convert_section(sec)
        if i == 0:
            hero, css = as_hero(node, css)
            node = hero or node
        blocks.append(node)
    page['blocks'] = blocks
    return page, css


def main():
    html_dir, css_dir, out_dir = map(Path, sys.argv[1:4])
    out_dir.mkdir(parents=True, exist_ok=True)
    for f in sorted(html_dir.glob('*.html')):
        css_file = css_dir / f'{f.stem}.css'
        css = css_file.read_text() if css_file.exists() else ''
        page, css = convert_page(f.read_text(), css)
        (out_dir / f'{f.stem}.json').write_text(json.dumps(page, indent=1, ensure_ascii=False) + '\n')
        if css_file.exists():
            css_file.write_text(css)


if __name__ == '__main__':
    main()
