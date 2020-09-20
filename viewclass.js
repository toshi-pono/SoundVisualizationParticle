const MAX_PERTICLE_RADIUS = 10;
const MIN_PERTICLE_RADIUS = 5;

class Perticle {
  constructor(x, y) {
    //this.radius = rand(MAX_PERTICLE_RADIUS, MIN_PERTICLE_RADIUS);
    this.radius = 10;
    this.pixi = new PIXI.Graphics()
      .beginFill(0xfffde6)
      .drawEllipse(0, 0, this.radius, this.radius)
      .endFill();
    this.pixi.x = x;
    this.pixi.y = y;
    this.pixi.alpha = 0.8;
    this.defaltX = x;

    this.animationCounter = 0;
    this.animationState = 0;
    this.randNum = rand(20);
    this.speedY = rand(11, 7);
  }
  Init(x, y) {
    this.pixi.x = x;
    this.pixi.y = y;
    this.pixi.alpha = 0.8;
    this.defaltX = x;
    this.pixi.visible = true;

    this.animationCounter = 0;
    this.animationState = 0;
    this.randNum = rand(20);
    this.speedY = rand(11, 7);
  }
  Scale(magnification) {
    this.pixi.scale.x = magnification;
    this.pixi.scale.y = magnification;
  }
  update() {
    if (this.animationCounter < 120) {
      // アニメーション
      this.pixi.x =
        this.defaltX +
        20 *
          Math.sin((this.animationCounter / 20 + this.randNum / 20) * Math.PI);
      this.pixi.y -= this.speedY;
      if (this.animationCounter > 60) {
        this.pixi.alpha -= 0.02;
      }
    } else {
      this.pixi.visible = false;
      this.animationState = -1;
    }
    this.animationCounter++;
  }
}

const stateName = ["停止中", "処理中"];
class ButtonP {
  constructor(x, y) {
    this.state = 0;
    this.pixi = new PIXI.Container();
    let background = new PIXI.Graphics()
      .beginFill(0xfffde6)
      .drawRect(0, 0, 200, 50)
      .endFill();
    this.text = new PIXI.Text(stateName[this.state], {
      fontSize: 30,
      fill: 0x000000,
    });
    this.text.x = 10;
    this.text.y = 10;

    this.pixi.addChild(background);
    this.pixi.addChild(this.text);
    this.pixi.x = x - 200;
    this.pixi.y = y - 50;
    this.pixi.interactive = true;
    this.pixi.buttonMode = true;
  }
  ChangeState() {
    this.state = 1 - this.state;
    this.text.text = stateName[this.state];
  }
}

function rand(maxnum, minnum = 0) {
  return Math.floor(Math.random() * (maxnum - minnum) + minnum);
}
