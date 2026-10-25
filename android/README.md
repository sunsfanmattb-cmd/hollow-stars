# Android build

`android/shell` is the Capacitor wrapper taken from the 1.6.1 APK (app ID `com.sunsfanmattb.hollowstars`),
with the game files removed. `build-apk.sh` copies the current `index.html`, `css/`, `js/` and `art/` into it,
adds the Android-only scripts (audio pause, back button), stamps the version and signs the APK.

The release key is **never** committed (this repo is public). Builds are signed with
`hollowstars-release.jks` (alias `hollowstars`, CN=Matthew Bowling), which the owner keeps privately.

Version history: 1.6.1 = code 8, 1.7 = code 9, 1.8 = code 10. Each new APK needs a higher version code.
