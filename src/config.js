import Phaser from 'phaser'
import RoundRectanglePlugin from './libs/rexroundrectangleplugin.min'
import PhaserUpdatePlugin from 'phaser-plugin-update'
import PreloaderScene from './scenes/PreloaderScene'
import IntroduceScene from './scenes/IntroduceScene'
import GameScene from './scenes/GameScene'

export default {
  title: 'Rescue Turtle',
  version: '1.0.0',
  type: Phaser.AUTO,
  backgroundColor: '#000000',
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'game-panel',
    width: '100%',
    height: '100%',
    resolution: window.devicePixelRatio || 1
  },
  autoRound: true,
  render: {
    roundPixels: true,
    powerPreference: 'high-performance' // 'high-performance', 'low-power' or 'default'
  },
  plugins: {
    global: [{ key: 'rexRoundRectanglePlugin', plugin: RoundRectanglePlugin, start: true }],
    scene: [{ key: 'registerToUpdateListPlugin', plugin: PhaserUpdatePlugin, mapping: 'updates' }]
  },
  scene: [ PreloaderScene, IntroduceScene, GameScene ]
}
