#!/usr/bin/env bash
set -e

KEYSTORE_FILE="linkshelf-release.keystore"
KEY_ALIAS="linkshelf-release-key"

echo "=========================================================="
echo "  LinkShelf Android Release Keystore Generator"
echo "=========================================================="
echo ""

if [ -f "$KEYSTORE_FILE" ]; then
  echo "⚠️  $KEYSTORE_FILE already exists in the current directory."
  echo "If you want to generate a new one, remove or rename it first."
  exit 1
fi

read -s -p "Enter keystore password (at least 6 characters): " PASSWORD
echo ""
read -s -p "Confirm keystore password: " PASSWORD_CONFIRM
echo ""

if [ "$PASSWORD" != "$PASSWORD_CONFIRM" ]; then
  echo "❌ Passwords do not match!"
  exit 1
fi

if [ ${#PASSWORD} -lt 6 ]; then
  echo "❌ Password must be at least 6 characters long."
  exit 1
fi

echo ""
echo "Generating keystore with alias '$KEY_ALIAS'..."
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore "$KEYSTORE_FILE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "$PASSWORD" \
  -keypass "$PASSWORD" \
  -dname "CN=LinkShelf, OU=Mobile, O=LinkShelf, L=Unknown, ST=Unknown, C=US"

echo ""
echo "✅ Keystore created successfully: $KEYSTORE_FILE"
echo ""
echo "=========================================================="
echo "  Add these secrets to GitHub Repository:"
echo "  (Settings -> Secrets and variables -> Actions -> New secret)"
echo "=========================================================="
echo ""
echo "1. ANDROID_KEYSTORE_PASSWORD"
echo "   $PASSWORD"
echo ""
echo "2. ANDROID_KEY_ALIAS"
echo "   $KEY_ALIAS"
echo ""
echo "3. ANDROID_KEY_PASSWORD"
echo "   $PASSWORD"
echo ""
echo "4. ANDROID_KEYSTORE_BASE64"
echo "   (Copy the string below):"
echo "----------------------------------------------------------"
base64 -w 0 "$KEYSTORE_FILE"
echo ""
echo "----------------------------------------------------------"
echo ""
echo "🔒 Keep $KEYSTORE_FILE in a safe backup. It is ignored by git."
