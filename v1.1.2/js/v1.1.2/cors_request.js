// Create the XHR object.
// var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        // XHR for Chrome/Firefox/Opera/Safari.
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        // XDomainRequest for IE.
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        // CORS not supported.
        xhr = null;
    }
    return xhr;
}

// Make the actual CORS request.
export function makeCorsRequest(url, on_load_function = null, cache_type = null) {
    // This is a sample server that supports CORS.

    var xhr = createCORSRequest('GET', url);
    if (!xhr) {
        console.log('CORS not supported');
        return;
    }

    // Response handlers.
    xhr.onload = function () {
        var text = xhr.responseText;
        // var title = getTitle(text);
        var data = JSON.parse(text);
        // console.log('Response from CORS request to ' + url);
        // console.log('Recieved: ' + text);
        if (on_load_function != null) {
            on_load_function(data, cache_type);
        }
    };

    xhr.onerror = function () {
        console.log('Woops, there was an error making the request.');
    };
    xhr.send();
}

// makeCorsRequest('https://api.imagineville.org/word/predict?left=');
