import jwt from 'jsonwebtoken';

export const verifyAccessToken = (req,res,next) =>{
    const access_token = req.cookies.access_token;
    if(!access_token){
        return res.json({
            success : false,
            message : "Access token not found Please relogin"
        })
    }

    try{
        const access_token_decoded = jwt.verify(access_token , process.env.JWT_SECRET);
        if(!access_token_decoded){
            res.json({
                success : false,
                msg : "Access token expired"
            })
        }
        req.user = access_token_decoded;
        next()
    }
    catch(err){
        console.log(err.message)
        return res.json({
            success : false,
            message : err.message
        })
    }

}