/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MembershipLevelUsageReportDto } from "../models/MembershipLevelUsageReportDto";
import type { ResourceUsageCountDto } from "../models/ResourceUsageCountDto";
import type { UsageLogDto } from "../models/UsageLogDto";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class UsageLogsService {
  /**
   * View your own usage history
   * Self-service: every resource interaction you've recorded, most recent first.
   * @returns UsageLogDto OK
   * @throws ApiError
   */
  public static getMyUsageHistory(): CancelablePromise<Array<UsageLogDto>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/usage-logs",
    });
  }

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

  /**
   * Usage analytics by resource
   * Crew-lead-only: resources ranked by usage count, highest demand first, to spot shortage risk.
   * @returns ResourceUsageCountDto OK
   * @throws ApiError
   */
  public static getResourceUsageAnalytics(): CancelablePromise<
    Array<ResourceUsageCountDto>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/usage-logs/reports/by-resource",
    });
  }

  /**
   * Usage report grouped by membership level
   * Crew-lead-only: passenger count and total resource usage for each tier, ship-wide.
   * @returns MembershipLevelUsageReportDto OK
   * @throws ApiError
   */
  public static getUsageReportByMembershipLevel(): CancelablePromise<
    Array<MembershipLevelUsageReportDto>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/usage-logs/reports/by-membership-level",
    });
  }
}
