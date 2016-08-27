/*global Prism*/
(function () {

    var convertBtn = document.querySelector('#convert');
    var sourceContainer = document.querySelector('#source');
    var languagePicker = document.querySelector('#language');
    var codeContainer = document.querySelector('#codeContainer');
    var prismTokenContainer = document.querySelector('#prismTokens');
    var outputContainer = document.querySelector('#output');
    var language;

    convertBtn.addEventListener('click', function () {
        language = getLanguage( languagePicker );
        codeContainer.className = 'language-' + language;
        var code = convertSource(sourceContainer.value, language);
        var tokenList;
        var tokenHtml;

        codeContainer.innerHTML = code;

        Prism.highlightElement(codeContainer);
        outputContainer.classList.add('has-content');

        tokenList = Array.from(codeContainer.querySelectorAll('span.token'));
        tokenList = Array.from(new Set(tokenList.map(extractToken)));
        tokenHtml = tokenList.map(tokensToHtml).join('');

        displayPrismTokens(prismTokenContainer, tokenHtml);
        fixButtonColors();
        addHoverableTokens(tokenList);
        addListeners();
    });

    function extractToken(domEl) {
        return Array.from(domEl.classList).pop();
    }

    function addHoverableTokens(tokens) {
        var sheet = document.querySelector('#mainStylesheet').sheet;
        tokens.forEach(function(token) {
            sheet.insertRule(`.hovered-${token} .token.${token} { box-shadow: 0 0 0 2px red; }`, sheet.cssRules.length);
        })
    }

    function addListeners() {
        var tokenSpans = Array.from(document.querySelectorAll('.prismToken'));
        tokenSpans.forEach(function(span) {
            let token = extractToken(span);
            span.addEventListener('mouseenter', function() {
                codeContainer.classList.add(`hovered-${token}`);
            });
            span.addEventListener('mouseleave', function() {
                codeContainer.classList.remove(`hovered-${token}`);
            });
        });
    }

    function fixButtonColors() {
        var tokenSpans = Array.from(document.querySelectorAll('.prismToken'));
        tokenSpans.forEach(function(span) {
            var color = window.getComputedStyle(span).getPropertyValue('color');
            color = '#' + color.match(/\d+/g).map(componentToHex).join('');
            span.querySelector('input').value = color;
        });

        jscolor.installByClassName('jscolor');
    }

    function componentToHex(c) {
        const hex = parseInt(c).toString(16)
        return hex.length === 1 ? '0' + hex : hex
    }

    function displayPrismTokens(el, html) {
        el.textContent = '';
        el.insertAdjacentHTML('afterbegin', `${html}`);
    }

    function tokensToHtml(token) {
        if (Array.isArray(token)) {
            return token.map(item => `<span class="prismToken token ${item}">${item} <input class="jscolor" onchange="updateTokenColor(this.jscolor, this)" data-token=${item}></span>`).join('');
        }

        return `<span class="prismToken token ${token}">${token} <input class="jscolor" onchange="updateTokenColor(this.jscolor, this)" data-token=${token}></span>`;
    }

    function getLanguage( el ) {
        return el.options[ el.selectedIndex ].value;
    }

    function convertSource(source, language) {
        if (language === 'markup') {
            source = he.encode( source );
        }

        return source;
    }

    function updateStylesheet(token) {
        var sheet = document.querySelector('#mainStylesheet').sheet;
        var color = localStorage[token];

        sheet.insertRule(`.token.${token} { color: #${color} }`, sheet.cssRules.length);
    }

    function useProvidedColors(url) {
        url = new URL(url);

        if (url.search.length === 0 ) {
            return;
        }

        url.search
            .slice(1)
            .split('&')
            .forEach(tokenColorPair => {
            let sheet = document.querySelector('#mainStylesheet').sheet;
            let [token, color] = tokenColorPair.split('=');

            sheet.insertRule(`.token.${token} { color: #${color} }`, sheet.cssRules.length);
        })
    }

    function fancyHeader() {
        let el = document.querySelector('h1 span');
        el.innerHTML = el.textContent
            .split('')
            .map((l, idx) => `<span class="letter-${idx}">${l}</span>`)
            .join('');
    }

    fancyHeader();
    useProvidedColors(window.location.href);

    Object.keys(localStorage).map(updateStylesheet);
})();

function updateUrlWith(url, token, color) {
    url = new URL(url);

    if (! url.href.includes(token)) {
        url.searchParams.append(token, color);
    } else {
        let tokenList = url.search.slice(1).split('&');
        let tokenLocation = tokenList.findIndex(pair => pair.includes(token));
        tokenList.splice(tokenLocation, 1, `${token}=${color}`);
        url.search = `?${tokenList.join('&')}`;
    }

    history.pushState(null, '', url)
}

function updateTokenColor(colorObj, inputEl) {
    var token = inputEl.dataset.token;
    var sheet = document.querySelector('#mainStylesheet').sheet;

    sheet.insertRule(`.token.${token} { color: #${colorObj} }`, sheet.cssRules.length);
    localStorage[token] = colorObj;

    updateUrlWith(window.location.href, token, colorObj);
}
