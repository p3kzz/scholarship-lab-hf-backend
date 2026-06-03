const prisma = require("../lib/prisma")
const aiService = require("../services/aiService")

function calculateAge(
    birthDate
) {

    if (!birthDate) {
        return 17
    }

    const today = new Date()

    const birth =
        new Date(birthDate)

    let age =
        today.getFullYear() -
        birth.getFullYear()

    const monthDiff =
        today.getMonth() -
        birth.getMonth()

    if (
        monthDiff < 0 ||
        (
            monthDiff === 0 &&
            today.getDate() <
            birth.getDate()
        )
    ) {
        age--
    }

    return age
}

exports.getRecommendations =
    async (req, res) => {

        try {

            const userId =
                req.user.userId

            const profile =
                await prisma.profile.findUnique({

                    where: {
                        userId,
                    },

                    include: {
                        targetCountries: true,
                        languageCertificates: true,
                        skills: true,
                    },
                })

            if (!profile) {

                return res.status(404).json({
                    message:
                        "Profile not found",
                })
            }

            const payload = {

                nationality:
                    profile.nationality ||
                    "Indonesia",

                age: Math.min(
                    calculateAge(
                        profile.birthDate
                    ),
                    20
                ),

                high_school_track:
                    profile.highSchoolTrack ||
                    "science",

                overall_report_card_average:
                    profile.reportAverage || 0,

                math_score:
                    profile.mathScore || 0,

                english_score:
                    profile.englishScore || 0,

                major_subject_average:
                    profile.majorSubjectAverage || 0,

                family_income_category:
                    profile.familyIncomeCategory || "",

                from_underrepresented_region:
                    profile.fromUnderrepresentedRegion || false,

                intended_career_track:
                    profile.intendedCareerTrack || "",

                willing_to_return_home:
                    profile.willingReturnHome || false,

                needs_full_funding:
                    profile.needsFullFunding || false,

                personal_statement:
                    profile.personalStatement || "",

                achievements_narrative:
                    profile.achievementsNarrative || "",

                future_goals:
                    profile.futureGoals || "",

                target_countries:
                    profile.targetCountries
                        .map(
                            c => c.country
                        )
                        .join(","),
            }

            const aiResult =
                await aiService.recommend(
                    payload,
                    5
                )

            console.log(
                "AI RESULT",
                JSON.stringify(
                    aiResult,
                    null,
                    2
                )
            )

            const scholarshipIds =
                aiResult.recommendations.map(
                    r => r.scholarship_id
                )

            const scholarships =
                await prisma.scholarship.findMany({

                    where: {
                        scholarshipId: {
                            in:
                                scholarshipIds,
                        },
                    },
                })

            console.log(
                "FOUND SCHOLARSHIPS",
                scholarships.length
            )

            console.log(
                scholarships.map(
                    s => s.scholarshipId
                )
            )

            const merged =
                aiResult.recommendations.map(
                    recommendation => {

                        const scholarship =
                            scholarships.find(
                                s =>
                                    s.scholarshipId ===
                                    recommendation.scholarship_id
                            )

                        return {

                            ...recommendation,

                            scholarship,
                        }
                    }
                )

            await prisma.recommendation.deleteMany({

                where: {
                    userId
                }
            })

            await prisma.recommendation.createMany({

                data:

                    merged

                        .filter(
                            item => item.scholarship
                        )

                        .map(
                            item => ({

                                userId,

                                scholarshipId:
                                    item.scholarship.id,

                                rank:
                                    item.rank,

                                score:
                                    item.score
                            })
                        )
            })

            console.log(
                "MERGED",
                JSON.stringify(
                    merged,
                    null,
                    2
                )
            )

            return res.json({
                recommendations:
                    merged,
            })

        } catch (error) {

            console.error(
                JSON.stringify(
                    error.response?.data,
                    null,
                    2
                )
            )

            return res.status(500).json({
                message:
                    "Failed to generate recommendations",
            })
        }
    }

exports.getSavedRecommendations =
    async (req, res) => {

        try {

            const userId =
                req.user.userId

            const recommendations =
                await prisma.recommendation.findMany({

                    where: {
                        userId
                    },

                    include: {
                        scholarship: true
                    },

                    orderBy: {
                        rank: "asc"
                    }
                })

            return res.json({
                recommendations
            })

        } catch (error) {

            console.error(error)

            return res.status(500).json({
                message:
                    "Failed to fetch recommendations"
            })
        }
    }