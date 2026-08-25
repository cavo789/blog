// Paste in your browser's DevTools console — desktop Chrome works fine,
// no physical accelerometer needed — to trigger the shake overlay without
// shaking anything. This is the exact snippet used to test the effect
// before a single real device was ever involved.
const fire = (x, y, z) => {
  window.dispatchEvent(
    new DeviceMotionEvent("devicemotion", {
      accelerationIncludingGravity: { x, y, z },
      acceleration: { x, y, z },
      interval: 16,
    }),
  );
};

fire(0, 0, 9.8);
setTimeout(() => fire(25, -20, 15), 150);
