/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UsageLogDto } from "../models/UsageLogDto";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class UsageLogsService {
  /**
   * Record resource usage
   * Self-service: real-time membership-level check against the resource's requirement, then logs the interaction. Denied attempts are not logged.
   * @returns UsageLogDto OK
   * @throws ApiError
   */
  public static recordUsage({
    requestBody,
  }: {
    requestBody: string;
  }): CancelablePromise<UsageLogDto> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/usage-logs",
      body: requestBody,
      mediaType: "application/json",
    });
  }
}
