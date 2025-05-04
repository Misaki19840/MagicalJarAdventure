export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  preload() {
    this.load.image('player', 'assets/player.png')
    this.load.image('net', 'assets/net.png')
    this.load.image('spirit', 'assets/spirit.png')
  }

  create() {
    this.player = this.physics.add.sprite(100, 500, 'player')
    this.player.health = 3

    this.spirit = this.physics.add.sprite(600, 400, 'spirit')
    this.spirit.setVelocityX(-60)
    this.spirit.setBounce(1, 1)
    this.spirit.setCollideWorldBounds(true)

    this.net = this.add.sprite(this.player.x, this.player.y, 'net').setVisible(false)
    this.input.keyboard.on('keydown-SPACE', this.swingNet, this)

    this.physics.add.overlap(this.player, this.spirit, this.takeDamage, null, this)
  }

  swingNet() {
    this.net.setPosition(this.player.x + 20, this.player.y)
    this.net.setVisible(true)
    this.time.delayedCall(300, () => this.net.setVisible(false))

    if (Phaser.Geom.Intersects.RectangleToRectangle(this.net.getBounds(), this.spirit.getBounds())) {
      this.catchSpirit()
    }
  }

  takeDamage() {
    this.player.health -= 1
    if (this.player.health <= 0) {
      this.scene.restart()
    }
  }

  catchSpirit() {
    this.spirit.disableBody(true, true)
    this.add.text(300, 300, 'Caught!', { fontSize: '32px', fill: '#fff' })
  }
}
