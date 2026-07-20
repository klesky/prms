/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CrewLeadDto } from "../models/CrewLeadDto";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class CrewLeadsService {
  /**
   * Register a crew lead
   * Self-registers the caller as a crew lead while a seat remains open (max 3 ship-wide), or lets an existing crew lead register someone else.
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
