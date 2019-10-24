# 2 in 1 script
## Google Photos Storage and date time correction for Global Positioning System
### Features
* Automatic correction for EXIF DateTimeGPS with DateTimeCreated if exist or directory name
* Rename photo as unique name ````yyyy-MM-ddThh:mm:ss.JPG````
* Create Google Photos Album Name in concordance of directory Name
* Upload photo in apropriate Album Name 
* Choose to correct photo and upload or only correct photo or only upload photo
 
### Installation
#### Node.js
````
VERSION=10.16.0
sudo apt-get -y install build-essential
wget https://nodejs.org/dist/v$VERSION/node-v$VERSION-linux-armv7l.tar.gz -O node.tar.gz
sudo tar -xvf node.tar.gz --strip 1 -C /usr/local
rm node.tar.gz
````

#### Create a client ID and client secret
* Open the Google API Console Credentials page.
* Click Select a project, then NEW PROJECT, and enter a name for the project, and optionally, edit the provided project ID. Click Create.
* On the Credentials page, select Create credentials, then OAuth client ID.
* You may be prompted to set a product name on the Consent screen; if so, click Configure consent screen, supply the requested information, and click Save to return to the Credentials screen.
* Select Other for the Application type, and enter any additional information required.
* Click Create.
* On the page that appears, copy the client ID and client secret to your clipboard, as you will need them when you configure your client library.

#### Script
````
mkdir ~/gp
cd ~/gp
wget https://github.com/ManuCart/Google-Photos-Storage/edit/master/package.json
npm install
node gp
````

#### Options
* Correct EXIF and Upload : ````node gp correct_upload````
* Correct EXIF Only : ````node gp correctd````
* Upload Only :  ````node gp upload````

