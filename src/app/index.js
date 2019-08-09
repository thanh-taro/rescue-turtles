/* eslint-disable no-undef */
import './css/fonts.css'
import './css/index.css'
import Game from '../Game'
import config from '../config'

const start = () => (window.game = new Game(config))
if (window.BUILD_TYPE === 'fbinstant') FBInstant.initializeAsync().then(() => start())
else start()
