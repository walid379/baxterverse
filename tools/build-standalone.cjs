// Rebuilds the standalone WebUI with ABSOLUTE asset URLs.
// Run through: npm run build:standalone (from komga-webui).
const {spawnSync} = require('child_process')
const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const result = spawnSync(cmd, ['run', 'build'], {
  cwd: process.cwd(),
  env: {...process.env, VUE_APP_STANDALONE: 'true'},
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
if (result.error) {
  console.error(result.error)
  process.exit(1)
}
process.exit(result.status === null ? 1 : result.status)
