class ApiError extends Error {

    status;
    message;

    constructor(status, message) {
        super();
        this.status = status;
        this.message = message;
    }

    static badRequest(message = 'Bad request'){
        return new ApiError(400, message)
    }

    static notFound(message = 'Not found'){
        return new ApiError(404, message)
    }

    static internal(message = 'Internal server error'){
        return new ApiError(500, message)
    }

    static forbidden(message = 'Forbidden'){
        return new ApiError(403, message)
    }

    static unauthorized(message = 'User not found'){
        return new ApiError(401, message)
    }
}

module.exports = ApiError;