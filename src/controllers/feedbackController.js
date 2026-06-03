const prisma = require("../lib/prisma")

exports.createFeedback = async (
    req,
    res
) => {

    try {

        const {
            scholarshipId,
            feedbackType,
        } = req.body

        const userId =
            req.user.userId

        const feedback =
            await prisma.feedback.upsert({

                where: {
                    userId_scholarshipId_feedbackType: {

                        userId,

                        scholarshipId,

                        feedbackType,
                    }
                },

                update: {},

                create: {
                    userId,
                    scholarshipId,
                    feedbackType,
                }
            })

        return res.status(201).json({
            message:
                "Feedback created",

            feedback,
        })

    } catch (error) {

        console.error(error)

        return res.status(500).json({
            message:
                "Failed to create feedback",
        })
    }
}

exports.getFeedbackStatus = async (
    req,
    res
) => {

    try {

        const userId =
            req.user.userId

        const scholarshipId =
            Number(req.params.scholarshipId)

        const feedbacks =
            await prisma.feedback.findMany({

                where: {
                    userId,
                    scholarshipId,
                },
            })

        const status = {

            clicked:
                feedbacks.some(
                    f => f.feedbackType === "click"
                ),

            applied:
                feedbacks.some(
                    f => f.feedbackType === "apply"
                ),

            accepted:
                feedbacks.some(
                    f => f.feedbackType === "accepted"
                ),
        }

        return res.status(200).json(
            status
        )

    } catch (error) {

        console.error(error)

        return res.status(500).json({
            message:
                "Failed to get feedback status"
        })
    }
}