const prisma = require("../lib/prisma")
const recommendationService =
    require(
        "../services/recommendationService"
    )

const fs = require("fs");
const FormData = require("form-data");
const axios = require("axios");

exports.completeOnboarding = async (req, res) => {

    try {

        const userId = req.user.userId

        const {

            // PERSONAL
            fullName,
            gender,
            birthDate,
            nationality,
            province,

            familyIncomeCategory,
            fromUnderrepresentedRegion,

            // ACADEMIC
            currentDegreeLevel,
            targetDegreeLevel,

            schoolName,
            highSchoolTrack,
            schoolTier,

            expectedGraduationYear,

            reportAverage,
            mathScore,
            englishScore,
            majorSubjectAverage,

            extracurricularText,

            // ACHIEVEMENT
            olympiadLevel,

            leadershipCount,
            volunteerCount,
            competitionCount,

            // CAREER
            intendedCareerTrack,
            willingReturnHome,
            needsFullFunding,

            // AI TEXT
            personalStatement,
            achievementsNarrative,
            futureGoals,

            // RELATIONS
            hardSkills,
            softSkills,
            langSkills,
            langCerts,
            targetCountries,

        } = req.body

        const profile = await prisma.profile.upsert({

            where: {
                userId,
            },

            update: {

                fullName,
                gender,

                birthDate:
                    birthDate && birthDate !== ""
                        ? new Date(birthDate)
                        : null,

                nationality,
                province,

                familyIncomeCategory,
                fromUnderrepresentedRegion,

                currentDegreeLevel,
                targetDegreeLevel,

                schoolName,
                highSchoolTrack,
                schoolTier,

                expectedGraduationYear,

                reportAverage,
                mathScore,
                englishScore,
                majorSubjectAverage,

                extracurricularText,

                olympiadLevel,

                leadershipCount,
                volunteerCount,
                competitionCount,

                intendedCareerTrack,
                willingReturnHome,
                needsFullFunding,

                personalStatement,
                achievementsNarrative,
                futureGoals,

                isCompleted: true,
            },

            create: {

                userId,

                fullName,
                gender,

                birthDate:
                    birthDate && birthDate !== ""
                        ? new Date(birthDate)
                        : null,

                nationality,
                province,

                familyIncomeCategory,
                fromUnderrepresentedRegion,

                currentDegreeLevel,
                targetDegreeLevel,

                schoolName,
                highSchoolTrack,
                schoolTier,

                expectedGraduationYear,

                reportAverage,
                mathScore,
                englishScore,
                majorSubjectAverage,

                extracurricularText,

                olympiadLevel,

                leadershipCount,
                volunteerCount,
                competitionCount,

                intendedCareerTrack,
                willingReturnHome,
                needsFullFunding,

                personalStatement,
                achievementsNarrative,
                futureGoals,

                isCompleted: true,
            },
        })

        // DELETE OLD RELATIONAL DATA

        await prisma.$transaction([

            prisma.skill.deleteMany({
                where: {
                    profileId: profile.id
                }
            }),

            prisma.targetCountry.deleteMany({
                where: {
                    profileId: profile.id
                }
            }),

            prisma.languageCertificate.deleteMany({
                where: {
                    profileId: profile.id
                }
            })

        ])

        // HARD SKILLS

        if (hardSkills?.length) {

            await prisma.skill.createMany({

                data: hardSkills.map(skill => ({
                    profileId: profile.id,
                    name: skill,
                    type: "HARD"
                }))

            })

        }

        // SOFT SKILLS

        if (softSkills?.length) {

            await prisma.skill.createMany({

                data: softSkills.map(skill => ({
                    profileId: profile.id,
                    name: skill,
                    type: "SOFT"
                }))

            })

        }

        // LANGUAGE SKILLS

        if (langSkills?.length) {

            await prisma.skill.createMany({

                data: langSkills.map(skill => ({
                    profileId: profile.id,
                    name: skill,
                    type: "LANGUAGE"
                }))

            })

        }

        // TARGET COUNTRIES

        if (targetCountries?.length) {

            await prisma.targetCountry.createMany({

                data: targetCountries.map(country => ({
                    profileId: profile.id,
                    country
                }))

            })

        }

        // LANGUAGE CERTIFICATES

        if (langCerts?.length) {

            await prisma.languageCertificate.createMany({

                data: langCerts.map(cert => ({

                    profileId: profile.id,

                    name: cert.testType,

                    score: String(cert.score)

                }))

            })

        }

        return res.status(201).json({

            message: "Onboarding completed",

            profile

        })

    } catch (error) {

        console.error(error)

        return res.status(500).json({

            message: "Failed to complete onboarding"

        })

    }

}

exports.getProfile = async (
    req,
    res
) => {

    try {

        const profile =
            await prisma.profile.findUnique({

                where: {
                    userId:
                        req.user.userId
                },

                include: {
                    user: {
                        select: {
                            email: true
                        }
                    },


                    skills: true,

                    languageCertificates: true,

                    targetCountries: true
                }
            })

        return res.json(
            {
                ...profile,
                email: profile.user.email
            }
        )

    } catch (error) {

        console.error(error)

        return res.status(500).json({

            message:
                "Failed to get profile"
        })
    }
}

exports.updateProfile = async (
    req,
    res
) => {

    try {

        const userId =
            req.user.userId

        const {

            // PERSONAL
            fullName,
            gender,
            birthDate,
            province,
            familyIncomeCategory,
            fromUnderrepresentedRegion,

            // ACADEMIC
            currentDegreeLevel,
            schoolName,
            highSchoolTrack,
            schoolTier,
            expectedGraduationYear,

            reportAverage,
            mathScore,
            englishScore,
            majorSubjectAverage,

            extracurricularText,

            olympiadLevel,
            intendedCareerTrack

        } = req.body

        const updateData = {}

        // PERSONAL

        if (fullName !== undefined)
            updateData.fullName = fullName

        if (gender !== undefined)
            updateData.gender = gender

        if (birthDate !== undefined)
            updateData.birthDate =
                birthDate
                    ? new Date(birthDate)
                    : null

        if (province !== undefined)
            updateData.province = province

        if (familyIncomeCategory !== undefined)
            updateData.familyIncomeCategory =
                familyIncomeCategory

        if (fromUnderrepresentedRegion !== undefined)
            updateData.fromUnderrepresentedRegion =
                fromUnderrepresentedRegion

        // ACADEMIC

        if (currentDegreeLevel !== undefined)
            updateData.currentDegreeLevel =
                currentDegreeLevel

        if (schoolName !== undefined)
            updateData.schoolName =
                schoolName

        if (highSchoolTrack !== undefined)
            updateData.highSchoolTrack =
                highSchoolTrack

        if (schoolTier !== undefined)
            updateData.schoolTier =
                schoolTier

        if (expectedGraduationYear !== undefined)
            updateData.expectedGraduationYear =
                expectedGraduationYear
                    ? Number(expectedGraduationYear)
                    : null

        if (reportAverage !== undefined)
            updateData.reportAverage =
                reportAverage
                    ? Number(reportAverage)
                    : null

        if (mathScore !== undefined)
            updateData.mathScore =
                mathScore
                    ? Number(mathScore)
                    : null

        if (englishScore !== undefined)
            updateData.englishScore =
                englishScore
                    ? Number(englishScore)
                    : null

        if (majorSubjectAverage !== undefined)
            updateData.majorSubjectAverage =
                majorSubjectAverage
                    ? Number(majorSubjectAverage)
                    : null

        if (extracurricularText !== undefined)
            updateData.extracurricularText =
                extracurricularText

        if (olympiadLevel !== undefined)
            updateData.olympiadLevel =
                olympiadLevel

        if (intendedCareerTrack !== undefined)
            updateData.intendedCareerTrack =
                intendedCareerTrack

        const profile =
            await prisma.profile.update({

                where: {
                    userId
                },

                include: {
                    user: {
                        select: {
                            email: true
                        }
                    }
                },

                data: updateData
            })
        try {

            await recommendationService
                .refreshRecommendations(
                    userId
                )

            console.log(
                "Recommendations refreshed"
            )

        } catch (error) {

            console.error(
                "Failed refresh recommendation",
                error
            )
        }
        return res.json({

            message:
                "Profile updated successfully",

            profile,

            email:
                profile.user.email
        })

    } catch (error) {

        console.error(error)

        return res.status(500).json({

            message:
                "Failed to update profile"
        })
    }
}

exports.updateSkills = async (
    req,
    res
) => {

    const userId =
        req.user.userId

    const {
        hardSkills,
        softSkills,
        languageSkills
    } = req.body

    const profile =
        await prisma.profile.findUnique({
            where: { userId }
        })

    await prisma.skill.deleteMany({
        where: {
            profileId:
                profile.id
        }
    })

    const data = [

        ...hardSkills.map(
            name => ({
                profileId:
                    profile.id,
                name,
                type: "HARD"
            })
        ),

        ...softSkills.map(
            name => ({
                profileId:
                    profile.id,
                name,
                type: "SOFT"
            })
        ),

        ...languageSkills.map(
            name => ({
                profileId:
                    profile.id,
                name,
                type: "LANGUAGE"
            })
        )
    ]

    if (data.length > 0) {

        await prisma.skill.createMany({
            data
        })
        try {

            await recommendationService
                .refreshRecommendations(
                    userId
                )

            console.log(
                "Recommendations refreshed"
            )

        } catch (error) {

            console.error(
                "Failed refresh recommendation",
                error
            )
        }
    }

    return res.json({
        message:
            "Skills updated"
    })
}

exports.uploadCV = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                message: "Upload CV",
            });
        }

        const profile = await prisma.profile.upsert({
            where: {
                userId: req.user.userId,
            },

            update: {
                cvUrl: `/uploads/cv/${req.file.filename}`,
                cvParsed: false,
                cvParsedText: null,
            },

            create: {
                userId: req.user.userId,
                cvUrl: `/uploads/cv/${req.file.filename}`,
                cvParsed: false,
                cvParsedText: null,
                isCompleted: false,
            },
        });

        return res.json({
            success: true,
            profile,
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message,
        });

    }
};

exports.parseCV = async (req, res) => {

    try {

        const profile =
            await prisma.profile.findUnique({
                where: {
                    userId: req.user.userId,
                },
            });

        if (!profile?.cvUrl) {
            return res.status(400).json({
                message: "CV belum diupload",
            });
        }

        const formData = new FormData();
        const filePath = "." + profile.cvUrl;

        console.log("FILE PATH:", filePath);
        console.log("FILE EXISTS:", fs.existsSync(filePath));
        formData.append(
            "file",
            fs.createReadStream(
                "." + profile.cvUrl
            )
        );
        console.log(
            "FORM HEADERS:",
            formData.getHeaders()
        );
        console.log(
            "AI URL:",
            `${process.env.AI_API_URL}/parse-cv`
        );
        console.log(
            "FINAL URL:",
            `${process.env.AI_API_URL}/parse-cv`
        );
        const response = await axios.post(
            `${process.env.AI_API_URL}/parse-cv`,
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            }
        );

        const result = response.data;

        console.log("AI RESPONSE:", result);
        console.log("AI STATUS:", response.status);

        if (!result) {
            return res.status(500).json({
                success: false,
                message: "AI parser tidak mengembalikan data",
            });
        }

        return res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error.response?.status === 429) {
            return res.status(503).json({
                success: false,
                code: "AI_RATE_LIMIT",
                message:
                    "Layanan AI sedang sibuk atau terkena rate limit. Silakan coba beberapa menit lagi atau isi data secara manual."
            });
        }
        console.error(error);

        if (error.response) {

            console.error(
                "AI ERROR STATUS:",
                error.response.status
            );

            console.error(
                "AI ERROR DATA:",
                error.response.data
            );

        }

        return res.status(500).json({
            message: error.message,
        });

    }

};