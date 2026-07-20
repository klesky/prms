/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CurrentUserDto } from "../models/CurrentUserDto";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class UserControllerService {
  /**
   * @returns CurrentUserDto OK
   * @throws ApiError
   */
  public static getCurrentUser(): CancelablePromise<CurrentUserDto> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/users/me",
    });
  }
}
