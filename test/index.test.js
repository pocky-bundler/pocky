import path from 'path'
import Bundler from '../src'

const hideProjectPath = file => {
  return {
    ...file,
    path: file.path.replace(path.join(__dirname, '../'), '/$ownDir/'),
    assets: file.assets.map(asset => hideProjectPath(asset))
  }
}

test('assets', async () => {
  const input = path.join(__dirname, 'fixtures/simple/input.js')
  const bundler = new Bundler(input)
  await bundler.bundle()
  expect(hideProjectPath(bundler.tree)).toMatchSnapshot()
})
