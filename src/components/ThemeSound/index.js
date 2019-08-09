import sound from './sound.mp3'

class ThemeSound {
  static get KEY () {
    return 'ThemeSound'
  }

  static preload (scene) {
    scene.load.audio(ThemeSound.KEY, sound)
  }
}

export default ThemeSound
