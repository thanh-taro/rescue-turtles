import Phaser from 'phaser'
import turtle from './turtle.png'
import thankYou1 from './thankyou1.mp3'
import thankYou2 from './thankyou2.mp3'
import thankYou3 from './thankyou3.mp3'
import talkBox from './talkbox.png'

class Turtle extends Phaser.GameObjects.Sprite {
  static get KEY () {
    return 'Turtle'
  }

  static preload (scene) {
    scene.load.spritesheet(Turtle.KEY, turtle, { frameWidth: 161, frameHeight: 100 })
    scene.load.audio(Turtle.KEY + 'rescuedSound1', thankYou1)
    scene.load.audio(Turtle.KEY + 'rescuedSound2', thankYou2)
    scene.load.audio(Turtle.KEY + 'rescuedSound3', thankYou3)
    scene.load.image(Turtle.KEY + 'talkBox', talkBox)
  }

  constructor (scene) {
    super(scene, 0, 0, Turtle.KEY, 0)
    this.setOrigin(1)

    scene.add.existing(this)
  }

  rescue (number = 1) {
    const alreadyRescued = this.getData('rescued')
    if (alreadyRescued) return

    this.setFrame(1)

    this.setData('rescued', true)
    const { scene } = this
    const sound = scene.sound.add(Turtle.KEY + 'rescuedSound' + number)
    sound.play()

    const { x, y, displayWidth, displayHeight } = this
    let talk = scene.add.image(x, y - displayHeight, Turtle.KEY + 'talkBox')
    talk.setOrigin(1)
    talk.setScale(displayWidth / talk.width)

    scene.time.delayedCall(3000, () => talk.destroy())
  }
}

export default Turtle
