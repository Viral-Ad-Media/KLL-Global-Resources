"""Convert the WP Rocket page cache from the KLL WordPress backup into content for the Next.js app.

Usage: python3 -I convert.py <backup-root> <next-app-dir>
"""
import os, posixpath, re, sys, glob, json, html, shutil
from bs4 import BeautifulSoup

EX, APP = sys.argv[1], sys.argv[2]
CACHE = EX + '/wp-content/cache/wp-rocket/kllglobalresources.com'
MIN = EX + '/wp-content/cache/min/1/'
SKIP = {'1-1-jpg', 'image333-png', 'law-image15-7-free-img', 'tai-lopez', 'bird-dog-bot', '1000-pip-builder'}
ORIGIN_RE = re.compile(r'https?://(?:www\.)?kllglobalresources\.com')

# Menu link that pointed at a page that never existed in the backup.
LINK_FIXES = {'/services/digital-and-software/maintenance-optimisation/': '/services/consulting/maintenance-optimisation/'}


def local(u):
    u = ORIGIN_RE.sub('', u)
    u = re.sub(r'(/wp-(?:content|includes)/[^?#\s"\')]+)\?[^\s"\')]*', r'\1', u)  # drop ?ver= cache busters
    return LINK_FIXES.get(u, u)


# ---------- CSS rule splitting ----------
def split_rules(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, depth, start, i, n = [], 0, 0, 0, len(css)
    q = None
    while i < n:
        c = css[i]
        if q:
            if c == '\\': i += 1
            elif c == q: q = None
        elif c in '"\'': q = c
        elif c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                out.append(css[start:i + 1].strip()); start = i + 1
        elif c == ';' and depth == 0:  # @import / @charset
            out.append(css[start:i + 1].strip()); start = i + 1
        i += 1
    tail = css[start:].strip()
    if tail: out.append(tail)
    return [r for r in out if r and not r.startswith('@charset') and not r.startswith('@import')]


def fix_css_urls(css):
    def rep(m):
        u = m.group(2)
        if u.startswith('data:'): return m.group(0)
        if not u.startswith(('http', '/')):
            u = posixpath.normpath(posixpath.join('/wp-content/cache/min/1/', u.split('?')[0].split('#')[0]))
        return 'url(' + m.group(1) + local(u) + m.group(1) + ')'
    return re.sub(r'url\(\s*([\'"]?)([^\'")]+)\1\s*\)', rep, css)


# ---------- pages ----------
pages = []
for f in sorted(glob.glob(CACHE + '/**/index-https.html', recursive=True)):
    rel = os.path.relpath(os.path.dirname(f), CACHE)
    rel = '' if rel == '.' else rel
    if rel.split('/')[0] in SKIP: continue
    pages.append((rel, f))

global_rules, seen = [], set()
order, order_set = [], set()
inline_global = []
page_out = []
assets = set()

for idx, (rel, f) in enumerate(pages):
    raw = open(f, encoding='utf-8').read()
    soup = BeautifulSoup(raw, 'lxml')
    title = html.unescape(soup.title.get_text()) if soup.title else 'KLL Global Resources, LLC'
    md = soup.find('meta', attrs={'name': 'description'})
    desc = md['content'] if md and md.get('content') else ''
    body_cls = soup.body.get('class', [])
    pid = next((c.split('-')[-1] for c in body_cls if re.fullmatch(r'page-id-\d+', c)), None)

    # CSS bundle -> rules; page rules are those scoped to this page's Elementor id
    bundle = re.findall(r'cache/min/1/([a-f0-9]+\.css)', raw)[0]
    rules = split_rules(fix_css_urls(open(MIN + bundle, encoding='utf-8').read()))
    own = re.compile(r'\.elementor-%s\b' % pid) if pid else None
    # Global rules keep their original cascade order. A rule that legitimately appears more than
    # once in a bundle (e.g. a reset repeated by two plugins) is kept each time: the key is
    # (text, nth occurrence), so only repeats across pages are dropped.
    page_rules, prev, occ = [], None, {}
    for r in rules:
        if own and own.search(r):
            page_rules.append(r); continue
        if 'mega-menu' in r or 'hfe-nav-menu' in r:  # replaced by the React header
            continue
        occ[r] = occ.get(r, 0) + 1
        k = (r, occ[r])
        if k not in seen:
            seen.add(k)
            pos = order.index(prev) + 1 if prev in order_set else len(order)
            order.insert(pos, k); order_set.add(k)
        prev = k
    if rel == '':
        def menu(ul):
            items = []
            for li in ul.find_all('li', recursive=False):
                a = li.find('a', recursive=False)
                kids = []
                for sub in li.find_all('ul', recursive=False): kids += menu(sub)
                if a is None:
                    if 'mega-menu-column' in li.get('class', []): items.append({'column': True, 'children': kids})
                    else: items += kids
                else:
                    href = local(a.get('href', '#'))
                    items.append({'label': a.get_text(strip=True), 'href': href, 'children': kids})
            return items
        json.dump(menu(soup.select_one('#mega-menu-primary')), open(APP + '/content/nav.json', 'w'), indent=1, ensure_ascii=False)
    if idx == 0 or rel == '':
        inline_global = []
        for st in soup.find_all('style'):
            sid = st.get('id', '')
            if sid in ('rocket-lazyload-nojs-css', 'wp-emoji-styles-inline-css'): continue
            if 'Mega Menu CSS' in (st.string or ''): continue
            inline_global.append(fix_css_urls(st.string or ''))

    # ---------- content ----------
    content = soup.select_one('#content') or soup.select_one('.elementor[data-elementor-type="wp-page"]')
    for t in content.find_all(['script', 'noscript', 'style', 'link']): t.decompose()
    for t in content.find_all(True):
        for a in ('data-lazy-src', 'data-lazy-srcset', 'data-lazy-sizes'):
            if t.has_attr(a):
                t[a.replace('data-lazy-', '')] = t[a]; del t[a]
        if t.has_attr('data-bg'):
            bg = t['data-bg']; del t['data-bg']
            t['style'] = (t.get('style', '') + ';background-image:url(%s)' % bg.strip('url()\'"')).lstrip(';')
        cls = t.get('class')
        if cls:
            cls = [c for c in cls if c not in ('elementor-invisible', 'rocket-lazyload', 'lazyloaded')]
            if cls: t['class'] = cls
            else: del t['class']
        for a in list(t.attrs):
            if a.startswith('data-rocket') or a == 'data-ll-status': del t[a]
        if t.name == 'img':
            t['loading'] = 'lazy'; t['decoding'] = 'async'
        # Elementor video widget is rendered by JS; bake in the embed.
        if t.has_attr('data-widget_type') and t['data-widget_type'] == 'video.default':
            try:
                s = json.loads(t.get('data-settings', '{}'))
                yt = s.get('youtube_url') or ''
                m = re.search(r'(?:v=|youtu\.be/|embed/)([\w-]{11})', yt)
                holder = t.select_one('.elementor-video')
                if m and holder:
                    holder.clear()
                    ifr = soup.new_tag('iframe', src='https://www.youtube-nocookie.com/embed/' + m.group(1),
                                       allow='accelerometer; encrypted-media; gyroscope; picture-in-picture',
                                       allowfullscreen='', loading='lazy', title='Video', frameborder='0')
                    ifr['class'] = 'elementor-video'
                    holder.replace_with(ifr)
            except Exception as e:
                print('video parse failed', rel, e)
    h = str(content)
    h = re.sub(r'(href|src|srcset|style|data-[\w-]+)=("[^"]*"|\'[^\']*\')', lambda m: m.group(1) + '=' + local(m.group(2)), h)
    h = ORIGIN_RE.sub('', h)
    h = re.sub(r'<img\s+src="data:image/svg\+xml[^"]*"\s+', '<img ', h)  # leftover placeholders
    key = rel.replace('/', '__') or 'home'
    os.makedirs(APP + '/content/html', exist_ok=True)
    open(APP + '/content/html/%s.html' % key, 'w', encoding='utf-8').write(h)
    if page_rules:
        os.makedirs(APP + '/content/css', exist_ok=True)
        open(APP + '/content/css/%s.css' % key, 'w', encoding='utf-8').write('\n'.join(page_rules))
    page_out.append({'path': rel, 'key': key, 'title': title, 'description': desc,
                     'css': bool(page_rules), 'elementorId': pid})
    for u in re.findall(r'(/wp-(?:content|includes)/[^"\'\s)]+)', h + '\n'.join(page_rules)): assets.add(u)

global_rules = [k[0] for k in order]
gcss = '\n'.join(global_rules) + '\n' + '\n'.join(inline_global)
os.makedirs(APP + '/public/css', exist_ok=True)
open(APP + '/public/css/wordpress.css', 'w', encoding='utf-8').write(gcss)
for u in re.findall(r'(/wp-(?:content|includes)/[^"\'\s)]+)', gcss): assets.add(u)
json.dump(page_out, open(APP + '/content/pages.json', 'w'), indent=1, ensure_ascii=False)

# ---------- assets ----------
copied = missing = 0
for u in sorted(assets):
    u = u.split('#')[0].split('?')[0].rstrip(',')
    src = EX + u
    if os.path.isfile(src):
        dst = APP + '/public' + u
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst); copied += 1
    else:
        missing += 1; print('missing asset', u)
# logo
for u in ['/wp-content/uploads/2020/04/cropped-KLL-Logo_Artboard-2-1.png', '/wp-content/uploads/2020/04/KLL-Logo_Artboard-2.png']:
    dst = APP + '/public' + u; os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy2(EX + u, dst)
print('pages', len(page_out), 'global rules', len(global_rules), 'global css KB', len(gcss) // 1024, 'assets', copied, 'missing', missing)
