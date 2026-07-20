/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResourceDto } from "../models/ResourceDto";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class ResourceControllerService {
  /**
   * @returns ResourceDto OK
   * @throws ApiError
   */
  public static listResources(): CancelablePromise<Array<ResourceDto>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/resources",
    });
  }

  /**
   * @returns ResourceDto OK
   * @throws ApiError
   */
  public static provisionResource({
    requestBody,
  }: {
    requestBody: ResourceDto;
  }): CancelablePromise<ResourceDto> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/resources",
      body: requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * @returns any OK
   * @throws ApiError
   */
  public static decommissionResource({
    resourceId,
  }: {
    resourceId: string;
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/resources/{resourceId}",
      path: {
        resourceId: resourceId,
      },
    });
  }
}
