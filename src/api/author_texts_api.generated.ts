/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** AuthorTextsAttributeInput */
export interface AuthorTextsAttributeInput {
  /**
   * Author Texts Attribute Id
   * @min 1
   * @max 2147483647
   */
  author_texts_attribute_id: number;
  /**
   * Attribute Value
   * @minLength 1
   * @maxLength 500
   */
  attribute_value: string;
}

/** AuthorTextsAttributeResponse */
export interface AuthorTextsAttributeResponse {
  /** Author Texts Attribute Id */
  author_texts_attribute_id: number;
  /** Attribute Name */
  attribute_name: string;
  /** Attribute Value */
  attribute_value: string;
}

/** AuthorTextsLikeInput */
export interface AuthorTextsLikeInput {
  /**
   * Value
   * @min 0
   * @max 1
   */
  value: number;
}

/**
 * AuthorTextsLogin
 * @example {"password":"author_texts_demo","username":"author_texts_lab4"}
 */
export interface AuthorTextsLogin {
  /**
   * Username
   * @minLength 1
   * @maxLength 80
   */
  username: string;
  /**
   * Password
   * @minLength 1
   * @maxLength 128
   */
  password: string;
}

/**
 * AuthorTextsPublish
 * @example {"attributes":[{"attribute_value":"Русский","author_texts_attribute_id":1}],"short_description":"Пример авторского текста","text_length":5,"unique_token_count":3,"work_title":"Проверка TTR"}
 */
export interface AuthorTextsPublish {
  /**
   * Work Title
   * @minLength 1
   * @maxLength 200
   */
  work_title: string;
  /**
   * Short Description
   * @minLength 1
   * @maxLength 500
   */
  short_description: string;
  /**
   * Text Length
   * @min 1
   * @max 2147483647
   */
  text_length: number;
  /**
   * Unique Token Count
   * @min 1
   * @max 2147483647
   */
  unique_token_count: number;
  /**
   * Attributes
   * @maxItems 50
   */
  attributes?: AuthorTextsAttributeInput[];
}

/**
 * AuthorTextsRegistration
 * @example {"password":"author_texts_demo","username":"author_texts_lab4"}
 */
export interface AuthorTextsRegistration {
  /**
   * Username
   * @minLength 1
   * @maxLength 80
   */
  username: string;
  /**
   * Password
   * @minLength 8
   * @maxLength 128
   */
  password: string;
}

/** AuthorTextsResponse */
export interface AuthorTextsResponse {
  /** Author Text Id */
  author_text_id: number;
  /** Work Title */
  work_title: string;
  /** Short Description */
  short_description: string | null;
  /** Author Texts Image Url */
  author_texts_image_url: string | null;
  /** Author Texts Video Url */
  author_texts_video_url: string | null;
  /** Unique Token Count */
  unique_token_count: number | null;
  /** Text Length */
  text_length: number | null;
  /** Author Texts Ratio */
  author_texts_ratio: number | null;
  /** Author Texts Like Count */
  author_texts_like_count: number;
  /**
   * Is Owner
   * @min 0
   * @max 1
   */
  is_owner: number;
  /**
   * Is Liked
   * @min 0
   * @max 1
   */
  is_liked: number;
  /** Attributes */
  attributes: AuthorTextsAttributeResponse[];
}

/** AuthorTextsUserResponse */
export interface AuthorTextsUserResponse {
  /** Author Texts User Id */
  author_texts_user_id: number;
  /** Username */
  username: string;
}

/** Body_create_author_texts_author_texts_post */
export interface BodyCreateAuthorTextsAuthorTextsPost {
  /**
   * Work Title
   * @minLength 1
   * @maxLength 200
   */
  work_title: string;
  /** Author Texts Image */
  author_texts_image: File | Blob;
  /** Author Texts Video */
  author_texts_video: File | Blob;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
  /** Input */
  input?: any;
  /** Context */
  ctx?: object;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance
      .request({
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type ? { "Content-Type": type } : {}),
        },
        params: query,
        responseType: responseFormat,
        data: body,
        url: path,
      })
      .then((response) => response.data);
  };
}

/**
 * @title Author texts — ЛР-4
 * @version 4.0.0
 * @baseUrl /api
 *
 * Сессии Redis и HttpOnly cookie. Сначала выполните регистрацию и login здесь, в Swagger. Браузер отправляет cookie автоматически. Корпус и лента доступны гостю.
 */
export class AuthorTextsApi<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  authorTexts = {
    /**
     * No description
     *
     * @tags author_texts
     * @name ListAuthorTextsAuthorTextsGet
     * @summary Корпус опубликованных текстов
     * @request GET:/author_texts
     * @secure
     */
    listAuthorTextsAuthorTextsGet: (
      query?: {
        /** Min Text Length */
        min_text_length?: number | null;
      },
      params: RequestParams = {},
    ) =>
      this.request<AuthorTextsResponse[], void>({
        path: `/author_texts`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags author_texts
     * @name CreateAuthorTextsAuthorTextsPost
     * @summary Создать черновик с фото и видео
     * @request POST:/author_texts
     * @secure
     */
    createAuthorTextsAuthorTextsPost: (
      data: BodyCreateAuthorTextsAuthorTextsPost,
      params: RequestParams = {},
    ) =>
      this.request<AuthorTextsResponse, void>({
        path: `/author_texts`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags author_texts
     * @name GetAuthorTextsDraftAuthorTextsDraftGet
     * @summary Черновик текущего пользователя
     * @request GET:/author_texts/draft
     * @secure
     */
    getAuthorTextsDraftAuthorTextsDraftGet: (params: RequestParams = {}) =>
      this.request<AuthorTextsResponse, void>({
        path: `/author_texts/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags author_texts
     * @name GetAuthorTextsFeedAuthorTextsFeedGet
     * @summary Лента: первая, по ID или следующая карточка
     * @request GET:/author_texts/feed
     * @secure
     */
    getAuthorTextsFeedAuthorTextsFeedGet: (
      query?: {
        /** Author Text Id */
        author_text_id?: number | null;
        /**
         * Next
         * @default false
         */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<AuthorTextsResponse, void>({
        path: `/author_texts/feed`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags author_texts
     * @name PublishAuthorTextsAuthorTextsAuthorTextIdPublishPut
     * @summary Заполнить и опубликовать собственный черновик
     * @request PUT:/author_texts/{author_text_id}/publish
     * @secure
     */
    publishAuthorTextsAuthorTextsAuthorTextIdPublishPut: (
      authorTextId: number,
      data: AuthorTextsPublish,
      params: RequestParams = {},
    ) =>
      this.request<AuthorTextsResponse, void>({
        path: `/author_texts/${authorTextId}/publish`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags author_texts
     * @name DeleteAuthorTextsAuthorTextsAuthorTextIdDelete
     * @summary Логически удалить собственный текст
     * @request DELETE:/author_texts/{author_text_id}
     * @secure
     */
    deleteAuthorTextsAuthorTextsAuthorTextIdDelete: (
      authorTextId: number,
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/author_texts/${authorTextId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags author_texts
     * @name LikeAuthorTextsAuthorTextsAuthorTextIdLikePost
     * @summary Поставить (1) или снять (0) лайк
     * @request POST:/author_texts/{author_text_id}/like
     * @secure
     */
    likeAuthorTextsAuthorTextsAuthorTextIdLikePost: (
      authorTextId: number,
      data: AuthorTextsLikeInput,
      params: RequestParams = {},
    ) =>
      this.request<AuthorTextsResponse, void>({
        path: `/author_texts/${authorTextId}/like`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  authorTextsUsers = {
    /**
     * No description
     *
     * @tags author_texts_users
     * @name RegisterAuthorTextsUserAuthorTextsUsersRegisterPost
     * @summary Регистрация пользователя
     * @request POST:/author_texts_users/register
     */
    registerAuthorTextsUserAuthorTextsUsersRegisterPost: (
      data: AuthorTextsRegistration,
      params: RequestParams = {},
    ) =>
      this.request<AuthorTextsUserResponse, void>({
        path: `/author_texts_users/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags author_texts_users
     * @name LoginAuthorTextsUserAuthorTextsUsersLoginPost
     * @summary Аутентификация и создание сессии Redis
     * @request POST:/author_texts_users/login
     */
    loginAuthorTextsUserAuthorTextsUsersLoginPost: (
      data: AuthorTextsLogin,
      params: RequestParams = {},
    ) =>
      this.request<AuthorTextsUserResponse, void>({
        path: `/author_texts_users/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags author_texts_users
     * @name LogoutAuthorTextsUserAuthorTextsUsersLogoutPost
     * @summary Деавторизация: удалить сессию и cookie
     * @request POST:/author_texts_users/logout
     * @secure
     */
    logoutAuthorTextsUserAuthorTextsUsersLogoutPost: (
      params: RequestParams = {},
    ) =>
      this.request<void, void>({
        path: `/author_texts_users/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
}
