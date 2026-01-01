import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';

export interface SceneLayers {
  root: Container;
  desk: Container;
  papers: Container;
  fx: Container;
  hud: Container;
}

export async function createScene(width: number, height: number) {
  const app = new Application();
  await app.init({
    width,
    height,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio,
    autoDensity: true
  });

  const root = new Container();
  const desk = new Container();
  const papers = new Container();
  const fx = new Container();
  const hud = new Container();

  root.addChild(desk, papers, fx, hud);
  app.stage.addChild(root);

  const deskRect = new Graphics()
    .roundRect(0, 0, width, height, 28)
    .fill({ color: 0x0f0d0b })
    .stroke({ color: 0x1c1a18, width: 2, alpha: 0.45 });
  deskRect.alpha = 0.96;
  desk.addChild(deskRect);

  const inbox = new Graphics()
    .roundRect(18, 90, 140, 220, 18)
    .fill({ color: 0xf4f0e4, alpha: 0.12 })
    .stroke({ color: 0xf4f0e4, width: 2, alpha: 0.18 });
  const archive = new Graphics()
    .roundRect(width - 170, 90, 140, 160, 18)
    .fill({ color: 0x4a7ad3, alpha: 0.12 })
    .stroke({ color: 0x4a7ad3, width: 2, alpha: 0.25 });
  const shredder = new Graphics()
    .roundRect(width - 170, 280, 140, 160, 18)
    .fill({ color: 0xb03a48, alpha: 0.12 })
    .stroke({ color: 0xb03a48, width: 2, alpha: 0.25 });
  desk.addChild(inbox, archive, shredder);

  const labels = [
    { text: 'Inbox', x: 38, y: 110 },
    { text: 'Archive', x: width - 152, y: 110 },
    { text: 'Shredder', x: width - 160, y: 300 }
  ];
  labels.forEach((meta) => {
    const label = new Text({
      text: meta.text,
      style: new TextStyle({ fontFamily: 'Spectral SC', fontSize: 14, fill: 0xf4f0e4, letterSpacing: 1 })
    });
    label.position.set(meta.x, meta.y);
    desk.addChild(label);
  });

  const vignette = new Graphics()
    .rect(0, 0, width, height)
    .fill({ color: 0x000000, alpha: 0.18 });
  vignette.blendMode = 'multiply';
  fx.addChild(vignette);

  const watermark = new Text({
    text: 'BUREAU OF ANOMALIES',
    style: new TextStyle({
      fill: 0xffffff,
      fontSize: 22,
      letterSpacing: 12,
      fontFamily: 'Spectral SC',
      align: 'center',
      dropShadow: true,
      dropShadowDistance: 0,
      dropShadowColor: '#ffffff',
      dropShadowAlpha: 0.08,
      dropShadowBlur: 3
    })
  });
  watermark.alpha = 0.06;
  watermark.angle = -16;
  watermark.x = width / 2 - watermark.width / 2;
  watermark.y = height / 2 - watermark.height / 2;
  desk.addChild(watermark);

  return { app, layers: { root, desk, papers, fx, hud } as SceneLayers };
}
