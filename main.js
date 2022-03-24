var _image;
window.onload = () => {
    document.querySelector('input[type="file"]').onchange = async (e) => {
        const canvas = await new Promise((resolve, _) => {
            const canvas = document.createElement("canvas");
            const src = _image ? _image.src : null;
            _image = new Image();
            _image.onload = () => {
                let width = document.querySelector('input[type="number"]').value;
                let height = width * _image.height / _image.width;
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.mozImageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.msImageSmoothingEnabled = false;
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(_image, 0, 0, canvas.width, canvas.height);
                resolve(canvas);
            }
            if(e.target.files.length !== 0) {
                _image.src = URL.createObjectURL(e.target.files[0]);
            } else if (src) {
                _image.src = src;
            }
        });
        const width = canvas.width;
        const height = canvas.height;
        const image = canvas.getContext("2d").getImageData(0, 0, width, height).data;
        const crop = (x) => (x < 0 ? 0 : (x > 255 ? 255 : x));
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (x + y * width) * 4;
                const oldpixel = [image[index], image[index + 1], image[index + 2]];
                const newpixel = oldpixel.map((i) => i > 127 ? 255 : 0);
                image[index + 0] = newpixel[0];
                image[index + 1] = newpixel[1];
                image[index + 2] = newpixel[2];
                const quant_error = [oldpixel[0] - newpixel[0], oldpixel[1] - newpixel[1], oldpixel[2] - newpixel[2]];
                for (let i = 0; i < 3; i++) {
                    if (x + 1 < width)                   image[index + 4             + i] = crop(image[index + 4             + i] + 7 * quant_error[i] / 16);
                    if (x - 1 >= 0 && y + 1 < height)    image[index - 4 + 4 * width + i] = crop(image[index - 4 + 4 * width + i] + 3 * quant_error[i] / 16);
                    if (y + 1 < height)                  image[index     + 4 * width + i] = crop(image[index     + 4 * width + i] + 5 * quant_error[i] / 16);
                    if (x + 1 < width && y + 1 < height) image[index + 4 + 4 * width + i] = crop(image[index + 4 + 4 * width + i] + 1 * quant_error[i] / 16);
                }
            }
        }
        let black_and_white = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (x + y * width) * 4;
                black_and_white.push(0.3 * image[index] + 0.586 * image[index + 1] + 0.114 * image[index + 2] < 127 ? 1 : 0);
            }
        }
        let output = "";
        for (let y = 0; y < height / 3; y++) {
            for (let x = 0; x < width / 2; x++) {
                output += String.fromCharCode(0x2800 + ([0,1,2].map((i) => [0,1].map((j) => black_and_white[width * (i + 3 * y) + 2 * x + j] << (3 * j + i)).reduce((a, b) => a + b)).reduce((a, b) => a + b) || 1));
            }
            output += "\n";
        }
        document.getElementsByTagName("textarea")[0].value = output;
        document.querySelector('input[type="file"]').value = null;
    }
    document.getElementsByTagName("button")[0].onclick = () => {
        document.getElementsByTagName("textarea")[0].select();
        document.execCommand('copy');
    }
    document.getElementsByTagName("button")[1].onclick = () => {
        location.reload();
    }
    document.querySelector('input[type="number"]').onchange = () => {
        document.getElementsByTagName('input')[0].dispatchEvent(new Event('change'));
    }
    const ondrag = document.getElementById("ondrag");
    ondrag.ondragover = document.body.ondragover = (e) => {
        e.preventDefault();
    }
    document.body.ondragenter = (e) => {
        e.preventDefault();
        ondrag.style.display = "grid";
    }
    ondrag.ondragleave = (e) => {
        e.preventDefault();
        ondrag.style.display = "none";
    }
    ondrag.ondrop = (e) => {
        e.preventDefault();
        ondrag.dispatchEvent(new Event('dragleave'));
        const fileInput = document.getElementsByTagName('input')[0];
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
    }
}
