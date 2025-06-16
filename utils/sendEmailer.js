
import nodeMailer from 'nodemailer';

export const sendEmail = async ({ email, subject, message }) => {
    if (!email || typeof email !== 'string') {
        throw new Error("No email recipient defined");
    }
    console.log(email);

    if (message instanceof Promise) {
        message = await message;
    }

    const transporter = nodeMailer.createTransport({
        host: process.env.SMTP_HOST,
        service: process.env.SMTP_SERVICE,
        port: Number(process.env.SMTP_PORT),
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const options = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html: message,
    };

    await transporter.sendMail(options);
    console.log(`Email sent to ${email}`);
};

