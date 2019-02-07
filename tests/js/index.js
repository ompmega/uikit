/* global UIkit */
import {on} from '../../src/js/util/event';
import {css} from '../../src/js/util/style';
import {ucfirst} from '../../src/js/util/lang';
import {prepend} from '../../src/js/util/dom';
import {addClass, removeClass} from '../../src/js/util/class';
import {fastdom} from '../../src/js/util/fastdom';

const storage = window.sessionStorage;
const key = '_uikit_style';
const keyinverse = '_uikit_inverse';
const docEl = document.documentElement;

// try to load themes.json
const request = new XMLHttpRequest();
request.open('GET', '../themes.json', false);
request.send(null);

const themes = request.status === 200 ? JSON.parse(request.responseText) : {};
const styles = {
    core: {css: '../dist/css/uikit-core.css'},
    theme: {css: '../dist/css/uikit.css'}
};
const component = location.pathname.split('/').pop().replace(/.html$/, '');

for (const theme in themes) {
    styles[theme] = themes[theme];
}

const variations = {
    '': 'Default',
    light: 'Dark',
    dark: 'Light'
};

if (getParam('style') && getParam('style').match(/\.(json|css)$/)) {
    styles.custom = getParam('style');
}

storage[key] = storage[key] || 'core';
storage[keyinverse] = storage[keyinverse] || '';

const dir = storage._uikit_dir || 'ltr';

// set dir
docEl.dir = dir;

const style = styles[storage[key]] || styles.theme;

// add style
document.writeln(`<link rel="stylesheet" href="${dir !== 'rtl' ? style.css : style.css.replace('.css', '').concat('-rtl.css')}">`);

// add javascript
document.writeln('<script src="../dist/js/uikit.js"></script>');
document.writeln(`<script src="${style.icons ? style.icons : '../dist/js/uikit-icons.js'}"></script>`);

on(window, 'load', () => setTimeout(() => fastdom.write(() => {

    const $body = document.body;
    const $container = prepend($body, `
        <div class="ui-container">
            <select class="ui-select ui-form-width-small" style="margin: 20px 20px 20px 0">
                <option value="index.html">Overview</option>
                ${[
                    'accordion',
                    'alert',
                    'align',
                    'animation',
                    'article',
                    'background',
                    'badge',
                    'base',
                    'breadcrumb',
                    'button',
                    'card',
                    'close',
                    'column',
                    'comment',
                    'container',
                    'countdown',
                    'cover',
                    'description-list',
                    'divider',
                    'dotnav',
                    'drop',
                    'dropdown',
                    'filter',
                    'flex',
                    'form',
                    'grid',
                    'grid-masonry',
                    'grid-parallax',
                    'heading',
                    'height',
                    'height-expand',
                    'height-viewport',
                    'icon',
                    'iconnav',
                    'image',
                    'label',
                    'leader',
                    'lightbox',
                    'link',
                    'list',
                    'margin',
                    'marker',
                    'modal',
                    'nav',
                    'navbar',
                    'notification',
                    'offcanvas',
                    'overlay',
                    'padding',
                    'pagination',
                    'parallax',
                    'position',
                    'placeholder',
                    'progress',
                    'scroll',
                    'scrollspy',
                    'search',
                    'section',
                    'slidenav',
                    'slider',
                    'slideshow',
                    'sortable',
                    'spinner',
                    'sticky',
                    'sticky-navbar',
                    'subnav',
                    'svg',
                    'switcher',
                    'tab',
                    'table',
                    'text',
                    'thumbnav',
                    'tile',
                    'toggle',
                    'tooltip',
                    'totop',
                    'transition',
                    'utility',
                    'upload',
                    'video',
                    'visibility',
                    'width'
                ].sort().map(name => `<option value="${name}.html">${name.split('-').map(ucfirst).join(' ')}</option>`).join('')}
            </select>
            <select class="ui-select ui-form-width-small" style="margin: 20px">
                ${Object.keys(styles).map(style => `<option value="${style}">${ucfirst(style)}</option>`).join('')}
            </select>
            <select class="ui-select ui-form-width-small" style="margin: 20px">
                ${Object.keys(variations).map(name => `<option value="${name}">${variations[name]}</option>`).join('')}        
            </select>
            <label style="margin: 20px">
                <input type="checkbox" class="ui-checkbox"/>
                <span style="margin: 5px">RTL</span>
            </label>
        </div>
    `);

    const [$tests, $styles, $inverse, $rtl] = $container.children;

    // Tests
    // ------------------------------

    on($tests, 'change', () => {
        if ($tests.value) {
            location.href = `${$tests.value}${styles.custom ? `?style=${getParam('style')}` : ''}`;
        }
    });
    $tests.value = `${component || 'index'}.html`;

    // Styles
    // ------------------------------

    on($styles, 'change', () => {
        storage[key] = $styles.value;
        location.reload();
    });
    $styles.value = storage[key];

    // Variations
    // ------------------------------

    $inverse.value = storage[keyinverse];

    if ($inverse.value) {

        removeClass(document.querySelectorAll('*'), [
            'ui-navbar-container',
            'ui-card-default',
            'ui-card-muted',
            'ui-card-primary',
            'ui-card-secondary',
            'ui-tile-default',
            'ui-tile-muted',
            'ui-tile-primary',
            'ui-tile-secondary',
            'ui-section-default',
            'ui-section-muted',
            'ui-section-primary',
            'ui-section-secondary',
            'ui-overlay-default',
            'ui-overlay-primary'
        ]);

        css(docEl, 'background', $inverse.value === 'dark' ? '#fff' : '#222');
        addClass($body, `ui-${$inverse.value}`);

    }

    on($inverse, 'change', () => {
        storage[keyinverse] = $inverse.value;
        location.reload();
    });

    // RTL
    // ------------------------------

    on($rtl, 'change', ({target}) => {
        storage._uikit_dir = target.checked ? 'rtl' : 'ltr';
        location.reload();
    });
    $rtl.firstElementChild.checked = dir === 'rtl';

    css(docEl, 'paddingTop', '');

}), 100));

css(docEl, 'paddingTop', '80px');

function getParam(name) {
    const match = new RegExp(`[?&]${name}=([^&]*)`).exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}
