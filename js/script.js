// 获取DOM元素
const imageUpload = document.getElementById('image-upload');
const originalImage = document.getElementById('original-image');
const pixelatedCanvas = document.getElementById('pixelated-canvas');
const pixelSlider = document.getElementById('pixel-size');
const pixelInput = document.getElementById('pixel-size-input');
const downloadBtn = document.getElementById('download-image');
const imagePlaceholder = document.querySelector('.image-placeholder');
const canvasPlaceholder = document.querySelector('.canvas-placeholder');

// 全局变量
let currentImage = null;
let pixelSize = 10;

// 初始化
function init() {
    // 监听文件上传
    imageUpload.addEventListener('change', handleImageUpload);
    
    // 监听像素化强度滑块
    pixelSlider.addEventListener('input', handlePixelSliderChange);
    
    // 监听像素化强度输入框
    pixelInput.addEventListener('input', handlePixelInputChange);
    
    // 监听下载按钮
    downloadBtn.addEventListener('click', downloadImage);
    
    // 初始化像素化强度显示
    updatePixelSizeDisplay(pixelSize);
}

// 处理图片上传
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        originalImage.src = e.target.result;
        currentImage = new Image();
        currentImage.onload = function() {
            // 显示原图
            originalImage.style.display = 'block';
            imagePlaceholder.style.display = 'none';
            
            // 自动应用默认像素化效果
            applyPixelation();
        };
        currentImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 处理像素化强度滑块变化
function handlePixelSliderChange(event) {
    pixelSize = parseInt(event.target.value);
    pixelInput.value = pixelSize;
    
    // 实时应用像素化效果
    if (currentImage) {
        applyPixelation();
    }
}

// 处理像素化强度输入框变化
function handlePixelInputChange(event) {
    let value = parseInt(event.target.value);
    
    // 确保值在有效范围内
    if (isNaN(value) || value < 1) {
        value = 1;
    } else if (value > 512) {
        value = 512;
    }
    
    pixelSize = value;
    pixelSlider.value = value;
    
    // 实时应用像素化效果
    if (currentImage) {
        applyPixelation();
    }
}

// 更新像素化强度显示
function updatePixelSizeDisplay(value) {
    pixelSlider.value = value;
    pixelInput.value = value;
}

// 应用像素化效果
function applyPixelation() {
    if (!currentImage) {
        return;
    }
    
    // 显示画布并隐藏占位符
    pixelatedCanvas.style.display = 'block';
    canvasPlaceholder.style.display = 'none';
    
    // 设置画布尺寸
    pixelatedCanvas.width = currentImage.width;
    pixelatedCanvas.height = currentImage.height;
    
    // 获取上下文
    const ctx = pixelatedCanvas.getContext('2d');
    
    // 禁用图像平滑以确保像素化效果清晰
    ctx.imageSmoothingEnabled = false;
    
    // 绘制原图
    ctx.drawImage(currentImage, 0, 0);
    
    // 获取图像数据
    const imageData = ctx.getImageData(0, 0, pixelatedCanvas.width, pixelatedCanvas.height);
    
    // 应用像素化效果
    pixelateImage(imageData, pixelSize);
    
    // 将处理后的图像数据放回画布
    ctx.putImageData(imageData, 0, 0);
}

// 像素化图像算法
function pixelateImage(imageData, pixelSize) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    // 确保像素大小不超过图片尺寸
    const actualPixelSize = Math.min(pixelSize, Math.min(width, height));
    
    // 遍历每个像素块
    for (let y = 0; y < height; y += actualPixelSize) {
        for (let x = 0; x < width; x += actualPixelSize) {
            // 计算像素块的边界
            const blockWidth = Math.min(actualPixelSize, width - x);
            const blockHeight = Math.min(actualPixelSize, height - y);
            
            // 计算像素块的平均颜色
            let r = 0, g = 0, b = 0, count = 0;
            
            for (let blockY = 0; blockY < blockHeight; blockY++) {
                for (let blockX = 0; blockX < blockWidth; blockX++) {
                    const idx = ((y + blockY) * width + (x + blockX)) * 4;
                    r += data[idx];
                    g += data[idx + 1];
                    b += data[idx + 2];
                    count++;
                }
            }
            
            // 计算平均值
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);
            
            // 将平均颜色应用到整个像素块
            for (let blockY = 0; blockY < blockHeight; blockY++) {
                for (let blockX = 0; blockX < blockWidth; blockX++) {
                    const idx = ((y + blockY) * width + (x + blockX)) * 4;
                    data[idx] = r;     // Red
                    data[idx + 1] = g; // Green
                    data[idx + 2] = b; // Blue
                    // Alpha 保持不变
                }
            }
        }
    }
}

// 下载图片
function downloadImage() {
    if (!pixelatedCanvas || pixelatedCanvas.style.display === 'none') {
        alert('请先上传图片');
        return;
    }
    
    const link = document.createElement('a');
    link.download = 'pixelated-image.png';
    link.href = pixelatedCanvas.toDataURL('image/png');
    link.click();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);