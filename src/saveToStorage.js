const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

const saveToStorage = async (type, { stream, filename }) => {
  const fileDirectory = `${type}`;
  mkdirp.sync(path.join(__dirname, `/public/${fileDirectory}`));

  const filePath = `${fileDirectory}/${filename}`;

  return new Promise((resolve, reject) => {
    stream
      .pipe(fs.createWriteStream(path.join(__dirname, `/public/${filePath}`)))
      .on("error", (error) => reject(error))
      .on("finish", () => resolve({ filePath }));
  });
};

module.exports = saveToStorage;
