class ApplicationResponse {
  constructor(success, message, data = null, errors = null) {
    this.hasError = !success;
    this.message = message;
    this.data = data;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }

  static success(message = "Success", data = null) {
    return new ApplicationResponse(true, message, data);
  }

  static created(message = "Created successfully", data = null) {
    return new ApplicationResponse(true, message, data);
  }

  static error(message = "Something went wrong", errors = null) {
    return new ApplicationResponse(false, message, null, errors);
  }

  static validation(message = "Validation failed", errors = null) {
    return new ApplicationResponse(false, message, null, errors);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApplicationResponse(false, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApplicationResponse(false, message);
  }

  static notFound(message = "Resource not found") {
    return new ApplicationResponse(false, message);
  }
}

export default ApplicationResponse;