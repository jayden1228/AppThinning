const colors = require("colors")
const { isGif, calculateFilesSizeInKB } = require("../../util/fileUtil")
const imageOptim = require("../../util/imageOptim/index")
const { appendIgnoreFiles } = require("../ignore/helper")
const { AppthinningError } = require("../../error")

async function compressGif(ctx, next) {
  console.log(colors.yellow("compressing gif."))

  let files = []
  for (let file of ctx.files) {
    if (isGif(file)) {
      files.push(file)
    }
  }

  if (files.length < 1) {
    console.log(colors.green("no gif need to be compressed."))
  } else {
    const sizeBeforeCompressed = calculateFilesSizeInKB(files)

    const result = await imageOptim(files).catch(function(err) {
      if (err instanceof AppthinningError) {
        return Promise.reject(err)
      }
    })
    await appendIgnoreFiles(ctx.program.dir, result).catch(function(err) {
      if (err instanceof AppthinningError) {
        return Promise.reject(err)
      }
      console.log(colors.red(err))
    })

    const sizeAfterCompressed = calculateFilesSizeInKB(files)
    const percent =
      (sizeBeforeCompressed - sizeAfterCompressed) / sizeBeforeCompressed
    const saving = (sizeBeforeCompressed - sizeAfterCompressed).toFixed(1)
    ctx.totalSaving += Number(saving)

    console.log(
      colors.green(
        "TOTAL was: " +
          sizeBeforeCompressed +
          "kB " +
          "now: " +
          sizeAfterCompressed +
          "kB " +
          "saving: " +
          saving +
          "kB " +
          "(" +
          percent.toFixed(1) * 100 +
          "%)"
      )
    )
  }

  await next()
}

module.exports = compressGif
