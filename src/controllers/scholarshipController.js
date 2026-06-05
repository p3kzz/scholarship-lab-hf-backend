const prisma = require("../lib/prisma")

exports.getPublicScholarships =
    async (req, res) => {

        try {

            const scholarships =
                await prisma.scholarship.findMany({

                    take: 6,

                    orderBy: {
                        createdAt: "desc"
                    },

                    select: {

                        id: true,

                        scholarshipId: true,

                        name: true,

                        link: true,

                        hostCountry: true,

                        hostRegion: true,

                        fundingIsFullFunding: true,

                        missionStatement: true,

                        targetRecipientProfile: true

                    }

                })

            return res.json({
                scholarships
            })

        } catch (error) {

            console.error(error)

            return res.status(500).json({
                message:
                    "Failed to fetch scholarships"
            })

        }

    }