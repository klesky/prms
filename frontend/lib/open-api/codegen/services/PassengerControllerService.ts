/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PassengerDto } from "../models/PassengerDto";
import type { ResourceDto } from "../models/ResourceDto";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class PassengerControllerService {
  /**
   * @returns PassengerDto OK
   * @throws ApiError
   */
  public static registerPassenger({
    requestBody,
  }: {
    requestBody: PassengerDto;
  }): CancelablePromise<PassengerDto> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/passengers",
      body: requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * @returns PassengerDto OK
   * @throws ApiError
   */
  public static changeMembershipLevel({
    username,
    requestBody,
  }: {
    username: string;
    requestBody: "SILVER" | "GOLD" | "PLATINUM";
  }): CancelablePromise<PassengerDto> {
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/passengers/{username}/membership-level",
      path: {
        username: username,
      },
      body: requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * @returns ResourceDto OK
   * @throws ApiError
   */
  public static getAccessibleResources({
    username,
  }: {
    username: string;
  }): CancelablePromise<Array<ResourceDto>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/passengers/{username}/resources",
      path: {
        username: username,
      },
    });
  }
}
