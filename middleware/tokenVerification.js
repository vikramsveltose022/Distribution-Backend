import dotenv from "dotenv"
import Jwt from "jsonwebtoken"
dotenv.config();
export const tokenVerification = async (req, res, next) => {
    try {
        let token = await req.headers.Authorization
        if (!token)
            throw new Error();
        token = token.split(" ")[1]
        Jwt.verify(token, process.env.TOKEN_SECRET_KEY)
        next();
    }
    catch (err) {
        console.log(err)
        return res.status(400).json({ error: "Unauthorization User", status: false })
    }
}
