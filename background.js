var get_selection = function() {
    var selection = document.getSelection();
    var text = selection.toString();
    var node = selection.anchorNode;
    var uri = node.baseURI;
    var parent = node.parentElement;
    var sibling = parent ? parent.children[0] : null;
    var nephew = sibling ? sibling.children[0] : null;
    var frag = (parent && parent.id)
        || (sibling && sibling.id)
        || (nephew && nephew.id)
        || (parent && parent.name)
        || (sibling && sibling.name)
        || (nephew && nephew.name);
    var whiteSpace = (parent && window.getComputedStyle(parent)['white-space']);
    var pre = (whiteSpace && whiteSpace.toLowerCase() == 'pre');
    var index;
    var ext;

    // Remove fragment from the url
    index = uri.lastIndexOf('#');
    uri = index >= 0 ? uri.substring(0, index) : uri;

    // Get extension from the url
    index = uri.lastIndexOf('.');
    ext = index >= 0 ? uri.substring(index + 1) : '';

    if (frag) {
        uri += '#' + frag;
    }

    return {
        text: text,
        uri: uri,
        pre: pre,
        ext: ext
    };
}

var copy_as_markdown_quot = function (args) {
    chrome.tabs.executeScript( {
          code: "(" + get_selection + ")();"
    }, function(selections) {
        var text = selections[0].text.trim();
        var uri = selections[0].uri;
        var pre = selections[0].pre;
        var ext = selections[0].ext;
        if (text) {
            lines = text.split('\n');
            result = '';
            if (pre) result += '> ```' + ext + '\n';
            for (var i = 0; i < lines.length; i++) {
                result += '> ' + lines[i] + '\n';
            }
            if (pre) result += '> ```\n'
            result += '>\n> -- ' + uri;
            copyTextToClipboard(result);
        }
    });
};

function copyTextToClipboard(text) {
    var copyFrom, body;

    copyFrom = document.createElement("textarea");
    copyFrom.textContent = text;
    body = document.getElementsByTagName('body')[0];
    body.appendChild(copyFrom);
    copyFrom.select();
    document.execCommand('copy');
    body.removeChild(copyFrom);
}

chrome.contextMenus.create({
    title: "Copy as Markdown quotation",
    contexts: ['selection'],
    onclick: copy_as_markdown_quot
});
