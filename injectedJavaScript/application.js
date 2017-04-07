var content = (penColor, backgroundColor, dataURL, penMinWidth, penMaxWidth, useFont, name) => `

  var showSignaturePad = function (signaturePadCanvas, bodyWidth, bodyHeight) {
    /*We're rotating by 90% -> Flip X and Y*/
    /*var width = bodyHeight;
    var height = bodyWidth;*/

    var width = bodyWidth;
    var height = bodyHeight;

    var sizeSignaturePad = function () {
      var devicePixelRatio = 1; /*window.devicePixelRatio || 1;*/
      var canvasWidth = width * devicePixelRatio;
      var canvasHeight = height * devicePixelRatio;
      signaturePadCanvas.width = canvasWidth;
      signaturePadCanvas.height = canvasHeight;
      signaturePadCanvas.getContext("2d").scale(devicePixelRatio, devicePixelRatio);
    };

    var finishedStroke = function(base64DataUrl) {
       executeNativeFunction("finishedStroke", {base64DataUrl: base64DataUrl});
    };

    var enableSignaturePadFunctionality = function () {
      var signaturePad = new SignaturePad(signaturePadCanvas, {
        penColor: "${penColor || "black"}",
        backgroundColor: "${backgroundColor || "white"}",
        onEnd: function() { finishedStroke(signaturePad.toDataURL()); }
      });
      /* signaturePad.translateMouseCoordinates = function (point) {
        var translatedY = point.x;
        var translatedX = width - point.y;
        point.x = translatedX;
        point.y = translatedY;
      }; */
      signaturePad.minWidth = ${penMinWidth || 1};
      signaturePad.maxWidth = ${penMaxWidth || 4};
      if ("${dataURL}") {
        signaturePad.fromDataURL("${dataURL}");
      }
    };

    sizeSignaturePad();
    enableSignaturePadFunctionality();
  };

  var bodyWidth = document.body.clientWidth;
  var bodyHeight = document.body.clientHeight;
  if(!bodyWidth) {
    bodyWidth = window.innerWidth;
  }
  if(!bodyHeight) {
    bodyHeight = window.innerHeight;
  }

  var canvasElement = document.querySelector("canvas");

  if (${useFont}) {
    var context = canvasElement.getContext("2d");
    var devicePixelRatio = 1; /* window.devicePixelRatio || 1; */
    context.canvas.width = bodyWidth * devicePixelRatio;
    context.canvas.height = bodyHeight * devicePixelRatio;

    var ratio = Math.max(window.devicePixelRatio || 1, 1);
    var backingStoreRatio = context.webkitBackingStorePixelRatio ||
			context.mozBackingStorePixelRatio ||
			context.msBackingStorePixelRatio ||
			context.oBackingStorePixelRatio ||
			context.backingStorePixelRatio || 1;
    var realRatio = ratio / backingStoreRatio;
    if (ratio !== backingStoreRatio) {
      ratio = ratio / backingStoreRatio;
    }

    var oldWidth = context.canvas.width;
    var oldHeight = context.canvas.height;

    var fontSize = 45;
    var textHeight = 12;
    if (realRatio === 2) {
      fontSize = 90;
      textHeight = 18;
    }

    var textWidth = -1;

    do {
      context.font = fontSize + "px SignatureFont";
      textWidth = context.measureText("${name}").width * ratio;
      fontSize = 7 * fontSize / 8;
    } while (textWidth > oldWidth);

    var textPosition = {
      x: ((oldWidth - textWidth) / 2),
      y: ((3 * oldHeight / 4) - textHeight)
    };

    context.fillStyle = "${penColor}";
    context.fillText("${name}", textPosition.x, textPosition.y);

    /* Fire a finishedStroke function to update the state */
    executeNativeFunction("finishedStroke", {base64DataUrl: canvasElement.toDataURL()});
  } else {
    showSignaturePad(canvasElement, bodyWidth, bodyHeight);
  }
`;

export default content;
