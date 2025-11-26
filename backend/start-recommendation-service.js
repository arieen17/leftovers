const { spawn } = require('child_process');
const path = require('path');
const { setTimeout } = require('timers/promises');

console.log('🚀 Starting recommendation service...');
const pythonService = spawn('./venv/bin/python', ['main.py'], {
  cwd: path.join(__dirname, '../recommendation-service'),
  stdio: 'inherit'
});

pythonService.on('error', (err) => {
  console.error('❌ Failed to start recommendation service:', err);
});

pythonService.on('close', (code) => {
  console.log(`❌ Recommendation service exited with code ${code}`);
});

console.log('⏳ Waiting for recommendation service to start...');
setTimeout(5000).then(() => {
  console.log('✅ Recommendation service should be ready');
});

process.stdin.resume();