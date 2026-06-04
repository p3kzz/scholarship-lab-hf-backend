const prisma = require("../lib/prisma")
const aiService = require("./aiService")

function calculateAge(birthDate) {
    if (!birthDate) return 17

    const today = new Date()
    const birth = new Date(birthDate)

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

exports.refreshRecommendations =
    async (userId) => {

        console.log(
            "=== REFRESH START ===",
            userId
        )

        const profile =
            await prisma.profile.findUnique({

                where: {
                    userId
                },

                include: {
                    targetCountries: true,
                    languageCertificates: true,
                    skills: true
                }
            })

        if (!profile) {
            throw new Error(
                "Profile not found"
            )
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
                    .map(c => c.country)
                    .join(",")
        }
console.log(
    "AI PAYLOAD:",
    JSON.stringify(
        payload,
        null,
        2
    )
)
        const aiResult =
            await aiService.recommend(
                payload,
                5
            )

        const scholarshipCodes =
            aiResult.recommendations.map(
                recommendation =>
                    recommendation.scholarship_id
            )

        const scholarships =
            await prisma.scholarship.findMany({

                where: {
                    scholarshipId: {
                        in: scholarshipCodes
                    }
                },

                select: {
                    id: true,
                    scholarshipId: true
                }
            })

        console.log(
            "DELETE OLD RECOMMENDATIONS"
        )

        await prisma.recommendation.deleteMany({

            where: {
                userId
            }
        })

        const recommendationData =
            aiResult.recommendations
                .map(rec => {

                    const scholarship =
                        scholarships.find(
                            s =>
                                s.scholarshipId ===
                                rec.scholarship_id
                        )

                    if (!scholarship) {

                        console.warn(
                            `Scholarship not found: ${rec.scholarship_id}`
                        )

                        return null
                    }

                    return {

                        userId,

                        scholarshipId:
                            scholarship.id,

                        score:
                            rec.score,

                        rank:
                            rec.rank
                    }
                })
                .filter(Boolean)

        console.log(
            "CREATE NEW RECOMMENDATIONS",
            recommendationData.length
        )

        if (
            recommendationData.length > 0
        ) {

            await prisma.recommendation.createMany({
                data:
                    recommendationData
            })
        }

        console.log(
            "=== REFRESH DONE ==="
        )

        return aiResult
    }