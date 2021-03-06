/*global Prism, jscolor, he*/
const syntaxReHighlighter = (function () {

    let srh = {};
    let env = {
        convertBtn: document.querySelector('#convert'),
        sourceContainer: document.querySelector('#source'),
        languagePicker: document.querySelector('#language'),
        codeContainer: document.querySelector('#codeContainer'),
        prismTokenContainer: document.querySelector('#prismTokens'),
        outputContainer: document.querySelector('#output'),
        mainStylesheet: document.querySelector('#mainStylesheet').sheet
    };

    let helpers = {
        colorToHex: function (c) {
            const hex = parseInt(c).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        },
        getSelectedLanguage: function (el) {
            return el.options[ el.selectedIndex ].value;
        },
        extractTokenFromClass: function (domEl) {
            return Array.from(domEl.classList).pop();
        }
    };

    srh.init = function () {
        srh.fancyHeader();
        srh.useProvidedColors(window.location.href);

        Object.keys(localStorage).map(srh.updateStylesheet);
    };


    env.convertBtn.addEventListener('click', function () {
        var language = helpers.getSelectedLanguage(env.languagePicker);
        env.codeContainer.className = 'language-' + language;
        var code = srh.convertSource(env.sourceContainer.value, language);
        var tokenList;
        var tokenHtml;

        env.codeContainer.innerHTML = code;

        Prism.highlightElement(env.codeContainer);
        env.outputContainer.classList.add('has-content');

        tokenList = Array.from(env.codeContainer.querySelectorAll('span.token'));
        tokenList = Array.from(new Set(tokenList.map(helpers.extractTokenFromClass)));
        tokenHtml = tokenList.map(srh.tokensToHtml).join('');

        srh.displayPrismTokens(env.prismTokenContainer, tokenHtml);
        srh.fixButtonColors();
        srh.addHoverableTokens(tokenList);
        srh.addListeners();
    });

    srh.addHoverableTokens = function (tokens) {
        tokens.forEach(function (token) {
            srh.addToStylesheet(`.hovered-${token} .token.${token} { box-shadow: 0 0 0 2px red; }`);
        });
    };

    srh.addListeners = function () {
        var tokenSpans = Array.from(document.querySelectorAll('.prismToken'));
        tokenSpans.forEach(function (span) {
            let token = helpers.extractTokenFromClass(span);
            span.addEventListener('mouseenter', function () {
                env.codeContainer.classList.add(`hovered-${token}`);
            });
            span.addEventListener('mouseleave', function () {
                env.codeContainer.classList.remove(`hovered-${token}`);
            });
            span.addEventListener('change', function () {
                let input = this.querySelector('input');
                srh.updateTokenColor(input.jscolor, input);
            });
        });
    };

    srh.fixButtonColors = function () {
        var tokenSpans = Array.from(document.querySelectorAll('.prismToken'));
        tokenSpans.forEach(function (span) {
            var color = window.getComputedStyle(span).getPropertyValue('color');
            color = '#' + color.match(/\d+/g).map(helpers.colorToHex).join('');
            span.querySelector('input').value = color;
        });

        jscolor.installByClassName('jscolor');
    };

    srh.displayPrismTokens = function (el, html) {
        el.textContent = '';
        el.insertAdjacentHTML('afterbegin', `${html}`);
    };

    srh.tokensToHtml = function (token) {
        if (Array.isArray(token)) {
            return token.map(srh.createToken).join('');
        }

        return srh.createToken(token);
    };

    srh.createToken = function (token) {
        return `<span class="prismToken token ${token}">${token} <input class="jscolor" data-token=${token}></span>`;
    };

    srh.convertSource = function (source, language) {
        if (language === 'markup') {
            source = he.encode(source);
        }

        return source;
    };

    srh.updateStylesheet = function (token) {
        var color = localStorage[token];

        srh.addTokenColorToStylesheet(token, color);
    };

    srh.addToStylesheet = function (cssDeclaration) {
        env.mainStylesheet.insertRule(cssDeclaration, env.mainStylesheet.cssRules.length);
    };

    srh.addTokenColorToStylesheet = function (token, color) {
        srh.addToStylesheet(`.token.${token} { color: #${color} }`);
    };

    srh.useProvidedColors = function (url) {
        url = new URL(url);

        if (url.search.length === 0) {
            return;
        }

        url.search
            .slice(1)
            .split('&')
            .forEach(tokenColorPair => {
                let [token, color] = tokenColorPair.split('=');
                srh.addTokenColorToStylesheet(token, color);
            });
    };

    srh.fancyHeader = function () {
        let el = document.querySelector('h1 span');
        el.innerHTML = el.textContent
            .split('')
            .map((l, idx) => `<span class="letter-${idx}">${l}</span>`)
            .join('');
    };

    srh.updateTokenColor = function (colorObj, inputEl) {
        var token = inputEl.dataset.token;

        srh.addTokenColorToStylesheet(token, colorObj);
        localStorage[token] = colorObj;

        srh.updateUrlWith(window.location.href, token, colorObj);
    };

    srh.updateUrlWith = function (url, token, color) {
        url = new URL(url);

        if (! url.href.includes(token)) {
            url.searchParams.append(token, color);
        } else {
            let tokenList = url.search.slice(1).split('&');
            let tokenLocation = tokenList.findIndex(pair => pair.includes(token));
            tokenList.splice(tokenLocation, 1, `${token}=${color}`);
            url.search = `?${tokenList.join('&')}`;
        }

        history.pushState(null, '', url);
    };

    return srh;
})();

syntaxReHighlighter.init();
