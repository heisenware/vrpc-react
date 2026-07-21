// Generates the ESM types entry. It must be a wrapper (not a copy):
// the declaration files use extensionless relative imports, which are
// valid in the CommonJS-format .d.ts files but not in a .d.mts file.
import { writeFileSync } from 'fs'

writeFileSync('dist/index.d.mts', "export * from './index.js'\n")
