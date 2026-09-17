const errorMiddleware = (err, req, res, next)=>{
    
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error!"; 
    
    if(err.name === "CastError"){

        statusCode = 400;
        message = `Invalid ${err.path} provided`;
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || []
    });
};

module.exports = errorMiddleware;