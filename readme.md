# Google Photos Metadata Fixer
Fix automatically metadata photos and upload to Google Photos
## Features
* Fix automatically EXIF DateTimeGPS with DateTimeOriginal if exists or else with directory name
* Rename photo files with an unique name ````yyyy-MM-ddThh:mm:ss.JPG````
* Create Google Photos Albums with the directory's name ````yyyy-MM-dd *````
* Upload photos in the appropriate Album 
* Choose either to correct photos and upload them or only to correct photos
 
## Prerequisite
#### Download and Install Node.js
Go to [nodejs.org](https://nodejs.org/en/download/current/) to download and install latest current version
````
VERSION=13.0.1
sudo apt-get -y install build-essential
wget https://nodejs.org/dist/v$VERSION/node-v$VERSION-linux-armv7l.tar.gz -O node.tar.gz
sudo tar -xvf node.tar.gz --strip 1 -C /usr/local
rm node.tar.gz
````
#### Google Photos OAuth2 Authentication
Create a client ID and client secret
* Open the [Google API Console Credentials page](https://console.developers.google.com/apis/credentials).
* Click __Select a project__, then __NEW PROJECT__, and enter a name for the project, and optionally, edit the provided project ID. Click __Create__.
* On the Credentials page, select __Create credentials__, then __OAuth client ID__.
* You may be prompted to set a product name on the Consent screen; if so, click __Configure consent screen__, supply the requested information, and click __Save__ to return to the Credentials screen.
* Select __Other__ for __the Application type__, and enter any additional information required.
* Click __Create__.
* On the page that appears, copy the __client ID__ and __client secret__ to the configuration file ````config.json````

#### Telegram Notification (Optional) 
Creating a new bot with [BotFather](https://telegram.me/botfather)
* Use the __/newbot__ command to create a new bot. The BotFather will ask you for a name and username, then generate an authorization token for your new bot.
* The __name__ of your bot is displayed in contact details and elsewhere.
* The __Username__ is a short name, to be used in mentions and telegram.me links. Usernames are 5-32 characters long and are case insensitive, but may only include Latin characters, numbers, and underscores. Your bot's username must end in ‘bot’.
* Copy the __token__ to the configuration file ````config.json````
* Send a dummy message to your new bot
* Go to following url ````https://api.telegram.org/bot````__token__````/getUpdates````
* Look for ````"chat":{"id":````
* Copy the __chatid__ to the configuration file ````config.json````

## Installation & Execution
#### Downloading and installing packages locally
````
mkdir ~/gp && cd ~/gp
wget https://raw.githubusercontent.com/ManuCart/Google-Photos-Storage/master/package.json
npm install
````
#### Execution
Run one of this two command from the location of the packages install directory
* To correct EXIF Photos : ````node gp````
* To correct EXIF Photos and Upload : ````node gp upload````

## MIT License

Copyright © ````October 1, 2019```` ````Emmanuel CHARETTE````

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

