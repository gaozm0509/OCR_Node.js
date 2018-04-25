const Koa = require('koa');
const request = require('request');
const koa_router = require('koa-router');
const path = require('path');
const { uploadFile } = require('./upload');

const userInfo = require('./userInfo');
const imageProcessing = require('./imageProcessing');
const config = require('./config');
const fs = require('fs');

const app = new Koa();

const router = new koa_router();


// 图片资源访问
router.get('/upload-files/album/:image', async ctx => {
    //image:"c05398301c0d3.jpg
    let staticPath = './upload-files/album';
    let fullStaticPath = path.join(__dirname, staticPath);
    fullStaticPath = fullStaticPath + '/' + ctx.params.image;
    var content = fs.readFileSync(fullStaticPath, "binary");
    ctx.res.writeHead(200, "Ok");
    ctx.res.write(content, "binary"); //格式必须为 binary，否则会出错
    ctx.res.end();
})

// 接收上传到服务器的图片，然后传给腾讯OCR，返回处理后的文字
router.post('/upload', async ctx => {
    // 上传文件请求处理
    let result = { success: false }
    let serverFilePath = path.join(__dirname, 'upload-files')

    // 上传文件事件
    result = await uploadFile(ctx, {
            fileType: 'album',
            path: serverFilePath
        })
        // 异步
    let fileUrl = ctx.origin + '/upload-files/album/' + result.imageName
    var body = await imageProcessing.requestTXService(fileUrl);
    setTimeout(function() {
        console.log('5')
    }, 86400); // 服务器保存一天
    ctx.body = body;
});

// 接收上传的code，返回userinfo相关
router.get('/userInfo', async(ctx) => {
    var body = await userInfo.requestWxInfoAsync(ctx.query.code);
    ctx.body = body;
});



app.use(router.routes());

app.listen(3000, () => {
    console.log('server start')
});