const fs = require('fs');
const util = require('util');

const exec    = util.promisify( require('child_process').exec )
const readdir = util.promisify( fs.readdir )
const stat    = util.promisify( fs.stat    )
const rename  = util.promisify( fs.rename  )
const exists  = util.promisify( fs.exists  )
const chmod   = util.promisify( fs.chmod   )
const moment  = require('moment')

async function main() {
const folder = process.argv[2]
year = await readdir(`${folder}`)

for(var y in year){
  album = await readdir(`${folder}/${year[y]}`)

  for(var a in album){
    const album_date            = moment(album[a].slice(0,10),'YYYY-MM-DD')
    const album_date_last_month = moment(album_date).subtract(1, 'months')
    const album_date_next_month = moment(album_date).add     (1, 'months')

    photo = await readdir(`${folder}/${year[y]}/${album[a]}`)

    for(var p in photo){
      let { stdout, stderr } = await exec(`exiv2 -g DateTimeOriginal -PEv "${folder}/${year[y]}/${album[a]}/${photo[p]}"`);
      let photo_exif = stdout;
      let photo_date = moment(photo_exif,'YYYY:MM:DD HH:mm:ss')
      if ( ! photo_date.isValid()) {photo_date = album_date;}
      let photo_name = `${photo_date.format('YYYYMMDDTHHmmss')}.JPG`

      if (( album_date_last_month < photo_date ) && ( photo_date < album_date_next_month))
        {console.log(`Date inside window OK`)}
        console.log(`Album Name : ${album[a]}`)
        console.log(`Exif  Orig : #${photo_exif}#`)
        console.log(`Photo Orig : ${photo[p]}`)
        console.log(`Photo Name : ${photo_name}`)
        console.log(`Photo Date : ${photo_date.format('YYYY-MM-DD')}`)
        console.log(`Album Date : ${album_date.format('YYYY-MM-DD')}`)
if (photo_name !== photo[p] ) {
       while (await exists(`${folder}/${year[y]}/${album[a]}/${photo_name}`)) {
                  photo_date = moment(photo_date).add     (1, 'seconds')
                  photo_name = `${photo_date.format('YYYYMMDDTHHmmss')}.JPG`
                  }
               await rename(`${folder}/${year[y]}/${album[a]}/${photo[p]}`,`${folder}/${year[y]}/${album[a]}/${photo_name}`)
               await exec(`exiv2 -M "set Exif.Photo.DateTimeOriginal ${photo_date.format('YYYY:MM:DD HH:mm:ss')}" "${folder}/${year[y]}/${album[a]}/${photo_name}"`
               let { stdout, stderr } = await exec(`exiv2 -g DateTimeOriginal -PEv "${folder}/${year[y]}/${album[a]}/${photo_name}"`);
               photo_exif = stdout;
               photo_date = moment(photo_exif,'YYYY:MM:DD HH:mm:ss')
               if ( ! photo_date.isValid()) {console.log(`Error Write Exif`);Process.exit()}.
               console.log(`Rename Date : ${photo[p]} to ${photo_name}`)
}
}
}
}
}

main()
