const { execSync } = require('child_process');

function run(cmd) {
  console.log('> ' + cmd);
  return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
}

try {
  // First unstage everything
  run('git reset');
  
  // Get all changed files
  const statusOutput = run('git status --porcelain');
  const lines = statusOutput.split('\n').filter(l => l.trim().length > 0);
  const files = lines.map(l => l.trim().substring(2).trim());
  
  console.log(`Total changed files to push: ${files.length}`);
  
  const BATCH_SIZE = 6;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const chunk = files.slice(i, i + BATCH_SIZE);
    console.log(`\n=== Processing Batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(files.length / BATCH_SIZE)} (${chunk.length} files) ===`);
    for (const f of chunk) {
      if (f.includes('generate_cards.py')) {
        run('git rm --cached generate_cards.py 2>nul || git add -u generate_cards.py');
      } else {
        run(`git add "${f}"`);
      }
    }
    const commitMsg = `fix: restore real official card scans batch ${Math.floor(i / BATCH_SIZE) + 1}`;
    run(`git commit -m "${commitMsg}"`);
    
    // Push this batch
    let pushed = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Pushing batch (attempt ${attempt})...`);
        run('git push origin main');
        pushed = true;
        console.log('✓ Batch pushed successfully!');
        break;
      } catch (err) {
        console.error(`Attempt ${attempt} failed: ${err.message}`);
        if (attempt === 3) throw err;
      }
    }
  }
  
  console.log('\n🎉 ALL BATCHES PUSHED SUCCESSFULLY TO GITHUB!');
} catch (e) {
  console.error('Batch push failed:', e.message);
  process.exit(1);
}
