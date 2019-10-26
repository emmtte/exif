# 2 in 1 script
## Google Photos Storage and date time correction for Global Positioning System
### Features
* Automatic correction for EXIF DateTimeGPS with DateTimeCreated if exist or directory name
* Rename photo as unique name ````yyyy-MM-ddThh:mm:ss.JPG````
* Create Google Photos Album Name in concordance of directory Name
* Upload photo in apropriate Album Name 
* Choose to correct photo and upload or only correct photo
 
### Prerequisite
#### Node.js
https://nodejs.org/en/
````
VERSION=13.0.1
sudo apt-get -y install build-essential
wget https://nodejs.org/dist/v$VERSION/node-v$VERSION-linux-armv7l.tar.gz -O node.tar.gz
sudo tar -xvf node.tar.gz --strip 1 -C /usr/local
rm node.tar.gz
````

#### Client ID and Client secret
https://console.developers.google.com/apis/credentials
* Open the Google API [Console Credentials page](https://console.developers.google.com/apis/credentials).
* Click Select a project, then NEW PROJECT, and enter a name for the project, and optionally, edit the provided project ID. Click Create.
* On the Credentials page, select Create credentials, then OAuth client ID.
* You may be prompted to set a product name on the Consent screen; if so, click Configure consent screen, supply the requested information, and click Save to return to the Credentials screen.
* Select Other for the Application type, and enter any additional information required.
* Click Create.
* On the page that appears, copy the client ID and client secret to your clipboard, as you will need them when you configure your client library.

### Installation
#### Script
````
mkdir ~/gp
cd ~/gp
wget https://github.com/ManuCart/Google-Photos-Storage/edit/master/package.json
npm install
node gp
````

#### Options
* Correct EXIF : ````node gp````
* Correct EXIF and Upload : ````node gp upload````

### License

MIT License

Copyright (c) October 1, 2019 Emmanuel CHARETTE

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

