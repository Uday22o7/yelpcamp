const catchAsync = function (fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

module.exports = catchAsync

// this is a function which check error it is used so that we don't have to write try catch in every route and this type of error handling is used with async function. this also catch a mongo error and any error that we didnot predict