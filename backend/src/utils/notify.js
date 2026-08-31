const Notification = require('../models/Notification');

// Section 2.8: the only three supported in-app notifications.
const MESSAGES = {
  mechanic_replied: 'Your mechanic replied',
  appointment_approved: 'Your appointment was approved',
  status_changed: 'Your car status changed',
};

// userId/faultReportId may be raw ObjectIds or populated docs — either works
// since Mongoose casts a doc to its _id when assigned to an ObjectId path.
async function notify(userId, type, faultReportId) {
  return Notification.create({
    user: userId,
    type,
    message: MESSAGES[type],
    faultReport: faultReportId,
  });
}

module.exports = notify;
