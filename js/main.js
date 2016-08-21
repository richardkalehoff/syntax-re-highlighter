/*global Prism*/
(function () {

    var convertBtn = document.querySelector('#convert');
    var sourceContainer = document.querySelector('#source');
    var languagePicker = document.querySelector('#language');
    var codeContainer = document.querySelector('#codeContainer');
    var prismTokenContainer = document.querySelector('#prismTokens');
    var language;
    var tokenHtml;

    convertBtn.addEventListener('click', function () {
        language = getLanguage( languagePicker );
        codeContainer.className = 'language-' + language;
        var code = convertSource(sourceContainer.value, language);

        codeContainer.innerHTML = code;

        Prism.highlightElement(codeContainer);

        tokenHtml = Object.keys(Prism.languages[language])
            .map(extractInnerTokens)
            .map(tokensToHtml)
            .join('');

        displayPrismTokens(prismTokenContainer, tokenHtml);
    });

    function displayPrismTokens(el, html) {
        el.textContent = '';
        el.insertAdjacentHTML('afterbegin', `${html}`);
    }

    function extractInnerTokens(token) {
        if (Prism.languages[language][token]['inside'] === undefined) {
            return token;
        }
        var innerTokens = Object.keys(Prism.languages[language][token]['inside']);
        return innerTokens
    }

    function tokensToHtml(token) {
        if (Array.isArray(token)) {
            return token.map(item => `<span class="prismToken token ${item}">${item} <button class="jscolor"></button></span>`).join('');
        }

        return `<span class="prismToken token ${token}">${token} <button class="jscolor"></button></span>`;
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
