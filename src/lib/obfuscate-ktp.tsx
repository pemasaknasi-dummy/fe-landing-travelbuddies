export function obfuscateKtp(ktp?: string | null) {
    if (!ktp) return "-";
    const cleanKtp = String(ktp).trim();
    if (
        cleanKtp === "" ||
        cleanKtp === "-" ||
        cleanKtp.startsWith("EMPTY-") ||
        cleanKtp.startsWith("ktp-agent-") ||
        cleanKtp.startsWith("0000000000000000")
    ) {
        return "-";
    }
    if (cleanKtp.length < 10) return cleanKtp;
    return cleanKtp.substring(0, 6) + "******" + cleanKtp.substring(cleanKtp.length - 4);
}