/*global Prism*/
(function () {

    var convertBtn = document.querySelector('#convert');
    var sourceContainer = document.querySelector('#source');
    var languagePicker = document.querySelector('#language');
    var codeContainer = document.querySelector('#codeContainer');
    var language;
    var tokenHtml;

    convertBtn.addEventListener('click', function () {
        language = getLanguage( languagePicker );
        codeContainer.className = 'language-' + language;
        var code = convertSource(sourceContainer.value, language);

        codeContainer.innerHTML = code; convertSource(sourceContainer.value, language);

        Prism.highlightElement(codeContainer);

        tokenHtml = Object.keys(Prism.languages[language])
            .map(token => `<span class="prismToken">${token}</span>`)
            .join('');

        codeContainer.parentElement.insertAdjacentHTML('afterend', `<p>${tokenHtml}</p>`);
    });

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
