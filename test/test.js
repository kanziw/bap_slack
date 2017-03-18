import Now from '../src/components/now'
import { MealKey } from '../src/const'

describe('Bap slack', function () {
  it('test should work.', () => {
    true.should.eql(true)
  })

  describe('Now class', () => {
    it('mealKey should be correct.', () => {
      // 1489159960165 : 'Sat Mar 11 2017 00:32:44 GMT+0900 (KST)'
      const now = new Now({ timestamp: 1489159960165 })
      now.mealKey.should.eql(MealKey.LateNightMeal)
    })
  })
})
