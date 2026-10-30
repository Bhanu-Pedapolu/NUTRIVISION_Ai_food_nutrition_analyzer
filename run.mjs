import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Detect Python executable (.venv preferred)
let pythonCmd = 'python';
const venvPythonWin = path.join(__dirname, '.venv', 'Scripts', 'python.exe');
const venvPythonUnix = path.join(__dirname, '.venv', 'bin', 'python');

if (fs.existsSync(venvPythonWin)) {
  pythonCmd = venvPythonWin;
} else if (fs.existsSync(venvPythonUnix)) {
  pythonCmd = venvPythonUnix;
}

console.log('\n========================================================');
console.log(' 🥗 NutriVision — AI Food Nutrition Analyzer Launcher');
console.log('========================================================\n');
console.log(`[Backend] Using Python: ${pythonCmd}`);

// Check GEMINI_API_KEY
const envPath = path.join(__dirname, 'backend', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your_gemini_api_key_here') || !envContent.includes('GEMINI_API_KEY=')) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  Notice: GEMINI_API_KEY is not configured yet in backend/.env.');
    console.log('\x1b[33m%s\x1b[0m', '   Add your key from https://aistudio.google.com/ to enable food analysis.\n');
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✓ GEMINI_API_KEY detected in backend/.env\n');
  }
}

// 1. Start FastAPI backend (shell: false prevents path-with-space errors on Windows)
console.log('⏳ Starting FastAPI backend on http://127.0.0.1:8000...');
const backend = spawn(pythonCmd, ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', '8000', '--reload'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: false,
});

backend.on('error', (err) => {
  console.error('❌ Failed to start backend:', err.message);
});

// 2. Start Vite frontend
console.log('⏳ Starting Vite frontend dev server...');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const frontend = spawn(npmCmd, ['run', 'dev:vite'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

frontend.on('error', (err) => {
  console.error('❌ Failed to start frontend:', err.message);
});

// 3. Automatically open browser after 2.5 seconds
setTimeout(() => {
  const url = 'http://localhost:5173';
  console.log('\n========================================================');
  console.log(` 🌐 Website ready! Opening: ${url}`);
  console.log('    Press Ctrl + C in this terminal to stop both servers.');
  console.log('========================================================\n');
  const openCmd = process.platform === 'win32' ? `start ${url}` : (process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`);
  spawn(openCmd, { shell: true, stdio: 'ignore' });
}, 2500);

// Cleanup on exit
const cleanExit = () => {
  console.log('\n🛑 Shutting down NutriVision servers...');
  if (backend.pid) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', backend.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
    } else {
      backend.kill('SIGINT');
    }
  }
  if (frontend.pid) {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', frontend.pid.toString(), '/f', '/t'], { stdio: 'ignore' });
    } else {
      frontend.kill('SIGINT');
    }
  }
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
