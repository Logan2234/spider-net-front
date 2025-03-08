const toHumanReadableMemory = (bytes: number): string => {
    const units = ['o', 'ko', 'Mo', 'Go', 'To'];
    let unitIndex = 0;

    while (bytes >= 1024) {
        bytes /= 1024;
        unitIndex++;
    }

    return bytes.toFixed(2) + units[unitIndex];
};

export { toHumanReadableMemory };