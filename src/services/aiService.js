const axios = require("axios")
const FormData = require("form-data")
const fs = require("fs")
const {
    createObjectCsvWriter
} = require("csv-writer")

const aiApi = axios.create({
    baseURL: process.env.AI_API_URL,
    timeout: 30000,
})

exports.health = async () => {

    const { data } =
        await aiApi.get("/health")

    return data
}

exports.recommend = async (
    payload,
    k = 5
) => {

    const { data } =
        await aiApi.post(

            `/recommend?k=${k}`,

            payload
        )

    return data
}

exports.refresh = async (
    csvPath
) => {

    const form =
        new FormData()

    form.append(
        "csv_file",
        fs.createReadStream(csvPath)
    )

    const { data } =
        await aiApi.post(
            "/refresh",
            form,
            {
                headers:
                    form.getHeaders()
            }
        )

    return data
}

exports.retrain = async (
    studentsPath,
    scholarshipsPath,
    feedbackPath
) => {

    const form =
        new FormData()

    form.append(
        "students",
        fs.createReadStream(
            studentsPath
        )
    )

    form.append(
        "scholarships",
        fs.createReadStream(
            scholarshipsPath
        )
    )

    form.append(
        "feedbacks",
        fs.createReadStream(
            feedbackPath
        )
    )

    const { data } =
        await aiApi.post(
            "/retrain",
            form,
            {
                headers:
                    form.getHeaders()
            }
        )

    return data
}