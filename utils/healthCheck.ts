import { Request, Response } from "express";
import { contacts } from "../constants/contacts";
import { HealthData } from "../types";
import { SuccessResHandler } from "./responseHandlers";

export function healthCheck(req: Request, res: Response) {
    const contactCount = contacts.length;
    const sampleContact = contactCount > 0 ? contacts[0] : null;

    const healthData: HealthData = {
        status: contactCount > 0 && sampleContact !== null ? 'ok' : 'degraded',
        contacts_loaded: contactCount,
        sample_contact: sampleContact,
        timestamp: new Date().toISOString(),
    };

    const httpStatus = healthData.status === 'ok' ? 200 : 503;
    SuccessResHandler(res, healthData, `Service is ${healthData.status}`, httpStatus);
    return httpStatus;
}