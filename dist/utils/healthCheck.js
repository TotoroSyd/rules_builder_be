"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheck = healthCheck;
const contacts_1 = require("../constants/contacts");
const responseHandlers_1 = require("./responseHandlers");
function healthCheck(req, res) {
    const contactCount = contacts_1.contacts.length;
    const sampleContact = contactCount > 0 ? contacts_1.contacts[0] : null;
    const healthData = {
        status: contactCount > 0 && sampleContact !== null ? 'ok' : 'degraded',
        contacts_loaded: contactCount,
        sample_contact: sampleContact,
        timestamp: new Date().toISOString(),
    };
    const httpStatus = healthData.status === 'ok' ? 200 : 503;
    (0, responseHandlers_1.SuccessResHandler)(res, healthData, `Service is ${healthData.status}`, httpStatus);
    return httpStatus;
}
//# sourceMappingURL=healthCheck.js.map