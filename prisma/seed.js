const fs = require("fs")
const path = require("path")
const csv = require("csv-parser")

const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {

    const scholarship = []

    await new Promise((resolve, reject) => {

        fs.createReadStream(
            path.join(
                __dirname,
                "data",
                "scholarship.csv"
            )
        )
            .pipe(csv())
            .on("data", (row) => {
                scholarship.push(row)
            })
            .on("end", resolve)
            .on("error", reject)
    })

    console.log(
        `Found ${scholarship.length} scholarship`
    )

    for (const row of scholarship) {

        await prisma.scholarship.upsert({

            where: {
                scholarshipId:
                    row.scholarship_id,
            },

            update: {},

            create: {

                scholarshipId:
                    row.scholarship_id,

                name:
                    row.name,

                eligibleNationalities:
                    JSON.parse(
                        row.eligible_nationalities
                    ),

                eligibleDegreeLevels:
                    JSON.parse(
                        row.eligible_degree_levels
                    ),

                eligibleHighSchoolTracks:
                    JSON.parse(
                        row.eligible_high_school_tracks
                    ),

                eligibleFields:
                    JSON.parse(
                        row.eligible_fields
                    ),

                preferredSchoolTier:
                    row.preferred_school_tier,

                minAge:
                    Number(row.min_age),

                maxAge:
                    Number(row.max_age),

                minReportCardAverage:
                    Number(
                        row.min_report_card_average
                    ),

                minMajorSubjectAverage:
                    Number(
                        row.min_major_subject_average
                    ),

                languageRequirements:
                    JSON.parse(
                        row.language_requirements
                    ),

                requiresFinancialNeed:
                    row.requires_financial_need === "True",

                maxFamilyIncomeCategory:
                    row.max_family_income_category,

                hostCountry:
                    row.host_country,

                hostRegion:
                    row.host_region,

                selectionCriteria:
                    JSON.parse(
                        row.selection_criteria
                    ),

                careerTrackPreference:
                    row.career_track_preference,

                requiresReturnHomeCountry:
                    row.requires_return_home_country === "True",

                missionStatement:
                    row.mission_statement,

                targetRecipientProfile:
                    row.target_recipient_profile,

                fundingCoversTuition:
                    row.funding_covers_tuition === "True",

                fundingCoversLiving:
                    row.funding_covers_living === "True",

                fundingCoversAirfare:
                    row.funding_covers_airfare === "True",

                fundingCoversInsurance:
                    row.funding_covers_insurance === "True",

                fundingMonthlyStipend:
                    Number(
                        row.funding_monthly_stipend
                    ),

                fundingIsFullFunding:
                    row.funding_is_full_funding === "True",

                fundingCoverageCount:
                    Number(
                        row.funding_coverage_count
                    ),

                // sementara kosong
                link: null,
            },
        })
    }

    console.log(
        "Scholarship seeding completed"
    )
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {

        console.error(e)

        await prisma.$disconnect()

        process.exit(1)
    })