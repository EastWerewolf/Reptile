const https = require('https');
const fs = require('fs');
const chreeio = require('cheerio')
const BaseUrl = 'https://dl.ixxcc.com/images/'
let categoryIndex = 0;

// 读取目录 写入category.json目录部分的代码省略
 function readCategory(readPath,writePath){
    return new Promise((resolve,reject)=>{
        fs.readFile(readPath,'utf-8',(err,data)=>{
            if(err){
                console.log('文件读取失败')
                reject('文件读取失败')
            } else {
                // console.log(data)
                const category = JSON.parse(data)
                resolve(category)
                // 创建目录 跑一遍足够
                if (writePath) {
                    category.forEach(i=>{
                        let path = ''
                        if (i.indexOf('/')> -1){
                            path = i.split('/')[0]
                        } else {
                            return
                        }
                        fs.mkdir(`${writePath}${path}`, { recursive: true }, (err) => {
                            if (err) throw err;
                        });
                    })
                }
            }
        })
    })
}

const downloadPart = [{
    writePath:'./imagePath/',
    readPath: './imagePath/category.json',
    baseUrl:BaseUrl
},{
    writePath:'./imagePath/cosplay/',
    readPath: './imagePath/category1.json',
    baseUrl:'https://dl.ixxcc.com/images/cosplay/'
}]
// 启动器 读取路径 下载文件 第一次跑需要加上writePath
const part = 1; // 0/1  0 下载一级目录内容  1下载二级目录内容
const {readPath,writePath,baseUrl} = downloadPart[part]
readCategory(readPath).then(category=>{
    downloadHtml(category,baseUrl)
})
/*
    category 文件目录
    baseUrl 路径
    downloadType 1 单线  2 并行  默认单线
 */
function downloadHtml(category,baseUrl,downloadType = 1){
    const filePath = category[categoryIndex]
    const Slash = filePath.indexOf('/') > -1 ? '' : '/'
    const url = baseUrl + filePath + Slash
    console.log(url,'开始爬取网页链接')
    https.get(url, function(res) {
        let data = "";
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on("end", function() {
           const imgArr = []
            $ = chreeio.load(data)
            $('a').each((index,ele )=>{
                const href = $(ele).attr('href') || ''
                if(href && href.indexOf('jpg') > -1){
                    imgArr.push(href)
                }
            })
            const path = baseUrl.replace(BaseUrl,'') + filePath.replace('/','');
            const hasImage = imgArr.length > 0
            // 下载方式 二选一即可 这里选择单线下载
            if(downloadType === 1){ // 单线下载 下载图片方法需加上category,baseUrl 参数 并行下载需要去掉这两个参数
                if (hasImage) { // 有图片下载
                    downloadImg(imgArr,path,category,baseUrl)
                } else { // 无图片进行下一个网页的爬取
                    if(categoryIndex < category.length){
                        categoryIndex++
                        downloadHtml(category,baseUrl,downloadType)
                    }
                }
            } else { // 并行下载 有内存溢出风险
                if(hasImage){ // 有图片下载图片
                    downloadImg(imgArr,path)
                }
                if(categoryIndex < category.length){ // 当前网页解析完成进行下一个网页解析
                    categoryIndex++
                    downloadHtml(category,baseUrl,downloadType)
                }
            }



        });
    }).on("error", function() {
        console.log('获取网页失败')
    });
}
function downloadImg(imgArr,filePath,category,baseUrl){
    console.log(`开始下载${filePath}部分内容`)
    let imgArrIndex = 0
    function loop(){
        console.log(imgArr[imgArrIndex],'imgArr[imgArrIndex]')
        const img = imgArr[imgArrIndex].split('./')[1]
        const url = BaseUrl + filePath + '/' + img
        const arr = url.split('/')
        const name = arr[arr.length-1].split('.jpg')[0]
        https.get(url, function(res) {
            console.log(url,'图片路径')
            let imgData = "";
            //设置图片编码格式
            res.setEncoding("binary");

            res.on('data', function (chunk) {
                imgData += chunk;
            });
            res.on("end", function() {
                if(imgArrIndex >= imgArr.length -1){
                    console.log(`${filePath}部分内容下载完璧`)
                    if(category && baseUrl){
                        if(categoryIndex < category.length){
                            categoryIndex++
                            downloadHtml(category,baseUrl)
                        }
                    }
                } else {
                    imgArrIndex++
                    loop()
                }
                writeFile(name,imgData,filePath)
            });
        }).on("error", function() {
            console.log('下载图片失败')
        });
    }
    loop()
}
function writeFile(name,imgData,path){
    // 通过文件流操作保存图片
    console.log(`开始写入文件 ./imagePath/${path}/${name}.jpg`)
    fs.writeFile(`./imagePath/${path}/${name}.jpg`, imgData, 'binary', (error) => {
        if (error) {
            console.log('下载失败,请检查路径是否存在');
        } else {
            console.log(`./imagePath/${path}/${name}.jpg 写入成功`)
        }
    })
}
