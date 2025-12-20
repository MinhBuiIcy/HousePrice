"use strict";

class ServiceError extends Error {
  constructor(message, { status = 500, data = null } = {}) {
    super(message);
    this.name = "ServiceError";
    this.status = status;
    this.data = data;
  }
}

module.exports = ServiceError;

