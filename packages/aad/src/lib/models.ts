// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface IAADPassword {
  hint?: string;
  id?: string;
  endDate?: string;
  startDate?: string;
  value?: string;
}

export interface IAADApplication {
  id?: string;
  displayName: string;
  passwords?: IAADPassword[];
  objectId?: string;
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface Web {
  redirectUris: string[];
}

export interface Oauth2PermissionScopes {
  adminConsentDescription: string;
  adminConsentDisplayName: string;
  id: string;
  isEnabled: boolean;
  type: string;
  userConsentDescription: string;
  userConsentDisplayName: string;
  value: string;
}

export interface PreAuthorizedApplication {
  appId: string;
  delegatedPermissionIds: string[];
}

export interface Api {
  requestedAccessTokenVersion: number;
  oauth2PermissionScopes: Oauth2PermissionScopes[];
  preAuthorizedApplications: PreAuthorizedApplication[];
}

export interface AccessToken {
  name: string;
  source?: any;
  essential: boolean;
  additionalProperties: any[];
}

export interface OptionalClaims {
  accessToken: AccessToken[];
}

export interface ResourceAccess {
  id: string;
  type: string;
}

export interface RequiredResourceAccess {
  resourceAppId?: string;
  resourceAccess?: ResourceAccess[];
}

export interface PasswordCredential {
  hint?: string;
  id?: string;
  endDate?: string;
  startDate?: string;
  value?: string;
}

export interface IAADDefinition {
  displayName?: string;
  id?: string;
  appId?: string;
  identifierUris?: string[];
  web?: Web;
  signInAudience?: string;
  api?: Api;
  optionalClaims?: OptionalClaims;
  requiredResourceAccess?: RequiredResourceAccess[];
  passwordCredentials?: PasswordCredential[];
}
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface IPermission {
  resource: string;
  scopes: string[];
  roles: string[];
  delegated: string[];
  application: string[];
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface AppRole {
  allowedMemberTypes: string[];
  description: string;
  displayName: string;
  id: string;
  isEnabled: boolean;
  origin: string;
  value: string;
}

export interface Oauth2PermissionScopes {
  adminConsentDescription: string;
  adminConsentDisplayName: string;
  id: string;
  isEnabled: boolean;
  type: string;
  userConsentDescription: string;
  userConsentDisplayName: string;
  value: string;
}

export interface Value {
  appId: string;
  displayName: string;
  appRoles: AppRole[];
  oauth2PermissionScopes: Oauth2PermissionScopes[];
}

export interface IPermissionList {
  value: Value[];
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface permissionList {
  resource: string;
  scopes: Array<string>;
  roles: Array<string>;
}

export enum Envs {
  Azure = "azure",
  LocalDebug = "local",
  Both = "both",
}


// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export interface ResourcePermission {
  name: string;
  type: string;
  resourceId: string | undefined;
  roles: string[] | undefined;
}

export enum CollaborationState {
  OK = "OK",
  NotProvisioned = "NotProvisioned",
  M365TenantNotMatch = "M365TenantNotMatch",
  SolutionIsNotIdle = "SolutionIsNotIdle",
  ERROR = "ERROR",
}

export interface CollaborationStateResult {
  state: CollaborationState;
  message?: string;
}

export interface ListCollaboratorResult {
  state: CollaborationState;
  message?: string;
  collaborators?: Collaborator[];
  error?: any;
}

export interface PermissionsResult {
  state: CollaborationState;
  message?: string;
  userInfo?: Record<string, any>;
  permissions?: ResourcePermission[];
}

export interface Collaborator {
  userPrincipalName: string;
  userObjectId: string;
  isAadOwner: boolean;
  teamsAppResourceId: string;
  aadResourceId?: string;
}

export interface AadOwner {
  userObjectId: string;
  resourceId: string;
  displayName: string;
  userPrincipalName: string;
}

export interface TeamsAppAdmin {
  userObjectId: string;
  resourceId: string;
  displayName: string;
  userPrincipalName: string;
}
