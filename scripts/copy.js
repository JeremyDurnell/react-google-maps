/**
 * This file only purpose is to copy files before npm publish and strip churn/security sensitive metadata from package.json
 *
 * **NOTE:**
 * 👉 This file should not use any 3rd party dependency
 */
const { writeFileSync, copyFileSync, statSync, readdirSync } = require('fs')
const { resolve, basename, join, dirname, relative } = require('path')
const packageJson = require('../package.json')

main()

function main() {
  const projectRoot = resolve(__dirname, '..')
  const distPath = resolve(projectRoot, 'dist')
  const distPackageJson = createDistPackageJson(packageJson)
  copyTranslationFile(distPath)

  const cpFiles = [
    'README.md',
    // other files can go here
    '.npmrc',
    'yarn.lock'
  ].map(file => resolve(projectRoot, file))

  cp(cpFiles, distPath)

  writeFileSync(resolve(distPath, 'package.json'), distPackageJson)
}

/**
 *
 * @param {string} distPath
 */
function copyTranslationFile(distPath) {
  syncWalk(resolve('src'))
    .filter(filePath => filePath.endsWith('.rb.json'))
    .forEach(filePath => {
      const newRelath = relative(resolve('src'), filePath)
      cp([filePath], join(distPath, dirname(newRelath)))
    })
}

/**
 *
 * @param {string[]|string} source
 * @param {string} target
 */
function cp(source, target) {
  const isDir = statSync(target).isDirectory()
  if (isDir) {
    if (!Array.isArray(source)) {
      throw new Error('if <target> is directory you need to provide source as an array')
    }

    source.forEach(file => copyFileSync(file, resolve(target, basename(file))))

    return
  }

  copyFileSync(/** @type {string} */ (source), target)
}

/**
 *
 * @param {string} dir - Absolute path
 * @param {string[]} [fileList]
 * @returns {Array}
 */
function syncWalk(dir, fileList = []) {
  const files = readdirSync(dir)
  for (const file of files) {
    const stat = statSync(join(dir, file))
    if (stat.isDirectory()) fileList = syncWalk(join(dir, file), fileList)
    else fileList.push(join(dir, file))
  }
  return fileList
}

/**
 * @param {typeof packageJson} packageConfig
 * @return {string}
 */
function createDistPackageJson(packageConfig) {
  const {
    devDependencies,
    scripts,
    engines,
    config,
    husky,
    'lint-staged': lintStaged,
    ...distPackageJson
  } = packageConfig

  return JSON.stringify(distPackageJson, null, 2)
}
