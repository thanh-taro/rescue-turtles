import Phaser from 'phaser'
import Background from '../components/Background'
import ThemeSound from '../components/ThemeSound'
import GemDice from '../components/GemDice'

class GameScene extends Phaser.Scene {
  static get KEY () {
    return 'GameScene'
  }

  constructor () {
    super({ key: GameScene.KEY })

    this.things = {}
  }

  create () {
    this.setBackground()
    this.playThemeSound()
    this.createGemDice()

    this.scale.on('resize', this.onResize, this)
  }

  onResize (gameSize, baseSize, displaySize, resolution) {
    const { width, height } = gameSize
    this.cameras.resize(width, height)
  }

  setBackground () {
    this.things.background = new Background(this, true)
  }

  playThemeSound () {
    this.things.themeSound = this.sound.add(ThemeSound.KEY)
    this.things.themeSound.play({ loop: true })
  }

  createGemDice () {
    this.things.gemDice = new GemDice(this)
  }
}

export default GameScene
