import Phaser from 'phaser'
import background from './background.jpg'

class Background extends Phaser.GameObjects.Image {
  static get KEY () {
    return 'Background'
  }

  static preload (scene) {
    scene.load.image(Background.KEY, background)
  }

  constructor (scene) {
    super(scene, scene.cameras.main.centerX, scene.cameras.main.centerY, Background.KEY)

    this.setOrigin(0.5, 0.5)
    const { width, height } = scene.cameras.main
    const scale = Math.max(width / this.width, height / this.height)
    this.setScale(scale)

    scene.add.existing(this)
    scene.scale.on('resize', this.onResize, this)
  }

  destroy () {
    this.scene.scale.off('resize', this.onResize, this)
    super.destroy()
  }

  onResize (gameSize, baseSize, displaySize, resolution) {
    const { width, height } = gameSize

    this.setPosition(Math.floor(width * 0.5), Math.floor(height * 0.5))
    const scale = Math.max(width / this.width, height / this.height)
    this.setScale(scale)
  }
}

export default Background
