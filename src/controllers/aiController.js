const aiService = require("../services/aiService")
const fs = require("fs")
const path = require("path")
const prisma = require("../lib/prisma")
const { createObjectCsvWriter } = require("csv-writer")

const retrainDatasetService = require("../services/retrainDatasetService")


exports.health = async (
    req,
    res
) => {

    try {

        const result =
            await aiService.health()

        return res.json(result)

    } catch (error) {

        console.error(error)

        return res.status(500).json({
            message:
                "AI unavailable"
        })
    }
}

exports.refresh = async (
    req,
    res
) => {

    try {

        const scholarships =
            await prisma.scholarship.findMany()

        const csvPath =
            path.join(
                __dirname,
                "../../tmp-scholarships.csv"
            )

        const csvWriter =
            createObjectCsvWriter({

                path: csvPath,

                header: [

                    { id: "scholarship_id", title: "scholarship_id" },
                    { id: "name", title: "name" },
                    { id: "eligible_nationalities", title: "eligible_nationalities" },
                    { id: "min_age", title: "min_age" },
                    { id: "max_age", title: "max_age" },
                    { id: "eligible_degree_levels", title: "eligible_degree_levels" },
                    { id: "eligible_high_school_tracks", title: "eligible_high_school_tracks" },
                    { id: "eligible_fields", title: "eligible_fields" },
                    { id: "preferred_school_tier", title: "preferred_school_tier" },
                    { id: "min_report_card_average", title: "min_report_card_average" },
                    { id: "min_major_subject_average", title: "min_major_subject_average" },
                    { id: "language_requirements", title: "language_requirements" },
                    { id: "requires_financial_need", title: "requires_financial_need" },
                    { id: "max_family_income_category", title: "max_family_income_category" },
                    { id: "host_country", title: "host_country" },
                    { id: "host_region", title: "host_region" },
                    { id: "selection_criteria", title: "selection_criteria" },
                    { id: "career_track_preference", title: "career_track_preference" },
                    { id: "requires_return_home_country", title: "requires_return_home_country" },
                    { id: "mission_statement", title: "mission_statement" },
                    { id: "target_recipient_profile", title: "target_recipient_profile" },
                    { id: "funding_covers_tuition", title: "funding_covers_tuition" },
                    { id: "funding_covers_living", title: "funding_covers_living" },
                    { id: "funding_covers_airfare", title: "funding_covers_airfare" },
                    { id: "funding_covers_insurance", title: "funding_covers_insurance" },
                    { id: "funding_monthly_stipend", title: "funding_monthly_stipend" },
                    { id: "funding_is_full_funding", title: "funding_is_full_funding" },
                    { id: "funding_coverage_count", title: "funding_coverage_count" },

                ],
            })
        await csvWriter.writeRecords(

            scholarships.map(s => ({

                scholarship_id:
                    s.scholarshipId,

                name:
                    s.name,

                eligible_nationalities:
                    JSON.stringify(
                        s.eligibleNationalities || []
                    ),

                min_age:
                    s.minAge,

                max_age:
                    s.maxAge,

                eligible_degree_levels:
                    JSON.stringify(
                        s.eligibleDegreeLevels || []
                    ),

                eligible_high_school_tracks:
                    JSON.stringify(
                        s.eligibleHighSchoolTracks || []
                    ),

                eligible_fields:
                    JSON.stringify(
                        s.eligibleFields || []
                    ),

                preferred_school_tier:
                    s.preferredSchoolTier,

                min_report_card_average:
                    s.minReportCardAverage,

                min_major_subject_average:
                    s.minMajorSubjectAverage,

                language_requirements:
                    JSON.stringify(
                        s.languageRequirements || []
                    ),

                requires_financial_need:
                    s.requiresFinancialNeed,

                max_family_income_category:
                    s.maxFamilyIncomeCategory,

                host_country:
                    s.hostCountry,

                host_region:
                    s.hostRegion,

                selection_criteria:
                    JSON.stringify(
                        s.selectionCriteria || {}
                    ),

                career_track_preference:
                    s.careerTrackPreference,

                requires_return_home_country:
                    s.requiresReturnHomeCountry,

                mission_statement:
                    s.missionStatement,

                target_recipient_profile:
                    s.targetRecipientProfile,

                funding_covers_tuition:
                    s.fundingCoversTuition,

                funding_covers_living:
                    s.fundingCoversLiving,

                funding_covers_airfare:
                    s.fundingCoversAirfare,

                funding_covers_insurance:
                    s.fundingCoversInsurance,

                funding_monthly_stipend:
                    s.fundingMonthlyStipend,

                funding_is_full_funding:
                    s.fundingIsFullFunding,

                funding_coverage_count:
                    s.fundingCoverageCount,

            }))
        )
        console.log(
            `Exporting ${scholarships.length} scholarships`
        )

        const result =
            await aiService.refresh(
                csvPath
            )

        fs.unlinkSync(
            csvPath
        )

        return res.json(result)

    } catch (error) {

        console.error(
            "REFRESH ERROR:",
            error.response?.data ||
            error.message ||
            error
        )

        return res.status(500).json({

            message: "Refresh failed",

            error:
                error.response?.data ||
                error.message
        })
    }
}

exports.retrain =
    async (req, res) => {

        try {

            const {

                studentsPath,

                scholarshipsPath,

                feedbackPath

            } =
                await retrainDatasetService
                    .generateDatasets()

            const result =
                await aiService.retrain(

                    studentsPath,

                    scholarshipsPath,

                    feedbackPath
                )

            return res.json(result)

        } catch (error) {

            console.error(error)

            return res.status(500).json({

                message:
                    "Failed to start retraining"
            })
        }
    }

