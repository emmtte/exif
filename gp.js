var EXITisValid = false
 
const Args = process.argv.slice(2)
let Upload; let Exif
if (Args[0] == undefined) {Upload = false; Exif = true }
if (Args[0] == 'upload')  {Upload = true;  Exif = true;console.log('upload ok')}
console.log(Args[0])
 
const readline = require('readline');
 
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
 
process.stdin.on('keypress', (key, data) => {
      if (data.ctrl && data.name === 't') {process.exit();}
          if (data.ctrl && data.name === 'a') {EXITisValid = true}
//console.log('key', key);
//console.log('data', data);
 });
 
const {google}  = require('googleapis')
const request   = require('request-promise')
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
 
const { format } = require('date-fns')
const getUnixTime  = require('date-fns/getUnixTime')
const addMonths    = require('date-fns/addMonths')
const subMonths    = require('date-fns/subMonths')
const addSeconds   = require('date-fns/addSeconds')
const isValid      = require('date-fns/isValid')
 
const sharp     = require('sharp')
const sizeOf    = require('image-size')
 
const exiftool  = require('exiftool-vendored').exiftool
 
const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
 
const delay = require('delay');
const config    = require('./config.json')
const bot = new Telegraf(config.TelegramBotToken)
const chatid = config.TelegramChatID
 
//bot.telegram.sendMessage(chatid,"test")
 
 
const oAuth2Client = new google.auth.OAuth2( config.OAuthClientID, config.OAuthClientSecret, "urn:ietf:wg:oauth:2.0:oob");//    "urn:ietf:wg:oauth:2.0:oob:auto"
tokens=require('./credentials.json')
 
 
var TotalSize = 0
let AlbumID=''
 
main()
 
async function bidon(){}
 
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
 
return
     
 
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
 
 
async function CheckAccessToken() {
    console.log(tokens.acess_token)
    console.log('test')
    try {
        const tokenInfo = await oAuth2Client.getTokenInfo(tokens.acess_token);
        console.log()
    console.log(tokenInfo)
        console.log()
    console.log(tokenInfo.scopes);
    }
    catch(e)
    {console.log(e)
    console.log()   
    console.log(e.response.data.error)
    return e.response.data.error
    }
}
 
 
async function main() {
 
if (Upload) {await auth()
         await token()}
 
//check directories
var dirs=[]
console.log(`Check Directories dates...`)
var globdirs = await glob(`${config.PhotosFolder}/[1839-2300]/????-??-??*`)
for(var dir of globdirs) {dirs.push(dir.split("/").pop().slice(0,10))}
let data = dirs.filter(function(a){return dirs.indexOf(a) !== dirs.lastIndexOf(a)});
if (data.length !== 0) {console.log(`Directories date are not unique ${data.join(", ")}`);process.exit()}
 
 
//exif photos 
var files=[]
var FilePath    
console.log(`Check Photos Exif...`)
var globfiles = await glob(`${config.PhotosFolder}/????/????-??-??*/*.@(heic|HEIC|jpg|JPG|jpeg|JPEG)`)
for ( FilePath of globfiles ) {
    await size(FilePath)
        await exif(FilePath)
    if (EXITisValid) {process.exit()}
}
 
if (!Upload) {process.exit()}
 
//upload photos
console.log(`Upload Photos to Goole Photos...`)
    globfiles = await glob(`${config.PhotosFolder}/????/????-??-??*/????????T??????.@(HEIC|JPEG)`)
for ( FilePath of globfiles ) {
        await upload(FilePath)
        if (EXITisValid) {process.exit()}
}
 
process.exit()
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
let  meta = await exiftool.read(FilePath)
 
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
    let PhotoID
        try{ response = await photos.mediaItems.upload(`${AlbumID}`, FileName, FilePath);
         if (response.newMediaItemResults[0].status.message !== 'Success') {console.log("ERREUR CREATION PICTURE");process.exit()}
         PhotoID=response.newMediaItemResults[0].mediaItem.id
    }
    catch(e) {//console.log (e)
          console.log(e.error.error.message)
          console.log(e.error.error.status)
          bot.telegram.sendMessage(chatid,"Error Upload : "+e.error.error.message)
          if (e.error.error.code == 500) {process.exit()}
          process.exit()
              }
 
    //console.log("PhotoId  :"+PhotoID)
    //await exiftool.write(`${Path}/${FileName}`, {JobID: `${config.JobID}`, MasterDocumentID:`${config.AlbumID}`, UniqueDocumentID:`${PhotoID}`})
    //await unlink(`${Path}/${FileName}_original`)
    //let Epoch        = getUnixTime(GPSDateTime)*1000
    //await utimes(`${Path}/${FileName}`, Epoch, Epoch)
         
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
 
console.log (`FilePath  : ${FilePath}`)
console.log (`FileName  : ${FileName}`) 
console.log (`AlbumName : ${AlbumName}`) 
console.log (`DirPath   : ${DirPath}`) 
console.log (`ExtName   : ${ExtName}`)
 
const GenesisDateTime = new Date('1839-01-07T00:00:00').getTime()
 
let meta = await exiftool.read(FilePath)
 
let AlbumDate           = new  Date(AlbumName.slice(0,10)+'T00:00:00').getTime()
let AlbumDateLastMonth  = subMonths(AlbumDate, 1         ).getTime()
let AlbumDateNextMonth  = addMonths(AlbumDate, 1         ).getTime()
 
console.log("GPSDateTime       : "+meta.GPSDateTime)
console.log("DateTimeOriginal  : "+meta.DateTimeOriginal)
console.log("ImageUniqueID     : "+meta.ImageUniqueID)
 
let GPSDateTime      = new Date(String(meta.GPSDateTime     ).slice(0,19)).getTime();
let DateTimeOriginal = new Date(String(meta.DateTimeOriginal).slice(0,19)).getTime();
let ImageUniqueID    = new Date(String(meta.ImageUniqueID   )            ).getTime();
let PhotoNameString   = path.parse(FileName).name   
//let PhotoFormat   = `${Str.substring(0,4)}-${Str.substring(4,6)}-${Str.substring(6,8)}T${Str.substring(9,11)}:${Str.substring(11,13)}:${Str.substring(13,15)}`
//let PhotoNameDate = new Date(String(PhotoFormat)).getTime()
 
if (isNaN(GPSDateTime)     ) {GPSDateTime      = GenesisDateTime}
if (isNaN(DateTimeOriginal)) {DateTimeOriginal = GenesisDateTime}
if (isNaN(ImageUniqueID)   ) {ImageUniqueID    = GenesisDateTime}
//if (isNaN(PhotoNameDate)   ) {PhotoNameDate    = GenesisDateTime}
 
//console.log('\033[2J');
console.log(`AlbumName         : ${AlbumName}`)
console.log(`FileName          : ${FileName}`)
console.log(`PhotoNameString   : ${PhotoNameString}`)
console.log(`DirPath           : ${DirPath}`)
console.log(`GenesisDateTime   : ${GenesisDateTime     } - ${format(GenesisDateTime,   "yyyy-MM-dd HH:mm:ss")}`)
console.log(`AlbumDate         : ${AlbumDate           } - ${format(AlbumDate,         "yyyy-MM-dd HH:mm:ss")}`)
console.log(`AlbumDateLastMonth: ${AlbumDateLastMonth  } - ${format(AlbumDateLastMonth,"yyyy-MM-dd HH:mm:ss")}`)
console.log(`AlbumDateNextMonth: ${AlbumDateNextMonth  } - ${format(AlbumDateNextMonth,"yyyy-MM-dd HH:mm:ss")}`)
console.log(`GPSDateTime       : ${GPSDateTime         } - ${format(GPSDateTime,       "yyyy-MM-dd HH:mm:ss")}`)
console.log(`DateTimeOriginal  : ${DateTimeOriginal    } - ${format(DateTimeOriginal,  "yyyy-MM-dd HH:mm:ss")}`)
console.log(`ImageUniqueID     : ${ImageUniqueID       } - ${format(ImageUniqueID   ,  "yyyy-MM-dd HH:mm:ss")}`)
let DateTime
 
let GPSisValid  = false
let EXIFisValid = false
let NAMEisValid = false
 
if ( ! isValid(AlbumDate))                                     { console.log("Error Album date not valid"  );process.exit()}
if (( GPSDateTime  == GenesisDateTime ) && ( DateTimeOriginal  == GenesisDateTime )) { DateTime = AlbumDate        ;console.log("Keep AlbumDate") }
if (( GPSDateTime  == GenesisDateTime ) && ( DateTimeOriginal !== GenesisDateTime )) { DateTime = DateTimeOriginal ;console.log("Keep DateTimeOriginal") }
if  ( GPSDateTime !== GenesisDateTime )                                              { DateTime = GPSDateTime      ;console.log("Keep GPSDateTime") ;GPSisValid = true }
if (( DateTime < AlbumDateLastMonth   ) || ( DateTime > AlbumDateNextMonth        )) { DateTime = AlbumDate        ;console.log("ERROR not inside right album")}
if (( GPSDateTime == DateTimeOriginal ) && ( GPSDateTime == ImageUniqueID         )) { EXIFisValid = true}
if (  PhotoNameString == format(DateTime,"yyyyMMdd'T'HHmmss")                      ) { NAMEisValid = true}
 
//let FileName = PhotoName
let FileDate = DateTime
 
if (! NAMEisValid) {
let FileNewName = `${format(FileDate,"yyyyMMdd'T'HHmmss")}.${ExtName}`
    while (await exists(`${DirPath}/${FileNewName}`)) {
        FileDate    = addSeconds(FileDate , 1 )
        FileNewName = `${format(FileDate,"yyyyMMdd'T'HHmmss")}.${ExtName}`
            console.log(`${FileNewName}`)
    }
await rename(`${DirPath}/${FileName}`,`${DirPath}/${FileNewName}`)
FileName = FileNewName
DateTime = FileDate
GPSisValid = false
}
 
let ExifDateTime = `${format(DateTime,"yyyy-MM-dd'T'HH:mm:ss")}`
let ExifDate     = `${format(DateTime,"yyyy-MM-dd")}`
let ExifTime     = `${format(DateTime,"HH:mm:ss")}`
let Epoch        = getUnixTime(DateTime)*1000
 
console.log("_______________________________________________________________________")
console.log("DateTime          : "+DateTime+" "+`${format(DateTime,"yyyyMMdd'T'HHmmss")}`)
console.log("ExifDateTime      : "+ExifDateTime) 
console.log("Epoch             : "+Epoch+" "+`${format(Epoch,"yyyyMMdd'T'HHmmss")}`) 
console.log("GPSisValid        : "+GPSisValid)
console.log("EXIFisValid       : "+EXIFisValid)
console.log("_______________________________________________________________________")
 
 
      if (!GPSisValid) {await exiftool.write(`${DirPath}/${FileName}`, {AllDates: `${ExifDateTime}`, GPSDateStamp:`${ExifDate}`, GPSTimeStamp:`${ExifTime}`, ImageUniqueID: `${ExifDateTime}`, ImageDescription: ''})
      console.log("GPS WRITE");
      await unlink(`${DirPath}/${FileName}_original`)
}
else if (!EXIFisValid) {await exiftool.write(`${DirPath}/${FileName}`, {AllDates:`${ExifDateTime}`, ImageUniqueID:`${ExifDateTime}`, ImageDescription: ''})
    console.log("EXIF WRITE")
    await unlink(`${DirPath}/${FileName}_original`)
}
 
await utimes(`${DirPath}/${FileName}`, Epoch, Epoch)
console.log("GPSDateTime Final Informations")
console.log("------------------------------")
 
meta = await exiftool.read(`${DirPath}/${FileName}`)
console.log("GPSDateTime       : "+meta.GPSDateTime)
console.log("DateTimeOriginal  : "+meta.DateTimeOriginal)
console.log("ImageUniqueID     : "+meta.ImageUniqueID)
if ((String(meta.GPSDateTime).slice(0,19)) !== (String(meta.DateTimeOriginal).slice(0,19))) {console.log('error GPSDateTime diff to DateTimeOriginal'); process.exit()}
 
}
 
 
async function size(File) {
var ExtName =  File.split('.').pop().toUpperCase()
if (EXTName = 'HEIC') {return;}
 
 
const maxSize = 100000000
var dimensions = sizeOf(`${File}`);
console.log("Width : "+dimensions.width);
console.log("Height: "+dimensions.height); 
console.log("sizeOf: "+(dimensions.width*dimensions.height))
if ((dimensions.width * dimensions.height) > maxSize ) { 
  console.log("ERROR JPEG dimension too big")
 
  const actualWidth  = dimensions.width
  const actualHeight = dimensions.height
 
  let ratio = maxSize / (actualWidth * actualHeight)
  if (actualWidth > actualHeight) {newWidth  = Math.floor(Math.sqrt(ratio)*actualWidth) ;newHeight=undefined}
                         else {newHeight = Math.floor(Math.sqrt(ratio)*actualHeight);newWidth =undefined}
 
  console.log("NewWidth  : "+newWidth);
  console.log("NewHeight : "+newHeight);
  console.log("NewsizeOf : "+(newWidth*newHeight)) 
 
  await sharp(`${File}`).resize(newWidth, newHeight).jpeg({ quality: 95}).toFile(`/tmp/PhotoResizedBySharp.jpg`)
  await unlink(`${File}`)
  await rename(`/tmp/PhotoResizedBySharp.jpg`, `${File}`)
  }
}
 
 
 
async function upload_original(filename,path) {
 
let settings = {
    headers : {'Content-type': 'application/octet-stream',
            'X-Goog-Upload-File-Name': filename,
            'X-Goog-Upload-Protocol': 'raw'},
    auth    : { "bearer": config.AccessToken },
    body    : await readFile(path)
}
 
    try {
        config.UploadToken = await request.post(`https://photoslibrary.googleapis.com/v1/uploads`, settings);
        console.log("uploadToken\n"+config.UploadToken)
    }
     
    catch (e) {
    console.log(e.body)
        process.exit()
     
    }    
 
       settings = {
    headers : { "Content-type": "application/json" },
        auth :    { "bearer": config.AccessToken },
        body: JSON.stringify({
        "albumId": config.AlbumID,
                "newMediaItems": [{
                  "description": filename,
                  "simpleMediaItem": {"uploadToken": config.UploadToken}
                   }]
                })
        }
 
try {
        response = await request.post(`https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate`, settings);
        console.log(response)
    if (response.newMediaItemResults[0].status.message !== 'Success') {console.log("ERREUR CREATION PICTURE");process.exit()}
    console.log("OK 2")
     
    } catch (e) {
    console.log("ERREUR 2") 
        console.log(e.body)
        process.exit()
    }    
 
}
