#!/usr/bin/env bash
# Builds a signed Hollow Stars APK from the current game files.
#
# The Android wrapper (Capacitor shell) lives in android/shell. This script copies
# index.html and art/ into it, injects the Android-only scripts, stamps the version,
# rebuilds with apktool and signs with the release key.
#
# Usage: android/build-apk.sh <versionName> <versionCode> <out.apk>
# Env:   APKTOOL_JAR, SIGNER_JAR, KEYSTORE (path to .jks), KS_PASS, KEY_ALIAS, KEY_PASS
set -euo pipefail
VNAME="$1"; VCODE="$2"; OUT="$3"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cp -r "$ROOT/android/shell" "$WORK/app"
PUB="$WORK/app/assets/public"
cp -r "$ROOT/art" "$PUB/art"

# Android-only scripts: audio pause/resume in <head>, back-button routing before </body>
python3 - "$ROOT/index.html" "$PUB/index.html" <<'EOF'
import sys
src, dst = sys.argv[1], sys.argv[2]
t = open(src, encoding='utf-8').read()
head = '<html lang="en"><head>'
assert t.count(head) == 1, 'head tag not found'
t = t.replace(head, head + '<script src="android-head.js"></script>', 1)
i = t.rfind('</body>')
assert i > 0, '</body> not found'
t = t[:i] + '<script src="android-shim.js"></script>' + t[i:]
open(dst, 'w', encoding='utf-8').write(t)
EOF

# Stamp version into apktool.yml
python3 - "$WORK/app/apktool.yml" "$VNAME" "$VCODE" <<'EOF'
import sys, re
p, name, code = sys.argv[1], sys.argv[2], sys.argv[3]
t = open(p).read()
t = re.sub(r'versionCode: .*', f'versionCode: {code}', t)
t = re.sub(r'versionName: .*', f'versionName: {name}', t)
open(p, 'w').write(t)
EOF

java -jar "$APKTOOL_JAR" b "$WORK/app" -o "$WORK/unsigned.apk"
java -jar "$SIGNER_JAR" -a "$WORK/unsigned.apk" -o "$WORK/signed" \
  --ks "$KEYSTORE" --ksPass "$KS_PASS" --ksAlias "$KEY_ALIAS" --ksKeyPass "$KEY_PASS" --allowResign
cp "$WORK"/signed/*.apk "$OUT"
echo "Built $OUT (version $VNAME, code $VCODE)"
