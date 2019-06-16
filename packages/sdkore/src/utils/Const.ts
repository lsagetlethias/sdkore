export type RequestHeaderName =
    | 'Accept'
    | 'Accept-Charset'
    | 'Accept-Encoding'
    | 'Accept-Language'
    | 'Accept-Datetime'
    | 'Access-Control-Request-Method'
    | 'Access-Control-Request-Headers'
    | 'Authorization'
    | 'Cache-Control'
    | 'Connection'
    | 'Cookie'
    | 'Content-Length'
    | 'Content-MD5'
    | 'Content-Type'
    | 'Date'
    | 'Expect'
    | 'Forwarded'
    | 'From'
    | 'Host'
    | 'If-Match'
    | 'If-Modified-Since'
    | 'If-None-Match'
    | 'If-Range'
    | 'If-Unmodified-Since'
    | 'Max-Forwards'
    | 'Origin'
    | 'Pragma'
    | 'Proxy-Authorization'
    | 'Range'
    | 'Referer'
    | 'TE'
    | 'User-Agent'
    | 'Upgrade'
    | 'Via'
    | 'Warning';

export type ResponseHeaderName = 'Accept-Range' | 'Content-Range';

export namespace REQUEST_HEADERS {
    /**
     * Media type(s) that is(/are) acceptable for the response. See Content negotiation.
     *
     * @example Accept: text/plain
     */
    export const ACCEPT = 'Accept';
    /**
     * Character sets that are acceptable.
     *
     * @example Accept-Charset: utf-8
     */
    export const ACCEPT_CHARSET = 'Accept-Charset';
    /**
     * List of acceptable encodings. See HTTP compression.
     *
     * @example Accept-Encoding: gzip, deflate
     */
    export const ACCEPT_ENCODING = 'Accept-Encoding';
    /**
     * List of acceptable human languages for response. See Content negotiation.
     *
     * @example Accept-Language: en-US
     */
    export const ACCEPT_LANGUAGE = 'Accept-Language';
    /**
     * Acceptable version in time.
     *
     * @example Accept-Datetime: Thu, 31 May 2007 20:35:00 GMT
     */
    export const ACCEPT_DATETIME = 'Accept-Datetime';
    /** @see[HTTP_REQUEST_HEADERS['Access-Control-Request-Headers'] */
    export const ACCESS_CONTROL_REQUEST_METHOD = 'Access-Control-Request-Method';
    /**
     * Initiates a request for cross-origin resource sharing with Origin (below).
     *
     * @example Access-Control-Request-Method: GET
     */
    export const ACCESS_CONTROL_REQUEST_HEADERS = 'Access-Control-Request-Headers';
    /**
     * Authentication credentials for HTTP authentication.
     *
     * @example `Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==`
     */
    export const AUTHORIZATION = 'Authorization';
    /**
     * Used to specify directives that must be obeyed by all caching mechanisms along the request-response chain.
     *
     * @example Cache-Control: no-cache
     */
    export const CACHE_CONTROL = 'Cache-Control';
    /**
     * Control options for the current connection and list of hop-by-hop request fields. Must not be used with HTTP/2.
     */
    export const CONNECTION = 'Connection';
    /**
     * An HTTP cookie previously sent by the server with Set-Cookie (below).
     *
     * @example Cookie: $Version=1; Skin=new;
     */
    export const COOKIE = 'Cookie';
    /**
     * The length of the request body in octets (8-bit bytes).
     *
     * @example Content-Length: 348
     */
    export const CONTENT_LENGTH = 'Content-Length';
    /**
     * A Base64-encoded binary MD5 sum of the content of the request body.
     *
     * @example Content-MD5: Q2hlY2sgSW50ZWdyaXR5IQ==    Obsolete[10]
     */
    export const CONTENT_MD5 = 'Content-MD5';
    /**
     * The Media type of the body of the request (used with POST and PUT requests).
     *
     * @example Content-Type: application/x-www-form-urlencoded
     */
    export const CONTENT_TYPE = 'Content-Type';
    /**
     * The date and time that the message was originated (in "HTTP-date" format as defined by RFC 7231
     * Date/Time Formats).
     *
     * @example Date: Tue, 15 Nov 1994 08:12:31 GMT
     */
    export const DATE = 'Date';
    /**
     * Indicates that particular server behaviors are required by the client.
     *
     * @example Expect: 100-continue
     */
    export const EXPECT = 'Expect';
    /**
     * Disclose original information of a client connecting to a web server through an HTTP proxy.[11]
     *
     * @example Forwarded: for=192.0.2.60;proto=http;by=203.0.113.43 Forwarded: for=192.0.2.43, for=198.51.100.17
     */
    export const FORWARDED = 'Forwarded';
    /**
     * The email address of the user making the request.
     *
     * @example From: user@example.com
     */
    export const FROM = 'From';
    /**
     * The domain name of the server (for virtual hosting), and the TCP port number on which the server is listening.
     * The port number may be omitted if the port is the standard port for the service requested.
     * Mandatory since HTTP/1.1. If the request is generated directly in HTTP/2, it should not be used.
     *
     * @example wynd.eu
     */
    export const HOST = 'Host';
    /**
     * Only perform the action if the client supplied entity matches the same entity on the server.
     * This is mainly for methods like PUT to only update a resource if it has not been modified
     * since the user last updated it.
     *
     * @example If-Match: "737060cd8c284d8af7ad3082f209582d"
     */
    export const IF_MATCH = 'If-Match';
    /**
     * Allows a 304 Not Modified to be returned if content is unchanged.
     *
     * @example If-Modified-Since: Sat, 29 Oct 1994 19:43:31 GMT
     */
    export const IF_MODIFIED_SINCE = 'If-Modified-Since';
    /**
     * Allows a 304 Not Modified to be returned if content is unchanged, see HTTP ETag.
     *
     * @example If-None-Match: "737060cd8c284d8af7ad3082f209582d"
     */
    export const IF_NONE_MATCH = 'If-None-Match';
    /**
     * If the entity is unchanged, send me the part(s) that I am missing; otherwise, send me the entire new entity.
     *
     * @example If-Range: "737060cd8c284d8af7ad3082f209582d"
     */
    export const IF_RANGE = 'If-Range';
    /**
     * Only send the response if the entity has not been modified since a specific time.
     *
     * @example If-Unmodified-Since: Sat, 29 Oct 1994 19:43:31 GMT
     */
    export const IF_UNMODIFIED_SINCE = 'If-Unmodified-Since';
    /**
     * Limit the number of times the message can be forwarded through proxies or gateways.
     *
     * @example Max-Forwards: 10
     */
    export const MAX_FORWARDS = 'Max-Forwards';
    /**
     * Initiates a request for cross-origin resource sharing (asks server for Access-Control-* response fields).
     * @example Origin: http://www.example-social-network.com
     */
    export const ORIGIN = 'Origin';
    /**
     * Implementation-specific fields that may have various effects anywhere along the request-response chain.
     *
     * @example Pragma: no-cache
     */
    export const PRAGMA = 'Pragma';
    /**
     * Authorization credentials for connecting to a proxy.
     *
     * @example Proxy-Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==
     */
    export const PROXY_AUTHORIZATION = 'Proxy-Authorization';
    /**
     * Request only part of an entity. Bytes are numbered from 0. See Byte serving.
     *
     * @example Range: bytes=500-999
     */
    export const RANGE = 'Range';
    /**
     * This is the address of the previous web page from which a link to the currently requested page was followed.
     * (The word “referrer” has been misspelled in the RFC as well as in most implementations to the point that it has
     * become standard usage and is considered correct terminology)
     *
     * @example Referer: http://en.wikipedia.org/wiki/Main_Page
     */
    export const REFERER = 'Referer';
    /**
     * The transfer encodings the user agent is willing to accept: the same values as for the response header field
     * Transfer-Encoding can be used, plus the "trailers" value (related to the "chunked" transfer method) to notify
     * the server it expects to receive additional fields in the trailer after the last, zero-sized, chunk.
     * Only trailers is supported in HTTP/2.
     *
     * @example TE: trailers, deflate
     */
    export const TE = 'TE';
    /**
     * The user agent string of the user agent.
     *
     * @example User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/12.0
     */
    export const USER_AGENT = 'User-Agent';
    /**
     * Ask the server to upgrade to another protocol. Must not be used in HTTP/2.
     *
     * @example Upgrade: h2c, HTTPS/1.3, IRC/6.9, RTA/x11, websocket
     */
    export const UPGRADE = 'Upgrade';
    /**
     * Informs the server of proxies through which the request was sent.
     *
     * @example Via: 1.0 fred, 1.1 example.com (Apache/1.1)
     */
    export const VIA = 'Via';
    /**
     * A general warning about possible problems with the entity body.
     *
     * @example Warning: 199 Miscellaneous warning
     */
    export const WARNING = 'Warning';
}

export namespace RESPONSE_HEADERS {
    export const ACCEPT_RANGE = 'Accept-Range';
    export const CONTENT_RANGE = 'Content-Range';
}

export const DEFAULT_CACHE_EXPIRATION = 120 * 1000; // 2 mins
export const DEFAULT_TOKEN_EXPIRATION = 1000 * 60 * 60 * 8; // 8 hours
