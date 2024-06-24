const otpGenerate = (length) => {
    const number = '0123456789';
    let otp='';
    for (let i = 0; i < length; i++) {
        const random = Math.floor(Math.random() * number.length);
        otp = otp+random
    }
    return otp;
};
export const OTPGenerate = otpGenerate(6);