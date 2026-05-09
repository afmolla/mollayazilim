Bu klasöre ürettiğiniz APK dosyasını koyun (ör. molla-restaurant.apk).
Panel → Site ayarları → "Android APK" alanına örnek: /apk/molla-restaurant.apk

Derleme (Expo EAS, ücretli kotası olabilir):
  cd mobile/restaurant-mobile
  npx eas-cli login
  npx eas-cli build --platform android --profile preview

APK dosyaları .gitignore ile repoya eklenmez; deploy sırasında sunucuya veya CI ile kopyalayın.
