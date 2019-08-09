import CSSFontLoaderFile from './CSSFontLoaderFile'

class QuicksandWebfont {
  static preload (scene) {
    scene.load.addFile(new CSSFontLoaderFile(scene.load, {
      key: 'Webfont-Quicksand-normal',
      fontName: 'Quicksand',
      weight: 'normal'
    }))

    scene.load.addFile(new CSSFontLoaderFile(scene.load, {
      key: 'Webfont-Quicksand-bold',
      fontName: 'Quicksand',
      weight: 'bold'
    }))

    scene.load.addFile(new CSSFontLoaderFile(scene.load, {
      key: 'Webfont-Quicksand-300',
      fontName: 'Quicksand',
      weight: 300
    }))

    scene.load.addFile(new CSSFontLoaderFile(scene.load, {
      key: 'Webfont-Quicksand-500',
      fontName: 'Quicksand',
      weight: 500
    }))
  }
}

export default QuicksandWebfont
