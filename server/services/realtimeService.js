let ioInstance = null;

function setIoInstance(io) {
  ioInstance = io;
}

function emitGlobal(eventName, payload) {
  if (ioInstance) {
    ioInstance.emit(eventName, payload);
  }
}

function emitToGroup(groupId, eventName, payload) {
  if (ioInstance) {
    ioInstance.to(`group:${groupId}`).emit(eventName, payload);
  }
}

function emitToUser(userId, eventName, payload) {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(eventName, payload);
  }
}

module.exports = {
  setIoInstance,
  emitGlobal,
  emitToGroup,
  emitToUser,
};
