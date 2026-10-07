import bcrypt from 'bcryptjs';

/**
 * Generates a random 6-digit OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hashes the OTP using bcrypt
 * @param {string} otp 
 */
export const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(otp, salt);
};

/**
 * Compares a plain OTP with its hashed version
 * @param {string} otp 
 * @param {string} hashedOtp 
 */
export const compareOTP = async (otp, hashedOtp) => {
    return await bcrypt.compare(otp, hashedOtp);
};
