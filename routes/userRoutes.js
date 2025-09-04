import {Router} from 'express'
const router = Router();
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

router.get("/me",verifyAccessToken ,async(req,res)=>{
    try{
        const user = await User.findByPk(req.user.userId);
        if(!user){
            return res.json({
                success : false,
                msg : "User not found"
            })
        }
        res.json({
            success : true,
            msg : "User found",
            user
        })
    }
    catch(err){
        res.json({
            success : false,
            msg : err.message
        })
    }
})

export default router