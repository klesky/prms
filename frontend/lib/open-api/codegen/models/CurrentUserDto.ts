/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type CurrentUserDto = {
  username?: string;
  name?: string;
  roles?: Array<string>;
  membershipLevel?: "SILVER" | "GOLD" | "PLATINUM";
};
