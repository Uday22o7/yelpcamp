class AppError extends Error{
    constructor(message,statusCode){
        super()
        this.message=message;
        this.statusCode=statusCode;
    }
}

module.exports = AppError

// A new AppError class is extended from pervious default error class called Error in this now error message and status code will also be included   