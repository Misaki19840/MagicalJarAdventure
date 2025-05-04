class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  preload() {
    this.load.image('player', 'assets/player_204.png')
    this.load.image('net', 'assets/net_204.png')
    this.load.image('spirit', 'assets/spirit_102.png')
  }

  create() {
    this.cameras.main.setBackgroundColor('#a7d4f7')

    const ground = this.add.rectangle(400, 580, 800, 40, 0x654321)
    this.physics.add.existing(ground, true)

    // Player setup
    this.player = this.physics.add.sprite(200, 400, 'player')
    this.player.body.setSize(50, 180, true).setOffset(66, 0)
    this.player.health = 3
    this.physics.add.collider(this.player, ground)
    this.lastDamageTime = 0

    // Spirit setup
    this.spirit = this.physics.add.sprite(600, 400, 'spirit')
    this.spirit.body.setSize(33, 33, true).setOffset(35, 50)
    this.spirit.setVelocityX(-60)
    this.spirit.setBounce(1, 1)
    this.spirit.setCollideWorldBounds(true)

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys()

    // Net follows the player
    this.net = this.add.sprite(this.player.x, this.player.y, 'net')
    this.net.setVisible(true)

    // Swing with SPACE
    this.input.keyboard.on('keydown-SPACE', this.swingNet, this)

    // Damage when player touches spirit
    this.physics.add.overlap(this.player, this.spirit, this.takeDamage, null, this)

    // Health text
    this.healthText = this.add.text(16, 16, 'Health: ' + this.player.health, {
      fontSize: '24px',
      fill: '#000'
    }).setScrollFactor(0)  // stays fixed on screen

    // Add movement buttons
    this.leftButton = this.add.rectangle(60, 540, 80, 80, 0x8888ff).setInteractive()
    this.rightButton = this.add.rectangle(160, 540, 80, 80, 0x8888ff).setInteractive()
    this.swingButton = this.add.rectangle(740, 540, 80, 80, 0xff8888).setInteractive()
    this.leftButton.setAlpha(0.5)
    this.rightButton.setAlpha(0.5)
    this.swingButton.setAlpha(0.5)    

    // Optional: Add labels
    this.add.text(45, 525, '←', { fontSize: '32px', fill: '#000' })
    this.add.text(145, 525, '→', { fontSize: '32px', fill: '#000' })
    this.add.text(720, 525, 'Net', { fontSize: '24px', fill: '#000' })

    this.moveLeft = false
    this.moveRight = false

    this.leftButton.on('pointerdown', () => this.moveLeft = true)
    this.leftButton.on('pointerup', () => this.moveLeft = false)
    this.leftButton.on('pointerout', () => this.moveLeft = false)
    
    this.rightButton.on('pointerdown', () => this.moveRight = true)
    this.rightButton.on('pointerup', () => this.moveRight = false)
    this.rightButton.on('pointerout', () => this.moveRight = false)
    
    this.swingButton.on('pointerdown', () => this.swingNet())
  }

  update() {
    const speed = 200
    this.player.setVelocityX(0)
  
    if (this.moveLeft) {
      this.player.setVelocityX(-200)
      this.player.flipX = true
    }
    if (this.moveRight) {
      this.player.setVelocityX(200)
      this.player.flipX = false
    }
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed)
      this.player.flipX = true  // 👈 face left
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed)
      this.player.flipX = false // 👈 face right
    }

    // Flip net to match player direction
    this.net.flipX = this.player.flipX    

    // Position net on correct side of hand
    const offsetX = this.player.flipX ? -53 : 53
    this.net.setPosition(this.player.x + offsetX, this.player.y)
  }

  swingNet() {
    const swingAngle = this.player.flipX ? -30 : 30

    this.tweens.add({
      targets: this.net,
      angle: swingAngle,
      duration: 100,
      yoyo: true,
      onComplete: () => {
        this.net.setAngle(0)
      }
    })
  
    if (Phaser.Geom.Intersects.RectangleToRectangle(this.net.getBounds(), this.spirit.getBounds())) {
      this.catchSpirit()
    }
  }
  

  takeDamage() {
    const now = this.time.now
    if (now - this.lastDamageTime < 1000) return // 1 second cooldown
    this.lastDamageTime = now
  
    console.log('Ouch!')
    const ouchText = this.add.text(this.player.x, this.player.y - 50, 'Ouch!', {
      fontSize: '28px',
      fill: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5)
    
    this.time.delayedCall(800, () => {
      ouchText.destroy()
    })    

    this.player.health -= 1
    this.healthText.setText('Health: ' + this.player.health)
    if (this.player.health <= 0) {
      this.scene.restart()
    }
  }
  

  catchSpirit() {
    this.spirit.disableBody(true, true)
    this.add.text(300, 300, 'Caught!', { fontSize: '32px', fill: '#fff' })
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 800 }, debug: false }
  },
  scene: [GameScene]
}

const game = new Phaser.Game(config)
