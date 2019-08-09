import Phaser from 'phaser'
import QuicksandWebfont from '../components/QuicksandWebfont'
import IntroduceScene from './IntroduceScene'
import Background from '../components/Background'
import ThemeSound from '../components/ThemeSound'
import IntroduceStory from '../components/IntroduceStory'
import Gem from '../components/Gem'
import CoinSound from '../components/CoinSound'
import Turtle from '../components/Turtle'

class PreloaderScene extends Phaser.Scene {
  static get KEY () {
    return 'PreloaderScene'
  }

  constructor () {
    super({ key: PreloaderScene.KEY })
  }

  preload () {
    const { BUILD_TYPE } = window
    if (BUILD_TYPE === 'fbinstant') {
      this.facebook.once('startgame', this.startGame, this)
      this.facebook.showLoadProgress(this)
    } else {
      this.makeLoadBar()
      this.load.on('complete', () => { this.startGame() })
    }

    QuicksandWebfont.preload(this)
    Background.preload(this)
    ThemeSound.preload(this)
    CoinSound.preload(this)
    IntroduceStory.preload(this)
    Gem.preload(this)
    Turtle.preload(this)
  }

  startGame () {
    this.scene.start(IntroduceScene.KEY)
  }

  makeLoadBar () {
    const loadingWidth = Math.min(this.cameras.main.width * 0.8, 500)
    const loadingHeight = 30
    const centerX = this.cameras.main.centerX
    const centerY = this.cameras.main.centerY

    let progressBar = this.add.graphics()
    let progressBox = this.add.graphics()
    progressBox.fillStyle(0x222222, 0.8)
    progressBox.fillRect(centerX - loadingWidth / 2, centerY - loadingHeight / 2, loadingWidth, loadingHeight)

    let loadingText = this.make.text({
      x: centerX,
      y: centerY - loadingHeight / 2 - 18,
      text: 'Đang tải trò chơi ...',
      style: {
        font: '16px monospace',
        fill: '#ffffff'
      }
    })
    loadingText.setOrigin(0.5, 0.5)

    let percentText = this.make.text({
      x: centerX,
      y: centerY,
      text: '0%',
      style: {
        font: '14px monospace',
        fill: '#ffffff'
      }
    })
    percentText.setOrigin(0.5, 0.5)

    let assetText = this.make.text({
      x: centerX,
      y: centerY + loadingHeight / 2 + 14,
      text: '',
      style: {
        font: '12px monospace',
        fill: '#ffffff'
      }
    })
    assetText.setOrigin(0.5, 0.5)

    this.load.on('progress', (value) => {
      percentText.setText(parseInt(value * 100) + '%')
      progressBar.clear()
      progressBar.fillStyle(0x66bb6a, 1)
      progressBar.fillRect(centerX - loadingWidth / 2 + 10, centerY - loadingHeight / 2 + 10, (loadingWidth - 20) * value, loadingHeight - 20)
    })

    this.load.on('fileprogress', (file) => {
      assetText.setText('Đang tải tập tin: ' + file.key)
    })

    this.load.on('complete', () => {
      progressBar.destroy()
      progressBox.destroy()
      loadingText.destroy()
      percentText.destroy()
      assetText.destroy()
    })

    assetText.setText('Đang tải font chữ: Quicksand')
  }
}

export default PreloaderScene
