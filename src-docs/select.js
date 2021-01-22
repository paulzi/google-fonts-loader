function createElement(tag, classes, appendTo) {
    let element = document.createElement(tag);
    if (classes) {
        element.className = classes;
    }
    if (appendTo) {
        appendTo.appendChild(element);
    }
    return element;
}

export function setOptions(select, options) {
    let list = select.querySelector('.select__panel .nav__list');
    list.innerHTML = '';
    let first;
    options.forEach(item => {
        let li  = createElement('li', 'nav__item', list);
        let btn = createElement('span', 'nav__link', li);
        li.setAttribute('data-value', item.value);
        btn.setAttribute('tabindex', '0');
        btn.textContent = item.name;
        if (item.style) {
            btn.setAttribute('style', item.style);
        }
        first = first || li;
    });
    first && selectOption(first);
}

export function selectOption(option) {
    let select = option.closest('.select');
    let ctrl = select.querySelector('.ctrl__input');
    ctrl.innerHTML = option.innerHTML;
    let link = ctrl.querySelector('.nav__link');
    link.classList.remove('nav__link');
    link.classList.add('input');
    let input = select.querySelector('.select__input');
    input.value = option.getAttribute('data-value');
    let event = document.createEvent('Event');
    event.initEvent('change', true, false);
    input.dispatchEvent(event);
}

function onClick(e) {
    let target = e.target;
    if (target instanceof Element) {
        let element = target.closest('.select__panel .nav__link');
        if (element) {
            element.blur();
            selectOption(element.parentNode);
        }
    }
}

function onFocus(e) {
    let target = e.target;
    if (target instanceof Element) {
        let element = target.closest('.select');
        element && element.classList.add('_focus');
    }
}

function onBlur(e) {
    let target = e.target;
    if (target instanceof Element) {
        let element = target.closest('.select');
        if (element && (!e.relatedTarget || e.relatedTarget.closest('.select') !== element)) {
            element.classList.remove('_focus');
        }
    }
}

document.addEventListener('click', onClick);
document.addEventListener('focus', onFocus, true);
document.addEventListener('blur',  onBlur,  true);