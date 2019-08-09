import Phaser from 'phaser'
import Gem from '../Gem'
import CoinSound from '../CoinSound'
import Turtle from '../Turtle'

class GemDice extends Phaser.GameObjects.GameObject {
  static get KEY () {
    return 'GemDice'
  }

  constructor (scene) {
    super(scene, GemDice.KEY)

    const { width, height } = scene.cameras.main
    this.calculateSizeAndPosition({ width, height })
    this.initDice()
    this.initGems()

    scene.scale.on('resize', this.onResize, this)
    scene.input.on('gameobjectdown', this.onSelectGem, this)
    scene.input.on('gameobjectup', this.onDeselectGem, this)
    scene.input.on('gameobjectmove', this.onSwipe, this)
    scene.updates.add(this)

    scene.time.delayedCall(1500, () => this.setGameState('running'))
  }

  onResize (gameSize, baseSize, displaySize, resolution) {
    this.calculateSizeAndPosition(gameSize)

    this.resizeDice()
    this.resizeGems()
  }

  onSelectGem (pointer, gem, event) {
    event.stopPropagation()

    this.setData('canSwipe', false)

    if (this.tweenOnSuggestion) {
      this.tweenOnSuggestion.stop(0)
      this.tweenOnSuggestion = null
      delete this.tweenOnSuggestion
    }

    if (this.getDiceBusy() || this.getGameState() !== 'running') return

    const { scene } = this

    // Deselect
    if (gem.getSelected() && this.oldSelected) {
      this.tweenOnSelect.stop(0)
      delete this.tweenOnSelect
      gem.setSelected(false)
      this.oldSelected.setSelected(false)
      this.oldSelected = null
      delete this.oldSelected

      return
    }

    // First select
    if (!this.oldSelected) {
      gem.setSelected(true)
      scene.children.bringToTop(gem)
      this.oldSelected = gem
      this.tweenOnSelect = scene.tweens.add({
        targets: gem,
        duration: 2000,
        rotation: 2 * Math.PI,
        repeat: -1
      })

      this.setData('canSwipe', true)

      return
    }

    // Can swap
    if (this.swapGems(gem, this.oldSelected)) {
      this.tweenOnSelect.stop(0)
      delete this.tweenOnSelect
      gem.setSelected(false)
      this.oldSelected.setSelected(false)
      this.oldSelected = null
      delete this.oldSelected

      return
    }

    // Change to first select
    this.tweenOnSelect.stop(0)
    delete this.tweenOnSelect
    this.oldSelected.setSelected(false)
    gem.setSelected(true)
    scene.children.bringToTop(gem)
    this.oldSelected = gem
    this.tweenOnSelect = scene.tweens.add({
      targets: gem,
      duration: 2000,
      rotation: 2 * Math.PI,
      repeat: -1
    })
  }

  onSwipe (pointer, gem, event) {
    event.stopPropagation()

    if (!this.getData('canSwipe')) return

    if (this.tweenOnSuggestion) {
      this.tweenOnSuggestion.stop(0)
      this.tweenOnSuggestion = null
      delete this.tweenOnSuggestion
    }

    if (gem.getSelected() || !this.oldSelected) return

    if (!this.swapGems(gem, this.oldSelected)) return

    this.tweenOnSelect.stop(0)
    delete this.tweenOnSelect
    gem.setSelected(false)
    this.oldSelected.setSelected(false)
    this.oldSelected = null
    delete this.oldSelected
  }

  onDeselectGem (pointer, gem, event) {
    event.stopPropagation()
    this.setData('canSwipe', false)
  }

  destroy () {
    this.timeBar.destroy()
    this.scoreBar.destroy()
    this.scoreValueBar.destroy()
    this.dicetimeBar.destroy()

    delete this.timeBar
    delete this.scoreBar
    delete this.scoreValueBar
    delete this.dicetimeBar

    super.destroy()
  }

  addScoreMultiple (value = 1) {
    const scoreMultiple = this.getData('scoreMultiple') || 0
    this.setData('scoreMultiple', scoreMultiple + value)
  }

  resetScoreMultiple () {
    this.setData('scoreMultiple', 1)
  }

  setDiceBusy (value = true) {
    this.setData('diceBusy', value)
  }

  getDiceBusy () {
    return this.getData('diceBusy')
  }

  getScoreMultiple () {
    return this.getData('scoreMultiple') || 1
  }

  getScorePerGem () {
    return 10
  }

  getWinScore () {
    return 9000
  }

  getTimeLimit () {
    return 3 * 60 // seconds
  }

  addTime (value = 1) {
    const currentTime = this.getData('time') || 0
    const time = currentTime + value
    const { timeBar } = this
    const remainTime = this.getTimeLimit() - time
    const minutes = Math.max(0, Math.floor(remainTime / 60))
    const seconds = Math.max(0, remainTime % 60)
    let displayTime = ''
    if (minutes > 9) displayTime += minutes + ':'
    else displayTime += '0' + minutes + ':'
    if (seconds > 9) displayTime += seconds
    else displayTime += '0' + seconds

    this.setData('time', currentTime + value)
    timeBar.setText(displayTime)

    if (remainTime <= 0) {
      this.setGameState('finished')
      this.checkResult()
    } else this.checkResult(true)
  }

  getTime () {
    return this.getData('time')
  }

  addScore (value) {
    const oldScore = this.getData('score') || 0
    const currentScore = oldScore + value
    const scoreCompletePercent = currentScore / this.getWinScore()
    this.setData('score', currentScore)

    let { scoreBar, scoreValueBar } = this
    scoreValueBar.displayWidth = scoreBar.displayWidth * Math.min(1, scoreCompletePercent)

    if (scoreCompletePercent > 0.33) this.turtle1.rescue(1)
    if (scoreCompletePercent > 0.66) this.turtle2.rescue(2)
    if (scoreCompletePercent >= 1) this.turtle3.rescue(3)

    this.checkResult(true)
  }

  getScore () {
    return this.getData('score')
  }

  setGameState (value = 'running') {
    this.setData('gameState', value)
  }

  getGameState () {
    return this.getData('gameState')
  }

  checkResult (canWinOnly = false) {
    const score = this.getScore()
    const winScore = this.getWinScore()
    if (score >= winScore) this.setGameState('win')
    else if (!canWinOnly) this.setGameState('loose')
  }

  win () {
    this.setGameState('ended')

    const { scene } = this
    const { centerX, centerY } = scene.cameras.main
    const text = scene.add.text(centerX, centerY, 'Chiến Thắng!!!', {
      fontSize: 36,
      fontFamily: 'Quicksand',
      fontStyle: 'bold',
      color: '#ffffff'
    })
    text.setBackgroundColor('#000000')
    text.setPadding(20)
    text.setOrigin(0.5)

    this.resultText = text
  }

  loose () {
    this.setGameState('ended')

    const { scene } = this
    const { centerX, centerY } = scene.cameras.main
    const text = scene.add.text(centerX, centerY, 'Thua Cuộc!!!', {
      fontSize: 36,
      fontFamily: 'Quicksand',
      fontStyle: 'bold',
      color: '#ffffff'
    })
    text.setBackgroundColor('#000000')
    text.setPadding(20)
    text.setOrigin(0.5)

    this.resultText = text
  }

  getDiceConfig () {
    const rows = 10
    const columns = 7
    const padding = 0.04
    const bottomLimit = 0.17

    return { rows, columns, padding, bottomLimit }
  }

  setTiles (tiles = []) {
    this.setData('tiles', tiles)
  }

  getTiles () {
    return this.getData('tiles') || []
  }

  setPosition (x, y) {
    this.setData('position', { x, y })
  }

  getPosition () {
    return this.getData('position')
  }

  setSize (width, height, padding, bottomSizeLimit) {
    this.setData('size', { width, height, padding, bottomSizeLimit })
  }

  getSize () {
    return this.getData('size')
  }

  setGemSize (gemSize) {
    this.setData('gemSize', gemSize)
  }

  getGemSize () {
    return this.getData('gemSize')
  }

  setGameSize (width, height) {
    this.setData('gameSize', { width, height })
  }

  getGameSize () {
    return this.getData('gameSize')
  }

  calculateSizeAndPosition (gameSize) {
    const { width, height } = gameSize
    this.setGameSize(width, height)

    const { rows, columns, padding, bottomLimit } = this.getDiceConfig()

    const dicePadding = Math.min(width * padding, height * padding)
    const bottomSizeLimit = (height * bottomLimit)
    let diceWidth = width - (2 * dicePadding)
    let diceHeight = height - (2 * dicePadding) - bottomSizeLimit
    const gemSize = Math.floor(Math.min((diceWidth / columns), (diceHeight / rows)))

    diceWidth = gemSize * columns
    diceHeight = gemSize * rows

    const x = (width - diceWidth) / 2
    const y = (height - bottomSizeLimit - diceHeight) / 2

    let tiles = []
    for (let row = 0; row < rows; ++row) {
      let tilesInRow = []
      for (let column = 0; column < columns; ++column) {
        const gemX = (column * gemSize + x) + gemSize / 2
        const gemY = (row * gemSize + y) + gemSize / 2
        tilesInRow[column] = { x: gemX, y: gemY, size: gemSize }
      }

      tiles[row] = tilesInRow
    }

    this.setGameSize(width, height)
    this.setPosition(x, y)
    this.setSize(diceWidth, diceHeight, dicePadding, bottomSizeLimit)
    this.setGemSize(gemSize)
    this.setTiles(tiles)
  }

  initDice () {
    const { scene } = this

    let dice = scene.add.rexRoundRectangle(0, 0, 1000, 1000, 20, 0xffffff)
    dice.setOrigin(0)
    dice.setAlpha(0.85)

    let timeBar = scene.add.text(0, 0, '00:00', {
      fontSize: 22,
      fontFamily: 'monospace',
      fontStyle: 'bold',
      color: '#ffffff'
    })
    timeBar.setOrigin(0, 1)
    timeBar.setBackgroundColor('#D84315')
    timeBar.setPadding(15, 5, 15, 5)

    let scoreBar = scene.add.rectangle(0, 0, 100, 100, 0xffffff)
    scoreBar.setOrigin(0, 1)
    let scoreValueBar = scene.add.rectangle(0, 0, 100, 100, 0x2196F3)
    scoreValueBar.setOrigin(0, 1)

    let scoreSound = scene.sound.add(CoinSound.KEY)

    let turtle1 = new Turtle(scene)
    let turtle2 = new Turtle(scene)
    let turtle3 = new Turtle(scene)

    this.timeBar = timeBar
    this.scoreBar = scoreBar
    this.scoreValueBar = scoreValueBar
    this.dice = dice
    this.scoreSound = scoreSound
    this.turtle1 = turtle1
    this.turtle2 = turtle2
    this.turtle3 = turtle3

    this.resizeDice()
  }

  resizeDice () {
    const { width, height } = this.getGameSize()
    const position = this.getPosition()
    const diceX = position.x
    const size = this.getSize()
    const diceWidth = size.width
    const dicePadding = size.padding
    const bottomSizeLimit = size.bottomSizeLimit
    const diceBGPadding = 5
    const { dice, timeBar, scoreBar, scoreValueBar, turtle1, turtle2, turtle3, resultText } = this

    dice.setPosition(position.x - diceBGPadding, position.y - diceBGPadding)
    dice.setDisplaySize(size.width + diceBGPadding * 2, size.height + diceBGPadding * 2)

    const timeTextHeight = height - bottomSizeLimit - dicePadding
    const fontSize = Math.min(36, Math.floor(timeTextHeight * 0.25))
    const timeBarX = diceX
    const timeBarY = height - dicePadding
    timeBar.setFontSize(fontSize)
    timeBar.setPosition(timeBarX, timeBarY)

    const scoreBarX = diceX + timeBar.width
    const scoreBarY = timeBarY - 1
    const scoreBarWidth = diceWidth - timeBar.width + diceBGPadding / 2
    const scoreBarHeight = 10
    scoreBar.setPosition(scoreBarX, scoreBarY)
    scoreBar.setDisplaySize(scoreBarWidth, scoreBarHeight)
    scoreValueBar.setPosition(scoreBarX, scoreBarY)
    scoreValueBar.setDisplaySize(scoreBarWidth * (this.getScore() / this.getWinScore()), scoreBarHeight)

    const turtle1X = scoreBarX + (scoreBarWidth / 3)
    const turtle2X = scoreBarX + (scoreBarWidth / 3 * 2)
    const turtle3X = scoreBarX + scoreBarWidth
    const turtleY = scoreBarY
    const turtleScale = Math.min(((scoreBarWidth / 3) * 0.85) / turtle1.width, timeBar.height / turtle1.height)
    turtle1.setPosition(turtle1X, turtleY)
    turtle2.setPosition(turtle2X, turtleY)
    turtle3.setPosition(turtle3X, turtleY)
    turtle1.setScale(turtleScale)
    turtle2.setScale(turtleScale)
    turtle3.setScale(turtleScale)

    if (resultText) resultText.setPosition(width / 2, height / 2)
  }

  initGems () {
    this.setDiceBusy(true)

    const { rows, columns } = this.getDiceConfig()
    let { gems } = this
    if (!gems) gems = []
    else {
      for (let row = 0; row < rows; ++row) {
        for (let column = 0; column < columns; ++column) {
          if (gems[row][column]) gems[row][column].destroy()
        }
      }
    }

    for (let row = 0; row < rows; ++row) {
      gems[row] = []
      for (let column = 0; column < columns; ++column) gems[row][column] = this.createGem(row, column, true, 1000, rows)
    }
    this.gems = gems

    const { scene } = this
    scene.time.delayedCall(1100, () => this.run())
  }

  resizeGems () {
    const { rows, columns } = this.getDiceConfig()
    const { gems } = this
    const tiles = this.getTiles()

    for (let row = 0; row < rows; ++row) {
      for (let column = 0; column < columns; ++column) {
        let gem = gems[row][column]
        if (!gem) continue

        const { x, y, size } = tiles[row][column]
        gem.setDisplaySize(size, size)
        gem.setPosition(x, y)
      }
    }
  }

  createGem (row, column, falling = true, animationTime = 1000, fallSteps = 13) {
    const { scene } = this
    const tiles = this.getTiles()
    const dicePosition = this.getPosition()
    const { x, y, size } = tiles[row][column]

    let gem = new Gem(scene)
    gem.setDisplaySize(size, size)
    gem.setColumn(column)
    gem.setRow(row)
    if (falling) {
      gem.setPosition(x, (dicePosition.y + size / 2) - (fallSteps - row) * size)
      scene.tweens.add({
        targets: gem,
        duration: animationTime,
        x,
        y
      })
    } else gem.setPosition(x, y)

    return gem
  }

  checkMatchOnGem (gem) {
    const { rows, columns } = this.getDiceConfig()
    const row = gem.getRow()
    const column = gem.getColumn()
    const { gems } = this
    let matchedList = []

    let _row = row
    let countVertical = 1
    let matchedListVertical = []
    while (true) {
      if (--_row < 0 || !gems[_row][column] || gems[_row][column].getType() !== gem.getType()) break
      matchedListVertical.push(gems[_row][column])
      ++countVertical
    }
    _row = row
    while (true) {
      if (++_row === rows || !gems[_row][column] || gems[_row][column].getType() !== gem.getType()) break
      matchedListVertical.push(gems[_row][column])
      ++countVertical
    }
    if (countVertical < 3) {
      matchedListVertical = []
      countVertical = 0
    } else {
      for (let i = 0; i < matchedListVertical.length; ++i) {
        matchedListVertical[i].setMatched(true)
        matchedList.push(matchedListVertical[i])
      }
    }

    let _column = column
    let countHorizontal = 1
    let matchedListHorizontal = []
    while (true) {
      if (--_column < 0 || !gems[row][_column] || gems[row][_column].getType() !== gem.getType()) break
      matchedListHorizontal.push(gems[row][_column])
      ++countHorizontal
    }
    _column = column
    while (true) {
      if (++_column === columns || !gems[row][_column] || gems[row][_column].getType() !== gem.getType()) break
      matchedListHorizontal.push(gems[row][_column])
      ++countHorizontal
    }
    if (countHorizontal < 3) {
      matchedListHorizontal = []
      countHorizontal = 0
    } else {
      for (let i = 0; i < matchedListHorizontal.length; ++i) {
        matchedListHorizontal[i].setMatched(true)
        matchedList.push(matchedListHorizontal[i])
      }
    }

    if (countVertical === 0 && countHorizontal === 0) return false

    gem.setMatched(true)
    matchedList.push(gem)

    return true
  }

  run () {
    this.setDiceBusy(true)
    this.setStuckTime(0)

    const { gems } = this
    const { rows, columns } = this.getDiceConfig()
    let hasMatched = false

    for (let row = 0; row < rows; ++row) {
      for (let column = 0; column < columns; ++column) {
        let gem = gems[row][column]
        if (!gem) continue

        if (this.checkMatchOnGem(gem)) hasMatched = true
      }
    }

    if (hasMatched) {
      this.clearSuggestion()
      this.addScoreMultiple(1)
      this.scoreGems()
    } else {
      this.clearSuggestion()
      this.resetScoreMultiple()
      this.setDiceBusy(false)
      const { scene } = this
      scene.time.delayedCall(10, () => {
        if (!this.moveable()) this.initGems()
      })
    }
  }

  scoreGems () {
    const { gems, scene, scoreSound } = this
    const { rows, columns } = this.getDiceConfig()
    const animationTime = 400

    let scoreList = []
    for (let row = 0; row < rows; ++row) {
      for (let column = 0; column < columns; ++column) {
        let gem = gems[row][column]
        if (!gem || !gem.getMatched()) continue

        gem.setMatched(false)
        scoreList.push(gem)
        gems[row][column] = null
      }
    }

    const scorePerGem = this.getScorePerGem()
    const scoreMultiple = this.getScoreMultiple()
    const score = scorePerGem * scoreMultiple
    this.addScore(scoreList.length * score)

    scoreSound.play({ volume: 0.2 + Math.min(0.8, 0.2 * scoreMultiple) })

    for (let i = 0; i < scoreList.length; ++i) {
      const gem = scoreList[i]

      scene.tweens.add({
        targets: gem,
        duration: animationTime,
        rotation: 2 * Math.PI,
        repeat: -1
      })
      scene.tweens.add({
        targets: gem,
        duration: animationTime,
        scale: 0
      })

      const scoreText = scene.add.text(gem.x, gem.y, score, {
        fontSize: gem.displayHeight * 0.6,
        fontFamily: 'monospace',
        fontStyle: 'bold',
        color: '#E91E63'
      })
      scoreText.setOrigin(0.5)
      scene.time.delayedCall(animationTime + 200, () => scoreText.destroy())
    }
    scene.time.delayedCall(animationTime + 50, () => {
      for (let i = 0; i < scoreList.length; ++i) {
        const gem = scoreList[i]
        gem.destroy()
      }

      this.fallGems()
    })
  }

  fallGems () {
    const { scene } = this
    let { gems } = this
    const tiles = this.getTiles()
    const { rows, columns } = this.getDiceConfig()
    const animationTimePerTile = 80
    let maxAnimationTime = 0

    let fallStepList = []
    for (let row = 0; row < rows; ++row) {
      fallStepList[row] = []
      for (let column = 0; column < columns; ++column) fallStepList[row][column] = 0
    }

    let newGemCountInColumn = []
    for (let column = 0; column < columns; ++column) {
      newGemCountInColumn[column] = 0
    }
    for (let column = 0; column < columns; ++column) {
      for (let row = rows - 1; row >= 0; --row) {
        let gem = gems[row][column]
        if (gem) continue

        ++newGemCountInColumn[column]

        let _row = row
        while (--_row >= 0) {
          if (gems[_row][column]) ++fallStepList[_row][column]
        }
      }
    }

    for (let row = rows - 1; row >= 0; --row) {
      for (let column = 0; column < columns; ++column) {
        let gem = gems[row][column]
        if (!gem) continue

        const fallSteps = fallStepList[row][column]
        if (fallSteps === 0) continue

        const newRow = row + fallSteps
        gem.setRow(newRow)
        gems[row][column] = null
        gems[newRow][column] = gem

        const animationTime = animationTimePerTile * fallSteps
        maxAnimationTime = Math.max(animationTime, maxAnimationTime)

        const { x, y } = tiles[newRow][column]
        scene.tweens.add({
          targets: gem,
          duration: animationTime,
          x,
          y
        })
      }
    }

    for (let column = 0; column < columns; ++column) {
      let count = newGemCountInColumn[column]
      if (count === 0) continue
      for (let row = 0; row < count; ++row) {
        const animationTime = count * animationTimePerTile
        maxAnimationTime = Math.max(animationTime, maxAnimationTime)
        const gem = this.createGem(row, column, true, animationTime, count)
        gems[row][column] = gem
      }
    }

    scene.time.delayedCall(maxAnimationTime + 30, () => this.run())
  }

  swapGems (gemA, gemB, noCheckMatch = false) {
    if (!gemA || !gemB) return

    this.setDiceBusy(true)

    const { scene } = this
    let { gems } = this
    const tiles = this.getTiles()
    const animationTime = 200

    const gemARow = gemA.getRow()
    const gemAColumn = gemA.getColumn()
    const gemBRow = gemB.getRow()
    const gemBColumn = gemB.getColumn()

    if (Math.abs(gemARow - gemBRow) > 1 || Math.abs(gemAColumn - gemBColumn) > 1 || (Math.abs(gemARow - gemBRow) === 1 && Math.abs(gemAColumn - gemBColumn) === 1)) {
      this.setDiceBusy(false)
      return false
    }

    gems[gemARow][gemAColumn] = gemB
    gems[gemBRow][gemBColumn] = gemA
    gemA.setRow(gemBRow)
    gemA.setColumn(gemBColumn)
    gemB.setRow(gemARow)
    gemB.setColumn(gemAColumn)

    scene.tweens.add({
      targets: gemA,
      duration: animationTime,
      x: tiles[gemBRow][gemBColumn].x,
      y: tiles[gemBRow][gemBColumn].y
    })
    scene.tweens.add({
      targets: gemB,
      duration: animationTime,
      x: tiles[gemARow][gemAColumn].x,
      y: tiles[gemARow][gemAColumn].y,
      onComplete: () => {
        if (noCheckMatch) {
          this.setDiceBusy(false)
          return
        }

        const matchedOnGemA = this.checkMatchOnGem(gemA)
        const matchedOnGemB = this.checkMatchOnGem(gemB)
        if (!matchedOnGemA && !matchedOnGemB) return this.swapGems(gemA, gemB, true)

        this.scoreGems()
      }
    })

    return true
  }

  moveable () {
    const { gems } = this
    const { rows, columns } = this.getDiceConfig()

    for (let column = 0; column < columns; ++column) {
      for (let row = 0; row < rows; ++row) {
        let gem = gems[row][column]
        if (!gem) continue

        const gemType = gem.getType()
        let sameTypeGem
        let sameTypeGemDirection
        let sameTypeGemRow
        if (row - 1 >= 0) {
          sameTypeGemRow = row - 1
          const prevGemInRow = gems[sameTypeGemRow][column]
          sameTypeGem = (!prevGemInRow || prevGemInRow.getType() !== gemType) ? null : prevGemInRow
          sameTypeGemDirection = -1
        }
        if (!sameTypeGem && row + 1 < rows) {
          sameTypeGemRow = row + 1
          const nextGemInRow = gems[sameTypeGemRow][column]
          sameTypeGem = (!nextGemInRow || nextGemInRow.getType() !== gemType) ? null : nextGemInRow
          sameTypeGemDirection = 1
        }
        if (!sameTypeGem) continue

        // Left neighbors
        let leftNeighborColumn = column - 1
        if (leftNeighborColumn >= 0) {
          let leftNeighborRow = sameTypeGemDirection === 1 ? row - 1 : sameTypeGemRow - 1
          if (leftNeighborRow >= 0) {
            const leftNeighborGem = gems[leftNeighborRow][leftNeighborColumn]
            if (leftNeighborGem && leftNeighborGem.getType() === gemType) {
              this.setSuggestion(leftNeighborGem, 'right')
              return true
            }
          }
          leftNeighborRow = sameTypeGemDirection === 1 ? sameTypeGemRow + 1 : row + 1
          if (leftNeighborRow < rows) {
            const leftNeighborGem = gems[leftNeighborRow][leftNeighborColumn]
            if (leftNeighborGem && leftNeighborGem.getType() === gemType) {
              this.setSuggestion(leftNeighborGem, 'right')
              return true
            }
          }
        }

        // Right neighbors
        let rightNeighborColumn = column + 1
        if (rightNeighborColumn >= 0) {
          let rightNeighborRow = sameTypeGemDirection === 1 ? row - 1 : sameTypeGemRow - 1
          if (rightNeighborRow >= 0) {
            const rightNeighborGem = gems[rightNeighborRow][rightNeighborColumn]
            if (rightNeighborGem && rightNeighborGem.getType() === gemType) {
              this.setSuggestion(rightNeighborGem, 'left')
              return true
            }
          }
          rightNeighborRow = sameTypeGemDirection === 1 ? sameTypeGemRow + 1 : row + 1
          if (rightNeighborRow < rows) {
            const rightNeighborGem = gems[rightNeighborRow][rightNeighborColumn]
            if (rightNeighborGem && rightNeighborGem.getType() === gemType) {
              this.setSuggestion(rightNeighborGem, 'left')
              return true
            }
          }
        }

        // Up neighbor
        let upNeighborRow = sameTypeGemDirection === -1 ? sameTypeGemRow - 2 : row - 2
        if (upNeighborRow >= 0) {
          const upNeighborGem = gems[upNeighborRow][column]
          if (upNeighborGem && upNeighborGem.getType() === gemType) {
            this.setSuggestion(upNeighborGem, 'down')
            return true
          }
        }

        // Down neighbor
        let downNeighborRow = sameTypeGemDirection === 1 ? sameTypeGemRow + 2 : row + 2
        if (downNeighborRow < rows) {
          const downNeighborGem = gems[downNeighborRow][column]
          if (downNeighborGem && downNeighborGem.getType() === gemType) {
            this.setSuggestion(downNeighborGem, 'up')
            return true
          }
        }
      }
    }

    for (let row = 0; row < rows; ++row) {
      for (let column = 0; column < columns; ++column) {
        let gem = gems[row][column]
        if (!gem) continue

        const gemType = gem.getType()
        let sameTypeGem
        let sameTypeGemDirection
        let sameTypeGemColumn
        if (column - 1 >= 0) {
          sameTypeGemColumn = column - 1
          const prevGemInColumn = gems[row][sameTypeGemColumn]
          sameTypeGem = (!prevGemInColumn || prevGemInColumn.getType() !== gemType) ? null : prevGemInColumn
          sameTypeGemDirection = -1
        }
        if (!sameTypeGem && column + 1 < columns) {
          sameTypeGemColumn = column + 1
          const nextGemInColumn = gems[row][sameTypeGemColumn]
          sameTypeGem = (!nextGemInColumn || nextGemInColumn.getType() !== gemType) ? null : nextGemInColumn
          sameTypeGemDirection = 1
        }
        if (!sameTypeGem) continue

        // Left neighbor
        let leftNeighborColumn = sameTypeGemDirection === 1 ? column - 2 : sameTypeGemColumn - 2
        if (leftNeighborColumn >= 0) {
          const leftNeighborGem = gems[row][leftNeighborColumn]
          if (leftNeighborGem && leftNeighborGem.getType() === gemType) {
            this.setSuggestion(leftNeighborGem, 'right')
            return true
          }
        }

        // Right neighbor
        let rightNeighborColumn = sameTypeGemDirection === -1 ? column + 2 : sameTypeGemColumn + 2
        if (rightNeighborColumn < columns) {
          const rightNeighborGem = gems[row][rightNeighborColumn]
          if (rightNeighborGem && rightNeighborGem.getType() === gemType) {
            this.setSuggestion(rightNeighborGem, 'left')
            return true
          }
        }

        // Up neighbors
        let upNeighborRow = row - 1
        if (upNeighborRow >= 0) {
          let upNeighborColumn = sameTypeGemDirection === 1 ? column - 1 : sameTypeGemColumn - 1
          if (upNeighborColumn >= 0) {
            const upNeighborGem = gems[upNeighborRow][upNeighborColumn]
            if (upNeighborGem && upNeighborGem.getType() === gemType) {
              this.setSuggestion(upNeighborGem, 'down')
              return true
            }
          }
          upNeighborColumn = sameTypeGemDirection === -1 ? column + 1 : sameTypeGemColumn + 1
          if (upNeighborColumn < columns) {
            const upNeighborGem = gems[upNeighborRow][upNeighborColumn]
            if (upNeighborGem && upNeighborGem.getType() === gemType) {
              this.setSuggestion(upNeighborGem, 'down')
              return true
            }
          }
        }

        // Down neighbor
        let downNeighborRow = row + 1
        if (downNeighborRow < rows) {
          let downNeighborColumn = sameTypeGemDirection === 1 ? column - 1 : sameTypeGemColumn - 1
          if (downNeighborColumn >= 0) {
            const downNeighborGem = gems[downNeighborRow][downNeighborColumn]
            if (downNeighborGem && downNeighborGem.getType() === gemType) {
              this.setSuggestion(downNeighborGem, 'up')
              return true
            }
          }
          downNeighborColumn = sameTypeGemDirection === -1 ? column + 1 : sameTypeGemColumn + 1
          if (downNeighborColumn < columns) {
            const downNeighborGem = gems[downNeighborRow][downNeighborColumn]
            if (downNeighborGem && downNeighborGem.getType() === gemType) {
              this.setSuggestion(downNeighborGem, 'up')
              return true
            }
          }
        }
      }
    }

    return false
  }

  setStuckTime (value) {
    this.setData('stuckTime', value)
  }

  getStuckTime () {
    return this.getData('stuckTime') || 0
  }

  addStuckTime (value) {
    const oldStuckTime = this.getStuckTime()
    this.setStuckTime(oldStuckTime + value)
  }

  setSuggestion (targetGem, moveDirection) {
    this.setData('suggestion', { targetGem, moveDirection })
  }

  getSuggestion () {
    return this.getData('suggestion') || {}
  }

  clearSuggestion () {
    this.setData('suggestion', {})
  }

  suggestion () {
    const { targetGem, moveDirection } = this.getSuggestion()
    if (!targetGem || !moveDirection) return

    this.setStuckTime(0)

    const { scene } = this
    const row = targetGem.getRow()
    const column = targetGem.getColumn()
    const { rows, columns } = this.getDiceConfig()

    if (row === undefined || row === null) return
    if (column === undefined || column === null) return

    const tiles = this.getTiles()
    let tweenConfig = {
      targets: targetGem,
      duration: 200,
      yoyo: 1,
      repeat: 2,
      repeatDelay: 150
    }

    if (moveDirection === 'left') {
      if (column - 1 < 0) return

      const { x, size } = tiles[row][column - 1]
      tweenConfig.x = x + (size / 6)
    } else if (moveDirection === 'right') {
      if (column + 1 >= columns) return

      const { x, size } = tiles[row][column + 1]
      tweenConfig.x = x - (size / 6)
    } else if (moveDirection === 'up') {
      if (row - 1 < 0) return

      const { y, size } = tiles[row - 1][column]
      tweenConfig.y = y + (size / 6)
    } else {
      if (row + 1 >= rows) return

      const { y, size } = tiles[row + 1][column]
      tweenConfig.y = y - (size / 6)
    }

    scene.children.bringToTop(targetGem)

    const tweenOnSuggestion = scene.tweens.add(tweenConfig)
    this.tweenOnSuggestion = tweenOnSuggestion
  }

  update (time, delta) {
    const oldTime = this.getData('oldTime')
    if (oldTime && ((time - oldTime) / 1000) < 1) return

    const gameState = this.getGameState()
    if (gameState === 'running') {
      this.setData('oldTime', time)
      this.addTime(1)

      if (this.getStuckTime() >= 5) this.suggestion()
      else this.addStuckTime(1)

      return
    }

    if (this.getDiceBusy()) return

    if (gameState === 'win') this.win()
    else if (gameState === 'loose') this.loose()
  }
}

export default GemDice
