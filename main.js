var image, _image;
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
        image = new Uint8Array(canvas.getContext("2d").getImageData(0, 0, width, height).data);
        let black_and_white = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (x + y * width) * 4;
                black_and_white += 0.3 * image[index] + 0.586 * image[index + 1] + 0.114 * image[index + 2] < 127 ? 1 : 0;
            }
        }
        let output = "";
        for (let y = 0; y < height / 4; y++) {
            for (let x = 0; x < width / 2; x++) {
                output += String.fromCharCode(0x2800 + [0,1,2,3].map((i) => (black_and_white[width * (i + 4 * y) + 2 * x] << i) + (black_and_white[width * (i + 4 * y) + 2 * x + 1] << (4 + i))).reduce((i, j) => i + j));
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
