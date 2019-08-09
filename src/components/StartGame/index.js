import Phaser from 'phaser'

class StartGame extends Phaser.GameObjects.Text {
  static get KEY () {
    return 'StartGame'
  }

  constructor (scene, destinationScene, config = {}) {
    const { scale, originX, originY } = config

    super(scene, 0, 0, 'Bắt đầu trò chơi >>>', {
      fontSize: 24,
      fontFamily: 'Quicksand',
      fontStyle: 'bold',
      color: '#ffffff'
    })

    this.setOrigin(originX, originY)
    this.setData('scaleConfig', scale)
    this.setData('destinationScene', destinationScene)

    scene.add.existing(this)
    scene.children.bringToTop(this)

    this.setInteractive({ cursor: 'pointer' })
    this.on('pointerdown', this.onPointerDown, this)
    scene.scale.on('resize', this.onResize, this)
  }

  destroy () {
    this.off('pointerdown', this.onPointerDown, this)
    this.scene.scale.off('resize', this.onResize, this)

    super.destroy()
  }

  onPointerDown (pointer, x, y, event) {
    if (event) event.stopPropagation()

    let { scene } = this.scene
    scene.shutdown()
    scene.start(this.getData('destinationScene'))
    scene.remove()
  }

  onResize (gameSize, baseSize, displaySize, resolution) {
    const { width, height } = gameSize
    const { percentX, percentY, fontSizePercent } = this.getData('scaleConfig')
    const fontSize = Math.floor(height * fontSizePercent)
    const x = width * percentX
    const y = height * percentY

    this.setFontSize(fontSize)
    this.setPosition(x, y)
  }
}

export default StartGame
