// Type definitions for sdkore
// Project: https://github.com/bios21/sdkore
// Definitions by: Lilian Saget-Lethias <lilian.sagetlethias@gmail.com>
// Definitions: https://github.com/bios21/sdkore

import * as SDKore from './dist';

export = SDKore;
export as namespace SDKore;

declare module 'axios' {
    interface AxiosRequestConfig {
        forceUpdate?: boolean;
        cache?: boolean;
    }
}
