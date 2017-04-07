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
    canvasElement.width = bodyWidth * devicePixelRatio;
    canvasElement.height = bodyHeight * devicePixelRatio;

    var oldWidth = canvasElement.offsetWidth;
    var oldHeight = canvasElement.offsetHeight;
    var w = bodyWidth;
    var h = bodyHeight;
    canvasElement.width = oldWidth;
    canvasElement.height = oldHeight;

    var ratio = (bodyWidth/bodyHeight);
    var fontSize = 45 * ratio;
    var textHeight = 12 * ratio;
    var textWidth = -1;
    do {
      context.font = fontSize + "px SignatureFont";
      textWidth = context.measureText("${name}").width;
      fontSize = 7 * fontSize / 8;
    } while (textWidth > w);

    var textPosition = {
      x: ((w - textWidth) / 2),
      y: ((3 * h / 4) - textHeight)
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
