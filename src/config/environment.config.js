import dotenv from 'dotenv'

dotenv.config()

export default {
    mongoURI: process.env.MONGO_URI,
    host: process.env.HOST,
    rwHost: process.env.RW_HOST,
    port: process.env.PORT,
    gitClientID: process.env.GIT_CLIENT_ID,
    gitClientIDRailway: process.env.GIT_CLIENT_ID_RW,
    gitClientSecret: process.env.GIT_CLIENT_SECRET,
    gitClientSecretRailway: process.env.GIT_CLIENT_SECRET_RW,
    gitCallbackURL: process.env.GIT_CALLBACK_URL,
    gitCallbackURLRailway: process.env.GIT_CALLBACK_URL_RW,
    jwtSecret: process.env.JWT_SECRET,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
    tokenCookieName: process.env.TOKEN_COOKIE_NAME,
    emailUser: process.env.EMAIL_USER,
    emailPassword: process.env.EMAIL_PASS,
    emailService: process.env.EMAIL_SERVICE,
    emailHost: process.env.EMAIL_HOST,
    nodeEnv: process.env.NODE_ENV,
    railway: process.env.RAILWAY,
}