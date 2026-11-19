/** Design System: todo CSS fica nos .css. Sem style="", <style>, cssText nem setAttribute('style') no HTML e nos scripts do app. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SRC = path.join(__dirname, '..', 'src');
const read = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');
// O WebAdmin é protótipo e vive fora de src/ (que é a pasta publicada); continua valendo a regra do CSS.
const PROTO = path.join(__dirname, '..', 'prototipos', 'admin');
const readProto = (f) => fs.readFileSync(path.join(PROTO, f), 'utf8');

for (const [page, load] of [['index.html', () => read('index.html')], ['dashboard.html', () => read('dashboard.html')], ['prototipos/admin/admin.html', () => readProto('admin.html')]]) {
  test(`${page}: sem style="" e sem bloco <style>`, () => {
    const html = load();
    assert.doesNotMatch(html, /\sstyle\s*=/i);
    assert.doesNotMatch(html, /<style[\s>]/i);
  });
}

// Scripts do app (o kit stk-pkt-* e a pasta apoio/ são dos pacotes)
for (const [f, load] of [['Program.js', () => read('Program.js')], ['app.js', () => read('app.js')], ['dashboard.js', () => read('dashboard.js')], ['tax-engine.js', () => read('tax-engine.js')],
  ['prototipos/admin/admin.js', () => readProto('admin.js')], ['prototipos/admin/infrastructure/AdminAdapter.js', () => readProto('infrastructure/AdminAdapter.js')]]) {
  test(`${f}: estilo só por classe`, () => {
    const src = load(f);
    assert.doesNotMatch(src, /\sstyle\s*=\s*["'\\]/, 'atributo style="" em string HTML');
    assert.doesNotMatch(src, /\.style\.cssText/);
    assert.doesNotMatch(src, /setAttribute\(\s*['"]style['"]/);
    assert.doesNotMatch(src, /\.style\.(?!setProperty|removeProperty)[a-zA-Z]+\s*=/, 'use classes ou .style.setProperty("--x", v)');
  });
}

test('Program.js e app.js continuam idênticos', () => {
  assert.equal(read('Program.js'), read('app.js'));
});
