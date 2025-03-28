import nodemailer from "nodemailer";
import fs from "fs";
import handlebars from "handlebars";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
    },
});

export const sendCodeRegister = (
    to: string,
    subject: string,
    templateName: string,
    variables: Record<string, any>
) => {
  const filePath = `./src/mailers/templates/${templateName}.html`;
  const templateSource = fs.readFileSync(filePath, "utf8");

  const template = handlebars.compile(templateSource);
  const htmlContent = template(variables);
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: to,
        subject: subject,
        html: htmlContent,
    };

    return transporter.sendMail(mailOptions);
};

export const sendCodeResetPassword = (
    to: string,
    subject: string,
    templateName: string,
    variables: Record<string, any>
) => {
  const filePath = `./src/mailers/templates/${templateName}.html`;
  const templateSource = fs.readFileSync(filePath, "utf8");

  const template = handlebars.compile(templateSource);
  const htmlContent = template(variables);
    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: to,
        subject: subject,
        html: htmlContent,
    };

    return transporter.sendMail(mailOptions);
};