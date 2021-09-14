var image;
const addErr = (x, y, err_red, err_green, err_blue, width) => {
    const clip = (x) => (x < 0 ? 0 : (x > 255 ? 255 : x));
    const index = (x + y * width) * 4;
    image[index + 0] = clip(image[index + 0] + err_red)
    image[index + 1] = clip(image[index + 1] + err_green)
    image[index + 2] = clip(image[index + 2] + err_blue)
    image[index + 3] = 255;
}
window.onload = () => {
    document.querySelector('input[type="file"]').onchange = async (e) => {
        const canvas = await new Promise((resolve, _) => {
            const canvas = document.createElement("canvas");
            const image = new Image();
            image.onload = () => {
                let width = document.querySelector('input[type="number"]').valueAsNumber;
                let height = width * image.height / image.width;
                canvas.width = width - (width % 2);
                canvas.height = height - (height % 4);
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#FFFFFF";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.mozImageSmoothingEnabled = false;
                ctx.webkitImageSmoothingEnabled = false;
                ctx.msImageSmoothingEnabled = false;
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
                resolve(canvas);
            }
            image.src = URL.createObjectURL(e.target.files[0]);
        });
        const shift_values = [0, 1, 2, 6, 3, 4, 5, 7];
        const width = canvas.width;
        const height = canvas.height;
        image = new Uint8Array(canvas.getContext("2d").getImageData(0, 0, width, height).data);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = (x + y * width) * 4;
                const pixel = [image[index + 0], image[index + 1], image[index + 2]];
                const newpixel = (0.2126 * pixel[0] + 0.7152 * pixel[1] + 0.0722 * pixel[2]) > 128 ? [255, 255, 255] : [0, 0, 0];
                image[index + 0] = Math.floor(newpixel[0] + 0.5);
                image[index + 1] = Math.floor(newpixel[1] + 0.5);
                image[index + 2] = Math.floor(newpixel[2] + 0.5);
                image[index + 3] = 255;
                const err_red = pixel[0] - newpixel[0];
                const err_green = pixel[1] - newpixel[1];
                const err_blue = pixel[2] - newpixel[2];
                if (x + 1 < canvas.width) addErr(x + 1, y, (7 / 16) * err_red, (7 / 16) * err_green, (7 / 16) * err_blue, width);
                if (x - 1 > 0 && y + 1 < canvas.height) addErr(x - 1, y + 1, (3 / 16) * err_red, (3 / 16) * err_green, (3 / 16) * err_blue, width);
                if (y + 1 < canvas.height) addErr(x, y + 1, (5 / 16) * err_red, (5 / 16) * err_green, (5 / 16) * err_blue, width);
                if (x + 1 < canvas.width) addErr(x + 1, y + 1, (1 / 16) * err_red, (1 / 16) * err_green, (1 / 16) * err_blue, width);
            }
        }
        let output = "";
        for (let imgy = 0; imgy < height; imgy += 4) {
            for (let imgx = 0; imgx < width; imgx += 2) {
                const braille_info = [0, 0, 0, 0, 0, 0, 0, 0];
                let dot_index = 0;
                for (let x = 0; x < 2; x++) {
                    for (let y = 0; y < 4; y++) {
                        const index = (imgx + x + width * (imgy + y)) * 4;
                        const pixel_data = image.slice(index, index + 4);
                        if (pixel_data[3] >= 128) {
                            const grey = 0.22 * pixel_data[0] + 0.72 * pixel_data[1] + 0.06 * pixel_data[2];
                            if (grey >= 128) braille_info[dot_index] = 1;
                        }
                        dot_index++;
                    }
                }
                let codepoint_offset = 0;
                for (const i in braille_info) {
                    codepoint_offset += (+braille_info[i]) << shift_values[i];
                }
                if (!codepoint_offset) {
                    codepoint_offset = 4;
                }
                output += String.fromCharCode(0x2800 + codepoint_offset);
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
