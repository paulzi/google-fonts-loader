import GoogleFontsLoader from '../src/GoogleFontsLoader';
import {setOptions} from './select';

let families;

const styleMap = {
    '100':  'Thin',
    '100i': 'Thin Italic',
    '200':  'ExtraLight',
    '200i': 'ExtraLight Italic',
    '300':  'Light',
    '300i': 'Light Italic',
    '400':  'Regular',
    '400i': 'Regular Italic',
    '500':  'Medium',
    '500i': 'Medium Italic',
    '600':  'SemiBold',
    '600i': 'SemiBold Italic',
    '700':  'Bold',
    '700i': 'Bold Italic',
    '800':  'ExtraBold',
    '800i': 'ExtraBold Italic',
    '900':  'Black',
    '900i': 'Black Italic',
};

GoogleFontsLoader.loadFamilies('AIzaSyARQXIjJQWsiLhig8beiRQwTUDe85WQZvY')
    .then(data => {
        families = data;
        let options = [];
        data.forEach(item => {
            let style = GoogleFontsLoader.getMainStyle(item.styles);
            options.push({
                name:  item.family,
                value: item.family,
                style: GoogleFontsLoader.styleToCSS(style),
            });
        });
        setOptions(document.querySelector('#family'), options);
        GoogleFontsLoader.preloadByFamilyNames(GoogleFontsLoader.extractStylesFromFamilies(data, true));
    });

document.addEventListener('change', onChange);

function onChange(e) {
    let target = e.target;
    let element = target.closest('#family');
    if (element) {
        let family = families.get(target.value);
        let options = [];
        GoogleFontsLoader.preloadByText('ThinLightRegularMediumBoldBlackExtraSemiItalic', family.styles);
        family.styles.forEach(style => {
            let key = (style.wght || 400) + (style.ital ? 'i' : '');
            options.push({
                name: styleMap[key] || key,
                value: JSON.stringify(style),
                style: GoogleFontsLoader.styleToCSS(style),
            });
        });
        setOptions(document.querySelector('#variation'), options);
    }
    element = target.closest('#variation');
    if (element) {
        let style = JSON.parse(target.value);
        GoogleFontsLoader.loadAndAwait([style])
            .then(() => {
                let btn = element.querySelector('.ctrl__input .input');
                document.querySelector('#text').setAttribute('style', btn.getAttribute('style'));
            });
    }
}