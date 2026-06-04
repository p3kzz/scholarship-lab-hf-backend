require('dotenv').config();

// console.log('DATABASE_URL:', process.env.DATABASE_URL);

const express = require('express');
const cors = require('cors');
const prisma = require('./lib/prisma');
const authController = require('./controllers/authController');
const profileController = require('./controllers/profileController')
const uploadCV = require('./middleware/uploadCV');

const feedbackController = require('./controllers/feedbackController')
const aiController = require('./controllers/aiController')
const recommendationController = require('./controllers/recommendationController')
const dashboardController = require('./controllers/dashboardController')

const authMiddleware = require('./middleware/auth');


const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
    res.send('API Running');
});
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/auth/google', authController.googleLogin);

app.get('/me', authMiddleware, async (req, res) => {

    const user =
        await prisma.user.findUnique({

            where: {
                id: req.user.userId
            },

            select: {

                id: true,
                name: true,
                email: true,

                profile: true
            }
        })

    console.log(
        JSON.stringify(
            user,
            null,
            2
        )
    )

    res.json(user)
})

app.post('/onboarding', authMiddleware, profileController.completeOnboarding)
app.get('/profile', authMiddleware, profileController.getProfile)
app.put(
    '/profile',
    authMiddleware,
    profileController.updateProfile
)
app.put(
    '/profile/skills',
    authMiddleware,
    profileController.updateSkills
)
app.post('/feedback', authMiddleware, feedbackController.createFeedback)
app.get('/feedback/status/:scholarshipId', authMiddleware, feedbackController.getFeedbackStatus)
app.get('/recommendations', authMiddleware, recommendationController.getRecommendations)
app.get('/recommendation', authMiddleware, recommendationController.getSavedRecommendations)
app.get(
    "/recommendations/saved",
    authMiddleware,
    recommendationController.getSavedRecommendations
)
app.get('/dashboard/stats', authMiddleware, dashboardController.getStats)
app.get('/ai/health', aiController.health)
app.post('/ai/refresh', aiController.refresh)
app.post('/ai/retrain', aiController.retrain)


app.post(
    '/profile/upload-cv',
    authMiddleware,
    uploadCV.single('cv'),
    profileController.uploadCV
);

// app.get(
//     '/profile/parse-cv',
//     authMiddleware,
//     profileController.parseCV
// );

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});