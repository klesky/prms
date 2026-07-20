/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CrewLeadDto } from "../models/CrewLeadDto";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class CrewLeadControllerService {
  /**
   * @returns CrewLeadDto OK
   * @throws ApiError
   */
  public static registerCrewLead({
    requestBody,
  }: {
    requestBody: CrewLeadDto;
  }): CancelablePromise<CrewLeadDto> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/crew-leads",
      body: requestBody,
      mediaType: "application/json",
    });
  }
}
