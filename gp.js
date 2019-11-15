/* global require */
/* eslint-disable no-console */
/* eslint no-process-exit: "error" */
 
const Args = process.argv.slice(2)
let Upload
if (Args[0] == undefined) {Upload = false }
if (Args[0] == 'upload')  {Upload = true  }
 
const {google}  = require('googleapis')
const Photos    = require('googlephotos')
 
const fs        = require('fs')
const path      = require('path')
const util      = require('util')
 
const glob = util.promisify(require('glob'));
 
const readFile  = util.promisify(fs.readFile )
const writeFile = util.promisify(fs.writeFile)
const readdir   = util.promisify(fs.readdir  )
const exists    = util.promisify(fs.exists   )
const unlink    = util.promisify(fs.unlink   )
const rename    = util.promisify(fs.rename   )
const utimes    = util.promisify(fs.utimes   )  
const stats     = util.promisify(fs.stat     )
const rmdir     = util.promisify(fs.rmdir    )
 
const { format }   = require('date-fns')
const getUnixTime  = require('date-fns/getUnixTime')
const addMonths    = require('date-fns/addMonths')
const subMonths    = require('date-fns/subMonths')
const addSeconds   = require('date-fns/addSeconds')
const isValid      = require('date-fns/isValid')
 
const sharp     = require('sharp')
const sizeOf    = require('image-size')
 
const exiftool  = require('exiftool-vendored').exiftool
 
const Telegraf = require('telegraf')
 
const config    = require('./config.json')
const bot = new Telegraf(config.TelegramBotToken)
const chatid = config.TelegramChatID
 
const oAuth2Client = new google.auth.OAuth2( config.OAuthClientID, config.OAuthClientSecret, "urn:ietf:wg:oauth:2.0:oob");//    "urn:ietf:wg:oauth:2.0:oob:auto"
 
let tokens
 
var TotalSize = 0
let AlbumID=''
 
main()
 
async function token() {
 
var now = Date.now()
console.log(`tokens.ExpiryDate  : ${tokens.expiry_date}`)
console.log(`tokens.ExpiryDate  : ${format(tokens.expiry_date,"yyyy-MM-dd HH:mm:ss")}`)
let ttime = tokens.expiry_date -60000
console.log(`ttime              : ${format(ttime,"yyyy-MM-dd HH:mm:ss")}`) 
console.log(`now                : ${now}`) 
console.log(`now                : ${format(now,"yyyy-MM-dd HH:mm:ss")}`)
 
if (Date.now() > (tokens.expiry_date-60000)) {
  oAuth2Client.setCredentials({refresh_token:  tokens.refresh_token });
  let response = await oAuth2Client.getAccessToken()
  tokens = response.res.data
  await writeFile("credentials.json", JSON.stringify(tokens, null, 1))  
}
}
 
 
async function auth () {
const prompts = require('prompts')
 
 
if (await exists('credentials.json')) {
tokens=require('./credentials.json')    
//with refresh_token  
oAuth2Client.setCredentials({refresh_token:  tokens.refresh_token });
let response = await oAuth2Client.getAccessToken()
tokens = response.res.data
await writeFile("credentials.json", JSON.stringify(tokens, null, 1))    
 
 
var now = Date.now()
console.log(`tokens.ExpiryDate  : ${tokens.expiry_date}`)
console.log(`tokens.ExpiryDate  : ${format(tokens.expiry_date,"yyyy-MM-dd HH:mm:ss")}`)
console.log(`now                : ${now}`) 
console.log(`now                : ${format(now,"yyyy-MM-dd HH:mm:ss")}`)
 
}
else
{   
 
//with url
 
const url = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: [Photos.Scopes.READ_AND_APPEND]});
const ask = await prompts({type: 'text', name: 'token', message: `Google Photos : \n${url}`});
 
console.log(ask.token);
 
let code = ask.token
tokens = (await oAuth2Client.getToken(code)).tokens
oAuth2Client.setCredentials(tokens);
console.log(tokens)
await writeFile("credentials.json", JSON.stringify(tokens, null, 1))
}
}
 
 
async function main() {
let FilePath
let globfiles
if (Upload) {
    await auth()
    await token()
        console.log(`Upload Photos to Goole Photos...`)
        globfiles = await glob(`${config.PhotosFolder}/????/????-??-??*/????????T??????.@(HEIC|JPEG)`)
        for ( FilePath of globfiles ) {await upload(FilePath)}
    Process.exit()
}
 
//rename files
console.log(`Rename Photos Files...`)
globfiles = await glob(`${config.PhotosFolder}/????/????-??-??*/*.@(heic|HEIC|jpg|JPG|jpeg|JPEG)`)
let num=0
let Path, Ext
let name
for ( FilePath of globfiles ) {
    num++
        name = String(num).padStart(10, '0')
        Path   = path.dirname (FilePath)
        Ext    = FilePath.split('.').pop()
        await rename(`${FilePath}`,`${Path}/${name}.${Ext}`) 
}
 
//exif photos   
console.log(`Check Photos Exif...`)
    globfiles = await glob(`${config.PhotosFolder}/????/????-??-??*/*.@(heic|HEIC|jpg|JPG|jpeg|JPEG)`)
for ( FilePath of globfiles ) {
    await size(FilePath)
        await exif(FilePath)
}
 
Process.exit()
}
 
 
 
 
async function upload(FilePath) {
await token()   
 
const DirPath   = path.dirname (FilePath)
const FileName  = path.basename(FilePath)
const AlbumName = path.dirname (FilePath).split('/').pop()
console.log (`FilePath  : ${FilePath}`)
console.log (`FileName  : ${FileName}`) 
console.log (`AlbumName : ${AlbumName}`) 
console.log (`DirPath   : ${DirPath}`) 
 
let photos = new Photos(tokens.access_token)
 
AlbumID = ''
if (await exists(`${DirPath}/id.txt`)) {AlbumID = await readFile(`${DirPath}/id.txt`)}
console.log("------------------"+AlbumID+"-----------------")
 
 
if (AlbumID == '') 
               {
        let AlbumDate     = new Date(AlbumName.slice(0,10))
                let AlbumNewName = `${AlbumName.slice(11)} (${format(AlbumDate,"dd/MM/yyyy")})`
                console.log("Try to Upload New Album")
                let response = await photos.albums.create(AlbumNewName)
                AlbumID = response.id
        console.log("New Album : "+AlbumNewName)
        console.log("AlbumId   : "+AlbumID)
                await writeFile(`${DirPath}/id.txt`,AlbumID)
                }
 
    console.log('start upload')
    console.log("Try to Upload New Photo")
        try{ let response = await photos.mediaItems.upload(`${AlbumID}`, FileName, FilePath)
           if (response.newMediaItemResults[0].status.message !== 'Success') {console.log("ERREUR CREATION PICTURE");Process.exit()}
    }
    catch(e) {//console.log (e)
        console.log(e.error.error.message)
        console.log(e.error.error.status)
        bot.telegram.sendMessage(chatid,"Error Upload : "+e.error.error.message)
        if (e.error.error.code == 500) {Process.exit()}
        Process.exit()
    }
         
    let Size = (await stats(FilePath)).size
    console.log("Size:"+Size)
    TotalSize = TotalSize + (Size / 1000000000)
    console.log("TotalSize:"+TotalSize)
    console.log(`(${(12 - TotalSize).toFixed(1)} Go restants)`)
        if (TotalSize > 12) {bot.telegram.sendMessage(chatid,"Dans paramètres de Google Photos cliquez sur récupérer de l'espace de stockage\nRemarque : Vous ne pouvez récupérer de l'espace de stockage qu'une seule fois par jour.")}
 
    await unlink(FilePath) //effacement du fichier
        let FilesNumber = await readdir(DirPath)
         
        console.log("Nombre de fichiers restant pour supression du repertoire "+FilesNumber.length)
          if (FilesNumber.length == 1) {
          await unlink(`${DirPath}/id.txt`)
          await rmdir (DirPath)}
            
}
 
 
async function exif(FilePath) {
 
const DirPath   = path.dirname (FilePath)
var FileName  = path.basename(FilePath)
const AlbumName = path.dirname (FilePath).split('/').pop()
var ExtName =  FilePath.split('.').pop().toUpperCase()
if (ExtName == 'JPG') {ExtName = 'JPEG'}
 
let meta = await exiftool.read(FilePath)
 
let AlbumDate           = new  Date(AlbumName.slice(0,10)+'T12:00:00').getTime()
let AlbumDateLastMonth  = subMonths(AlbumDate, 1         ).getTime()
let AlbumDateNextMonth  = addMonths(AlbumDate, 1         ).getTime()
 
console.clear();
console.log (`FilePath          : ${FilePath}`)
console.log (`FileName          : ${FileName}`) 
console.log (`AlbumName         : ${AlbumName}`) 
console.log (`DirPath           : ${DirPath}`) 
console.log (`ExtName           : ${ExtName}`)
console.log ()
console.log (`AlbumDate         : ${AlbumDate}`)
console.log (`AlbumDateLastMonth: ${AlbumDateLastMonth}`)
console.log (`AlbumDateNextMonth: ${AlbumDateNextMonth}`)
console.log (`DateTimeOriginal  : ${meta.DateTimeOriginal}`)
console.log ()
console.log (`Orientation       : ${meta.Orientation    }`)
console.log (`FNumber           : ${meta.FNumber}`)
console.log (`ExposureTime      : ${meta.ExposureTime}`)
console.log (`FocalLength       : ${meta.FocalLength}`)
console.log (`ISO               : ${meta.ISO}`)
console.log (`GPSAltitude       : ${meta.GPSAltitude}`)
console.log (`GPSLatitude       : ${meta.GPSLatitude}`)  
console.log (`GPSLongitude      : ${meta.GPSLongitude}`)
console.log (`GPSAltitudeRef    : ${meta.GPSAltitudeRef}`)
console.log (`GPSLatitudeRef    : ${meta.GPSLatitudeRef}`)
console.log (`GPSLongitudeRef   : ${meta.GPSLongitudeRef}`)
 
let DateTime = new Date(String(meta.DateTimeOriginal).slice(0,19)).getTime();
if ( ! isValid(AlbumDate)) { console.log("Error Album date not valid"  );Process.exit()}
if ( ! isValid(DateTime )) { DateTime = AlbumDate}
if (meta.FNumber  == undefined) {DateTime=AlbumDate}
if (( DateTime < AlbumDateLastMonth ) || ( DateTime > AlbumDateNextMonth )) { DateTime = AlbumDate ;console.log("ERROR not inside right album")}
 
 
let FileNewName = `${format(DateTime,"yyyyMMdd'T'HHmmss")}.${ExtName}`
    while ((await glob(`${config.PhotosFolder}/????/????-??-??*/${FileNewName}`)).length !== 0){
        DateTime    = addSeconds(DateTime , 1 )
        FileNewName = `${format(DateTime,"yyyyMMdd'T'HHmmss")}.${ExtName}`
        console.log(`${FileNewName}`)
    }
await rename(`${DirPath}/${FileName}`,`${DirPath}/${FileNewName}`)
 
FileName = FileNewName
 
let ExifDateTime = `${format(DateTime,"yyyy-MM-dd'T'HH:mm:ss")}`
console.log (`ExifDateTime      : ${ExifDateTime}`)
 
 
try { await exiftool.write(`${DirPath}/${FileName}`, {}, ["-all="])} catch(e) {console.log('ERROR DELETE EXIF')}
await exiftool.write(`${DirPath}/${FileName}`, {AllDates: `${ExifDateTime}`, Model:'Camera Exposure', FNumber: meta.FNumber, ExposureTime: meta.ExposureTime, FocalLength:meta.FocalLength, ISO: meta.ISO,GPSAltitude:meta.GPSAltitude,GPSLatitude:meta.GPSLatitude,GPSLongitude:meta.GPSLongitude,GPSLatitudeRef:meta.GPSLatitudeRef,GPSLongitudeRef:meta.GPSLongitudeRef})
if (meta.Orientation==undefined) (meta.Orientation = 1)
await exiftool.write(`${DirPath}/${FileName}`, {Orientation: `${meta.Orientation}`}, ['-n'])
 
await unlink(`${DirPath}/${FileName}_original`)
 
let Epoch        = getUnixTime(DateTime)*1000
console.log("DateTime          : "+DateTime+" "+`${format(DateTime,"yyyyMMdd'T'HHmmss")}`)
console.log("ExifDateTime      : "+ExifDateTime) 
console.log("Epoch             : "+Epoch+" "+`${format(Epoch,"yyyyMMdd'T'HHmmss")}`) 
 
await utimes(`${DirPath}/${FileName}`, Epoch, Epoch)
 
}
 
 
async function size(File) {
var ExtName =  File.split('.').pop().toUpperCase()
if (ExtName == 'HEIC') {return}
 
 
const maxSize = 100000000
var dimensions = sizeOf(`${File}`);
console.log("Width : "+dimensions.width);
console.log("Height: "+dimensions.height); 
console.log("sizeOf: "+(dimensions.width*dimensions.height))
if ((dimensions.width * dimensions.height) > maxSize ) { 
  console.log("ERROR JPEG dimension too big")
 
  const actualWidth  = dimensions.width
  const actualHeight = dimensions.height
  let newWidth
  let newHeight
  let ratio = maxSize / (actualWidth * actualHeight)
    if (actualWidth > actualHeight) {newWidth = Math.floor(Math.sqrt(ratio)*actualWidth); newHeight = undefined}
    else {newHeight = Math.floor(Math.sqrt(ratio)*actualHeight); newWidth = undefined}
 
  console.log("NewWidth  : "+newWidth);
  console.log("NewHeight : "+newHeight);
  console.log("NewsizeOf : "+(newWidth*newHeight)) 
 
  await sharp(`${File}`).resize(newWidth, newHeight).jpeg({ quality: 95}).toFile(`/tmp/PhotoResizedBySharp.jpg`)
  await unlink(`${File}`)
  await rename(`/tmp/PhotoResizedBySharp.jpg`, `${File}`)
  }
}
