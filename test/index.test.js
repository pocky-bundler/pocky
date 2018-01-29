import fs from 'fs'
import path from 'path'
import Bundler from '../src'

const hideProjectPath = file => {
  return {
    path: file.path.replace(path.join(__dirname, '../'), '/$ownDir/'),
    assets: file.assets.map(asset => hideProjectPath(asset))
  }
}

test('assets', async () => {
  const inputPath = path.join(__dirname, 'fixtures/simple/input.js')
  const bundler = new Bundler({
    path: inputPath,
    content: fs.readFileSync(inputPath, 'utf8')
  })
  await bundler.bundle()
  expect(hideProjectPath(bundler.tree)).toMatchSnapshot()
})
