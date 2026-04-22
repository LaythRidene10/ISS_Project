import glob, re

pages = glob.glob('src/pages/*.vue')
modified = []
for path in pages:
    text = open(path, 'r', encoding='utf-8').read()
    orig = text
    text = re.sub(r'<v-app-bar\b[^>]*>[\s\S]*?<\/v-app-bar>\s*', '', text)
    text = re.sub(r'<v-navigation-drawer\b[^>]*>[\s\S]*?<\/v-navigation-drawer>\s*', '', text)
    text = re.sub(r'const navItems = \[[\s\S]*?\];?\n?', '', text)
    if 'useAppStore' in text and 'store' not in text:
        text = re.sub(r"import \{ useAppStore \} from '@\/stores\/app'\s*\n", '', text)
    if 'const store' in text and 'store' not in text:
        text = re.sub(r'const store\s*=.*\n', '', text)
    if 'const drawer' in text and 'drawer' not in text:
        text = re.sub(r'const drawer\s*=.*\n', '', text)
    if text != orig:
        open(path, 'w', encoding='utf-8').write(text)
        modified.append(path)
print('modified:', modified)
