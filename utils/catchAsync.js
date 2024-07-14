module.exports = func => {
    return (req,res,next) => {
        //return a executed fun function and then catches error if they are found
        
        func(req,res,next).catch(next);
    }
}