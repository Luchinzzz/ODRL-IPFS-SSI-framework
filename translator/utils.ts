/**
 * Searches for a specific field in a JSON file.
 * 
 * @param jsonFile - The JSON file to analyze.
 * @param searchKey - The name of the field to search for.
 * @returns The value associated with the field if found, otherwise `null`.
 */
export function searchFieldInJson(jsonFile: Record<string, any>, searchKey: string): any | null {
    function recursiveSearch(obj: Record<string, any>): any | null {
        for (const key in obj) {
            if (key === searchKey) {
                return obj[key];
            }
            if (typeof obj[key] === "object" && obj[key] !== null) {
                const result = recursiveSearch(obj[key]);
                if (result !== null) {
                    return result;
                }
            }
        }
        return null;
    }

    return recursiveSearch(jsonFile);
}

/**
 * Converts a string to a Date object if the key is 'date'.
 * 
 * @param key - The JSON key.
 * @param value - The value associated with the key.
 * @returns Returns a Date object if the key is 'date', otherwise returns a string.
 */
export function stringToDate(key: string, value: string): Date | string {
    if (key == "date") {
        return new Date(value);
    } else {
        return value;
    }
};

export function toUnixTimestamp(input: string): number {
    // Regex for supported formats
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    const timeFormat = /^(\d{2}):(\d{2}):(\d{2})(\.\d{1,3})?$/; // HH:mm:ss.sss
    const dateTimeFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/; // YYYY-MM-DDTHH:mm:ss.sssZ

    if (dateFormat.test(input)) {
        // Case YYYY-MM-DD
        const date = new Date(input); // Interpreted as midnight UTC
        if (isNaN(date.getTime())) {
            throw new Error("Invalid YYYY-MM-DD date format.");
        }
        return date.getTime();
    } else if (timeFormat.test(input)) {
        // Case HH:mm:ss.sss
        const match = input.match(timeFormat);
        if (!match) {
            throw new Error("Internal error in time matching.");
        }

        const [, hours, minutes, seconds, milliseconds] = match;
        const hoursNum = parseInt(hours, 10);
        const minutesNum = parseInt(minutes, 10);
        const secondsNum = parseInt(seconds, 10);
        const millisecondsNum = milliseconds ? parseFloat(milliseconds) * 1000 : 0;

        if (
            hoursNum < 0 || hoursNum > 23 ||
            minutesNum < 0 || minutesNum > 59 ||
            secondsNum < 0 || secondsNum > 59
        ) {
            throw new Error("Time values out of range.");
        }

        // Create a date with the current day and replace hours/minutes/seconds
        const now = new Date();
        now.setHours(hoursNum, minutesNum, secondsNum, millisecondsNum);

        return now.getTime();
    } else if (dateTimeFormat.test(input)) {
        // Case YYYY-MM-DDTHH:mm:ss.sssZ
        const date = new Date(input);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid ISO date-time format.");
        }
        return date.getTime();
    } else {
        throw new Error("Unrecognized format. Use YYYY-MM-DD, HH:mm:ss.sss, or YYYY-MM-DDTHH:mm:ss.sssZ.");
    }
}

