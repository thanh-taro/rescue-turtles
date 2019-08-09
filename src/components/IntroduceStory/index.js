import Phaser from 'phaser'
import story1 from './story1.jpg'
import story2 from './story2.jpg'
import story3 from './story3.jpg'
import story4 from './story4.jpg'
import story5 from './story5.jpg'
import story6 from './story6.jpg'
import story7 from './story7.jpg'
import story8 from './story8.jpg'

const storyLines = [
  {
    image: 'IntroduceStoryImage1',
    storyLine: 'Đã có bao giờ bạn suy nghĩ về rác thải trên bãi biển? Nhất là rác thải nhựa?',
    duration: 7
  },
  {
    image: 'IntroduceStoryImage2',
    storyLine: 'Mỗi ngày, có khoảng 22 tấn rác bị thải ra bãi biển. Trong đó có đến 80% là rác thải nhựa.',
    duration: 7
  },
  {
    image: 'IntroduceStoryImage8',
    storyLine: 'Chai nhựa, túi nilon, ly cốc sử dụng 1 lần, ống hút nhựa, áo mưa tiện lợi, dép nhựa,...',
    duration: 7
  },
  {
    image: 'IntroduceStoryImage3',
    storyLine: 'Đã có bao giờ bạn suy nghĩ về tác hại của những rác thải đó?',
    duration: 7
  },
  {
    image: 'IntroduceStoryImage4',
    storyLine: '59% loài chim biển trên thế giới bị ảnh hưởng trực tiếp.',
    duration: 7
  },
  {
    image: 'IntroduceStoryImage5',
    storyLine: '25% loài cá biển đang hứng chịu hậu quả nặng nề.',
    duration: 7
  },
  {
    image: 'IntroduceStoryImage6',
    storyLine: 'Và 100% loài rùa biển đang đứng trước nguy cơ tuyệt chủng.',
    duration: 7
  },
  {
    image: 'IntroduceStoryImage7',
    storyLine: 'Hãy chung tay dọn dẹp rác thải bãi biển để bảo vệ môi trường.',
    duration: 10
  },
  {
    image: null,
    storyLine: 'Có 3 chú rùa biển bị mắc kẹt trong rác thải khiến chúng không thể tìm được đường về nhà. Trong thời gian 3 phút bạn hãy dọn thật nhiều rác thải để giúp 3 chú nhé!',
    duration: 10
  }
]

class IntroduceStoryLine extends Phaser.GameObjects.Text {
  static get KEY () {
    return 'IntroduceStoryLine'
  }

  constructor (scene, config = {}) {
    const { scale, originX, originY } = config

    super(scene, 0, 0, '', {
      fontSize: 22,
      fontFamily: 'Quicksand',
      fontStyle: '500',
      color: '#ffffff'
    })

    this.tweenOnShow = scene.tweens.add({
      targets: this,
      alpha: 1,
      ease: 'Linear',
      duration: 1000,
      paused: true,
      onStart: () => this.setAlpha(0)
    })
    this.setOrigin(originX, originY)
    this.setBackgroundColor('rgba(183, 28, 28, 0.7)')
    this.setData('scaleConfig', scale)

    scene.add.existing(this)
    scene.scale.on('resize', this.onResize, this)
  }

  destroy () {
    this.tweenOnShow.stop()
    this.tweenOnShow.remove()
    this.scene.scale.off('resize', this.onResize, this)
    super.destroy()
  }

  onResize (gameSize, baseSize, displaySize, resolution) {
    const { width, height } = gameSize
    const { percentX, percentY, fontSizePercent } = this.getData('scaleConfig')
    const padding = Math.max(width * (fontSizePercent / 3), height * (fontSizePercent / 3))
    const fontSize = Math.floor(height * fontSizePercent)
    const x = (width * percentX) - padding
    const y = (height * percentY) - padding
    const wordWrapWidth = width * (1 - percentX * 2)

    this.setFontSize(fontSize)
    this.setPosition(x, y)
    this.setPadding(padding, padding, padding, padding)
    this.setWordWrapWidth(wordWrapWidth)
  }

  next (index) {
    const { storyLine, image } = storyLines[index]
    this.setText(storyLine)
    if (image) this.setBackgroundColor('rgba(183, 28, 28, 0.7)')
    else this.setBackgroundColor('rgba(183, 28, 28, 0)')

    this.tweenOnShow.play()
  }
}

class IntroduceStoryImage extends Phaser.GameObjects.Image {
  static get KEY () {
    return 'IntroduceStoryImage'
  }

  static preload (scene) {
    scene.load.image('IntroduceStoryImage1', story1)
    scene.load.image('IntroduceStoryImage2', story2)
    scene.load.image('IntroduceStoryImage3', story3)
    scene.load.image('IntroduceStoryImage4', story4)
    scene.load.image('IntroduceStoryImage5', story5)
    scene.load.image('IntroduceStoryImage6', story6)
    scene.load.image('IntroduceStoryImage7', story7)
    scene.load.image('IntroduceStoryImage8', story8)
  }

  constructor (scene, config = {}) {
    const { scale, originX, originY } = config

    super(scene, 0, 0, IntroduceStoryImage.KEY)
    this.setOrigin(originX, originY)
    this.setData('scaleConfig', scale)

    scene.add.existing(this)
    scene.scale.on('resize', this.onResize, this)
  }

  destroy () {
    this.scene.scale.off('resize', this.onResize, this)
    super.destroy()
  }

  next (index) {
    const { image } = storyLines[index]
    const { percentY } = this.getData('scaleConfig')

    if (!image) this.setAlpha(0)
    else {
      this.setAlpha(1)
      this.setTexture(image)
      const { width, height } = this.scene.cameras.main
      const scale = Math.max(width / this.width, (height * percentY) / this.height)
      this.setScale(scale)
    }
  }

  onResize (gameSize, baseSize, displaySize, resolution) {
    const { width, height } = gameSize
    const { percentX, percentY } = this.getData('scaleConfig')
    const x = width * percentX
    const y = height * percentY
    const scale = Math.max(width / this.width, (height * percentY) / this.height)

    this.setPosition(x, y)
    this.setScale(scale)
  }
}

class IntroduceStory extends Phaser.GameObjects.GameObject {
  static preload (scene) {
    IntroduceStoryImage.preload(scene)
  }

  constructor (scene, config = {}) {
    super(scene, 'IntroduceStory')

    const { storyLine, storyImage } = config
    this.storyImage = new IntroduceStoryImage(scene, storyImage)
    this.storyLine = new IntroduceStoryLine(scene, storyLine)

    scene.updates.add(this)
  }

  update (time, delta) {
    const oldTime = this.getData('oldTime')
    let currentStoryIndex = this.getData('currentStoryIndex')
    if (!currentStoryIndex) currentStoryIndex = 0

    if (
      currentStoryIndex === 0 ||
      (currentStoryIndex < storyLines.length && (time - oldTime >= storyLines[currentStoryIndex - 1].duration * 1000))
    ) {
      const { storyLine, storyImage } = this
      storyLine.next(currentStoryIndex)
      storyImage.next(currentStoryIndex)

      this.setData('currentStoryIndex', currentStoryIndex + 1)
      this.setData('oldTime', time)
    }
  }

  destroy () {
    const { storyLine, storyImage } = this

    storyLine.destroy()
    storyImage.destroy()
    super.destroy()
  }
}

export default IntroduceStory
