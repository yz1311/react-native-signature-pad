var content = (penColor, backgroundColor, dataURL, penMinWidth, penMaxWidth, useFont, name, height, width, initTimeout) => `

var showSignaturePad = function (signaturePadCanvas, bodyWidth, bodyHeight) {
  var width = bodyWidth;
  var height = bodyHeight;

  var sizeSignaturePad = function () {
    var devicePixelRatio = window.devicePixelRatio || 1;
    var canvasWidth = width * devicePixelRatio;
    var canvasHeight = height * devicePixelRatio;
    signaturePadCanvas.width = canvasWidth;
    signaturePadCanvas.height = canvasHeight;
    signaturePadCanvas.getContext("2d").scale(devicePixelRatio, devicePixelRatio);
  };

  var enableSignaturePadFunctionality = function () {
    var signaturePad = new SignaturePad(signaturePadCanvas, {
      penColor: "${penColor || "black"}",
      backgroundColor: "${backgroundColor || "white"}",
      onEnd: function() { finishedStroke(signaturePad.toDataURL()); }
    });
    signaturePad.minWidth = ${penMinWidth || 1};
    signaturePad.maxWidth = ${penMaxWidth || 4};
    if ("${dataURL}") {
      signaturePad.fromDataURL("${dataURL}");
    }
    document.addEventListener('message', function (event) {
      var data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        return;
      }

      if (!data) return;

      var action = data['action'];
      if (!action) return;

      if (action === 'clear') {
        signaturePad && signaturePad.clear();

        return;
      }
    });
  };

  reportSize(width, height);
  sizeSignaturePad();
  enableSignaturePadFunctionality();
};

var canvasElement = document.querySelector("canvas");

var reportSize = function(width, height) {
  if (postMessage.length === 1) {
    window.postMessage(JSON.stringify({ width: width, height: height }));
  } else { 
    setTimeout(function() { reportSize(width, height) }, 100);
  }
}

var finishedStroke = function(base64DataUrl) {
  window.postMessage(JSON.stringify({ base64DataUrl: base64DataUrl }));
};

var getBodyWidth = function() {
  var bodyWidth = document && document.body && document.body.clientWidth ? document.body.clientWidth * 2 : 0;
  if(!bodyWidth) {
    bodyWidth = window && window.innerWidth ? window.innerWidth : ${width || 0};
  }

  return bodyWidth;
};

var getBodyHeight = function() {
  var bodyHeight = document && document.body && document.body.clientHeight ? document.body.clientHeight * 2 : 0;
  if(!bodyHeight) {
    bodyHeight = window && window.innerHeight ? window.innerHeight : ${height || 0};
  }

  return bodyHeight;
};

var initSignaturePad = function(bodyWidth, bodyHeight) {
  if (${useFont}) {
    var context = canvasElement.getContext("2d");
    var devicePixelRatio = 1; /* window.devicePixelRatio || 1; */
    canvasElement.width = bodyWidth * devicePixelRatio;
    canvasElement.height = bodyHeight * devicePixelRatio;

    var w = bodyWidth;
    var h = bodyHeight;
    canvasElement.width = canvasElement.offsetWidth * 2;
    canvasElement.height = canvasElement.offsetHeight * 2;

    var fontToHeightRatio = 45 / 159;
    var fontSize = canvasElement.height * fontToHeightRatio;
    var textHeight = 18;
    var textWidth = -1;
    do {
      context.font = fontSize + "px SignatureFont, cursive";
      textWidth = context.measureText("${name}").width;
      fontSize = 7 * fontSize / 8;
    } while (textWidth + (w * 0.05) > w);

    var textPosition = {
      x: ((w - textWidth) / 2),
      y: ((3 * h / 4) - textHeight)
    };

    context.fillStyle = "${penColor}";
    context.fillText("${name}", textPosition.x, textPosition.y);

    /* Fire a finishedStroke function to update the state */
    setTimeout(function () {
      finishedStroke(canvasElement.toDataURL());
    }, 75);
  } else {
      showSignaturePad(canvasElement, bodyWidth / 2, bodyHeight / 2);
  }
};

var whileDocumentSizeNotSet = function(timeout, maximumWaitTime) {
  try {
    if ( typeof whileDocumentSizeNotSet.counter == 'undefined' ) {
      whileDocumentSizeNotSet.counter = 0;
      whileDocumentSizeNotSet.bodyHeight = 0;
      whileDocumentSizeNotSet.bodyWidth = 0;
    } else {
      whileDocumentSizeNotSet.counter++;
    }


    const maxAttemts = Math.floor(maximumWaitTime / timeout);
    const attempt = whileDocumentSizeNotSet.counter;

    const previousBodyHeight = whileDocumentSizeNotSet.bodyHeight;
    const previousBodyWidth = whileDocumentSizeNotSet.bodyWidth;
    
    const bodyHeight = getBodyHeight();
    const bodyWidth = getBodyWidth();

    whileDocumentSizeNotSet.bodyHeight = bodyHeight;
    whileDocumentSizeNotSet.bodyWidth = bodyWidth;
    
    if (bodyHeight === 0 || bodyWidth === 0 || previousBodyWidth !== bodyWidth || previousBodyHeight !== bodyHeight) {
      if (attempt <= maxAttemts) {
       setTimeout(whileDocumentSizeNotSet, timeout, timeout, maximumWaitTime);
       
       return false;
      } else {
        window.alert('Timed out trying to load SignaturePad, tried ' + attempt + ' times in ' + maximumWaitTime + 'ms.');
        // of maximumWaitTime:' + maximumWaitTime + ', timeout:' + timeout + ', maxAttemts' + maxAttemts + ' times');

        initSignaturePad(700, 700);
      }
    } else {
      initSignaturePad(bodyWidth, bodyHeight);

      // window.alert('Had to wait ' + attempt + ' times, width: ' + bodyWidth + ', height: ' + bodyHeight);
    }
  } catch (e) {
    if (window) {
      window.alert(e.message);
    }
  }

  return true;
};

whileDocumentSizeNotSet(250, ${initTimeout || 3000});

`;

export default content;
