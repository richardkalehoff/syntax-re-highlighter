/*global Prism*/
(function () {

    var convertBtn = document.querySelector('#convert');
    var sourceContainer = document.querySelector('#source');
    var languagePicker = document.querySelector('#language');
    var codeContainer = document.querySelector('#codeContainer');
    var language;

    convertBtn.addEventListener('click', function () {
        language = languagePicker.options[ languagePicker.selectedIndex ].value;
        codeContainer.className = 'language-' + language;
        var code = convertSource(sourceContainer.value, language);

        codeContainer.innerHTML = code; convertSource(sourceContainer.value, language);

        Prism.highlightElement(codeContainer);
    });

    function convertSource(source, language) {
        if (language === 'markup') {
            source = he.encode( source );
        }

        return source;
    }
})();
