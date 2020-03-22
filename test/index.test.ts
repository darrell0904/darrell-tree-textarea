// index.test.ts

import assert from 'assert'
import myFirstFunc from '../src/text'

describe('validate:', () => {
  /**
   * myFirstFunc
   */
  describe('myFirstFunc', () => {
    test(' return hello rollup ', () => {
      assert.strictEqual(myFirstFunc('rollup'), 'hello rollup')
    })
  })
})
