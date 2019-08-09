import Phaser from 'phaser'
import FontFaceObserver from 'fontfaceobserver'

class CSSFontLoaderFile extends Phaser.Loader.File {
  constructor (loader, config) {
    config.type = 'webfont'

    super(loader, config)

    this.fontName = config.fontName
    this.weight = config.weight
  }

  load () {
    const { fontName, weight } = this

    const font = new FontFaceObserver(fontName, { weight })
    font.load().then(() => { this.loader.nextFile(this, true) })
  }
}

export default CSSFontLoaderFile
