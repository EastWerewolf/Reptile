const https = require('https');
const fs = require('fs');
const chreeio = require('cheerio')
const baseUrl = 'https://dl.ixxcc.com/images/'
const category = [
    'ElyEE_E子', // index 0
    '一只云烧', // index 1
    '九曲Jean', // index 2
    '你的负卿', // index 3
    '半半子', // index 4
    '南桃Momoko', // index 5
    '周叽是可爱兔兔', // index 6
    '小野妹子', // index 7
    '弥音音', // index 8
    '念念_D', // index 9
    '抖娘利世', // index 10
    '水淼aqua', // index 11
    '疯猫ss', // index 12
    '白金Saki', // index 13
    '秋和柯基', // index 14
    '腐团儿', // index 15
    '菌烨Tako', // index 16
    '蜜汁猫裘', // index 17
    '蠢沫沫', // index 18
    '起司块wii', // index 19
    '过期米线线喵', // index 20
    '魔物喵Nagisa', // index 21
    '黑川' // index 22
]
let categoryIndex = 0

// 创建目录 跑一边足够
category.forEach(i=>{
    fs.mkdir(`./imagePath/${i}`, { recursive: true }, (err) => {
        if (err) throw err;
    });
})
downloadHtml()
function downloadHtml(){
    const filePath = category[categoryIndex]
    const url = baseUrl + filePath + '/'
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
            downloadImg(imgArr,filePath)
        });
    }).on("error", function() {
        console.log('获取网页失败')
    });
}
function downloadImg(imgArr,filePath){
    console.log(`开始下载${filePath}部分内容`)
    let imgArrIndex = 0
    function loop(){
        const img = imgArr[imgArrIndex].split('./')[1]
        const url = baseUrl + filePath + '/' + img
        const arr = url.split('/')
        const name = arr[arr.length-1].split('.jpg')[0]
        https.get(url, function(res) {
            let imgData = "";
            //设置图片编码格式
            res.setEncoding("binary");

            res.on('data', function (chunk) {
                imgData += chunk;
            });
            res.on("end", function() {
                if(imgArrIndex >= imgArr.length -1){
                    categoryIndex++
                    downloadHtml()
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
