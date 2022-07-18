;(function(window) {
    const digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_';
    const binArray = ['000000','000001','000010','000011','000100','000101','000110','000111',
                      '001000','001001','001010','001011','001100','001101','001110','001111',
                      '010000','010001','010010','010011','010100','010101','010110','010111',
                      '011000','011001','011010','011011','011100','011101','011110','011111',
                      '100000','100001','100010','100011','100100','100101','100110','100111',
                      '101000','101001','101010','101011','101100','101101','101110','101111',
                      '110000','110001','110010','110011','110100','110101','110110','110111',
                      '111000','111001','111010','111011','111100','111101','111110','111111'];

    const oW = 84;
    const oH = 111;

    const offset = 8;

    const borderOffset = 4;

    var module = {
        imageDownload : (imgDiv, callback) => {
            
            var resultArray = [];
            var tempSrc = "";
            var col = imgDiv.children[0].offsetTop;
            var colCheck = false;
            var total = imgDiv.children.length;

            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");
        
            for(var i = 0; i < total; i++) {
                var style = window.getComputedStyle ? getComputedStyle(imgDiv.children[i], null) : imgDiv.children[i].currentStyle;
                
                if(col !== imgDiv.children[i].offsetTop && !colCheck) {
                    col = i;
                    colCheck = true;
                }
    
                if(tempSrc !== style.backgroundImage) {
                    tempSrc = style.backgroundImage;
        
                    var result = {i: style.backgroundImage, children:[{i:i, x:style.backgroundPositionX, y:style.backgroundPositionY, s:style.backgroundSize, c:imgDiv.children[i].children[0].classList.value}]};
                    resultArray.push(result);
                } else {
                    resultArray[(resultArray.length - 1)].children.push({i:i, x:style.backgroundPositionX, y:style.backgroundPositionY, s:style.backgroundSize, c:imgDiv.children[i].children[0].classList.value});
                }
            }
    
            var proArray = [];

            if(col < 12) col = 12;
            var row = Math.floor(total / col) + 1;

            canvas.width = oW * col + (col - 1) * offset + borderOffset;
            canvas.height = oH * row + (row - 1) * offset + borderOffset;
    
            for(var i = 0; i < resultArray.length; i++) {
                proArray.push(imgLoad(ctx, resultArray[i],i,col));
            }
    
            Promise.all(proArray).then(function() {
                callback(canvas);
            });
        },

        decode : (code) => {
            if(code) {
                var decodedCode = '';
                for(var i = 0; i < code.length; i++) {
                    decodedCode += binArray[digits.indexOf(code[i])];
                }
                return decodedCode;
            }
            return code;
        },

        encode : (code) => {
            var encodedCode = '';
            for(var i = 0; i < (parseInt(code.length/6)); i++) {
                encodedCode += digits.charAt(parseInt(code.substr(i*6,6),2));
            }
            return encodedCode;
        }

    }

    function imgLoad(ctx, result, i, col) {
        return new Promise(function(resolve, reject) {
            let img = new Image();
            let imgSrc = result.i.replace(/^url\(['"](.+)['"]\)/, '$1');

            img.src = imgSrc;
            img.i = i;
            img.onload = function() {
                var w = img.width;
                var h = img.height;

                for(var j = 0; j < result.children.length; j++) {
                    var pluxArray = result.children[j].s.split(' ');
                    var pluxX = w / Number(pluxArray[0].replace('px',''));
                    var pluxY = h / Number(pluxArray[1].replace('px',''));

                    var posX = Number(result.children[j].x.replace('-','').replace('px',''));
                    var posY = Number(result.children[j].y.replace('-','').replace('px',''));
                    
                    let indexX = result.children[j].i % col;
                    let indexY = Math.floor(result.children[j].i / col);

                    var x = (borderOffset/2) + (indexX * oW + (indexX * offset));
                    var y = (borderOffset/2) + (indexY * oH + (indexY * offset));

                    ctx.drawImage(img,pluxX * posX,pluxY * posY, oW * pluxX, oH * pluxY,x,y,oW,oH);
                    ctx.strokeRect(x,y,oW,oH);

                    if(result.children[j].c == "selected") {
                        ctx.fillStyle="rgb(0,0,0,0.7)";
                        ctx.fillRect(x,y,oW,oH);
                    }
                }

                resolve();
            }
        });
    }
    window.PokedocUtil = module;
}(window));
