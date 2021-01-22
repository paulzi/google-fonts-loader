# Google Fonts Loader

Load fonts to document from google fonts service.

This library only provides the ability to programmatically load fonts. If you need a component for choosing a font from a dropdown, you will need a custom select library.

[DEMO](https://paulzi.github.io/google-fonts-loader/index.html)

## Usage

Import required functions from library:

```javascript
import {load} from 'google-fonts-loader';

load({'Roboto': ['400', '400i', '700', '700i']});
```

Or include `dist/google-fonts-loader.js` and use `window.GoogleFontsLoader` object:

```javascript
GoogleFontsLoader.load({'Roboto': ['400', '400i', '700', '700i']});
```

## List formats

For some functions (`makeUrl`, `load`, ...) you can pass list of font styles in array or object formats:

Array format:

```javascript
import {load} from 'google-fonts-loader';

load([
    {family: 'Roboto', wght: 400},
    {family: 'Roboto', wght: 400, ital: 1},
]);
```

Object format:

```javascript
import {load} from 'google-fonts-loader';

load({'Roboto': ['400', '400i']});
```

## Import and tree-shaking

If you want your bundle to include only the functions you use, you must import of separate functions:

```javascript
import {preloadByFamilyNames, loadAndAwait} from 'google-fonts-loader';
// your code... Use preloadByFamilyNames() and loadAndAwait()
```

If you don't need it, you can import the object with all functions:

```javascript
import GoogleFontsLoader from 'google-fonts-loader';
// your code... Use GoogleFontsLoader.preloadByFamilyNames() and GoogleFontsLoader.loadAndAwait()
```

## Documentation

Exports:

- `settings {Object}` global settings of library.
    - `axisDefaults: {wght: 400, ital: 0} {Object}` default values for font axis.

- `makeUrl(list[, query = {}])` - create URL for import font using [CSS API v2](https://developers.google.com/fonts/docs/css2);
    - `list {Object[]|Object}` - [array or object](#List-formats) of font styles for load;
    - `query: {} {Object}` - additional url query params, such [display=swap](https://developers.google.com/fonts/docs/css2#use_font-display);
    - `@returns {URL}`

- `load(list[, query = {}])` - load fonts in document (this function only include css with fonts, woff files will be loading only on using this font on page; if you need load with font files, use `loadAndAwait()`)
    - `list {Object[]|Object}` - [array or object](#List-formats) of font styles for load;
    - `query: {} {Object}` - additional url query params, such [display=swap](https://developers.google.com/fonts/docs/css2#use_font-display);
    - `@returns {?HTMLLinkElement}` - added link element or null if no loading is required.

- `loadAndAwait(list[, query = {}, glyphs])` - load fonts in document and await all fonts loaded.
    - `list {Object[]|Object}` - [array or object](#List-formats) of font styles for load;
    - `query: {} {Object}` - additional url query params, such [display=swap](https://developers.google.com/fonts/docs/css2#use_font-display);
    - `glyphs: undefined {String}` - specified string for loading glyphs in fonts. Google fonts include all subsets of font on page, browser loads only used on the page subsets (https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet/load);
    - `@returns {Promise}` - promise will be fulfilled once all fonts are loaded.

- `loadFamilies(apiKey)` - load family list from Google Fonts API.
    - `apiKey {String}` - your [API key](https://developers.google.com/fonts/docs/developer_api#APIKey).
    - `@returns {Promise<Map>}` - return promise of Map `family name => family data`.

- `compactText(text)` - removes duplicate characters in string (useful for `&text=` parameter).
    - `text {String}`

- `preloadByText(text, list[, query = {}])` - preload fonts in document with limited glyphs specified in the text.
    - `text {String}` - text identifying the required glyphs;
    - `list {Object[]|Object}` - [array or object](#List-formats) of font styles for load;
    - `query: {} {Object}` - additional url query params, such [display=swap](https://developers.google.com/fonts/docs/css2#use_font-display);

- `preloadByFamilyNames(list[, query = {}, callback])` - preload fonts with glyphs specified in family name (useful for font family picker).
    - `list {Object[]|Object}` - [array or object](#List-formats) of font styles for load;
    - `query: {} {Object}` - additional url query params, such [display=swap](https://developers.google.com/fonts/docs/css2#use_font-display);
    - `callback: undefined {Function(family, styles)}` - callback for transform text from family name (useful for add additional text, i. e. `Italic`);
        - `family {String}` - family name;
        - `styles {Object[]}` - array of font styles.

- `extractStylesFromFamilies(families[, onlyMain])` - extract font styles from font families.
    - `families {Map|Array}` - Array or Map of font families (i. e. result of loadFamilies());
    - `onlyMain {Boolean}` - extract only main style (see getMainStyle());
    - `@returns {Object[]}` - font styles.

- `getMainStyle(styles)` - returns the closest style to 400 wght non italic.
    - `styles: {Object[]}` - array of font styles;
    - `@returns {Object}` - font style.

- `styleToCSS(style)` - return string of CSS font style.
    - `style {Object}` - font style;
    - `@returns {String}` - CSS style of font.

- `default {Object}` - Obect varians of functions above.
    - `makeUrl()`
    - `load()`
    - `loadAndAwait()`
    - `loadFamilies()`
    - `compactText()`
    - `preloadByText()`
    - `preloadByFamilyNames()`
    - `extractStylesFromFamilies()`
    - `getMainStyle()`
    - `styleToCSS()`

## Browser support

- Chrome 54+
- Firefox 47+
- Edge 79+
- Safari 10.1+
- Opera 41+
- iOS Safari 10.3+
- Android Chrome 54+
- Android Browser 5.0+

IE, Edge 18 - not support (RIP)!