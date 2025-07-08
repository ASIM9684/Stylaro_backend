// socket.js
let ioInstance;

module.exports = {
  init: (io) => {
    ioInstance = io;
  },
  getIO: () => {
    if (!ioInstance) {
      throw new Error("❌ Socket.io not initialized");
    }
    return ioInstance;
  }
};
