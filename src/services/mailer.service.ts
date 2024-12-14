import fs from "fs";
import path from "path";
import { injectable } from "tsyringe";
import nodemailer from "nodemailer";
import { config } from "../common/config";
import { Resend } from "resend";
import handlebars from "handlebars";

type SendMail = {
  to: string | string[];
  subject: string;
  html: string;
};

type SendTemplate<T> = {
  to: string | string[];
  props: T;
};

@injectable()
export class MailerService {
  private nodemailer = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "adella.hoppe@ethereal.email",
      pass: "dshNQZYhATsdJ3ENke",
    },
  });

  private resend = new Resend(config.email.resendKey);

  sendEmailVerificationToken(data: SendTemplate<{ link: string }>) {
    const template = handlebars.compile(this.getTemplate("email-verification"));
    return this.send({
      to: data.to,
      subject: "Pomo ~ Email Verification",
      html: template({ link: data.props.link }),
    });
  }

  sendResetPasswordOTP(data: SendTemplate<{ otp: string }>) {
    const template = handlebars.compile(this.getTemplate("reset-password"));
    return this.send({
      to: data.to,
      subject: "Pomo ~ Password Reset",
      html: template({ code: data.props.otp }),
    });
  }

  private async send({ to, subject, html }: SendMail) {
    await this.resend.emails.send({
      from: "Pomo <info@send.pomo.fres.space>",
      to: to,
      subject: subject,
      html: html,
    });
  }

  private getTemplate(template: string) {
    const __dirname = path.dirname(__filename); // get the name of the directory
    return fs.readFileSync(
      path.join(__dirname, `../infrastructure/email-templates/${template}.hbs`),
      "utf-8",
    );
  }
}
