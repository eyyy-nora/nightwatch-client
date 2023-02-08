import { Get, Query, Req, Service, Session } from "@propero/easy-api";
import axios from "axios";
import * as crypto from "crypto";
import type { Request } from "express";
import { User } from "src/entity/user";
import qs from "querystring";

export interface OAuthTokenData {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
}

@Service()
export class OAuthService {
  constructor(
    protected target_uri: string,
    protected client_id: string,
    protected client_secret: string,
    protected redirect_uri: string | undefined,
    protected scope: string,
    protected userForData: (data: OAuthTokenData) => Promise<User>,
    protected tokenForUser: (user: User) => string,
  ) {}

  @Get("/redirect-uri")
  protected getRedirectUri(req: Request) {
    return req.protocol + "://" + req.get("host") + req.baseUrl + req.path;
  }

  @Get("/authorize")
  public async authorize(
    @Query("code") code: string,
    @Query("state") state: string,
    @Query("referer") referer: string,
    @Session() session: Request["session"],
    @Req request: Request,
  ) {
    const { client_id, client_secret, scope } = this;
    const redirect_uri = this.redirect_uri || this.getRedirectUri(request);

    if (!code) {
      const state = (session.oauthState = crypto.randomUUID());
      session.oauthReferer = referer;
      return {
        redirect: this.buildAuthUrl("authorize", {
          response_type: "code",
          client_id,
          redirect_uri,
          scope,
          state,
        }),
      };
    }

    if (state !== session.oauthState)
      return {
        status: 401,
        data: "Invalid State",
      };

    const data = await this.postAuthUrl("token", undefined, {
      grant_type: "authorization_code",
      client_id,
      client_secret,
      redirect_uri,
      scope,
      state,
      code,
    });

    session.user = await this.userForData(data);
    const body = this.closeWindow(session.oauthReferer ?? "/");
    session.oauthState = session.oauthReferer = "";
    return body;
  }

  @Get("/logout")
  public async logout(@Session("user") user: User, @Session() session: Request["session"]) {
    if (!user) return;
    const { client_id, client_secret } = this;
    await this.postAuthUrl("token/revoke", undefined, {
      client_id,
      client_secret,
      token: this.tokenForUser(user),
    });
    session.user = session.oauthState = undefined;
  }

  buildAuthUrl(endpoint: string, params?: any) {
    const url = `${this.target_uri}/${endpoint}`;
    return params ? `${url}?${qs.stringify(params)}` : url;
  }

  async postAuthUrl(endpoint: string, params?: any, form?: any) {
    const { data } = await axios.post(this.buildAuthUrl(endpoint, params), qs.stringify(form), {
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    return data;
  }

  scriptBody(script: string) {
    return `<html><head><script>${script}</script></head></html>`;
  }

  closeWindow(url: string) {
    return this.scriptBody(
      this.functionBody(
        (URL: string) => {
          if (window.opener) {
            window.opener.postMessage({ type: "oauth", success: true });
            try {
              window.close();
            } catch (e) {
              /* unhandled */
            }
          } else window.location.href = URL;
        },
        { URL: JSON.stringify(url) },
      ),
    );
  }

  functionBody(fn: (...args: any[]) => void, replacements: Record<string, string> = {}) {
    const body = fn.toString();
    const firstBrace = body.indexOf("{");
    const lastBrace = body.lastIndexOf("}");
    let code = body.slice(firstBrace + 1, lastBrace - 1).trim();
    for (const [key, value] of Object.entries(replacements)) code = code.replaceAll(key, value);
    return code;
  }
}
