/**
 * Provide team accessToken
 */
export interface AppStudioTokenProvider {
  /**
   * Get team access token
   * @param showDialog Control whether the UI layer displays pop-up windows
   */
  getAccessToken(showDialog?: boolean): Promise<string | undefined>;

  /**
   * Get app studio token JSON object
   * - tid : tenantId
   * - unique_name : user name
   * - ...
   * @param showDialog Control whether the UI layer displays pop-up windows
   */
  getJsonObject(
    showDialog?: boolean
  ): Promise<Record<string, unknown> | undefined>;

  /**
   * App studio sign out
   */
  signout(): Promise<boolean>;

  /**
   * Add update account info callback
   * @param name callback name
   * @param statusChange callback method
   * @param immediateCall whether callback when register, the default value is true
   */
  setStatusChangeMap(
    name: string,
    statusChange: (
      status: string,
      token?: string,
      accountInfo?: Record<string, unknown>
    ) => Promise<void>,
    immediateCall?: boolean
  ): Promise<boolean>;

  /**
   * Remove update account info callback
   * @param name callback name
   */
  removeStatusChangeMap(name: string): Promise<boolean>;
}
