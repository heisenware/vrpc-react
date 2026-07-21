// Preflight for build/publish: the toolchain needs a Node with
// require(esm) support (eslint config chain) and Vite 8 compatibility.
const [major, minor] = process.versions.node.split('.').map(Number)

const ok =
  major >= 23 ||
  (major === 22 && minor >= 12) ||
  (major === 20 && minor >= 19)

if (!ok) {
  console.error(
    '\nThis repository\'s toolchain requires Node >= 20.19 or >= 22.12 ' +
      `(you are running ${process.versions.node}).\n` +
      'Tip: run "nvm use" (an .nvmrc is provided) and try again.\n'
  )
  process.exit(1)
}
