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
    });

    function extractToken(domEl) {
        return Array.from(domEl.classList).pop();
    }

    function fixButtonColors() {
        var tokenSpans = document.querySelectorAll('.prismToken')
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
})();

function updateTokenColor(colorObj, inputEl) {
    var token = inputEl.dataset.token;
    var sheet = document.querySelector('#mainStylesheet').sheet;

    sheet.insertRule(`.token.${token} { color: #${colorObj} }`, sheet.cssRules.length);
}
