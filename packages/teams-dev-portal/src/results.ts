export class AppStudioResultFactory {
  static readonly defaultHelpLink = "";
  static readonly defaultIssueLink = "";

  public static UserError(
    name: string,
    message: string,
    helpLink?: string,
    stack?: string,
    innerError?: any
  ) {
    return new Error([name, message, helpLink, innerError, stack].join("\n"));
  }

  public static SystemError(
    name: string,
    message: string,
    innerError?: any,
    stack?: string,
    issueLink?: string
  ) {
    return new Error([name, message, issueLink, innerError, stack].join("\n"));
  }
}
