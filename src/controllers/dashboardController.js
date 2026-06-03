const prisma =
    require("../lib/prisma")

exports.getStats = async (
    req,
    res
) => {

    try {

        const userId =
            req.user.userId

        const applied =
            await prisma.feedback.count({

                where: {
                    userId,
                    feedbackType: "apply"
                }
            })

        const accepted =
            await prisma.feedback.count({

                where: {
                    userId,
                    feedbackType: "accepted"
                }
            })

        return res.json({

            applied,
            accepted
        })

    } catch (error) {

        console.error(error)

        return res.status(500).json({

            message:
                "Failed to load dashboard stats"
        })
    }
}