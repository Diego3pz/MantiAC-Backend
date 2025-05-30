
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = process.env.BREVO_API_KEY;


export const sendEmail = async (emailData: any) => {
    try {
        const response = await axios.post(
            BREVO_API_URL,
            emailData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': BREVO_API_KEY,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error enviando el correo:', error.response?.data || error.message);
        throw error;
    }
};