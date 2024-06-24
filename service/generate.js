export const generateRandomOTP = async (length) => {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
    let otp = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        otp += characters.charAt(randomIndex);
    }
    return otp;
}