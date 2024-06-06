import twilio from 'twilio';

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);

const sendMessage = async (to, message) => {
  try {
    // const response = await client.messages.create({
    //   body: message,
    //   to: `+${to}`,
    //   from: '+1(608) 680-3421',
    // });
    // console.log(response);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export { sendMessage };
