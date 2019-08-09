import sound from './coin-sound.mp3'

class CoinSound {
  static get KEY () {
    return 'CoinSound'
  }

  static preload (scene) {
    scene.load.audio(CoinSound.KEY, sound)
  }
}

export default CoinSound
