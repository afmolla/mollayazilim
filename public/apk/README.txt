Bu klasöre ürettiğiniz APK dosyasını tam bu ada koyun:
  public/apk/molla-restaurant.apk

Restoran vitrininde varsayılan ayar: data/restaurant/settings.json → mobilAndroidApkUrl = "/apk/molla-restaurant.apk"
Değiştirmek için: /restaurant/panel → Site ayarları → "Android APK (doğrudan indir)"

Tam URL de yazılabilir (ör. GitHub Releases).

Derleme (Expo EAS, ücretli kotası olabilir):
  cd mobile/restaurant-mobile
  npx eas-cli login
  npx eas-cli build --platform android --profile preview

APK dosyaları .gitignore ile repoya eklenmez; deploy sırasında sunucuya veya CI ile kopyalayın.
