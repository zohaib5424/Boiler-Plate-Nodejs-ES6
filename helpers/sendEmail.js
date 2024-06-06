import nodemailer from 'nodemailer';

async function sendEmail(email, subject, html) {
  console.log('sending email', email, subject);
  let response;
  console.log('process.env.SENDGRID_API_KEY', process.env.SENDGRID_API_KEY);

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  let mailOptions = {
    from: 'no-reply@creditbutterfly.ai',
    to: email,
    subject: subject,
    html: html,
    fromName: 'Creditbutterfly',
  };

  try {
    const data = await transporter.sendMail(mailOptions);
    console.log('data', data);
    response = true;
  } catch (err) {
    console.log('err', err);
    response = false;
  }

  return response;
}

export { sendEmail };
