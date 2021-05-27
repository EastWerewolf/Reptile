const https = require('https');
const fs = require('fs');
const chreeio = require('cheerio')
const baseUrl = 'https://dl.ixxcc.com/images/'
const category = ['ElyEE_E子','一只云烧','九曲Jean','你的负卿','半半子',
    '南桃Momoko','周叽是可爱兔兔','小野妹子','弥音音','念念_D','抖娘利世',
    '水淼aqua','疯猫ss','白金Saki','秋和柯基','腐团儿','菌烨Tako',
    '蜜汁猫裘','蠢沫沫','起司块wii','过期米线线喵','魔物喵Nagisa','黑川']
let categoryIndex = 0

// 创建目录 跑一边足够
// category.forEach(i=>{
//     fs.mkdir(`./imagePath/${i}`, { recursive: true }, (err) => {
//         if (err) throw err;
//     });
// })
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
            console.log('获取网页失败')
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
