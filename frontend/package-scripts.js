// package-scripts.js - 自定義安裝腳本
const { execSync } = require('child_process');

function installWithLegacyDeps() {
  console.log('🔧 安裝依賴 (使用 legacy-peer-deps)...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
}

function checkDeps() {
  console.log('🔍 檢查依賴版本衝突...');
  try {
    execSync('npm ls --depth=0', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  發現版本衝突，請使用 --legacy-peer-deps');
  }
}

module.exports = { installWithLegacyDeps, checkDeps };
