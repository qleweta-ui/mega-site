import Matter from 'matter-js';

export function createPhysicsWorld(width: number, height: number) {
  const engine = Matter.Engine.create({ enableSleeping: true });
  const world = engine.world;
  world.gravity.y = 1.1;

  const floor = Matter.Bodies.rectangle(width / 2, height + 40, width, 80, {
    isStatic: true,
    friction: 0.9
  });
  const walls = [
    Matter.Bodies.rectangle(-30, height / 2, 60, height, { isStatic: true }),
    Matter.Bodies.rectangle(width + 30, height / 2, 60, height, { isStatic: true }),
    Matter.Bodies.rectangle(width / 2, -30, width, 60, { isStatic: true })
  ];
  Matter.World.add(world, [floor, ...walls]);

  return { engine, world };
}
