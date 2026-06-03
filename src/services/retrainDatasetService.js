const prisma = require("../lib/prisma")
const path = require("path")
const fs = require("fs")

const {
    createObjectCsvWriter
} = require("csv-writer")

exports.generateDatasets =
    async () => {

        const exportDir =
            path.join(
                __dirname,
                "../../tmp"
            )

        if (
            !fs.existsSync(exportDir)
        ) {
            fs.mkdirSync(
                exportDir,
                {
                    recursive: true
                }
            )
        }

        /*
        STUDENTS
        */

        const profiles =
            await prisma.profile.findMany({

                include: {
                    skills: true,
                    targetCountries: true,
                    languageCertificates: true
                }
            })

        const studentsPath =
            path.join(
                exportDir,
                "students.csv"
            )

        const studentsWriter =
            createObjectCsvWriter({

                path: studentsPath,

                header: [

                    {
                        id: "student_id",
                        title: "student_id"
                    },

                    {
                        id: "nationality",
                        title: "nationality"
                    },

                    {
                        id: "age",
                        title: "age"
                    },

                    {
                        id: "high_school_track",
                        title: "high_school_track"
                    },

                    {
                        id: "overall_report_card_average",
                        title:
                            "overall_report_card_average"
                    },

                    {
                        id: "math_score",
                        title: "math_score"
                    },

                    {
                        id: "english_score",
                        title: "english_score"
                    },

                    {
                        id: "major_subject_average",
                        title:
                            "major_subject_average"
                    },

                    {
                        id: "family_income_category",
                        title:
                            "family_income_category"
                    },

                    {
                        id:
                            "from_underrepresented_region",

                        title:
                            "from_underrepresented_region"
                    },

                    {
                        id:
                            "intended_career_track",

                        title:
                            "intended_career_track"
                    },

                    {
                        id:
                            "personal_statement",

                        title:
                            "personal_statement"
                    },

                    {
                        id:
                            "achievements_narrative",

                        title:
                            "achievements_narrative"
                    },

                    {
                        id: "future_goals",
                        title:
                            "future_goals"
                    }
                ]
            })

        await studentsWriter.writeRecords(

            profiles.map(
                profile => ({

                    student_id:
                        profile.userId,

                    nationality:
                        profile.nationality,

                    age: 17,

                    high_school_track:
                        profile.highSchoolTrack,

                    overall_report_card_average:
                        profile.reportAverage,

                    math_score:
                        profile.mathScore,

                    english_score:
                        profile.englishScore,

                    major_subject_average:
                        profile.majorSubjectAverage,

                    family_income_category:
                        profile.familyIncomeCategory,

                    from_underrepresented_region:
                        profile.fromUnderrepresentedRegion,

                    intended_career_track:
                        profile.intendedCareerTrack,

                    personal_statement:
                        profile.personalStatement,

                    achievements_narrative:
                        profile.achievementsNarrative,

                    future_goals:
                        profile.futureGoals
                })
            )
        )

        /*
        SCHOLARSHIPS
        */

        const scholarships =
            await prisma.scholarship.findMany()

        const scholarshipsPath =
            path.join(
                exportDir,
                "scholarships.csv"
            )

        const scholarshipsWriter =
            createObjectCsvWriter({

                path:
                    scholarshipsPath,

                header:
                    Object.keys(
                        scholarships[0]
                    ).map(
                        key => ({
                            id: key,
                            title: key
                        })
                    )
            })

        await scholarshipsWriter
            .writeRecords(
                scholarships
            )

        /*
        FEEDBACK
        */

        const feedbacks =
            await prisma.feedback.findMany({

                include: {
                    scholarship: true
                }
            })

        const feedbackPath =
            path.join(
                exportDir,
                "feedback.csv"
            )

        const feedbackWriter =
            createObjectCsvWriter({

                path:
                    feedbackPath,

                header: [

                    {
                        id:
                            "student_id",

                        title:
                            "student_id"
                    },

                    {
                        id:
                            "scholarship_id",

                        title:
                            "scholarship_id"
                    },

                    {
                        id:
                            "feedback_type",

                        title:
                            "feedback_type"
                    }
                ]
            })

        await feedbackWriter.writeRecords(

            feedbacks.map(
                feedback => ({

                    student_id:
                        feedback.userId,

                    scholarship_id:
                        feedback.scholarship
                            .scholarshipId,

                    feedback_type:
                        feedback.feedbackType
                })
            )
        )

        return {

            studentsPath,

            scholarshipsPath,

            feedbackPath
        }
    }