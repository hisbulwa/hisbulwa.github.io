var webPush = require('web-push');

const vapidKeys = {
   "publicKey": "BF_YEO4Q7-Ag2QR7bFT98EGOgC9IXZKPlD_1WJDZJ4goKlHRbt2luy3G-poGtCL4vi1eBpkF7P4E6VQWpMan6Qw",
   "privateKey": "mYFEMxbbhJZ0dTMXMAsLvZC-Wdb7J-co8Q4QgHonoGI"
};


webPush.setVapidDetails(
   'mailto:example@yourdomain.org',
   vapidKeys.publicKey,
   vapidKeys.privateKey
)
var pushSubscription = {
   "endpoint": "https://fcm.googleapis.com/fcm/send/eOB88-gfOok:APA91bFRYy9L4snihkcdEhMYTfrKhdyvX_K4c2gY2aJw0PS8DEDvvE2vHVMUjt7QvniPY6tm-cN4ypa_8NITrBdnu6-kjvI7raao2Zfwq6Do2L6Z9xCk_98faKQgrMWL4WXAH_xCIYNY",
   "keys": {
       "p256dh": "BALFr7Dxg0nifYDRKOpcsMi00putuaUqrAvEGuwKiUh9FKfjjR5DYWB8rTaBIHxoAmx+XUF56fwRLqASMZNWPvs=",
       "auth": "JBhFf2+uNOak9l+S9NTPBw=="
   }
};
var payload = 'Selamat! Aplikasi Anda sudah dapat menerima push notifikasi!';

var options = {
   gcmAPIKey: '856909524006',
   TTL: 60
};
webPush.sendNotification(
   pushSubscription,
   payload,
   options
);
