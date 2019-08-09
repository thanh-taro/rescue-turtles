import Phaser from 'phaser'
import foamBox from './foam-box.png'
import plasticBag from './plastic-bag.png'
import plasticBottle from './plastic-bottle.png'
import plasticCup from './plastic-cup.png'
import plasticDrink from './plastic-drink.png'
import plasticFlipFlops from './plastic-flip-flops.png'

class Gem extends Phaser.GameObjects.Image {
  static get KEY () {
    return 'Gem'
  }

  static get GEM_TYPES () {
    return [
      { gemType: 'foam-box', image: foamBox },
      { gemType: 'plastic-bag', image: plasticBag },
      { gemType: 'plastic-bottle', image: plasticBottle },
      { gemType: 'plastic-cup', image: plasticCup },
      { gemType: 'plastic-drink', image: plasticDrink },
      { gemType: 'plastic-flip-flops', image: plasticFlipFlops }
    ]
  }

  static get RANDOM_GEM_TYPE () {
    const GEM_TYPES = Gem.GEM_TYPES
    return GEM_TYPES[Math.round(Math.random() * (GEM_TYPES.length - 1))].gemType
  }

  static preload (scene) {
    for (let i = 0; i < Gem.GEM_TYPES.length; ++i) {
      const { gemType, image } = Gem.GEM_TYPES[i]
      scene.load.image(Gem.KEY + gemType, image)
    }
  }

  constructor (scene, config = {}) {
    let { gemType } = config
    if (!gemType) gemType = Gem.RANDOM_GEM_TYPE

    super(scene, 0, 0, Gem.KEY + gemType)
    this.setOrigin(0.5)
    this.setType(gemType)

    scene.add.existing(this)
    this.setInteractive({ cursor: 'pointer' })
  }

  setType (value) {
    this.setData('type', value)
  }

  getType () {
    return this.getData('type')
  }

  setColumn (value) {
    this.setData('column', value)
  }

  getColumn () {
    return this.getData('column')
  }

  setRow (value) {
    this.setData('row', value)
  }

  getRow () {
    return this.getData('row')
  }

  setSelected (value = true) {
    this.setData('selected', value)
  }

  getSelected () {
    return this.getData('selected')
  }

  setMatched (value = true) {
    this.setData('matched', value)
  }

  getMatched () {
    return this.getData('matched')
  }
}

export default Gem
