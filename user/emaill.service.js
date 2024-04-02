import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "kade.senger33@ethereal.email",
    pass: "2ZS4kMznRwgdbeCgwN",
  },
});

// async..await is not allowed in global scope, must use a wrapper
export const sendEmailOTP = async (firstName, otp, email) => {
  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: '"Nepal Mart" <kade.senger33@ethereal.email>', // sender address
    to: email, // list of receivers
    subject: "Reset password otp", // Subject line
    html: `<div style="box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;padding:1rem;">
    <h3>Reset password otp</h3>
   <br/> 
   <p>Dear ${firstName},</p>
   <br/>
   <p>Your otp for nepal mart app is <span style="font-weight:bold;"
   > ${otp}.</span> </p>
   <img style="height:100px; width:100px;" src="https://cdn.pixabay.com/photo/2017/03/16/21/18/logo-2150297_640.png"/>
   <p> If you did not request to change password, you can ignore this message.</p>
    </div>`, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
};
