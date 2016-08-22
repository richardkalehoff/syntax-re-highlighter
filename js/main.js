/*global Prism*/
(function () {

    var convertBtn = document.querySelector('#convert');
    var sourceContainer = document.querySelector('#source');
    var languagePicker = document.querySelector('#language');
    var codeContainer = document.querySelector('#codeContainer');
    var prismTokenContainer = document.querySelector('#prismTokens');
    var language;

    convertBtn.addEventListener('click', function () {
        language = getLanguage( languagePicker );
        codeContainer.className = 'language-' + language;
        var code = convertSource(sourceContainer.value, language);
        var tokenList;
        var tokenHtml;

        codeContainer.innerHTML = code;

        Prism.highlightElement(codeContainer);

        tokenList = getInnerTokens(Prism.languages[language]);
        tokenList = Array.from(new Set(tokenList));
        tokenHtml = tokenList.map(tokensToHtml).join('');

        displayPrismTokens(prismTokenContainer, tokenHtml);
        fixButtonColors();
    });

    function getInnerTokens(obj) {
        var tokens = [];

        for (var index in obj) {
            if (obj.hasOwnProperty(index)) {
                if (obj[index]['inside'] === undefined) {
                    tokens.push(index);
                } else {
                    tokens.push(index);
                    let innerTokenList = getInnerTokens(obj[index]['inside']);
                    tokens = tokens.concat(innerTokenList);
                }
            }
        }

        return tokens;
    }

    function fixButtonColors() {
        var tokenSpans = document.querySelectorAll('.prismToken')
        tokenSpans.forEach(function(span) {
            var color = window.getComputedStyle(span).getPropertyValue('color');
            color = convertToHex(color);
            span.querySelector('input').value = color;
        });

        jscolor.installByClassName('jscolor');
    }

    function convertToHex(color) {
        var rgb = color.match(/\d+/g);
        var r = parseInt(rgb[0]).toString(16);
        var g = parseInt(rgb[1]).toString(16);
        var b = parseInt(rgb[2]).toString(16);
        return '#' + r + g + b;
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
