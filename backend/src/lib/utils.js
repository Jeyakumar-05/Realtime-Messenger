import jwt from 'jsonwebtoken';

export const generateToken = (userId, res) => {

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '5d' });

    res.cookie('jwt', token, {
        maxAge: 5 * 24 * 60 * 60 * 1000, // 5 days
        httpOnly: true, // to prevent XSS attacks
        sameSite: 'strict', // to prevent CSRF attacks
        secure: process.env.NODE_ENV !== 'development', // to prevent attacks from other domains
    });

}