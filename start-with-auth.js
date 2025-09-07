const readline = require('readline');
const { spawn } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function hiddenQuestion(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    process.stdin.on('data', function(char) {
      char = char + '';
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function startMagicMirror() {
  try {
    console.log('MagicMirror CalDAV Authentication Setup');
    console.log('=====================================');
    
    const username = await question('CalDAV Username: ');
    const password = await hiddenQuestion('CalDAV Password: ');
    
    rl.close();
    
    // Set environment variables
    process.env.CALDAV_USERNAME = username;
    process.env.CALDAV_PASSWORD = password;
    
    console.log('Starting MagicMirror...');
    
    // Start MagicMirror
    const mm = spawn('npm', ['start'], {
      stdio: 'inherit',
      env: process.env
    });
    
    mm.on('close', (code) => {
      console.log(`MagicMirror exited with code ${code}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

startMagicMirror();
