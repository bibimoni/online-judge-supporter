import { exists, fileName, directory, extension, baseName } from "../path.js";
const expandArgumentWithPath = (command, filePath) => {
    if (command === null) {
        return command;
    }
    return expandArgument(command, {
        file: fileName(filePath),
        relativeFile: filePath,
        fileBase: baseName(filePath),
        relativeDir: directory(filePath)
    });
};
const expandArgument = (command, { file, relativeFile, fileBase, relativeDir }) => {
    return command.replaceAll("{file}", file)
        .replaceAll("{relative_file}", relativeFile)
        .replaceAll("{file_base}", fileBase)
        .replaceAll("{relative_dir}", relativeDir);
};
const validateFilePath = (filePath) => {
    return filePath && exists(filePath);
};
export { validateFilePath };
export { expandArgumentWithPath };
export { fileName };
export { extension };
export { baseName };
export { directory };
export default {
    validateFilePath,
    expandArgumentWithPath,
    fileName,
    extension,
    baseName,
    directory
};
