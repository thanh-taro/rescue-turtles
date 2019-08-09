import Phaser from 'phaser'
import StartGame from '../components/StartGame'
import IntroduceStory from '../components/IntroduceStory'
import GameScene from './GameScene'

class IntroduceScene extends Phaser.Scene {
  static get KEY () {
    return 'IntroduceScene'
  }

  constructor () {
    super({ key: IntroduceScene.KEY })

    this.things = {}
  }

  create () {
    this.createIntroduceStory()
    this.createStartGameButton()

    this.scale.on('resize', this.onResize, this)
    this.scale.refresh()
  }

  onResize (gameSize, baseSize, displaySize, resolution) {
    const { width, height } = gameSize
    this.cameras.resize(width, height)
  }

  shutdown () {
    this.scale.off('resize', this.onResize, this)
    this.things.startGame.destroy()
    this.things.introduceStory.destroy()
  }

  createStartGameButton () {
    this.things.startGame = new StartGame(this, GameScene.KEY, {
      originX: 1,
      originY: 1,
      scale: {
        percentX: 0.98,
        percentY: 0.98,
        fontSizePercent: 0.025
      }
    })
  }

  createIntroduceStory () {
    this.things.introduceStory = new IntroduceStory(this, {
      storyLine: {
        originX: 0,
        originY: 1,
        scale: {
          percentX: 0.04,
          percentY: 0.93,
          fontSizePercent: 0.04
        }
      },
      storyImage: {
        originX: 0.5,
        originY: 1,
        scale: {
          percentX: 0.5,
          percentY: 0.93
        }
      }
    })
  }
}

export default IntroduceScene
