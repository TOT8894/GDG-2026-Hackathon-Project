import Notification from "../models/notificationModel.js";

/**
 * Create one or more notifications.
 * @param {Array<{userId, title, message, type, link, relatedId, actorName}>} items
 */
export async function notify(items) {
    try {
        if (!Array.isArray(items)) items = [items];
        const valid = items.filter((n) => n && n.userId && n.title && n.message);
        if (valid.length) await Notification.insertMany(valid);
    } catch (err) {
        console.error("Notification error:", err.message);
    }
}

export async function notifyOne(userId, { title, message, type = "system", link = null, relatedId = null, actorName = null }) {
    return notify([{ userId, title, message, type, link, relatedId, actorName }]);
}
