// shorthands for minify
const doc     = document;
const obj     = Object;
const assign  = obj.assign;
const keys    = obj.keys;
const entries = obj.entries;

// settings
export const settings = {
    axisDefaults: {
        wght: 400,
        ital: 0,
    },
};

// variables
let loaded = {};

/**
 * Make URL for Google Fonts CSS API
 * @param {Object[]|Object} list Array or object format of font style list
 * @param {Object} [query] Additional query params
 * @returns {URL}
 */
export function makeUrl(list, query = {}) {
    let url = new URL('https://fonts.googleapis.com/css2');
    let families = {};
    normalizeList(list).forEach(item => {
        let family = families[item.family] = families[item.family] || {axis: ['wght'], styles: []};
        keys(item).forEach(key => {
            if (key !== 'family' && family.axis.indexOf(key) === -1) {
                family.axis.push(key);
            }
        });
        family.styles.push(item);
    });
    entries(families).forEach(([name, family]) => {
        let axis = family.axis.sort();
        let styles = [];
        family.styles.forEach(item => {
            let style = [];
            axis.forEach(key => {
                if (key !== 'family') {
                    style.push(item[key] !== undefined ? item[key] : (settings.axisDefaults[key] || 0));
                }
            });
            styles.push(style.join(','));
        });
        url.searchParams.append('family', `${name}:${axis.join(',')}@${styles.sort().join(';')}`);
    });
    entries(query).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });
    return url;
}

/**
 * Load google fonts to document
 * @param {Object[]|Object} list Array or object format of font style list
 * @param {Object} [query] Additional query params
 * @returns {?HTMLLinkElement} Added to head <link> element or null if no loading is required
 */
export function load(list, query = {}) {
    list = normalizeList(list).filter(item => {
        let key = convertStyleToString(item);
        let pass = !loaded[key];
        if (!query.text) {
            loaded[key] = true;
        }
        return pass;
    });
    if (list.length === 0) {
        return null;
    }
    let url = makeUrl(list, query);
    let link = doc.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', url.toString());
    doc.head.appendChild(link);
    return link;
}

/**
 * Load and await google fonts to document
 * @param {Object[]|Object} list Array or object format of font style list
 * @param {Object} [query] Additional query params
 * @param {String} [glyphs] Load this glyphs in fonts
 * @returns {Promise} Promise will be fulfilled once all fonts are loaded
 */
export function loadAndAwait(list, query = {}, glyphs) {
    list = normalizeList(list);
    return new Promise((resolve, reject) => {
        let link = load(list, query);
        if (link) {
            link.onerror = e => reject(e);
            link.onload = () => {
                let promises = [];
                list.forEach(item => {
                    let font = [
                        item.ital ? 'italic'  : null,
                        item.wght ? item.wght : null,
                        item.wdth ? item.wdth : null,
                        '1em',
                        "'" + item.family + "'",
                    ].filter(part => part !== null).join(' ');
                    promises.push(doc.fonts.load(font, glyphs));
                });
                Promise.all(promises)
                    .then(() => resolve(link))
                    .catch(err => reject(err));
            };
        } else {
            resolve(null);
        }
    });
}

/**
 * Load Google Fonts available fonts family list
 * @param {String} apiKey API key
 * @returns {Promise} Return promise of Map family name => data
 */
export function loadFamilies(apiKey) {
    return fetch('https://www.googleapis.com/webfonts/v1/webfonts?sort=popularity&key=' + encodeURIComponent(apiKey))
        .then(response => response.json())
        .then(data => {
            let map = new Map();
            data.items.forEach((item, idx) => {
                item.styles = [];
                item.popularity = idx;
                item.variants.forEach(variant => {
                    item.styles.push({
                        family: item.family,
                        wght:   variant.indexOf('regular') !== -1 ? 400 : parseInt(variant) || 400,
                        ital:   variant.indexOf('italic') !== -1 ? 1 : 0,
                    });
                });
                map.set(item.family, item);
            });
            return new Map([...map.entries()].sort((a, b) => a[0] > b[0] ? 1 : -1));
        });
}

/**
 * Removes duplicate characters in string (useful for `&text=` parameter)
 * @param {String} text
 * @returns {String}
 */
export function compactText(text) {
    return text.split('').filter((item, i, self) => self.indexOf(item) === i).join('');
}

/**
 * Preload fonts with limited glyphs specified in the text
 * @param {String} text text identifying the required glyphs
 * @param {Object[]|Object} list Array or object format of font style list
 * @param {Object} [query] Additional query params
 */
export function preloadByText(text, list, query = {}) {
    text = compactText(text);
    load(list, assign({}, query, {text}));
}

/**
 * Preload fonts with glyphs specified in family name (useful for font family picker)
 * @param {Object[]|Object} list Array or object format of font style list
 * @param {Object} [query] Additional query params
 * @param {Object} [callback] Callback for transform text from family name (useful for add additional text, i. e. `Italic`)
 */
export function preloadByFamilyNames(list, query = {}, callback) {
    let families = {};
    normalizeList(list).forEach(style => {
        let family = families[style.family] = families[style.family] || [];
        family.push(style);
    });
    entries(families).forEach(([family, styles]) => {
        let text = callback ? callback(family, styles) : family;
        text = compactText(text);
        load(styles, assign({}, query, {text}));
    });
}

/**
 * Extract font styles from font families
 * @param {Map|Array} families Array or Map of font families (i. e. result of loadFamilies())
 * @param {Boolean} [onlyMain] Extract only main style (see getMainStyle())
 * @returns {Object[]}
 */
export function extractStylesFromFamilies(families, onlyMain) {
    let styles = [];
    families.forEach(data => {
        if (onlyMain) {
            styles.push(getMainStyle(data.styles));
        } else {
            data.styles.forEach(style => {
                styles.push(style);
            });
        }
    });
    return styles;
}

/**
 * Returns the closest style to 400 wght non italic
 * @param {Object[]} styles
 * @returns {Object}
 */
export function getMainStyle(styles) {
    let sort = styles.slice().sort((a, b) => {
        if (a.ital > b.ital) {
            return 1;
        }
        let da = Math.abs(400 - (a.wght || 400));
        let db = Math.abs(400 - (b.wght || 400));
        if (da !== db) {
            return da - db;
        }
        return a - b;
    });
    return sort[0];
}

/**
 * Convert font style to CSS style
 * @param {Object} style
 * @returns {String}
 */
export function styleToCSS(style) {
    let result = {};
    result['font-family'] = "'" + style.family + "'";
    result['font-weight'] = style.wght || 400;
    result['font-style']  = style.ital ? 'italic' : 'normal';
    return entries(result).map(kv => kv.join(':')).join(';');
}

export default {
    makeUrl,
    load,
    loadAndAwait,
    loadFamilies,
    compactText,
    preloadByText,
    preloadByFamilyNames,
    extractStylesFromFamilies,
    getMainStyle,
    styleToCSS,
}

/**
 * Convert font style to string
 * @param {Object} style
 * @returns {String}
 */
function convertStyleToString(style) {
    let key = [style.family];
    keys(settings.axisDefaults).sort().forEach(axis => {
        key.push(`${axis}:${style[axis]}`)
    });
    return key.join(';');
}

/**
 * Normalize font style list
 * @param {Object[]|Object} list Array or object format of font style list
 */
function normalizeList(list) {
    if (Array.isArray(list)) {
        return list;
    }
    let result = [];
    entries(list).forEach(([family, styles]) => {
        styles.forEach(style => {
            result.push({
                family,
                wght: parseInt(style),
                ital: style.slice(-1) === 'i' ? 1 : 0,
            });
        });
    });
    return result;
}