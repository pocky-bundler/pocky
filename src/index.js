import fs from 'fs'
import path from 'path'
import * as acorn from 'acorn'
import * as walk from 'acorn/dist/walk'

export default class Bundler {
  constructor(input, { inputFileSystem = fs } = {}) {
    this.input = path.resolve(input)
    this.inputFileSystem = inputFileSystem
  }

  async bundle() {
    const root = {
      path: this.input,
      content: await this.readFile(this.input)
    }

    this.tree = {
      ...root,
      isRoot: true,
      assets: await this.getAssets(root)
    }
  }

  async getAssets(file) {
    const assets = []

    const ast = acorn.parse(file.content, {
      sourceType: 'module'
    })

    walk.simple(ast, {
      ImportDeclaration(node) {
        assets.push({
          path: path.resolve(path.dirname(file.path), node.source.value),
          importPath: node.source.value,
          importNames: node.specifiers.map(spec => {
            return {
              local: spec.local.name,
              imported: spec.imported ? spec.imported.name : 'default'
            }
          })
        })
      }
    })

    return Promise.all(
      assets.map(async asset => {
        asset.content = await this.readFile(asset.path)
        asset.assets = await this.getAssets(asset)
        return asset
      })
    )
  }

  readFile(filepath) {
    return new Promise((resolve, reject) => {
      // Try .js for now
      this.inputFileSystem.readFile(
        filepath.replace(/(\.js)?$/, '.js'),
        'utf8',
        (err, content) => {
          if (err) return reject(err)
          resolve(content)
        }
      )
    })
  }
}
