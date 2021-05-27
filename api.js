const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const url = 'https://api.ixxcc.com/img.php?return=img';
const hashArr = [];
const maxCount = 100;
let start = 0 ; // 爬取张数限制

function downloadFile(){
    const hash = crypto.createHash('sha256');
    https.get(url, (res) => {
        const date = new Date()
        const dateStr = date.getFullYear() + '-' + (date.getMonth()+ 1) + '-' + date.getDate()
        //用来存储图片二进制编码
        let imgData = '';
        const name = dateStr + `第${start}张`
        //设置图片编码格式
        res.setEncoding("binary");

        //检测请求的数据
        res.on('data', (chunk) => {
            imgData += chunk;
        })

        //请求完成执行的回调
        res.on('end', () => {
            hash.update(imgData)
            const hashFile = hash.digest('hex')
            if(start > maxCount){
                console.log(`已经下载${maxCount}张图片`)
                return
            }
            if(hashArr.length > 0){
                if(hashArr.indexOf(hashFile) > -1){
                    console.log('重复图片内容')
                    downloadFile()
                } else {
                    hashArr.push(hashFile);
                    writeFile(name,imgData)
                }
            } else {
                hashArr.push(hashFile);
                writeFile(name,imgData)
            }

        })
    })
}
function writeFile(name,imgData){
    // 通过文件流操作保存图片
    fs.writeFile(`./saveImage/${name}.jpg`, imgData, 'binary', (error) => {
        if (error) {
            console.log('下载失败,请检查路径是否存在');
        } else {
            console.log(`第${start}张下载成功！`)
            start++
            downloadFile()
        }
    })
}
downloadFile()
